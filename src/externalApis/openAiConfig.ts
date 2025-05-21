import { ProcessEnv } from "../config";


export type OpenAiConfig = {
    apiKey: string,
};

export const createOpenAiConfig = (
    env: ProcessEnv
): OpenAiConfig => ({
    apiKey: env.OPENAI_API_KEY
});
