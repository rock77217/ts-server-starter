import { ROLES } from "@configs/settings";
import { IExpressLog } from "@models/express_log.model";
import { IUser } from "@models/user.model";
import { checkAndGetAuthUser } from "@services/auth.service";
import logMoredis from "@services/moredis/log.moredis";
import { logger } from "@utils/logger";
import { NextFunction, Request, Response } from "express";

export interface IUserAuth extends IBasicAuth {
  user: IUser;
}

export interface IBasicAuth {}

type IBasicFunc = (req: Request, info: IBasicAuth) => Promise<any>;

type IUserFunc = IBasicFunc | ((req: Request, info: IUserAuth) => Promise<any>);

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
      this.retSuccess(req, res, await func(req, {}));
    } catch (err) {
      next(err);
    }
  };

  public callAuth = async (req: Request, res: Response, next: NextFunction, func: IUserFunc, requireRole = this.defaultRole) => {
    try {
      const data: IUserAuth = {
        user: await checkAndGetAuthUser(req.header("apiKey"), true, requireRole),
      };
      this.retSuccess(req, res, await func(req, data));
    } catch (err: any) {
      next(err);
    }
  };

  public callAuthNotActived = async (req: Request, res: Response, next: NextFunction, func: IUserFunc, requireRole = this.defaultRole) => {
    try {
      const data: IUserAuth = {
        user: await checkAndGetAuthUser(req.header("apiKey"), false, requireRole),
      };
      this.retSuccess(req, res, await func(req, data), data.user.name);
    } catch (err: any) {
      next(err);
    }
  };

  protected retSuccess = (req: Request, res: Response, ret: any, userName?: string) => {
    if (typeof ret === "object") {
      if (ret === null) res.end();
      else if (ret.status && ret.data) {
        res.status(ret.status).send(ret.data);
        this.saveExpressLog(req, ret.data, userName);
      } else {
        res.json(ret);
        this.saveExpressLog(req, ret, userName);
      }
    } else {
      const retStr = String(ret);
      res.send(retStr);
      this.saveExpressLog(req, retStr, userName);
    }
  };

  private saveExpressLog = async (req: Request, ret: any, userName?: string) => {
    try {
      if (req.method.toLowerCase() !== "get") {
        const log: IExpressLog = {
          operator: userName,
          path: req.path,
          method: req.method,
          params: JSON.stringify(req.params),
          body: JSON.stringify(req.body),
          result: typeof ret === "object" ? JSON.stringify(ret) : String(ret),
        }
        await logMoredis.saveExpressLog(log);
      }
    } catch (err: any) {
      logger.error(`Save express log failed. ${err}`);
    }
  };
}
export default BaseController;
