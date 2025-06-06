import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";
import { authenticatedRequestZodSchema } from "../authentication/validators";

const getLessonByIdRequstZodSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
export const getLessonByIdRequstValidator = validateHandlerRequest(
  getLessonByIdRequstZodSchema
);

const createLessonRequstZodSchema = z
  .object({
    body: z.object({
      videoUrl: z.string().url(),
    }),
  })
  .merge(authenticatedRequestZodSchema);

export type CreateLessonRequst = z.infer<typeof createLessonRequstZodSchema>;
export const createLessonRequstValidator = validateHandlerRequest(
  createLessonRequstZodSchema
);

const createRelatedLessonRequstZodSchema = z
  .object({
    body: z.object({
      videoId: z.string(),
      relatedLessonId: z.string(),
    }),
  })
  .merge(authenticatedRequestZodSchema);

export const createRelatedLessonRequestValidator = validateHandlerRequest(
  createRelatedLessonRequstZodSchema
);

const createMergedLessonRequstZodSchema = z
  .object({
    body: z.object({
      lessonIds: z
        .array(z.string())
        .min(1, "At least one lesson ID is required"),
      title: z.string().optional(),
    }),
  })
  .merge(authenticatedRequestZodSchema);

export const createMergedLessonRequstValidator = validateHandlerRequest(
  createMergedLessonRequstZodSchema
);

const deleteLessonRequstZodSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
export const deleteLessonRequstValidator = validateHandlerRequest(
  deleteLessonRequstZodSchema
);

const updateLessonRequstZodSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().optional(),
    isFavorite: z.boolean().optional(),
    videoUrl: z.string().url().optional(),
    summary: z.string().optional(),
  }),
});
export const updateLessonRequstValidator = validateHandlerRequest(
  updateLessonRequstZodSchema
);

const relatedVideosLessonRequstZodSchema = z.object({
  query: z.object({
    id: z.string(),
  }),
});
export const relatedVideosLessonRequstValidator = validateHandlerRequest(
  relatedVideosLessonRequstZodSchema
);
