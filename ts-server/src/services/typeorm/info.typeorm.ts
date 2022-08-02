import { BaseTypeorm } from "./base.typeorm";
import { SYS_DB } from "@configs/settings";
import { User } from "@entities/info/user.entity";

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

class InfoTypeorm extends BaseTypeorm {
  constructor() {
    super(SYS_DB.info, [User]);
  }

  public getUser = async (name: string) => {
    return await this.findOne(User, { name: name });
  };

  public listUsersWithSecret = async () => {
    return await this.find(User);
  };

  public listUsers = async () => {
    const userList = [];
    for (const user of await this.find(User)) {
      userList.push(stripeSecret(user));
    }
    return userList;
  };

  public clearUsers = async () => {
    return await this.delete(User, {});
  };

  public saveUser = async (user: User, key = { name: user.name }) => {
    return await this.findOneAndUpdate(User, user, key);
  };
}

const infoTypeorm = new InfoTypeorm();
export default infoTypeorm;
