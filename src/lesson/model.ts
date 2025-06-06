import { Model, model, Schema } from "mongoose";

export interface VideoDetails {
  title: string;
  channel: string;
  channelId: string;
  description: string;
  tags?: string[];
  views: string;
  duration: string;
  videoId: string;
}

export interface Lesson {
  owner: string;
  title: string;
  sharedUsers: string[];
  summary: string;
  videoDetails?: VideoDetails;
  relatedLessonGroupId?: string;
}

const videoDetailsSchema = new Schema<VideoDetails>(
  {
    title: { type: String, required: true },
    channel: { type: String, required: true },
    channelId: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: [String], default: [] },
    views: { type: String, required: true },
    duration: { type: String, required: true },
    videoId: { type: String, required: true },
  },
  { _id: false } // Prevents creating a separate `_id` for the sub-document
);

const lessonSchema = new Schema<Lesson>(
  {
    owner: { type: String, required: true },
    title: { type: String, required: true },
    sharedUsers: { type: [String], default: [] },
    summary: { type: String, required: true },
    videoDetails: { type: videoDetailsSchema },
    relatedLessonGroupId: String,
  },
  { timestamps: true }
);

export type LessonModel = Model<Lesson>;
export const lessonModel = model("lessons", lessonSchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
 *       type: object
 *       required:
 *         - owner
 *         - title
 *         - summary
 *         - videoDetails
 *       properties:
 *         owner:
 *           type: string
 *           description: ID of the user who owns the lesson
 *         title:
 *           type: string
 *           description: The title of the lesson
 *         sharedUsers:
 *           type: array
 *           description: List of user IDs the lesson is shared with
 *           items:
 *             type: string
 *         summary:
 *           type: string
 *           description: Summary of the lesson content
 *         videoDetails:
 *           type: object
 *           description: Details of the video associated with the lesson
 *           properties:
 *             title:
 *               type: string
 *               description: Title of the video
 *             channel:
 *               type: string
 *               description: Name of the channel that uploaded the video
 *             channelId:
 *               type: string
 *               description: ID of the channel that uploaded the video
 *             description:
 *               type: string
 *               description: Description of the video
 *             tags:
 *               type: array
 *               description: Tags associated with the video
 *               items:
 *                 type: string
 *             views:
 *               type: string
 *               description: Number of views the video has
 *             duration:
 *               type: string
 *               description: Duration of the video in ISO 8601 format
 *             videoId:
 *               type: string
 *               description: ID of the video
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the lesson was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the lesson was last updated
 *       example:
 *         owner: "user123"
 *         title: "Introduction to Geography"
 *         sharedUsers: ["user456", "user789"]
 *         summary: "This lesson covers the basics of geography including continents and oceans."
 *         videoDetails:
 *           title: "Geography Basics"
 *           channel: "Educational Channel"
 *           channelId: "channel123"
 *           description: "Learn the basics of geography in this video."
 *           tags: ["geography", "education", "basics"]
 *           views: "12345"
 *           duration: "PT10M30S"
 *           videoId: "RuNPg-HuEyY"
 *         createdAt: "2025-04-17T12:00:00Z"
 *         updatedAt: "2025-04-17T12:00:00Z"
 */
