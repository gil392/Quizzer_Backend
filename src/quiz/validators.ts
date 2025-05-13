import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";
import { quizCheckTypes, QuizSettings } from "./types";

const quizSettingsZodSchema: z.ZodType<QuizSettings> = z.object({
  checkType: z.enum(quizCheckTypes),
  isRandomOrder: z.coerce.boolean(),
  maxQuestionCount: z.coerce.number(),
  solvingTimeMs: z.coerce.number(),
});

export const getQuizByIdRequestZodSchema = z.object({
    params: z.object({
        quizId: z.string(),
    }),
});

export const getQuizByIdRequestValidator = validateHandlerRequest(
    getQuizByIdRequestZodSchema
);

export const generateQuizRequstZodSchema = z.object({
  body: z.object({
    lessonId: z.string(),
    settings: quizSettingsZodSchema,
  }),
});
export const generateQuizRequstValidator = validateHandlerRequest(
  generateQuizRequstZodSchema
);

export const questionAnswerSubmittionZodSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.string(),
});

const getQuizzesRequstZodSchema = z.object({
  query: z.object({
    lessonId: z.string().optional(),
  }),
});
export const getQuizzesRequstValidator = validateHandlerRequest(
  getQuizzesRequstZodSchema
);

const deleteQuizRequstZodSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
export const deleteQuizRequstValidator = validateHandlerRequest(
  deleteQuizRequstZodSchema
);

const updateQuizRequstZodSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().optional(),
  }),
});
export const updateQuizRequstValidator = validateHandlerRequest(
  updateQuizRequstZodSchema
);
