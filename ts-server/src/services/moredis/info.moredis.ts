import BaseMoredis, { genEntitiesMap } from "./base.moredis";
import { DBS, SYS_DB } from "@configs/settings";
import User from "@entities/info/user.entity";

export const stripeSecret = (user: User, keepSecret = false, keepVault = false) => {
  if (!keepVault) {
    user?.chainMarket?.forEach((chainMarket) => {
      if (chainMarket.vault) chainMarket.vault = "Invisible";
    });
  }

  if (!keepSecret) {
    delete user?.secret;
    delete user?.secretCandidate;
  }

  return user;
};

class InfoMoredis extends BaseMoredis {
  constructor() {
    const entities = genEntitiesMap(SYS_DB.info, Object.keys(DBS.info));
    super(SYS_DB.info, entities);
  }

  public getUser = async (name: string) => {
    return await this.hybridFindOne(DBS.info.user, { name: name });
  };

  public listUsersWithSecret = async () => {
    return await this.hybridFind(DBS.info.user);
  };

  public listUsers = async () => {
    const userList = [];
    for (const user of await this.hybridFind(DBS.info.user)) {
      userList.push(stripeSecret(user));
    }
    return userList;
  };

  public clearUsers = async () => {
    return await this.delete(DBS.info.user, {});
  };

  public saveUser = async (user: User, key = { name: user.name }) => {
    return await this.hybridUpdate(DBS.info.user, key, user);
  };
}

const infoMoredis = new InfoMoredis();
export default infoMoredis;
