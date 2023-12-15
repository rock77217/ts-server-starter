import ExpressLog from "@/handlers/express_log.handler";
import { NextFunction, Request, Response } from "express";

const saveResponseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { send } = res;
  res.send = function (body) {
    if (res.locals.logId) ExpressLog.updateResult(res.locals.logId, body);
    return send.call(this, body);
  };
  next();
};

export default saveResponseMiddleware;
