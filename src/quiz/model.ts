import { model, Schema } from 'mongoose';
import { Question, quizCheckTypes, QuizSettings } from './types';

export interface Quiz {
    title: string;
    lessonId: string;
    questions: Question[];
    grade?: number;
    setting: QuizSettings;
}

const questionSchema = new Schema<Question>(
    {
        question: { type: String, required: true },
        correctAnswer: { type: String, required: true },
        incorrectAnswers: { type: [String], required: true },
        points: { type: Number, required: true },
        selectedAnswer: String
    },
    { _id: false, versionKey: false, minimize: true }
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
    setting: { type: quizSettingsSchema, required: true }
});
export const quizModel = model('quizzes', quizSchema);
