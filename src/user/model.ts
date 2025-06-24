import { Model, Schema, model } from "mongoose";
import { LeanDocument } from "../services/database/types";
import { Settings, settingsSchema } from "./settingsModel";

/**
 * @swagger
 * components:
 *   schemas:
 *     UserWithAuthentication:
 *       type: object
 *       required:
 *         - _id
 *         - email
 *         - hashedPassword
 *         - username
 *         - streak
 *       properties:
 *         _id:
 *           type: string
 *           format: mongoose.Types.ObjectId
 *           description: User's ids
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
 *         profileImage:
 *           type: string
 *           description: url to the user profile image
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
 *         _id: "681cd953115ca90e9f94a9d2"
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
 *     User:
 *       type: object
 *       required:
 *         - _id
 *         - email
 *         - hashedPassword
 *         - username
 *         - streak
 *       properties:
 *         _id:
 *           type: string
 *           format: mongoose.Types.ObjectId
 *           description: User's ids
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         username:
 *           type: string
 *           description: The display name or handle of the user
 *         profileImage:
 *           type: string
 *           description: url to the user profile image
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
 *         achievements:
 *           type: array
 *           description: List of achievements IDs the user completed
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
 *         xp:
 *           type: number
 *           description: Current xp of the user (gained by achivments)
 *         settings:
 *           type: Settings
 *           description: User settings
 *       example:
 *         _id: "681cd953115ca90e9f94a9d2"
 *         email: "jane.doe@example.com"
 *         username: "jane_doe"
 *         friendRequests: ["user456", "user789"]
 *         friends: ["user123", "user321"]
 *         achievements: ["user123", "user321"]
 *         favoriteLessons: ["lesson1", "lesson2"]
 *         streak: 5
 *         settings: { feedbackType: "onSubmit",
 *                     questionsOrder: "chronological",
 *                     displayMode: "Light",
 *                     maxQuestionCount: 10,
 *                     isManualCount: false,
 *                     solvingTimeMs: 6000 , }
 */

export type User = LeanDocument<{
  email: string;
  username: string;
  profileImage?: string;
  friendRequests?: string[];
  friends?: string[];
  achievements?: string[];
  favoriteLessons?: string[];
  streak: number;
  lastQuizDate?: Date;
  xp: number;
  settings?: Partial<Settings>;
}>;

export type UserWithAuthentication = User & {
  hashedPassword: string;
  refreshToken?: string[];
};

const userSchema = new Schema<UserWithAuthentication>({
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  username: { type: String, required: true },
  profileImage: String,
  refreshToken: { type: [String], default: [] },
  friendRequests: { type: [String], default: [] },
  friends: { type: [String], default: [] },
  achievements: { type: [String], default: [] },
  favoriteLessons: { type: [String], default: [] },
  streak: { type: Number, default: 0 },
  lastQuizDate: { type: Date },
  xp: { type: Number, default: 0 },
  settings: { type: settingsSchema, required: false },
});
userSchema.index({ username: "text", email: "text" });

export type UserModel = Model<UserWithAuthentication>;
export const userModel = model<UserWithAuthentication>("users", userSchema);
