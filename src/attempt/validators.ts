import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";


export const getAttemptsByQuizIdRequestValidator = z.object({
    params: z.object({
        quizId: z.string(),
    }),
});

export const questionAttemptZodSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.string(),
});
export const createAttemptRequstZodSchema = z.object({
  body: z.object({
    quizId: z.string(),
    questions: z.array(questionAttemptZodSchema).min(1),
  }),
});
export const AttemptQuizRequestValidator = validateHandlerRequest(
  createAttemptRequstZodSchema
);


