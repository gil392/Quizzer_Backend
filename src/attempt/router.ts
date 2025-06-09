import { RequestHandler, Router } from "express";
import * as handlers from "./handlers";
import { AttemptDal } from "./dal";
import { QuizzesDal } from "../quiz/dal";
import { UsersDal } from "../user/dal";

/**
 * @swagger
 * tags:
 *   name: Attempt
 *   description: API for /attempt
 */

export type AttemptRouterDependencies = {
  attemptDal: AttemptDal;
  quizzesDal: QuizzesDal;
  usersDal: UsersDal;
};

const createRouterController = ({
  attemptDal,
  quizzesDal,
  usersDal,
}: AttemptRouterDependencies) => ({
  CreateAttempt: handlers.createAttempt(quizzesDal, attemptDal, usersDal),
  GetAttemptsByQuizId: handlers.GetAttemptsByQuizId(attemptDal),
  getQuestionResult: handlers.getQuestionResult(quizzesDal),
  addAnswerToAttempt: handlers.addAnswerToAttempt(attemptDal, quizzesDal),
  updateAttemptWithAnswers: handlers.updateAttemptWithAnswers(
    attemptDal,
    quizzesDal
  ),
});

export const createAttemptRouter = (
  authMiddleware: RequestHandler,
  dependencies: AttemptRouterDependencies
): Router => {
  const router = Router();
  const controller = createRouterController(dependencies);

  /**
   * @swagger
   * /attempt:
   *   get:
   *     summary: Get attempts by quiz ID
   *     tags: [Attempt]
   *     parameters:
   *       - in: query
   *         name: quizId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the quiz to retrieve attempts for
   *     responses:
   *       200:
   *         description: List of attempts for the specified quiz
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   attemptId:
   *                     type: string
   *                     description: The ID of the attempt
   *                   grade:
   *                     type: number
   *                     description: The grade achieved in the attempt
   *                   passed:
   *                     type: boolean
   *                     description: Whether the attempt passed or failed
   *               example:
   *                 - attemptId: "attempt123"
   *                   userId: "user456"
   *                   grade: 85
   *                   passed: true
   *                 - attemptId: "attempt789"
   *                   userId: "user123"
   *                   grade: 70
   *                   passed: false
   *       400:
   *         description: Invalid input (e.g., missing or invalid quizId)
   *       404:
   *         description: Quiz not found
   *       500:
   *         description: Server error
   */
  router.get("/", authMiddleware, controller.GetAttemptsByQuizId);

  /**
   * @swagger
   * /attempt:
   *   post:
   *     summary: Submit a solved quiz
   *     tags: [Attempt]
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
  router.post("/", authMiddleware, controller.CreateAttempt);

  /**
   * @swagger
   * /attempt/question/{questionId}:
   *   get:
   *     summary: Get the result of a specific question attempt
   *     tags: [Attempt]
   *     parameters:
   *       - in: path
   *         name: questionId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the question
   *       - in: query
   *         name: selectedAnswer
   *         required: true
   *         schema:
   *           type: string
   *         description: The selected answer for the question
   *     responses:
   *       200:
   *         description: The result of the question attempt
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 questionId:
   *                   type: string
   *                 selectedAnswer:
   *                   type: string
   *                 correctAnswer:
   *                   type: string
   *                 isCorrect:
   *                   type: boolean
   *               example:
   *                 questionId: "q1"
   *                 selectedAnswer: "A"
   *                 correctAnswer: "B"
   *                 isCorrect: false
   *       400:
   *         description: Invalid input
   *       404:
   *         description: Question not found
   *       500:
   *         description: Server error
   */
  router.get("/question/:questionId", controller.getQuestionResult);

  /**
   * @swagger
   * /attempt/answer:
   *   post:
   *     summary: Add or update an answer for a specific question in an existing attempt
   *     tags: [Attempt]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - attemptId
   *               - questionId
   *               - selectedAnswer
   *             properties:
   *               attemptId:
   *                 type: string
   *                 description: The ID of the attempt to update
   *               questionId:
   *                 type: string
   *                 description: The ID of the question being answered
   *               selectedAnswer:
   *                 type: string
   *                 description: The answer selected by the user
   *           example:
   *             attemptId: "attempt123"
   *             questionId: "q1"
   *             selectedAnswer: "A"
   *     responses:
   *       200:
   *         description: The updated attempt with the new answer
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/QuizAttempt'
   *       400:
   *         description: Invalid input or question not found
   *       404:
   *         description: Attempt not found
   *       500:
   *         description: Server error
   */
  router.post("/answer", authMiddleware, controller.addAnswerToAttempt);

  /**
   * @swagger
   * /attempt/update:
   *   put:
   *     summary: Update an existing attempt with all answers at once
   *     tags: [Attempt]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - attemptId
   *               - questions
   *             properties:
   *               attemptId:
   *                 type: string
   *                 description: The ID of the attempt to update
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
   *             attemptId: "attempt123"
   *             questions:
   *               - questionId: "q1"
   *                 selectedAnswer: "A"
   *               - questionId: "q2"
   *                 selectedAnswer: "B"
   *     responses:
   *       200:
   *         description: The updated attempt with all answers
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/QuizAttempt'
   *       400:
   *         description: Invalid input or quiz not found
   *       404:
   *         description: Attempt not found
   *       500:
   *         description: Server error
   */
  router.put("/update", authMiddleware, controller.updateAttemptWithAnswers);

  return router;
};
