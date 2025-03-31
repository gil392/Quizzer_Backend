import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const processEnvZodSchema = z.object({
    PORT: z.coerce.number(),
    DB_CONNECTION_STRING: z.string().url(),
});
export type ProcessEnv = z.infer<typeof processEnvZodSchema>;

export const getProcessEnv = (): ProcessEnv => {
    const validation = processEnvZodSchema.safeParse(process.env);
    if (!validation.success) {
        throw validation.error;
    }

    return validation.data;
};
