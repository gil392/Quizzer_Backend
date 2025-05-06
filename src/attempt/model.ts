import { Model, model, Schema } from 'mongoose';
import { QuestionAttempt, QuizAttempt } from './types';

const questionAttemptSchema = new Schema<QuestionAttempt>(
    {
        questionId: { type: String, required: true },
        selectedAnswer: { type: String, required: true },
        correctAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true }
    },
    { _id: false, versionKey: false, minimize: true }
);

const quizAttemptSchema = new Schema<QuizAttempt>(
    {
        quizId: { type: String, required: true },
        results: { type: [questionAttemptSchema], required: true },
        score: { type: Number, required: true }
    },
    { versionKey: false, minimize: true }
);

export type QuizAttemptModel = Model<QuizAttempt>;
export const quizAttemptModel = model('attempts', quizAttemptSchema); 