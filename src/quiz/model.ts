import { Model, model, Schema } from 'mongoose';
import { Question, Quiz, quizCheckTypes, QuizSettings } from './types';

const questionSchema = new Schema<Question>(
    {
        question: { type: String, required: true },
        correctAnswer: { type: String, required: true },
        incorrectAnswers: { type: [String], required: true },
        selectedAnswer: String
    },
    { versionKey: false, minimize: true }
);

const quizSettingsSchema = new Schema<QuizSettings>(
    {
        checkType: { type: String, enum: quizCheckTypes, required: true },
        isRandomOrder: { type: Boolean, default: false },
        maxQuestionCount: { type: Number, required: true },
        solvingTimeMs: { type: Number, required: true }
    },
    { _id: false, versionKey: false, minimize: true }
);

const quizSchema = new Schema<Quiz>({
    title: { type: String, required: true },
    lessonId: { type: String, required: true },
    questions: { type: [questionSchema], required: true },
    grade: Number,
    settings: { type: quizSettingsSchema, required: true }
});

export type QuizModel = Model<Quiz>;
export const quizModel = model('quizzes', quizSchema);
