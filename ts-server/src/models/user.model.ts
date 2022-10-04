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

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       description: User data
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         isActived:
 *           type: boolean
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *         updateTime:
 *           type: string
 *         createTime:
 *           type: string
 */
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
