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
  getRelatedVideos: handlers.getRelatedVideosForLesson(lessonsDal)
});

export const createLessonRouter = (
  dependecies: LessonRouterDependencies
): Router => {
  const router = Router();
  const controller = createRouterController(dependecies);

  /**
 * @swagger
 * /lesson/relatedVideos:
 *   get:
 *     summary: Get related videos for a lesson
 *     tags: [Lesson]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the lesson to fetch related videos for
 *     responses:
 *       200:
 *         description: A list of related videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   videoId:
 *                     type: string
 *                     description: ID of the related video
 *                   snippet:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         description: Title of the related video
 *                       description:
 *                         type: string
 *                         description: Description of the related video
 *                       publishTime:
 *                         type: string
 *                         description: Publish time of the related video
 *                       channelTitle:
 *                         type: string
 *                         description: Name of the channel that uploaded the related video
 *                       channelId:
 *                         type: string
 *                         description: ID of the channel that uploaded the related video
 *                       thumbnail:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             description: Thumbnail URL
 *                           width:
 *                             type: number
 *                             description: Thumbnail width
 *                           height:
 *                             type: number
 *                             description: Thumbnail height
 *       404:
 *         description: Lesson not found
 *       400:
 *         description: Invalid lesson ID or missing video details
 *       500:
 *         description: Server error
 */
  router.get("/relatedVideos", controller.getRelatedVideos);

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
   * /lesson/{id}:
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
  router.delete("/:id", controller.deleteLesson);

  /**
   * @swagger
   * /lesson/{id}:
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
  router.put("/:id", controller.updateLesson);


  return router;
};
