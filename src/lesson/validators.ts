import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";

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
export type CreateLessonRequst = z.infer<typeof createLessonRequstZodSchema>;
export const createLessonRequstValidator = validateHandlerRequest(
  createLessonRequstZodSchema
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
  params: z.object({
    id: z.string(),
  }),
});
export const relatedVideosLessonRequstValidator = validateHandlerRequest(
  relatedVideosLessonRequstZodSchema
);
