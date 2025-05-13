import { Router } from "express";
import { QuestionsGenerator } from "../externalApis/quizGenerator";
import { LessonsDal } from "../lesson/dal";
import { QuizzesDal } from "./dal";
import * as handlers from "./handlers";

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
    questionsGenerator,
}: QuizRouterDependencies) => ({
    getQuizById: handlers.getQuizById(quizzesDal),
    generateQuiz: handlers.generateQuiz(
        quizzesDal,
        lessonsDal,
        questionsGenerator
    ),
    getQuizzes: handlers.getQuizzes(quizzesDal),
    deleteQuiz: handlers.deleteQuiz(quizzesDal),
    updateQuiz: handlers.updateQuiz(quizzesDal),
});

export const createQuizRouter = (
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
    router.get('/:quizId', controller.getQuizById);

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
     *   get:
     *     summary: Get all quizzes, optionally filtered by lesson ID
     *     tags: [Quiz]
     *     parameters:
     *       - in: query
     *         name: lessonId
     *         schema:
     *           type: string
     *         description: The ID of the lesson to filter quizzes by
     *     responses:
     *       200:
     *         description: A list of quizzes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Quiz'
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

    return router;
};
