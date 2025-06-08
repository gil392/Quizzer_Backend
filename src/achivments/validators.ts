import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";

export const AchievementImageZodSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid achievement ID"),
  }),
});

export const validateAchievementImageRequest = validateHandlerRequest(
  AchievementImageZodSchema
);