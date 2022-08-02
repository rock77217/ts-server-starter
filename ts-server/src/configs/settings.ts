import { config } from "dotenv";
config();

export const { MONGO_URI, MONGO_URI_SUFFIX, NODE_ENV, PORT } = process.env;
export const ROLES = {
  basic: "basic",
  advanced: "advanced",
  store: "store",
  audit: "audit",
  admin: "admin",
};
export const SYS_DB = Object.freeze({
  info: "info",
});
export const ADM_NAME = "admin";

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
