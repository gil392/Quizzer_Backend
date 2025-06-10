import { Model, model, Schema } from "mongoose";
import {
  Question,
  Quiz,
  quizFeedbacks,
  quizQuestionsOrders,
  QuizSettings,
} from "./types";

const questionSchema = new Schema<Question>(
  {
    question: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    answers: { type: [String], required: true },
  },
  { versionKey: false, minimize: true }
);

const quizSettingsSchema = new Schema<QuizSettings>(
  {
    feedbackType: { type: String, enum: quizFeedbacks, required: true },
    questionsOrder: { type: String, enum: quizQuestionsOrders, required: true },
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
 *         - feedbackType
 *         - maxQuestionCount
 *         - solvingTimeMs
 *       properties:
 *         feedbackType:
 *           type: string
 *           enum: [auto, manual]  # Update based on your `quizFeedbacks` array
 *           description: The method used to check the quiz
 *         questionsOrder:
 *           type: string
 *           enum: [chronological, random]
 *           description: The questions order in the quiz
 *         maxQuestionCount:
 *           type: integer
 *           description: Maximum number of questions in the quiz
 *         solvingTimeMs:
 *           type: integer
 *           description: Time allowed to solve the quiz in milliseconds
 *       example:
 *         feedbackType: auto
 *         questionsOrder: chronological
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
 *           feedbackType: auto
 *           questionsOrder: chronological
 *           maxQuestionCount: 10
 *           solvingTimeMs: 600000
 */
