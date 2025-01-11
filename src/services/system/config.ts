import { ProcessEnv } from '../../config';
import { createDatabaseConfig, DatabaseConfig } from '../database/config';
import { createServerConfig, ServerConfig } from '../server/config';

export type SystemConfig = {
    databaseConfig: DatabaseConfig;
    serverConfig: ServerConfig;
};

export const createSystemConfig = (processEnv: ProcessEnv): SystemConfig => ({
    serverConfig: createServerConfig(processEnv),
    databaseConfig: createDatabaseConfig(processEnv),
});
