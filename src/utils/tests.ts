import { ProcessEnv, getProcessEnv } from '../config';

export const createTestEnv = (env?: Partial<ProcessEnv>): ProcessEnv => {
    const processEnv = getProcessEnv();

    return {
        ...processEnv,
        ...(env ?? {})
    };
};
