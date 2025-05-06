import { Types } from 'mongoose';
import { z } from 'zod';
import { questionAnswerSubmittionZodSchema } from './validators';

export type QuizAttempt = {
    quizId: string;
    results: QuestionAttempt[];
    score: number;
};

export type QuestionAttempt = {
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
};

export type QuestionAnswerSubmittion = z.infer<
    typeof questionAnswerSubmittionZodSchema
>;
