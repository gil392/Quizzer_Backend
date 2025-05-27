import { Router } from "express";
import * as handlers from "./handlers";
import { AttemptDal } from "./dal";
import { QuizzesDal } from "../quiz/dal";

/**
 * @swagger
 * tags:
 *   name: Attempt
 *   description: API for /attempt
 */

export type AttemptRouterDependencies = {
    attemptDal: AttemptDal;
    quizzesDal: QuizzesDal;
};

const createRouterController = ({
    attemptDal,
    quizzesDal
}: AttemptRouterDependencies) => ({
    CreateAttempt: handlers.createAttempt(quizzesDal, attemptDal),
    GetAttemptsByQuizId: handlers.GetAttemptsByQuizId(attemptDal),
    getQuestionResult: handlers.getQuestionResult(quizzesDal),
});

export const createAttemptRouter = (
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
    router.get('/', controller.GetAttemptsByQuizId);

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
    router.post('/', controller.CreateAttempt);


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
    router.get('/question/:questionId', controller.getQuestionResult);


    return router;
};
