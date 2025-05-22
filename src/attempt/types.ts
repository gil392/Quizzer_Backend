import { z } from 'zod';
import { questionAttemptZodSchema } from './validators';

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

export type QuestionAnswerAttempt = z.infer<
    typeof questionAttemptZodSchema
>;
