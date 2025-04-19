import { Router } from "express";
import { VideoSummeraizer } from "../externalApis/videoSummerizer";
import { LessonsDal } from "../lesson/dal";
import * as handlers from "./handlers";

/**
 * @swagger
 * tags:
 *   name: Lesson
 *   description: API for /lesson
 */

export type LessonRouterDependencies = {
  lessonsDal: LessonsDal;
  videoSummeraizer: VideoSummeraizer;
};

const createRouterController = ({
  lessonsDal,
  videoSummeraizer,
}: LessonRouterDependencies) => ({
  createLesson: handlers.createLesson(lessonsDal, videoSummeraizer),
  getLessonById: handlers.getLessonById(lessonsDal),
  getLessons: handlers.getLessons(lessonsDal),
  deleteLesson: handlers.deleteLesson(lessonsDal),
  updateLesson: handlers.updateLesson(lessonsDal),
});

export const createLessonRouter = (
  dependecies: LessonRouterDependencies
): Router => {
  const router = Router();
  const controller = createRouterController(dependecies);

  /**
   * @swagger
   * /lesson/{id}:
   *   get:
   *     summary: Get a lesson by its ID
   *     tags: [Lesson]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the lesson to retrieve
   *     responses:
   *       200:
   *         description: The lesson object
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Lesson'
   *       404:
   *         description: Lesson not found
   *       400:
   *         description: Invalid ID format
   *       500:
   *         description: Server error
   */
  router.get("/:id", controller.getLessonById);

  /**
   * @swagger
   * /lesson:
   *   post:
   *     summary: Create a lesson from a video URL
   *     tags: [Lesson]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - videoUrl
   *             properties:
   *               videoUrl:
   *                 type: string
   *                 format: uri
   *                 description: The URL of the video to summarize into a lesson
   *           example:
   *             videoUrl: "https://example.com/video.mp4"
   *     responses:
   *       201:
   *         description: Lesson successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Lesson'
   *       400:
   *         description: Invalid video URL
   *       500:
   *         description: Server error during lesson creation
   */
  router.post("/", controller.createLesson);

  /**
   * @swagger
   * /lesson:
   *   get:
   *     summary: Get all lessons
   *     tags: [Lesson]
   *     responses:
   *       200:
   *         description: A list of lessons
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Lesson'
   *       500:
   *         description: Server error
   */
  router.get("/", controller.getLessons);

  /**
   * @swagger
   * /lesson/delete/{id}:
   *   delete:
   *     summary: Delete a lesson by its ID
   *     tags: [Lesson]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the lesson to delete
   *     responses:
   *       200:
   *         description: Lesson successfully deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Lesson with id 123 deleted successfully.
   *       404:
   *         description: Lesson not found
   *       400:
   *         description: Invalid ID format
   *       500:
   *         description: Server error
   */
  router.delete("/delete/:id", controller.deleteLesson);

  /**
   * @swagger
   * /lesson/update/{id}:
   *   put:
   *     summary: Update a lesson by its ID
   *     tags: [Lesson]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the lesson to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: The new title of the lesson
   *               summary:
   *                 type: string
   *                 description: The new summary of the lesson
   *           example:
   *             title: Updated Lesson Title
   *             summary: Updated summary content.
   *     responses:
   *       200:
   *         description: Lesson successfully updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Lesson'
   *       404:
   *         description: Lesson not found
   *       400:
   *         description: Invalid ID format
   *       500:
   *         description: Server error
   */
  router.put("/update/:id", controller.updateLesson);

  return router;
};
