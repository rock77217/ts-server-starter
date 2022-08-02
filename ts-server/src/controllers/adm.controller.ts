import BaseController from "./base.controller";
import { Request, Response } from "express";
import { activateUser, checkRole, createUserWithSecret, initAdm } from "@services/auth.service";
import { User } from "@entities/info/user.entity";
import { MSG_200, MSG_400 } from "@configs/settings";
import infoTypeorm from "@services/typeorm/info.typeorm";

class AdmController extends BaseController {
  initAdm = async (req: Request, res: Response) => {
    this.callFunc(req, res, async (req: Request) => {
      return await initAdm();
    });
  };

  activeAdm = async (req: Request, res: Response) => {
    this.callAuthFuncNotActived(req, res, async (req: Request, user: User) => {
      await activateUser(user.name);
      return MSG_200["activated"];
    }, this.admRole)
  };

  listUsers = async (req: Request, res: Response) => {
    this.callAuthFunc(req, res, async (req: Request, user: User) => {
      return await infoTypeorm.listUsers();
    }, this.admRole);
  };

  saveUser = async (req: Request, res: Response) => {
    this.callAuthFunc(req, res, async (req: Request, user: User) => {
      const { name, roles } = req.body;

      const existUser = await infoTypeorm.getUser(name);
      if (existUser) {
        existUser.roles = checkRole(roles);
        return await infoTypeorm.saveUser(existUser) ? MSG_200["successful"] : MSG_400["update_failed"];
      } else {
        const userWithSecret = await createUserWithSecret(name, checkRole(roles));
        return await infoTypeorm.saveUser(userWithSecret.user) ? userWithSecret.secret : MSG_400["update_failed"];
      }
    }, this.admRole);
  }
}

const admController = new AdmController();
export default admController;
