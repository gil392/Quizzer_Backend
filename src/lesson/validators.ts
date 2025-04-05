import { z } from 'zod';
import { validateHandlerRequest } from '../services/server/validators';

const getLessonByIdRequstZodSchema = z.object({
    params: z.object({
        id: z.string()
    })
});
export const getLessonByIdRequstValidator = validateHandlerRequest(
    getLessonByIdRequstZodSchema
);

const createLessonRequstZodSchema = z.object({
    body: z.object({
        videoUrl: z.string().url(),
        title: z.string()
    })
});
export type CreateLessonRequst = z.infer<typeof createLessonRequstZodSchema>;
export const createLessonRequstValidator = validateHandlerRequest(
    createLessonRequstZodSchema
);
