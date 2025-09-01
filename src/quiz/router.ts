import { RequestHandler, Router } from "express";
import { QuestionsGenerator } from "../externalApis/quizGenerator";
import { LessonsDal } from "../lesson/dal";
import { QuizzesDal } from "./dal";
import * as handlers from "./handlers";
import { QuizzesRatingDal } from "../quizRating/dal";
import { rateQuiz } from "../quizRating/handlers";
import { AttemptDal } from "../attempt/dal";

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: API for /quiz
 */

export type QuizRouterDependencies = {
  quizzesDal: QuizzesDal;
  lessonsDal: LessonsDal;
  quizzesRatingDal: QuizzesRatingDal;
  attemptDal: AttemptDal;
  questionsGenerator: QuestionsGenerator;
};

const createRouterController = ({
  quizzesDal,
  lessonsDal,
  questionsGenerator,
  attemptDal,
  quizzesRatingDal,
}: QuizRouterDependencies) => ({
  getQuizById: handlers.getQuizById(quizzesDal),
  generateQuiz: handlers.generateQuiz(
    quizzesDal,
    lessonsDal,
    questionsGenerator
  ),
  getQuizzes: handlers.getQuizzes(quizzesDal),
  deleteQuiz: handlers.deleteQuiz(quizzesDal, attemptDal, quizzesRatingDal),
  updateQuiz: handlers.updateQuiz(quizzesDal),
  rateQuiz: rateQuiz(quizzesDal, quizzesRatingDal),
});

export const createQuizRouter = (
  authMiddleware: RequestHandler,
  dependencies: QuizRouterDependencies
): Router => {
  const router = Router();
  const controller = createRouterController(dependencies);

  /**
   * @swagger
   * /quiz/{quizId}:
   *   get:
   *     summary: Get a quiz by its ID
   *     tags: [Quiz]
   *     parameters:
   *       - in: path
   *         name: quizId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the quiz to retrieve
   *     responses:
   *       200:
   *         description: The requested quiz
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Quiz'
   *       400:
   *         description: Invalid input (e.g., missing or invalid quizId)
   *       404:
   *         description: Quiz not found
   *       500:
   *         description: Server error
   */
  router.get("/:quizId", controller.getQuizById);

  /**
   * @swagger
   * /quiz:
   *   post:
   *     summary: Generate a quiz based on a lesson and quiz settings
   *     tags: [Quiz]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - lessonId
   *               - settings
   *             properties:
   *               lessonId:
   *                 type: string
   *                 description: The ID of the lesson to generate the quiz from
   *               settings:
   *                 $ref: '#/components/schemas/QuizSettings'
   *           example:
   *             lessonId: "lesson123"
   *             settings:
   *               feedbackType: auto
   *               questionsOrder: chronological
   *               maxQuestionCount: 5
   *               solvingTimeMs: 600000
   *     responses:
   *       200:
   *         description: The generated quiz
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Quiz'
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  router.post("/", controller.generateQuiz);
  /**
   * @swagger
   * /quiz:
   *   post:
   *     summary: Generate a quiz based on a lesson and quiz settings
   *     tags: [Quiz]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - lessonId
   *               - settings
   *             properties:
   *               lessonId:
   *                 type: string
   *                 description: The ID of the lesson to generate the quiz from
   *               settings:
   *                 $ref: '#/components/schemas/QuizSettings'
   *           example:
   *             lessonId: "lesson123"
   *             settings:
   *               feedbackType: onSubmit
   *               questionsOrder: chronological
   *               maxQuestionCount: 5
   *               solvingTimeMs: 600000
   *     responses:
   *       200:
   *         description: The generated quiz
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Quiz'
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  router.post("/", controller.generateQuiz);

  /**
   * @swagger
   * /quiz:
   *   get:
   *     summary: Get all quizzes of authenticated user, optionally filtered by lesson ID
   *     tags: [Quiz]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: lessonId
   *         schema:
   *           type: string
   *         description: The ID of the lesson to filter quizzes by
   *     responses:
   *       200:
   *         description: A list of quizzes with ratings filtered by the authenticated user
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                     description: The ID of the quiz
   *                   title:
   *                     type: string
   *                     description: The title of the quiz
   *                   lessonId:
   *                     type: string
   *                     description: The ID of the lesson this quiz belongs to
   *                   ratings:
   *                     type: array
   *                     description: An array of ratings for the quiz, filtered by the authenticated user
   *                     items:
   *                       type: number
   *                       description: The rating value
   *       400:
   *         description: Invalid input (e.g., invalid query parameters)
   *       500:
   *         description: Server error
   */
  router.get("/", authMiddleware, controller.getQuizzes);

  /**
   * @swagger
   * /quiz/{id}:
   *   delete:
   *     summary: Delete a quiz by its ID
   *     tags: [Quiz]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the quiz to delete
   *     responses:
   *       200:
   *         description: Quiz successfully deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Quiz with id 123 deleted successfully.
   *       404:
   *         description: Quiz not found
   *       500:
   *         description: Server error
   */
  router.delete("/:id", controller.deleteQuiz);

  /**
   * @swagger
   * /quiz/{id}:
   *   put:
   *     summary: Update a quiz by its ID
   *     tags: [Quiz]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the quiz to update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: The new title of the quiz
   *           example:
   *             title: Updated Quiz Title
   *     responses:
   *       200:
   *         description: Quiz successfully updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Quiz'
   *       404:
   *         description: Quiz not found
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  router.put("/:id", controller.updateQuiz);

  /**
   * @swagger
   * /quiz/rate:
   *   post:
   *     summary: Rate a quiz
   *     tags: [Quiz]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: quizId
   *         in: query
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the quiz to rate
   *         example: quiz123
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - rating
   *             properties:
   *               rating:
   *                 type: number
   *                 description: The rating for the quiz (1-5)
   *                 minimum: 1
   *                 maximum: 5
   *             example:
   *               rating: 4
   *     responses:
   *       201:
   *         description: Quiz rated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Rating for quiz quiz123 submitted successfully.
   *                 rating:
   *                   type: object
   *                   properties:
   *                     quizId:
   *                       type: string
   *                       description: The ID of the quiz
   *                     rater:
   *                       type: string
   *                       description: The ID of the user who rated the quiz
   *                     rating:
   *                       type: number
   *                       description: The rating value
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       description: The timestamp when the rating was created
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                       description: The timestamp when the rating was last updated
   *       204:
   *         description: Rating deleted successfully (if rating is null)
   *       400:
   *         description: Invalid input (e.g., missing or invalid quizId or rating)
   *       404:
   *         description: Quiz not found
   *       500:
   *         description: Server error
   */
  router.post("/rate", authMiddleware, controller.rateQuiz);

  return router;
};
