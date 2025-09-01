import { Model, model, Schema } from "mongoose";
import { QuestionAttempt, QuizAttempt } from "./types";

const questionAttemptSchema = new Schema<QuestionAttempt>(
  {
    questionId: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false, versionKey: false, minimize: true }
);

const quizAttemptSchema = new Schema<QuizAttempt>(
  {
    quizId: { type: String, required: true },
    results: { type: [questionAttemptSchema], required: true },
    score: { type: Number, required: true },
    expiryTime: { type: Number },
    userId: { type: String, required: true }
  },
  { versionKey: false, minimize: true }
);

export type QuizAttemptModel = Model<QuizAttempt>;
export const quizAttemptModel = model("attempts", quizAttemptSchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     QuestionAttempt:
 *       type: object
 *       required:
 *         - questionId
 *         - selectedAnswer
 *         - correctAnswer
 *         - isCorrect
 *       properties:
 *         questionId:
 *           type: string
 *           description: ID of the question
 *         selectedAnswer:
 *           type: string
 *           description: The answer selected by the user
 *         correctAnswer:
 *           type: string
 *           description: The correct answer for the question
 *         isCorrect:
 *           type: boolean
 *           description: Whether the user's answer was correct
 *       example:
 *         questionId: "q123"
 *         selectedAnswer: "B"
 *         correctAnswer: "B"
 *         isCorrect: true
 *     QuizAttempt:
 *       type: object
 *       required:
 *         - quizId
 *         - results
 *         - score
 *         - userId
 *       properties:
 *         quizId:
 *           type: string
 *           description: ID of the quiz
 *         results:
 *           type: array
 *           description: List of question attempts
 *           items:
 *             $ref: '#/components/schemas/QuestionAttempt'
 *         score:
 *           type: number
 *           description: The score achieved in the quiz
 *         expiryTime:
 *           type: number
 *           description: Expiry time for the attempt (timestamp in ms)
 *         userId:
 *           type: string
 *           description: ID of the user who made the attempt
 *       example:
 *         quizId: "quiz456"
 *         results:
 *           - questionId: "q123"
 *             selectedAnswer: "B"
 *             correctAnswer: "B"
 *             isCorrect: true
 *           - questionId: "q124"
 *             selectedAnswer: "A"
 *             correctAnswer: "C"
 *             isCorrect: false
 *         score: 1
 *         expiryTime: 1749698141000
 *         userId: "user789"
 */