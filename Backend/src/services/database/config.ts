import { ProcessEnv } from '../../config';

export type DatabaseConfig = {
    connectionString: string;
};

export const createDatabaseConfig = (processEnv: ProcessEnv): DatabaseConfig => ({
    connectionString: processEnv.DB_CONNECTION_STRING,
});
