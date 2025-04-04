import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
const portZodSchema = z
    .string()
    .refine((value) => !isNaN(Number(value)), {
        message: 'Must be a string representing a valid number'
    })
    .transform(Number);

const processEnvZodSchema = z.object({
    PORT: portZodSchema,
    DB_CONNECTION_STRING: z.string().url(),
    YOUTUBE_API_CLIENT_ID: z.string(),
    YOUTUBE_API_SECRET_ID: z.string(),
    YOUTUBE_API_REDIRECT_URI: z.string().url(),
});
export type ProcessEnv = z.infer<typeof processEnvZodSchema>;

export const getProcessEnv = (): ProcessEnv => {
    const validation = processEnvZodSchema.safeParse(process.env);
    if (!validation.success) {
        throw validation.error;
    }

    return validation.data;
};
