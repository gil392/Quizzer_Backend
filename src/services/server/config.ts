import { AuthConfig, createAuthConfig } from '../../authentication/config';
import { ProcessEnv } from '../../config';

export type ServerConfig = {
    port: number;
    authConfig: AuthConfig;
};

export const createServerConfig = (processEnv: ProcessEnv): ServerConfig => ({
    port: processEnv.PORT,
    authConfig: createAuthConfig(processEnv)
});
