import { config } from "dotenv";
import DBSchema from "./db.schema.json";
config();

const loadRedisUri = (_redisUriArray = process.env.REDIS_SENTINELS) => {
  if (_redisUriArray) {
    let redis_hosts: Array<{ host: string; port: number }> = [];
    let uriList = _redisUriArray.split(",");
    for (let uri of uriList) {
      let host = uri.split(":");
      redis_hosts.push({ host: host[0], port: Number(host[1]) || 26379 });
    }
    return redis_hosts;
  }
  throw new Error("loadRedisUri failed!");
};

export const { MONGO_URI, MONGO_URI_SUFFIX, NODE_ENV, PORT, REDIS_HOST, LOG_DIR } = process.env;
export const ADM_NAME = "admin";
export enum ROLES {
  basic = "basic",
  advanced = "advanced",
  store = "store",
  audit = "audit",
  admin = "admin",
}
export const LOG_ALIVE_MONTHS = 3;

/**
 * DBs
 */
export const DBS = DBSchema;
export enum SYS_DB {
  info = "info",
  metadata = "metadata",
  log = "log",
}

/**
 * Redis values
 */
export const REDIS_SENTINELS = loadRedisUri();
export const REDIS_NAME = "mymaster";
