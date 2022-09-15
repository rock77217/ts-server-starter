import { DBS, SYS_DB } from "@configs/settings";
import { IUser } from "@models/user.model";
import { DeleteResult } from "mongodb";
import BaseMoredis from "./base.moredis";

export const stripeSecret = (user: IUser, keepSecret = false) => {
  if (!keepSecret) {
    delete user?.secret;
    delete user?.secretCandidate;
  }

  return user;
};

class InfoMoredis extends BaseMoredis {
  constructor() {
    super(SYS_DB.info, Object.keys(DBS.info));
  }

  public getUser = async (name: string): Promise<IUser> => {
    return await this.hybridFindOne(DBS.info.user, { name: name });
  };

  public listUsersWithSecret = async (): Promise<IUser[]> => {
    return await this.hybridFind(DBS.info.user);
  };

  public listUsers = async (): Promise<IUser[]> => {
    const userList = [];
    for (const user of await this.hybridFind(DBS.info.user)) {
      userList.push(stripeSecret(user));
    }
    return userList;
  };

  public clearUsers = async (): Promise<DeleteResult> => {
    return await this.delete(DBS.info.user, {});
  };

  public saveUser = async (user: IUser, key = { name: user.name }) => {
    return await this.hybridUpdate(DBS.info.user, key, user);
  };
}

const infoMoredis = new InfoMoredis();
export default infoMoredis;
