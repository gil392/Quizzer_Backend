import { Model, model, Schema } from 'mongoose';

export interface Lesson {
    owner: string;
    title: string;
    sharedUsers: string[];
    videoUrl: string;
    summary: string;
}

const lessonSchema = new Schema<Lesson>(
    {
        owner: { type: String, required: true },
        title: { type: String, required: true },
        sharedUsers: { type: [String], default: [] },
        videoUrl: { type: String, required: true },
        summary: { type: String, required: true }
    },
    { timestamps: true }
);

export type LessonModel = Model<Lesson>;
export const lessonModel = model('lessons', lessonSchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
 *       type: object
 *       required:
 *         - owner
 *         - title
 *         - videoUrl
 *         - summary
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
 *         videoUrl:
 *           type: string
 *           description: URL of the lesson video
 *         summary:
 *           type: string
 *           description: Summary of the lesson content
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
 *         videoUrl: "https://www.youtube.com/watch?v=RuNPg-HuEyY"
 *         summary: "This lesson covers the basics of geography including continents and oceans."
 *         createdAt: "2025-04-17T12:00:00Z"
 *         updatedAt: "2025-04-17T12:00:00Z"
 */
