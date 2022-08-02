import { Request, Response } from "express";
import { ROLES } from "@/configs/settings";
import { checkAndGetAuthUser } from "@services/auth.service";

class BaseController {
  protected basicRole = [ROLES["basic"]];
  protected advanceRole = [ROLES["advanced"], ROLES["admin"]];
  protected storeRole = [ROLES["store"]];
  protected admRole = [ROLES["admin"]];

  public callFunc = async (req: Request, res: Response, func: Function): Promise<void> => {
    try {
      this.retSuccess(res, await func(req));
    } catch (err) {
      this.retFail(res, err);
    }
  };

  public callAuthFunc = async (req: Request, res: Response, func: Function, requireRole = this.basicRole) => {
    try {
      const user = await checkAndGetAuthUser(req.header("apiKey"), true, requireRole);
      this.retSuccess(res, await func(req, user));
    } catch (err) {
      this.retFail(res, err);
    }
  };

  public callAuthFuncNotActived = async (req: Request, res: Response, func: Function, requireRole = this.basicRole) => {
    try {
      const user = await checkAndGetAuthUser(req.header("apiKey"), false, requireRole);
      this.retSuccess(res, await func(req, user));
    } catch (err) {
      this.retFail(res, err);
    }
  };

  protected retSuccess = (res: Response, ret: any) => {
    if (typeof ret === "object") {
      if (ret === null) res.end();
      else if (ret.status && ret.data) {
        res.status(ret.status).send(ret.data);
      } else {
        res.json(ret);
      }
    } else {
      res.send(String(ret));
    }
  };

  protected retFail = (res: Response, err: unknown, code: number = 500) => {
    if (err instanceof Error) {
      const errMsg = err && err.message ? err.message : err;
      console.error(err);
      res.status(code).json({ error: errMsg });
    } else {
      console.log("Unexpected error:", err);
    }
  };
}

export default BaseController;
