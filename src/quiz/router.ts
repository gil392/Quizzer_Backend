import { RequestHandler, Router } from "express";
import { QuestionsGenerator } from "../externalApis/quizGenerator";
import { LessonsDal } from "../lesson/dal";
import { QuizzesDal } from "./dal";
import * as handlers from "./handlers";
import { QuizzesRatingDal } from "../quizRating/dal";
import { rateQuiz } from "../quizRating/handlers";

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
  questionsGenerator: QuestionsGenerator;
};

const createRouterController = ({
  quizzesDal,
  lessonsDal,
  questionsGenerator,
  quizzesRatingDal,
}: QuizRouterDependencies) => ({
  getQuizById: handlers.getQuizById(quizzesDal),
  generateQuiz: handlers.generateQuiz(
    quizzesDal,
    lessonsDal,
    questionsGenerator
  ),
  getQuizzes: handlers.getQuizzes(quizzesDal),
  deleteQuiz: handlers.deleteQuiz(quizzesDal, quizzesRatingDal),
  updateQuiz: handlers.updateQuiz(quizzesDal),
  submitQuiz: handlers.submitQuiz(quizzesDal),
  rateQuiz: rateQuiz(quizzesDal),
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
   *               checkType: auto
   *               isRandomOrder: true
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
   *               checkType: auto
   *               isRandomOrder: true
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
   * /quiz/submit:
   *   post:
   *     summary: Submit a solved quiz
   *     tags: [Quiz]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quizId
   *               - questions
   *             properties:
   *               quizId:
   *                 type: string
   *                 description: The ID of the quiz being submitted
   *               questions:
   *                 type: array
   *                 minItems: 1
   *                 items:
   *                   type: object
   *                   required:
   *                     - questionId
   *                     - selectedAnswer
   *                   properties:
   *                     questionId:
   *                       type: string
   *                     selectedAnswer:
   *                       type: string
   *           example:
   *             quizId: "quiz456"
   *             questions:
   *               - questionId: "q1"
   *                 selectedAnswer: "A"
   *               - questionId: "q2"
   *                 selectedAnswer: "B"
   *     responses:
   *       200:
   *         description: Quiz submission result (e.g., score or status)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 grade:
   *                   type: number
   *                 passed:
   *                   type: boolean
   *               example:
   *                 grade: 80
   *                 passed: true
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  router.post("/submit", controller.submitQuiz);

  /**
   * @swagger
   * /quiz:
   *   get:
   *     summary: Get all quizzes, optionally filtered by lesson ID and user ID
   *     tags: [Quiz]
   *     parameters:
   *       - in: query
   *         name: lessonId
   *         schema:
   *           type: string
   *         description: The ID of the lesson to filter quizzes by
   *       - in: query
   *         name: userId
   *         schema:
   *           type: string
   *         description: The ID of the user to filter ratings by. Only ratings from this user will be included in the response.
   *     responses:
   *       200:
   *         description: A list of quizzes with ratings filtered by the specified user ID
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
   *                     description: An array of ratings for the quiz, filtered by the specified user ID
   *                     items:
   *                       type: number
   *                       description: The rating value
   *       400:
   *         description: Invalid input (e.g., invalid query parameters)
   *       500:
   *         description: Server error
   */
  router.get("/", controller.getQuizzes);

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
   *     parameters:
   *       - in: query
   *         name: quizId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the quiz to rate
   *       - in: query
   *         name: rater
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user rating the quiz
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
   *           example:
   *             rating: 4
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
   *                 rating:
   *                   $ref: '#/components/schemas/QuizRating'
   *       404:
   *         description: Quiz not found
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  router.post("/rate", authMiddleware ,controller.rateQuiz);

  return router;
};
