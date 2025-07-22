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
    type: { type: String, required: true },
    condition: { type: conditionSchema, required: true },
  },
  { _id: false }
);

const rewardSchema = new Schema(
  {
    icon: { type: String, required: true },
    xp: { type: Number, default: 0 },
  },
  { _id: false }
);

const achievementSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  reward: rewardSchema,
  requirements: [requirementSchema],
  achivmentLock: { type: String },
  sharedUsers: { type: [String], default: [] },
});

export type AchievementsModel = Model<Achievement>;
export const achievementModel = model<Achievement>(
  "achievement",
  achievementSchema
);

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
 *         - icon
 *         - xp
 *       properties:
 *         icon:
 *           type: string
 *           description: Icon url (image path)
 *         xp:
 *           type: number
 *           description: XP amount
 *       example:
 *         icon: "/images/achievements1.png"
 *         xp: 100
 *
 *     Achievement:
 *       type: object
 *       required:
 *         - _id
 *         - title
 *         - description
 *         - reward
 *         - requirements
 *       properties:
 *         _id:
 *           type: string
 *           format: mongoose.Types.ObjectId
 *           description: User's ids
 *         title:
 *           type: string
 *           description: Title of the achievement
 *         description:
 *           type: string
 *           description: Description of the achievement
 *         reward:
 *           $ref: '#/components/schemas/Reward'
 *         requirements:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Requirement'
 *         achivmentLock:
 *           type: string
 *           description: id of achievment that must be completed before
 *       example:
 *         title: "A Student"
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
 *
 *     RequirmentProgress:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Total required count for the requirement.
 *           example: 10
 *         value:
 *           type: integer
 *           description: Current progress made towards the requirement.
 *           example: 5
 *
 *     AchievementProgress:
 *       type: object
 *       required:
 *         - _id
 *         - description
 *         - rewards
 *         - requirements
 *       properties:
 *         _id:
 *           type: string
 *           format: mongoose.Types.ObjectId
 *           description: User's ids
 *         title:
 *           type: string
 *           description: Title of the achievement
 *         description:
 *           type: string
 *           description: Description of the achievement.
 *         rewards:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Reward'
 *         achievementLock:
 *           type: string
 *           description: Optional lock ID that must be unlocked first.
 *         requirements:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RequirmentProgress'
 */
