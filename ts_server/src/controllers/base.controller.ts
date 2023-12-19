import { ROLES } from "@/configs/settings";
import { IUser } from "@/models/user.model";
import { checkAndGetAuthUser } from "@/services/auth.service";
import { NextFunction, Request, Response } from "express";

export interface IUserAuth extends IBasicAuth {
  user: IUser;
}

export interface IBasicAuth {}

type IBasicFunc = (info: IBasicAuth) => Promise<any>;

type IUserFunc = IBasicFunc | ((info: IUserAuth) => Promise<any>);

export const basicRole = [ROLES["basic"]];
export const advanceRole = [ROLES["advanced"], ROLES["admin"]];
export const storeRole = [ROLES["store"]];
export const admRole = [ROLES["admin"]];

class BaseController {
  private defaultRole: ROLES[];

  constructor(roles: ROLES[] = basicRole) {
    this.defaultRole = roles;
  }

  public callFunc = async (req: Request, res: Response, next: NextFunction, func: IBasicFunc): Promise<void> => {
    try {
      this.retSuccess(req, res, await func({}));
    } catch (err) {
      next(err);
    }
  };

  public callAuth = async (req: Request, res: Response, next: NextFunction, func: IUserFunc, requireRole = this.defaultRole) => {
    try {
      const data: IUserAuth = {
        user: await checkAndGetAuthUser(req.header("apiKey"), true, requireRole, res.locals.logId),
      };
      this.retSuccess(req, res, await func(data));
    } catch (err: any) {
      next(err);
    }
  };

  public callAuthNotActived = async (req: Request, res: Response, next: NextFunction, func: IUserFunc, requireRole = this.defaultRole) => {
    try {
      const data: IUserAuth = {
        user: await checkAndGetAuthUser(req.header("apiKey"), false, requireRole, res.locals.logId),
      };
      this.retSuccess(req, res, await func(data), data.user.name);
    } catch (err: any) {
      next(err);
    }
  };

  protected retSuccess = (req: Request, res: Response, ret: any, userName?: string) => {
    if (typeof ret === "object") {
      if (ret === null) res.end();
      else if (ret.status && ret.data) {
        res.status(ret.status).send(ret.data);
      } else {
        res.json(ret);
      }
    } else {
      const retStr = String(ret);
      res.send(retStr);
    }
  };
}
export default BaseController;
