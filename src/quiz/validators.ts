import { z } from 'zod';
import { validateHandlerRequest } from '../services/server/validators';
import { quizCheckTypes, QuizSettings } from './types';

const quizSettingsZodSchema: z.ZodType<QuizSettings> = z.object({
    checkType: z.enum(quizCheckTypes),
    isRandomOrder: z.coerce.boolean(),
    maxQuestionCount: z.coerce.number(),
    solvingTimeMs: z.coerce.number()
});

export const generateQuizRequstZodSchema = z.object({
    body: z.object({
        lessonId: z.string(),
        settings: quizSettingsZodSchema
    })
});
export const generateQuizRequstValidator = validateHandlerRequest(
    generateQuizRequstZodSchema
);
