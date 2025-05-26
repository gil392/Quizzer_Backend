import { Model, Schema, model } from "mongoose";
import { Achievement } from "./types";

const conditionSchema = new Schema(
  {
    values: { type: Map, of: Number, default: {} },
    count: { type: Number, required: true },
  },
  { _id: false }
);

const requirementSchema = new Schema(
  {
    type: { type: String, enum: ["quiz", "user"], required: true },
    condition: { type: conditionSchema, required: true },
  },
  { _id: false }
);

const rewardSchema = new Schema(
  {
    type: { type: String, required: true, enum: ["icon", "xp"] },
    icon: { type: String },
    xp: { type: Number },
  },
  { _id: false }
);

const achievementSchema = new Schema({
  description: { type: String, required: true },
  rewards: [rewardSchema],
  requirements: [requirementSchema],
  achivmentLock: { type: String },
});

export type AchievementsModel = Model<Achievement>;
export const achievementsModel = model("achievement", achievementSchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     Condition:
 *       type: object
 *       required:
 *         - values
 *         - count
 *       properties:
 *         values:
 *           type: object
 *           additionalProperties:
 *             type: number
 *           description: A key-value map representing field names and their expected numbers
 *         count:
 *           type: number
 *           description: Total number of matching fields required
 *       example:
 *         values:
 *           streak: 5
 *           grade: 90
 *         count: 2
 *
 *     Requirement:
 *       type: object
 *       required:
 *         - type
 *         - condition
 *       properties:
 *         type:
 *           type: string
 *           enum: [quiz, user]
 *           description: Type of requirement
 *         condition:
 *           $ref: '#/components/schemas/Condition'
 *       example:
 *         type: "quiz"
 *         condition:
 *           values:
 *             grade: 90
 *           count: 1
 *
 *     Reward:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum: [icon, xp]
 *           description: Type of reward
 *         icon:
 *           type: string
 *           description: Icon name (only if type is "icon")
 *         xp:
 *           type: number
 *           description: XP amount (only if type is "xp")
 *       example:
 *         type: "xp"
 *         xp: 100
 *
 *     Achievement:
 *       type: object
 *       required:
 *         - description
 *         - rewards
 *         - requirements
 *       properties:
 *         description:
 *           type: string
 *           description: Description of the achievement
 *         rewards:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Reward'
 *         requirements:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Requirement'
 *         achivmentLock:
 *           type: string
 *           description: id of achievment that must be completed before
 *       example:
 *         description: "Complete 5 quizzes with at least 90% grade"
 *         rewards:
 *           - type: "xp"
 *             xp: 100
 *         requirements:
 *           - type: "quiz"
 *             condition:
 *               values:
 *                 grade: 90
 *               count: 5
 */
