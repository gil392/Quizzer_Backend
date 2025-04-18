import { Router } from 'express';
import { VideoSummeraizer } from '../externalApis/videoSummerizer';
import { LessonsDal } from '../lesson/dal';
import * as handlers from './handlers';

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
    videoSummeraizer
}: LessonRouterDependencies) => ({
    createLesson: handlers.createLesson(lessonsDal, videoSummeraizer),
    getLessonById: handlers.getLessonById(lessonsDal)
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
    router.get('/:id', controller.getLessonById);

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
    router.post('/', controller.createLesson);

    return router;
};
