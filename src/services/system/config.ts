import { ProcessEnv } from '../../config';
import { createOpenAiConfig, OpenAiConfig } from '../../externalApis/openAiConfig';
import { createDatabaseConfig, DatabaseConfig } from '../database/config';
import { createServerConfig, ServerConfig } from '../server/config';

export type SystemConfig = {
    databaseConfig: DatabaseConfig;
    serverConfig: ServerConfig;
    openAiConfig: OpenAiConfig
};

export const createSystemConfig = (processEnv: ProcessEnv): SystemConfig => ({
    serverConfig: createServerConfig(processEnv),
    databaseConfig: createDatabaseConfig(processEnv),
    openAiConfig: createOpenAiConfig(processEnv)
});
