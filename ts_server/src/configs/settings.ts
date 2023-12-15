import { config } from "dotenv";
import DBSchema from "./db.schema.json";
config();

export const { PORT, NODE_ENV, LOG_DIR } = process.env;
export const getDefaultMongoUrl = (dbName: string): string => {
  return process.env.MONGO_URI_SUFFIX ? `${process.env.MONGO_URI}/${dbName}${process.env.MONGO_URI_SUFFIX}` : `${process.env.MONGO_URI}/${dbName}`;
};
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
