import { MSG_200, MSG_400 } from "@exceptions/HttpException";
import { activateUser, checkRole, createUserWithSecret, initAdm } from "@services/auth.service";
import infoMoredis from "@services/moredis/info.moredis";
import { NextFunction, Request, Response } from "express";
import BaseController, { admRole, IUserAuth } from "./base.controller";

class AdmController extends BaseController {
  constructor() {
    super(admRole);
  }

  initAdm = (req: Request, res: Response, next: NextFunction) => {
    this.callFunc(req, res, next, async () => {
      return await initAdm();
    });
  };

  public activeAdm = (req: Request, res: Response, next: NextFunction) => {
    this.callAuthNotActived(req, res, next, async (req: Request, auth: IUserAuth) => {
      await activateUser(auth.user.name);
      return MSG_200["activated"];
    });
  };

  listUsers = (req: Request, res: Response, next: NextFunction) => {
    this.callAuth(req, res, next, async () => {
      return await infoMoredis.listUsers();
    });
  };

  saveUser = (req: Request, res: Response, next: NextFunction) => {
    this.callAuth(req, res, next, async (req: Request) => {
      const { name, roles } = req.body;

      const existUser = await infoMoredis.getUser(name);
      if (existUser) {
        existUser.roles = checkRole(roles);
        return await infoMoredis.saveUser(existUser) ? MSG_200["successful"] : MSG_400["update_failed"];
      } else {
        const userWithSecret = await createUserWithSecret(name, checkRole(roles));
        return await infoMoredis.saveUser(userWithSecret.user) ? userWithSecret.secret : MSG_400["update_failed"];
      }
    });
  }
}

const admController = new AdmController();
export default admController;
