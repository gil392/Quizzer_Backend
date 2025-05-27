import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";
import { authenticatedRequestZodSchema } from "../authentication/validators";

export const getAttemptsByQuizIdRequestSchema = z.object({
  query: z.object({
    quizId: z.string(),
  }),
});

export const questionAttemptZodSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.string(),
});

export const createAttemptRequestSchema = authenticatedRequestZodSchema.and(
  z.object({
    body: z.object({
      quizId: z.string(),
      questions: z.array(questionAttemptZodSchema).min(1),
    }),
  })
);

export const getAttemptsByQuizIdRequestValidator = validateHandlerRequest(
  getAttemptsByQuizIdRequestSchema
);

export const createAttemptRequestValidator = validateHandlerRequest(
  createAttemptRequestSchema
);
