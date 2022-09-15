import { DBS, LOG_ALIVE_MONTHS, SYS_DB } from "@configs/settings";
import { IExpressLog } from "@models/express_log.model";
import moment from "moment";
import BaseMoredis from "./base.moredis";

class LogMoredis extends BaseMoredis {
  constructor() {
    super(SYS_DB.log, Object.keys(DBS.log), false);
  }

  public saveExpressLog = async (log: IExpressLog) => {
    return await this.save(DBS.log.express_log, log);
  };

  public deleteOldExpressLog = async () => {
    const olderThan = moment().subtract(LOG_ALIVE_MONTHS, "months").toDate();
    const key = { createTime: { $lte: olderThan } };
    return await this.delete(DBS.log.express_log, key);
  };
}

const logMoredis = new LogMoredis();
export default logMoredis;
