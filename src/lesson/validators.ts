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

const createLessonRequstZodSchema = z.object({
  body: z.object({
    videoUrl: z.string().url(),
  }),
});

const createMergedLessonRequstZodSchema = z
  .object({
    body: z.object({
      lessonIds: z.array(z.string()),
      title: z.string().optional(),
    }),
  })
  .merge(authenticatedRequestZodSchema);

export type CreateLessonRequst = z.infer<typeof createLessonRequstZodSchema>;
export const createLessonRequstValidator = validateHandlerRequest(
  createLessonRequstZodSchema
);

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
