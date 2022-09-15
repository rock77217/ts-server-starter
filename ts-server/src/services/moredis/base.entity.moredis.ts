import {
  MONGO_URI,
  MONGO_URI_SUFFIX,
  REDIS_HOST,
  REDIS_NAME,
  REDIS_SENTINELS
} from "@configs/settings";
import sysEmitter from "@events/system.emitter";
import { MSG_400, MSG_500 } from "@exceptions/HttpException";
import { logger } from "@utils/logger";
import { isEmpty } from "@utils/util";
import flatten from "flat";
import Redis from "ioredis";
import { DataSource, ObjectLiteral } from "typeorm";

interface IEntityMap {
  [name: string]: any;
}

const reconnectOnError = (err: Error): boolean => {
  const targetErrors = ["READONLY", "ETIMEDOUT"];
  if (targetErrors.includes(err.message)) {
    return true;
  }
  return false;
};

const genEntityName = (entityName: string, appendStr?: string) => {
  return appendStr ? `${entityName}_${appendStr}` : entityName;
};

export const genEntitiesMap = (dbName: string, entityNames: string[], appendStr?: string) => {
  const entities: IEntityMap = {};
  for (let mName of entityNames) {
    let entity = require(`@entities/${dbName}/${mName}.entity`).default;
    if (!entity) throw new Error(`Entity load failed: ${mName}`);
    mName = genEntityName(mName, appendStr);
    entities[mName] = entity;
  }
  return entities;
};

export default class BaseMoredis {
  protected ds: DataSource;
  protected dbName: string;
  protected dbEntities: any = {};
  private isCached: boolean;
  private redisRole?: string;
  private redisPublisher?: Redis.Redis;
  private redisClient?: Redis.Redis;

  public MOREDIS_READY_EVENT = "moredis_ready";

  constructor(dbName: string, entities: IEntityMap, isCached = true) {
    this.dbName = dbName;
    this.isCached = isCached;
    this.dbEntities = entities;
    this.ds = new DataSource({
      type: "mongodb",
      url: MONGO_URI_SUFFIX ? `${MONGO_URI}/${dbName}${MONGO_URI_SUFFIX}` : `${MONGO_URI}/${dbName}`,
      entities: Object.values(this.dbEntities),
    });

    this.ds
      .initialize()
      .then(async () => {
        if (!this.isCached) return;
        this.redisPublisher = new Redis({ host: REDIS_HOST, reconnectOnError: reconnectOnError });
        this.redisPublisher.on("connect", async () => {
          this.redisRole = await this.getRedisRole();

          this.redisClient?.disconnect();
          this.redisClient = new Redis({ sentinels: REDIS_SENTINELS, name: REDIS_NAME });
          this.redisClient.on("connect", async () => {
            if (process.env.NODE_APP_INSTANCE === "0") logger.info(`[MoredisDB][${this.dbName}] Client connected`);
            sysEmitter.emit(this.MOREDIS_READY_EVENT, this.dbName);
            if (this.isMaster()) {
              await this.syncRedis();
            }
          });
        });
      })
      .catch((err) => {
        logger.error("[MongoDB] Connection error:", err);
      });
  }

  private getEntity = (entityName: string) => {
    const entity = this.dbEntities[entityName];
    if (entity) return entity;
    throw new Error(MSG_400["entity_not_found"]);
  };

  protected delete = async (entityName: string, key: ObjectLiteral = {}) => {
    const entity = this.getEntity(entityName);
    const ret = await this.ds.getMongoRepository(entity).deleteMany(key);
    if (ret && this.isCached) {
      await this.syncRedis(entityName);
    }
    return ret;
  };

  protected findOneAndUpdate = async (entityName: string, key: ObjectLiteral = {}, data: Object) => {
    const entity = this.getEntity(entityName);
    if (!data && Object.keys(data).length === 0) throw new Error(`${MSG_500["update_failed"]}, ${key}: ${data}`);

    const updatedData = await this.ds
      .getMongoRepository(entity)
      .findOneAndUpdate(key, { $set: data }, { upsert: true, returnOriginal: false });

    if (updatedData && this.isCached) {
      await this.syncRedis(entityName);
    }
    return JSON.parse(JSON.stringify(updatedData));
  };

  protected findOne = async (entityName: string, key: ObjectLiteral = {}) => {
    const entity = this.getEntity(entityName);
    return JSON.parse(JSON.stringify(await this.ds.manager.findOne(entity, key)));
  };

  protected find = async (entityName: string, key: ObjectLiteral = {}) => {
    const entity = this.getEntity(entityName);
    return JSON.parse(JSON.stringify(await this.ds.manager.find(entity, key)));
  };

  public isMaster = () => {
    return process.env.NODE_APP_INSTANCE === "0" && this.redisRole === "master";
  };

  /**
   * Redis functions below
   */

  private genRedisDBKey = (entityName: string) => {
    return `db:${this.dbName}:${entityName}`;
  };

  protected genRedisCacheKey = (...keys: string[]) => {
    return `cache:${this.dbName}:${keys.join(":")}`;
  };

  private syncRedis = async (entityName?: string, isLog = false) => {
    let entityNames = entityName ? [entityName] : Object.keys(this.dbEntities);
    for (const mName of entityNames) {
      const data = await this.find(mName);
      if (data) {
        await this.redisSet(this.genRedisDBKey(mName), data, isLog);
      }
    }
  };

  private getRedisRole = async () => {
    const info = await this.redisPublisher?.info();
    const role = info
      ?.split("\r\n")
      .find((line: string) => line.match(/role/))
      ?.split(":")[1];
    if (role === undefined) throw new Error(`Redis role invalid. info: ${JSON.stringify(info)}`);
    return role;
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

  public hybridFind = async (entityName: string, keys = {}) => {
    return (
      (this.isCached && (await this.redisGet(this.genRedisDBKey(entityName), keys))) ||
      (await this.find(entityName, keys))
    );
  };

  public hybridFindOne = async (entityName: string, keys = {}) => {
    const ret = await this.hybridFind(entityName, keys);
    return ret && ret.length > 0 ? ret[0] : null;
  };

  public hybridUpdate = async (entityName: string, keys = {}, data: object) => {
    return await this.findOneAndUpdate(entityName, keys, data);
  };
}
