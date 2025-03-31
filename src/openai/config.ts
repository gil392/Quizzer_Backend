import { getProcessEnv, ProcessEnv } from '../config';

export type ChatGeneratorConfig = {
    apiKey: string,
};

export const createChatGeneratorConfig = (
    env: ProcessEnv
): ChatGeneratorConfig => ({
    apiKey: env.OPENAI_API_KEY
});
