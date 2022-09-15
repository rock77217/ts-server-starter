import { Schema } from "mongoose";
import { ROLES } from "../configs/settings";

export interface IUser {
  name: string;
  secret?: string;
  secretCandidate?: string | null;
  isActived: boolean;
  roles?: ROLES[];
  updateTime?: Date;
  createTime?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, unique: true },
    secret: { type: String, require: true },
    secretCandidate: { type: String },
    isActived: { type: Boolean, require: true, default: true },
    roles: { type: [String], default: [ROLES.basic], enum: Object.values(ROLES) },
    updateTime: { type: Date, default: Date.now },
    createTime: { type: Date, default: Date.now },
  }
);

module.exports = UserSchema;
