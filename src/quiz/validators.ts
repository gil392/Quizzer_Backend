import { z } from 'zod';
import { validateHandlerRequest } from '../services/server/validators';
import { quizCheckTypes, QuizSettings } from './types';

const quizSettingsZodSchema: z.ZodType<QuizSettings> = z.object({
    checkType: z.enum(quizCheckTypes),
    isRandomOrder: z.boolean(),
    maxQuestionCount: z.number(),
    solvingTimeMs: z.number()
});

export const generateQuizRequstZodSchema = z.object({
    body: z.object({
        title: z.string(),
        videoUrl: z.string().url(),
        settings: quizSettingsZodSchema
    })
});
export const generateQuizRequstValidator = validateHandlerRequest(
    generateQuizRequstZodSchema
);
