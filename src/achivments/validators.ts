import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";
import { authenticatedRequestZodSchema } from "../authentication/validators";

export const AchievementImageZodSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid achievement ID"),
  }),
});

export const validateAchievementImageRequest = validateHandlerRequest(
  AchievementImageZodSchema
);

export const AchievementProgressRequestSchema = authenticatedRequestZodSchema.and(
  z.object({
    query: z.object({
      friendId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid friend ID").optional(),
    }),
  })
);

export const validateAchievementProgressRequest = validateHandlerRequest(
  AchievementProgressRequestSchema
);