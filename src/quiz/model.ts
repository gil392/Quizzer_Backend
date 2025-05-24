import { Model, model, Schema } from "mongoose";
import { Question, Quiz, quizCheckTypes, QuizSettings } from "./types";

const questionSchema = new Schema<Question>(
  {
    question: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    incorrectAnswers: { type: [String], required: true },
  },
  { versionKey: false, minimize: true }
);

const quizSettingsSchema = new Schema<QuizSettings>(
  {
    checkType: { type: String, enum: quizCheckTypes, required: true },
    isRandomOrder: { type: Boolean, default: false },
    maxQuestionCount: { type: Number, required: true },
    solvingTimeMs: { type: Number, required: true },
  },
  { _id: false, versionKey: false, minimize: true }
);

const quizSchema = new Schema<Quiz>({
  title: { type: String, required: true },
  lessonId: { type: String, required: true },
  questions: { type: [questionSchema], required: true },
  grade: Number,
  settings: { type: quizSettingsSchema, required: true },
});

export type QuizModel = Model<Quiz>;
export const quizModel = model("quizzes", quizSchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       required:
 *         - question
 *         - correctAnswer
 *         - incorrectAnswers
 *       properties:
 *         question:
 *           type: string
 *           description: The question text
 *         correctAnswer:
 *           type: string
 *           description: The correct answer
 *         incorrectAnswers:
 *           type: array
 *           description: List of incorrect answers
 *           items:
 *             type: string
 *       example:
 *         question: What is the capital of France?
 *         correctAnswer: Paris
 *         incorrectAnswers:
 *           - Berlin
 *           - Madrid
 *           - Rome
 *
 *     QuizSettings:
 *       type: object
 *       required:
 *         - checkType
 *         - maxQuestionCount
 *         - solvingTimeMs
 *       properties:
 *         checkType:
 *           type: string
 *           enum: [auto, manual]  # Update based on your `quizCheckTypes` array
 *           description: The method used to check the quiz
 *         isRandomOrder:
 *           type: boolean
 *           default: false
 *           description: Whether questions are shuffled
 *         maxQuestionCount:
 *           type: integer
 *           description: Maximum number of questions in the quiz
 *         solvingTimeMs:
 *           type: integer
 *           description: Time allowed to solve the quiz in milliseconds
 *       example:
 *         checkType: auto
 *         isRandomOrder: true
 *         maxQuestionCount: 10
 *         solvingTimeMs: 600000
 *
 *     Quiz:
 *       type: object
 *       required:
 *         - title
 *         - lessonId
 *         - questions
 *         - settings
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the quiz
 *         lessonId:
 *           type: string
 *           description: ID of the lesson this quiz belongs to
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         grade:
 *           type: number
 *           description: Optional grade of the quiz
 *         settings:
 *           $ref: '#/components/schemas/QuizSettings'
 *       example:
 *         title: Geography Basics
 *         lessonId: 123abc
 *         questions:
 *           - question: What is the capital of France?
 *             correctAnswer: Paris
 *             incorrectAnswers: [Berlin, Madrid, Rome]
 *         grade: 90
 *         settings:
 *           checkType: auto
 *           isRandomOrder: true
 *           maxQuestionCount: 10
 *           solvingTimeMs: 600000
 */
