import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const jwtExpiresInZodSchema = z
    .string()
    .regex(/^\d+(s|m|h|d|w|y)$/)
    .or(z.number());

const portZodSchema = z
    .string()
    .refine((value) => !isNaN(Number(value)), {
        message: 'Must be a string representing a valid number'
    })
    .transform(Number);

const processEnvZodSchema = z.object({
    PORT: portZodSchema,
    DB_CONNECTION_STRING: z.string().url(),
    OPENAI_API_KEY: z.string(),
    CORS_ORIGIN: z.string().optional(),

    // AuthConfig
    AUTH_TOKEN_SECRET: z.string(),
    AUTH_TOKEN_EXPIRES: jwtExpiresInZodSchema,
    AUTH_REFRESH_TOKEN_EXPIRES: jwtExpiresInZodSchema
});
export type ProcessEnv = z.infer<typeof processEnvZodSchema>;

export const getProcessEnv = (): ProcessEnv => {
    const validation = processEnvZodSchema.safeParse(process.env);
    if (!validation.success) {
        throw validation.error;
    }

    return validation.data;
};
