import { Router } from 'express';
import { QuestionsGenerator } from '../externalApis/quizGenerator';
import { LessonsDal } from '../lesson/dal';
import { QuizzesDal } from './dal';
import * as handlers from './handlers';

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: API for /quiz
 */

export type QuizRouterDependencies = {
    quizzesDal: QuizzesDal;
    lessonsDal: LessonsDal;
    questionsGenerator: QuestionsGenerator;
};

const createRouterController = ({
    quizzesDal,
    lessonsDal,
    questionsGenerator
}: QuizRouterDependencies) => ({
    generateQuiz: handlers.generateQuiz(
        quizzesDal,
        lessonsDal,
        questionsGenerator
    ),
    submitQuiz: handlers.submitQuiz(quizzesDal)
});

export const createQuizRouter = (
    dependecies: QuizRouterDependencies
): Router => {
    const router = Router();
    const controller = createRouterController(dependecies);

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
    router.post('/', controller.generateQuiz);

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
    router.post('/submit', controller.submitQuiz);

    return router;
};
