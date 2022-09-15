import {
  MONGO_URI,
  MONGO_URI_SUFFIX,
  REDIS_HOST,
  REDIS_NAME,
  REDIS_SENTINELS
} from "@configs/settings";
import sysEmitter from "@events/system.emitter";
import { MSG_500 } from "@exceptions/HttpException";
import { dbOperate, EventMsg } from "@interfaces/event_msg.interface";
import { logger } from "@utils/logger";
import { isEmpty } from "@utils/util";
import flatten from "flat";
import Redis from "ioredis";
import { DeleteResult } from "mongodb";
import mongoose, { QueryOptions } from "mongoose";

const reconnectOnError = (err: Error): boolean => {
  const targetErrors = ["READONLY", "ETIMEDOUT"];
  if (targetErrors.includes(err.message)) {
    return true;
  }
  return false;
};

export enum MOREDIS_EVENT {
  CONNECT = "moredis_connect",
  READY = "moredis_ready",
  MODIFY = "moredis_modified",
}

export default class BaseMoredis {
  public dbName: string;
  protected conn: mongoose.Connection;
  protected modelNames: string[];
  private isCached: boolean;
  private redisRole?: string;
  private redisPublisher?: Redis.Redis;
  private redisClient?: Redis.Redis;

  private excluded = { _id: 0, __v: 0 };
  private options: QueryOptions = { upsert: true, new: true, setDefaultsOnInsert: true, projection: this.excluded };

  constructor(dbName: string, modelNames: string[], isCached = true) {
    this.dbName = dbName;
    this.isCached = isCached;
    this.modelNames = modelNames;
    const url = MONGO_URI_SUFFIX ? `${MONGO_URI}/${dbName}${MONGO_URI_SUFFIX}` : `${MONGO_URI}/${dbName}`;

    if (process.env.NODE_APP_INSTANCE === "0") logger.info(`[MoredisDB][${this.dbName}] Start connect.`);
    this.conn = mongoose.createConnection(url, { connectTimeoutMS: 60000, serverSelectionTimeoutMS: 60000 });

    this.conn.on("error", (err: any) => {
      logger.error(`[MoredisDB][${this.dbName}] DB Connect error: ${err}`);
    });

    this.conn.once("open", async () => {
      if (!this.isCached) return;
      this.redisPublisher = new Redis({ host: REDIS_HOST, reconnectOnError: reconnectOnError });
      this.redisPublisher.on("connect", async () => {
        this.redisRole = await this.getRedisRole();

        this.redisClient?.disconnect();
        this.redisClient = new Redis({ sentinels: REDIS_SENTINELS, name: REDIS_NAME });
        this.redisClient.on("connect", async () => {
          if (process.env.NODE_APP_INSTANCE === "0") logger.info(`[MoredisDB][${this.dbName}] Redis client connected`);
          sysEmitter.emit(MOREDIS_EVENT.CONNECT, this.dbName);
          if (this.isMaster()) {
            await this.syncRedis();
          }
        });
      });
    });
  }

  protected getModel = (modelName: string): mongoose.Model<any> => {
    if (Object.keys(this.conn.models).includes(modelName)) {
      return this.conn.models[modelName];
    } else if (this.modelNames.includes(modelName)) {
      return this.conn.model(modelName, require(`@models/${modelName}.model`));
    }
    throw new Error(MSG_500["model_not_found"]);
  };

  protected save = async (modelName: string, obj: any) => {
    const model = this.getModel(modelName);
    return await new model(obj).save();
  };

  protected delete = async (modelName: string, key = {}, extMsg = {}): Promise<DeleteResult>  => {
    const model = this.getModel(modelName);
    const ret = await model.deleteMany(key);
    if (ret.acknowledged && this.isCached) {
      await this.syncRedis(modelName);
      await this.broadcastMsg(MOREDIS_EVENT.MODIFY, modelName, dbOperate.delete, key, extMsg);
    }
    return ret;
  };

  protected dropCollection = async (modelName: string) => {
    try {
      await this.conn.dropCollection(modelName);
    } catch (err) {
      logger.error(err);
    }
  };

  protected dropDatabase = async () => {
    await this.conn.dropDatabase();
  };

  public closeAndDestory = async () => {
    await this.conn.destroy();
  };

  protected findOneAndUpdate = async (modelName: string, key = {}, data: any, extMsg = {}) => {
    const model = this.getModel(modelName);
    if (!data && Object.keys(data).length === 0) throw new Error(`${MSG_500["update_failed"]}, ${key}: ${data}`);

    // Add null element to unset for delete that
    const unset: any = {};
    for (const prop of Object.keys(data)) {
      if (data[prop] === null) {
        delete data[prop];
        unset[prop] = 1;
      }
    }
    const updatedData = await model.findOneAndUpdate(key, { $set: data, $unset: unset }, this.options).exec();

    if (updatedData || this.isCached) {
      await this.syncRedis(modelName);
      await this.broadcastMsg(MOREDIS_EVENT.MODIFY, modelName, dbOperate.update, key, extMsg);
    }
    return updatedData;
  };

  protected findOne = async (modelName: string, key: {}) => {
    const model = this.getModel(modelName);
    return JSON.parse(JSON.stringify(await model.findOne(key, this.excluded).exec()));
  };

  protected find = async (modelName: string, key = {}) => {
    const model = this.getModel(modelName);
    return JSON.parse(JSON.stringify(await model.find(key, this.excluded).exec()));
  };

  private getRedisRole = async (): Promise<string | undefined> => {
    const info = await this.redisPublisher?.info();
    return info?.split("\r\n").find((line: string) => line.match(/role/))?.split(":")[1];
  };

  public isMaster = () => {
    return process.env.NODE_APP_INSTANCE === "0" && this.redisRole === "master";
  };

  protected publish = async (event: string, extMsg = {}) => {
    return await this.redisClient?.publish(event, JSON.stringify(extMsg));
  };

  public onMessage = (handleFunc: (...args: any[]) => void) => {
    this.redisPublisher?.on("message", handleFunc);
  };

  public subscribe = async (...args: any[]) => {
    await this.redisPublisher?.subscribe(...args);
  };

  public unsubscribe = (...args: any[]) => {
    this.redisPublisher?.unsubscribe(...args);
  };

  private broadcastMsg = async (event: MOREDIS_EVENT, modelName: string, operate: dbOperate, modified = {}, extMsg = {}) => {
    const msg: EventMsg = {
      dbName: this.dbName,
      modelName: modelName,
      modified: modified,
      operate: operate,
      extMsg: extMsg,
    };
    return await this.redisClient?.publish(event, JSON.stringify(msg));
  };

  /**
   * Redis functions below
   */

   private genRedisDBKey = (modelName: string) => {
    return `db:${this.dbName}:${modelName}`;
  };

  protected genRedisCacheKey = (...keys: string[]) => {
    return `cache:${this.dbName}:${keys.join(":")}`;
  };

  private syncRedis = async (modelName?: string, isLog = false) => {
    let modelNames = modelName ? [modelName] : this.modelNames;
    for (const mName of modelNames) {
      const data = await this.find(mName);
      if (data) {
        await this.redisSet(this.genRedisDBKey(mName), data, isLog);
      }
    }
  };

  private redisSet = async (redisKey: string, value: object, isLog = true) => {
    if (isLog) logger.debug("Cache", redisKey, "updated");
    if (this.redisClient) {
      return this.redisClient.set(redisKey, JSON.stringify(value), (err) => {
        if (err) logger.error(err);
      });
    }
    return null;
  };

  private redisGet = async (redisKey: string, keys: any = {}) => {
    try {
      if (this.redisClient) {
        let value = await this.redisClient.get(redisKey);
        let valueObj = isEmpty(value) ? [] : JSON.parse(value!);
        if (!isEmpty(keys) && typeof keys === "object" && valueObj) {
          valueObj = valueObj.filter((item: object) => {
            let flattenItem: any = flatten(item);
            for (let key in keys) {
              if (flattenItem[key] === undefined || flattenItem[key] != keys[key]) return false;
            }
            return true;
          });
        }
        return valueObj;
      }
    } catch (err) {
      logger.error(`redisGet failed.`, err);
    }
    return null;
  };

  public hybridFind = async (modelName: string, keys = {}) => {
    return (this.isCached && (await this.redisGet(this.genRedisDBKey(modelName), keys))) || (await this.find(modelName, keys));
  };

  public hybridFindOne = async (modelName: string, keys = {}): Promise<any> => {
    const ret = await this.hybridFind(modelName, keys);
    return ret && ret.length > 0 ? ret[0] : null;
  };

  public hybridUpdate = async (modelName: string, keys = {}, data: object, extMsg = {}) => {
    return await this.findOneAndUpdate(modelName, keys, data, extMsg);
  };
}
