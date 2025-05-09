import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";
import { authenticate } from "../externalApis/youtube/authentication";
import { authenticatedRequestZodSchema } from "../authentication/validators";

const rateQuizRequestZodSchema = z
  .object({
    query: z.object({
      quizId: z.string().nonempty("Quiz ID is required"),
    }),
    body: z.object({
      rating: z
        .number()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5")
        .nullable(),
    }),
  })
  .merge(authenticatedRequestZodSchema);

export const rateQuizRequestValidator = validateHandlerRequest(
  rateQuizRequestZodSchema
);
