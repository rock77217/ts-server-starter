import { DBS, SYS_DB } from "@/configs/settings";
import { IUser } from "@/models/user.model";
import BaseMongo from "@/services/mongo/base.mongo";
import mongoose from "mongoose";

export const stripeSecret = (user: IUser, keepSecret = false) => {
  if (!keepSecret) {
    delete user?.secret;
    delete user?.secretCandidate;
  }

  return user;
};

class InfoMongo extends BaseMongo {
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

  public clearUsers = async (): Promise<mongoose.mongo.DeleteResult> => {
    return await this.delete(DBS.info.user, {});
  };

  public saveUser = async (user: IUser, key = { name: user.name }) => {
    return await this.hybridUpdate(DBS.info.user, key, user);
  };
}

const infoMongo = new InfoMongo();
export default infoMongo;
