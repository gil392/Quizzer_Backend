import { Model, model, Schema } from "mongoose";
import { Notification } from "./types";

const notificationSchema = new Schema<Notification>({
    toUserId: { type: String, required: true },
    fromUserId: { type: String, required: true },
    type: { type: String, enum: ["share", "achievement"], required: true },
    relatedEntityId: { type: String, required: true },
    entityType: { type: String, enum: ["quiz", "summary", "user"], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export type NotificationModel = Model<Notification>;
export const notificationModel = model("notifications", notificationSchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Notification ID
 *         toUserId:
 *           type: string
 *           description: Recipient user ID
 *         fromUserId:
 *           type: string
 *           description: Sender user ID
 *         type:
 *           type: string
 *           enum: [share, achievement]
 *           description: Type of notification
 *         relatedEntityId:
 *           type: string
 *           description: ID of the related quiz, summary, or user
 *         entityType:
 *           type: string
 *           enum: [quiz, summary, user]
 *           description: Type of the related entity
 *         message:
 *           type: string
 *           description: Notification message
 *         read:
 *           type: boolean
 *           description: Whether the notification has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *       required:
 *         - toUserId
 *         - fromUserId
 *         - type
 *         - relatedEntityId
 *         - entityType
 *         - message
 */