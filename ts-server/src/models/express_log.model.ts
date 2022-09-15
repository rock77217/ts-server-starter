import { Schema } from "mongoose";

export interface IExpressLog {
  operator?: string;
  path?: string;
  method?: string;
  params: string;
  body: string;
  result: string;
  createTime?: Date;
}

const ExpressLogSchema = new Schema<IExpressLog>(
  {
    operator: { type: String, default: "system" },
    path: { type: String },
    method: { type: String },
    params: { type: String },
    body: { type: String },
    result: { type: String },
    createTime: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = ExpressLogSchema;
