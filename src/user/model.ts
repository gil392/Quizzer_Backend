import { Model, Schema, model } from "mongoose";
import { z } from "zod";
import { Settings, settingsSchema, settingsZodSchema } from "./settingsModel";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - hashedPassword
 *         - username
 *         - streak
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         hashedPassword:
 *           type: string
 *           description: Hashed password for authentication
 *         username:
 *           type: string
 *           description: The display name or handle of the user
 *         refreshToken:
 *           type: array
 *           description: List of refresh tokens issued to the user
 *           items:
 *             type: string
 *         friendRequests:
 *           type: array
 *           description: List of user IDs who sent friend requests
 *           items:
 *             type: string
 *         friends:
 *           type: array
 *           description: List of user IDs who are friends
 *           items:
 *             type: string
 *         favoriteLessons:
 *           type: array
 *           description: List of lesson IDs favorited by the user
 *           items:
 *             type: string
 *         streak:
 *           type: number
 *           description: Current streak count (e.g., days active in a row)
 *         settings:
 *           type: Settings
 *           description: User settings for lesson
 *       example:
 *         email: "jane.doe@example.com"
 *         hashedPassword: "$2b$10$E8xKkF..."
 *         username: "jane_doe"
 *         refreshToken: ["token123", "token456"]
 *         friendRequests: ["user456", "user789"]
 *         friends: ["user123", "user321"]
 *         favoriteLessons: ["lesson1", "lesson2"]
 *         streak: 5
 *         settings: { feedbackType: "onSubmit",
 *                     questionsOrder: "chronological",
 *                     displayMode: "Light",
 *                     maxQuestionCount: 10,
 *                     isManualCount: false,
 *                     solvingTimeMs: 6000 , }
 *
 *     PublicUser:
 *       type: object
 *       required:
 *         - email
 *         - hashedPassword
 *         - username
 *         - streak
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         username:
 *           type: string
 *           description: The display name or handle of the user
 *         friendRequests:
 *           type: array
 *           description: List of user IDs who sent friend requests
 *           items:
 *             type: string
 *         friends:
 *           type: array
 *           description: List of user IDs who are friends
 *           items:
 *             type: string
 *         favoriteLessons:
 *           type: array
 *           description: List of lesson IDs favorited by the user
 *           items:
 *             type: string
 *         streak:
 *           type: number
 *           description: Current streak count (e.g., days active in a row)
 *         settings:
 *           type: Settings
 *           description: User settings
 *       example:
 *         email: "jane.doe@example.com"
 *         username: "jane_doe"
 *         friendRequests: ["user456", "user789"]
 *         friends: ["user123", "user321"]
 *         favoriteLessons: ["lesson1", "lesson2"]
 *         streak: 5
 *         settings: { feedbackType: "onSubmit",
 *                     questionsOrder: "chronological",
 *                     displayMode: "Light",
 *                     maxQuestionCount: 10,
 *                     isManualCount: false,
 *                     solvingTimeMs: 6000 , }
 */

export type PublicUser = {
  email: string;
  username: string;
  streak: number;
  friendRequests?: string[];
  friends?: string[];
  favoriteLessons?: string[];
  settings?: Partial<Settings>;
};

export type User = PublicUser & {
  hashedPassword: string;
  refreshToken?: string[];
};

export const userZodSchema: z.ZodType<User> = z.object({
  email: z.string().email(),
  hashedPassword: z.string(),
  username: z.string(),
  streak: z.coerce.number(),
  refreshToken: z.array(z.string()).default([]),
  friendRequests: z.array(z.string()).default([]),
  friends: z.array(z.string()).default([]),
  favoriteLessons: z.array(z.string()).default([]),
  settings: settingsZodSchema.optional(),
});

const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  username: { type: String, required: true },
  streak: { type: Number, default: 0 },
  refreshToken: { type: [String], default: [] },
  friendRequests: { type: [String], default: [] },
  friends: { type: [String], default: [] },
  favoriteLessons: { type: [String], default: [] },
  settings: { type: settingsSchema, required: false },
});

export type UserModel = Model<User>;
export const userModel = model<User>("users", userSchema);
