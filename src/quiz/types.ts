import { Types } from 'mongoose';
import { z } from 'zod';
import { questionAnswerSubmittionZodSchema } from './validators';

export const quizCheckTypes = ['onSubmit', 'onSelectAnswer'] as const;

export interface Quiz {
    title: string;
    lessonId: string;
    questions: Question[];
    grade?: number;
    settings: QuizSettings;
}

export type QuizSettings = {
    checkType: (typeof quizCheckTypes)[number];
    isRandomOrder: boolean;
    maxQuestionCount: number;
    solvingTimeMs: number;
};

export type Answer = string;

export type Question = {
    _id?: Types.ObjectId;
    question: string;
    incorrectAnswers: Answer[];
    correctAnswer: Answer;
};

export type QuizResponseQuestion = {
    _id: string;
    text: string;
    answers: Answer[];
};
export type QuizResponse = Omit<Quiz, 'questions'> & {
    questions: QuizResponseQuestion[];
};

export type QuizResult = {
    quizId: string;
    results: QuestionResult[];
    score: number;
};

export type QuestionResult = {
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
};

export type QuestionAnswerSubmittion = z.infer<
    typeof questionAnswerSubmittionZodSchema
>;
