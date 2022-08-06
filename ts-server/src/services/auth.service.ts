import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import infoMoredis, { stripeSecret } from "@services/moredis/info.moredis";
import User, { ChainMarket } from "@entities/info/user.entity";
import { ADM_NAME, MSG_400, MSG_403, MSG_500, ROLES } from "@configs/settings";
import { isEmpty } from "@utils/util";

interface UserSecretResponse {
  user: User;
  secret: string;
}

const checkAdminEnable = (users: User[]) => {
  return Boolean(users.length >= 1 && users[0].name === ADM_NAME && users[0].isActived);
};

const isMatchRole = (ownRoles: string[], requiredRole?: string[]) => {
  if (requiredRole) {
    for (const role of ownRoles) {
      if (requiredRole.includes(role)) return true;
    }
    return false;
  }
  return true;
};

export const initAdm = async () => {
  const users = await infoMoredis.listUsersWithSecret();
  if (!checkAdminEnable(users)) {
    await infoMoredis.clearUsers();
    const userSecretResp = await createUserWithSecret(ADM_NAME, Object.keys(ROLES), undefined, false);
    await infoMoredis.saveUser(userSecretResp.user);
    return userSecretResp.secret;
  }
  throw new Error(MSG_400["already_init"]);
};

export const createUserWithSecret = async (name: string, roles: string[], chainMarket?: ChainMarket, isActived = true): Promise<UserSecretResponse> => {
  const secret = uuidv4();
  const user = new User();
  user.name = name;
  user.secret = await argon2.hash(secret);
  user.isActived = isActived;
  user.roles = roles;
  user.chainMarket = chainMarket ? [chainMarket] : undefined;
  return { user, secret };
};

export const activateUser = async (name: string) => {
  const user = await infoMoredis.getUser(name);
  if (user) {
    if (user?.isActived) throw new Error(MSG_400["already_activated"]);
    user.isActived = !user.isActived;
    await infoMoredis.saveUser(user);
  } else {
    throw new Error(MSG_400["user_not_found"]);
  }
}

export const checkAndGetAuthUser = async (secret?: string, needActived = true, requireRole?: string[], withVault = false) => {
  const userList = await infoMoredis.listUsersWithSecret();
  if (isEmpty(userList)) throw new Error(MSG_500["server_error"]);
  for (const user of userList) {
    if (user?.secret && secret && await argon2.verify(user.secret, secret)) {
      if (needActived && !user.isActived) throw new Error(MSG_403["not_activated"]);
      if (!isMatchRole(user.roles, requireRole)) throw new Error(MSG_403["permission_denied"]);
    }

    return stripeSecret(user);
  }
  throw new Error(MSG_403["key_invalid"]);
};

export const checkRole = (roles: string[]) => {
  const result = Object.values(ROLES).filter(r => roles.indexOf(r) > -1);
  if (result.length === roles.length) return result;
  throw new Error(MSG_400["role_invalid"]);
}
