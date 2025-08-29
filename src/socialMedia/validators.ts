import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";

const socialMediaImageRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ID format"),
  }),
});

export const validateSocialMediaImageRequest = validateHandlerRequest(
  socialMediaImageRequestSchema
);

const socialMediaPreviewRequestSchema = z.object({
  query: z.object({
    text: z.string().min(1, "Text is required"),
    imageType: z.enum(["achievement", "attempt"], {
      errorMap: () => ({
        message: "imageType must be 'achievement' or 'attempt'",
      }),
    }),
    imageId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid image ID format"),
    link: z.string().url("Invalid URL format"),
    title: z.string().optional(),
  }),
});

export const validateSocialMediaPreviewRequest = validateHandlerRequest(
  socialMediaPreviewRequestSchema
);
