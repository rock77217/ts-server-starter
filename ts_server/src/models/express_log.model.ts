import { Schema } from "mongoose";

export interface IExpressLog {
  logId: string;
  operator?: string;
  path?: string;
  method?: string;
  query?: string;
  params: string;
  body: string;
  result?: string;
  executionTime?: number;
  retStatus?: number;
  createTime?: Date;
  updateTime?: Date;
}

const ExpressLogSchema = new Schema<IExpressLog>(
  {
    logId: { type: String, required: true },
    operator: { type: String, default: "system" },
    path: { type: String },
    method: { type: String },
    query: { type: String },
    params: { type: String },
    body: { type: String },
    result: { type: String },
    executionTime: { type: Number },
    retStatus: { type: Number },
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = ExpressLogSchema;
