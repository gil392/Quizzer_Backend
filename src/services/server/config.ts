import { ProcessEnv } from '../../config';

export type ServerConfig = {
    port: number;
};

export const createServerConfig = (processEnv: ProcessEnv): ServerConfig => ({
    port: processEnv.PORT,
});
