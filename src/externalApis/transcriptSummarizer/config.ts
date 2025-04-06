import { ProcessEnv } from "../../config";


export type SummarizerConfig  = {
    apiKey: string,
};

export const createSummarizerConfig = (
    env: ProcessEnv
): SummarizerConfig  => ({
    apiKey: env.OPENAI_API_KEY
});
