import { IExpressLog } from "@/models/express_log.model";
import logMoredis from "@/services/moredis/log.moredis";
import { logger } from "@/utils/logger";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

export default class ExpressLog {
  public static create = async (req: Request): Promise<string | undefined> => {
    try {
      const logId = uuidv4();
      const log: IExpressLog = {
        logId: logId,
        path: req.path,
        method: req.method,
        query: JSON.stringify(req.query),
        params: JSON.stringify(req.params),
        body: JSON.stringify(req.body),
      };
      await logMoredis.saveExpressLog(log);
      return logId;
    } catch (e: any) {
      logger.warn(`Create express log failed.`, e);
      return undefined;
    }
  };

  public static updateUser = async (logId: string, userName?: string) => {
    if (!logId) return;
    try {
      const log = await logMoredis.getExpressLog(logId);
      if (log) {
        log.operator = userName;
        await logMoredis.saveExpressLog(log);
      } else throw new Error(`Log ${logId} not found.`);
    } catch (e: any) {
      logger.error(`Save express log failed.`, e);
    }
  };

  public static updateResult = async (logId: string, ret?: any, status?: number) => {
    if (!logId) return;
    try {
      const log = await logMoredis.getExpressLog(logId);
      if (log) {
        log.result = ret !== undefined ? (typeof ret === "object" ? JSON.stringify(ret) : String(ret)) : undefined;
        log.retStatus = status;
        log.executionTime = log.createTime ? Date.now() - new Date(log.createTime).getTime() : undefined;
        await logMoredis.saveExpressLog(log);
      } else throw new Error(`Log ${logId} not found.`);
    } catch (e: any) {
      logger.error(`Save express log failed.`, e);
    }
  };

  public static clearOldLogs = async () => {
    return await logMoredis.deleteOldExpressLog();
  };
}