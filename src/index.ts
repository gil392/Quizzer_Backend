import { getProcessEnv } from './config';
import { createSystemConfig } from './services/system/config';
import { System } from './services/system/system';

const handleError = (error: Error) => {
    console.error(error);
    process.exit(1);
};

try {
    const processEnv = getProcessEnv();
    const systemConfig = createSystemConfig(processEnv);
    const system = new System(systemConfig); 
    system.start().catch(handleError);
} catch (error) {
    handleError(error as Error);
}
