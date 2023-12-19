import BaseController, { IUserAuth, admRole } from "@/controllers/base.controller";
import { MSG_200, MSG_400 } from "@/exceptions/HttpException";
import { activateUser, checkRole, createUserWithSecret, initAdm } from "@/services/auth.service";
import infoMongo from "@/services/mongo/info.mongo";
import { NextFunction, Request, Response } from "express";

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
    this.callAuthNotActived(req, res, next, async (auth: IUserAuth) => {
      await activateUser(auth.user.name);
      return MSG_200["activated"];
    });
  };

  listUsers = (req: Request, res: Response, next: NextFunction) => {
    this.callAuth(req, res, next, async () => {
      return await infoMongo.listUsers();
    });
  };

  saveUser = (req: Request, res: Response, next: NextFunction) => {
    this.callAuth(req, res, next, async () => {
      const { name, roles } = req.body;

      const existUser = await infoMongo.getUser(name);
      if (existUser) {
        existUser.roles = checkRole(roles);
        return await infoMongo.saveUser(existUser) ? MSG_200["successful"] : MSG_400["update_failed"];
      } else {
        const userWithSecret = await createUserWithSecret(name, checkRole(roles));
        return await infoMongo.saveUser(userWithSecret.user) ? userWithSecret.secret : MSG_400["update_failed"];
      }
    });
  }
}

const admController = new AdmController();
export default admController;
