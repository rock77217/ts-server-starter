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
export const ROLES = {
  basic: "basic",
  advanced: "advanced",
  store: "store",
  audit: "audit",
  admin: "admin",
};

/**
 * DBs
 */
export const DBS = DBSchema;
export const SYS_DB = Object.freeze({
  info: "info",
});

/**
 * Redis values
 */
export const REDIS_SENTINELS = loadRedisUri();
export const REDIS_NAME = "mymaster";

/**
 * Http return values
 */
export const MSG_200 = {
  successful: "Successful",
  activated: "Activated",
};
export const MSG_400 = {
  already_activated: "Already activated",
  already_init: "Adm user already activated",
  entity_not_found: "Entity not found. Please check your input.",
  role_invalid: "Invalid roles",
  user_not_found: "User name not found",
  update_failed: "Update data failed.",
  delete_failed: "Delete data failed.",
};
export const MSG_403 = {
  auth_failed: "Authentication error",
  key_invalid: "API key invalid",
  not_activated: "This user not activated yet",
  permission_denied: "Permission denied",
};
export const MSG_404 = {
  not_found: "Not Found",
};
export const MSG_500 = {
  update_failed: "Database update error",
  server_error: "Server error, please contact administrator",
};
