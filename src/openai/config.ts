import { getProcessEnv, ProcessEnv } from '../config';

export type SummarizerConfig  = {
    apiKey: string,
};

export const createTranscriptSummarizerConfig = (
    env: ProcessEnv
): SummarizerConfig  => ({
    apiKey: env.OPENAI_API_KEY
});
