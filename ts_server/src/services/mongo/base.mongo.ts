import { getDefaultMongoUrl } from "@/configs/settings";
import HttpException, { MSG_500 } from "@/exceptions/HttpException";
import { logger } from "@/utils/logger";
import { deleteUndefinedElem, isMasterThread } from "@/utils/util";
import mongoose, { ConnectOptions, QueryOptions } from "mongoose";
import urlJoin from "url-join";

export default class BaseMongo {
  public dbName: string;
  protected conn?: mongoose.Connection;
  protected modelNames: string[];

  private connectOptions: ConnectOptions = { connectTimeoutMS: 60000, serverSelectionTimeoutMS: 60000 };
  private excluded = { _id: 0, __v: 0 };
  private options: QueryOptions = { upsert: true, new: true, setDefaultsOnInsert: true, projection: this.excluded };

  constructor(dbName: string, modelNames: string[]) {
    this.dbName = dbName;
    this.modelNames = modelNames;

    this.tryConnectDB();
  }

  public tryConnectDB = async (serverUrl?: string) => {
    if (this.conn) await this.closeAndDestory();
    const url = serverUrl ? urlJoin(serverUrl, this.dbName) : getDefaultMongoUrl(this.dbName);
    try {
      this.conn = mongoose.createConnection(url, this.connectOptions);

      this.conn.once("open", () => {
        if (this.conn) {
          this.conn.on("error", (err: any) => {
            logger.error(`[MongoDB][${this.dbName}] Connection event: error. Reason: ${err.message}`);
            mongoose.disconnect();
          });

          this.conn.on("disconnected", () => {
            logger.error(`[MongoDB][${this.dbName}] Connection event: disconnected.`);
            // Retry wnhen disconnected
            setImmediate(() => this.tryConnectDB());
          });

          this.conn.on("reconnected", () => {
            this._handleConnected();
          });

          this._handleConnected();
        }
      });
    } catch (err: any) {
      logger.error(`[MongoDB][${this.dbName}] MongoDB connect error. Reason: ${err.message}`);
      // Retry when error at first time
      setImmediate(() => this.tryConnectDB());
    }
  };

  private _handleConnected = async () => {
    if (isMasterThread()) {
      if (this.conn) {
        for (const modelName of Object.keys(this.conn.models)) {
          await this.conn.models[modelName].syncIndexes();
        }
      }

      logger.info(`[MongoDB][${this.dbName}] Start connect.`);
    }
  };

  protected getModel = (modelName: string): mongoose.Model<any> => {
    if (this.conn) {
      if (Object.keys(this.conn.models).includes(modelName)) {
        return this.conn.models[modelName];
      } else if (this.modelNames.includes(modelName)) {
        return this.conn.model(modelName, require(`@/models/${modelName}.model`));
      }
      throw new HttpException(MSG_500["model_not_found"]);
    } else throw new HttpException(MSG_500["db_not_connected"]);
  };

  protected save = async (modelName: string, obj: any) => {
    const model = this.getModel(modelName);
    return await new model(obj).save();
  };

  protected isExists = async (modelName: string, key: object = {}): Promise<boolean> => {
    const model = this.getModel(modelName);
    return Boolean(await model.exists(deleteUndefinedElem(key)));
  };

  protected delete = async (modelName: string, key = {}, extMsg = {}): Promise<mongoose.mongo.DeleteResult> => {
    key = deleteUndefinedElem(key);
    const model = this.getModel(modelName);
    return await model.deleteMany(key);
  };

  protected dropCollection = async (modelName: string) => {
    try {
      await this.conn?.dropCollection(modelName);
    } catch (err) {
      logger.error(err);
    }
  };

  protected dropDatabase = async () => {
    await this.conn?.dropDatabase();
  };

  public closeAndDestory = async () => {
    await this.conn?.destroy();
  };

  protected findOneAndUpdate = async (modelName: string, key = {}, data: any, options: QueryOptions = {}, extMsg = {}) => {
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
    const updateQuery = { $set: data, $unset: unset };
    return await model.findOneAndUpdate(key, updateQuery, { ...this.options, ...options }).exec();
  };

  protected findOne = async (modelName: string, key: {}) => {
    const model = this.getModel(modelName);
    return JSON.parse(JSON.stringify(await model.findOne(key, this.excluded).exec()));
  };

  protected find = async (modelName: string, key = {}) => {
    const model = this.getModel(modelName);
    return JSON.parse(JSON.stringify(await model.find(key, this.excluded).exec()));
  };

  public hybridFind = async (modelName: string, keys = {}) => {
    return await this.find(modelName, deleteUndefinedElem(keys));
  };

  public hybridFindOne = async (modelName: string, keys = {}): Promise<any> => {
    const key = deleteUndefinedElem(keys);
    if (Object.keys(key).length === 0) return null;
    const ret = await this.hybridFind(modelName, key);
    return ret && ret.length > 0 ? ret[0] : null;
  };

  public hybridUpdate = async (modelName: string, keys = {}, data: object, extMsg = {}) => {
    return await this.findOneAndUpdate(modelName, deleteUndefinedElem(keys), data, extMsg);
  };
}
