import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";

export const getAttemptsByQuizIdRequestSchema = z.object({
    query: z.object({
        quizId: z.string(),
    }),
});

export const questionAttemptZodSchema = z.object({
    questionId: z.string(),
    selectedAnswer: z.string(),
});

export const createAttemptRequestSchema = z.object({
    body: z.object({
        quizId: z.string(),
        questions: z.array(questionAttemptZodSchema).min(1),
    }),
});

export const getQuestionResultRequestSchema = z.object({
    params: z.object({
        questionId: z.string(),
    }),
    query: z.object({
        selectedAnswer: z.string(),
    }),
});

export const getAttemptsByQuizIdRequestValidator = validateHandlerRequest(
    getAttemptsByQuizIdRequestSchema
);

export const createAttemptRequestValidator = validateHandlerRequest(
    createAttemptRequestSchema
);

export const getQuestionResultRequestValidator = validateHandlerRequest(
    getQuestionResultRequestSchema
);