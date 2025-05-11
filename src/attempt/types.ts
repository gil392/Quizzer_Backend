import { z } from 'zod';
import { createAttemptRequestSchema } from './validators';

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
    typeof createAttemptRequestSchema
>;
