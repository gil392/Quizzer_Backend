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
      questions: z.array(questionAttemptZodSchema),
    }),
  })
);

export const updateAttemptWithAnswersRequestSchema =
  authenticatedRequestZodSchema.and(
    z.object({
      body: z.object({
        attemptId: z.string(),
        questions: z.array(questionAttemptZodSchema),
      }),
    })
  );

export const addAnswerToAttemptRequestSchema = z.object({
  body: z.object({
    questionId: z.string().min(1, "questionId is required"),
    attemptId: z.string().min(1, "attemptId is required"),
    selectedAnswer: z.string().min(1, "selectedAnswer is required"),
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

export const updateAttemptWithAnswersRequestValidator = validateHandlerRequest(
  updateAttemptWithAnswersRequestSchema
);

export const getQuestionResultRequestValidator = validateHandlerRequest(
  getQuestionResultRequestSchema
);

export const addAnswerToAttemptRequestValidator = validateHandlerRequest(
  addAnswerToAttemptRequestSchema
);
