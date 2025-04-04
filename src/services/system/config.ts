import { ProcessEnv } from '../../config';
import { createSummarizerConfig, SummarizerConfig } from '../../externalApis/transcriptSummarizer/config';
import { createDatabaseConfig, DatabaseConfig } from '../database/config';
import { createServerConfig, ServerConfig } from '../server/config';

export type SystemConfig = {
    databaseConfig: DatabaseConfig;
    serverConfig: ServerConfig;
    summarizerConfig: SummarizerConfig;
};

export const createSystemConfig = (processEnv: ProcessEnv): SystemConfig => ({
    serverConfig: createServerConfig(processEnv),
    databaseConfig: createDatabaseConfig(processEnv),
    summarizerConfig: createSummarizerConfig(processEnv)
});
