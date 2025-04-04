import { ProcessEnv } from '../../config';

export type ServerConfig = {
    port: number;
    youtubeApiKey: string;
    youtubeApiSecret: string;
    youtubeApiRedirectUri: string;
};

export const createServerConfig = (processEnv: ProcessEnv): ServerConfig => ({
    port: processEnv.PORT,
    youtubeApiKey: processEnv.YOUTUBE_API_CLIENT_ID,
    youtubeApiSecret: processEnv.YOUTUBE_API_SECRET_ID,
    youtubeApiRedirectUri: processEnv.YOUTUBE_API_REDIRECT_URI,
});
