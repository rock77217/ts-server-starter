import { DBS, LOG_ALIVE_MONTHS, SYS_DB } from "@/configs/settings";
import { IExpressLog } from "@/models/express_log.model";
import BaseMongo from "@/services/mongo/base.mongo";
import moment from "moment";

class LogMongo extends BaseMongo {
  constructor() {
    super(SYS_DB.log, Object.keys(DBS.log));
  }

  public saveExpressLog = async (log: IExpressLog) => {
    const key = { logId: log.logId };
    log.updateTime = new Date();
    return await this.hybridUpdate(DBS.log.express_log, key, log);
  };

  public getExpressLog = async (logId: string): Promise<IExpressLog | null> => {
    return await this.hybridFindOne(DBS.log.express_log, { logId });
  };

  public deleteOldExpressLog = async () => {
    const olderThan = moment().subtract(LOG_ALIVE_MONTHS, "months").toDate();
    const key = { createTime: { $lte: olderThan } };
    return await this.delete(DBS.log.express_log, key);
  };
}

const logMongo = new LogMongo();
export default logMongo;
