import { ProcessEnv, getProcessEnv } from '../config';

export const createTestEnv = (env?: Partial<ProcessEnv>): ProcessEnv => {
    const processEnv = getProcessEnv();

    return {
        ...processEnv,
        ...(env ?? {})
    };
};

export const asMockOf = <MockedType>(
    mock: Record<keyof MockedType, jest.Mock>
): MockedType => mock as unknown as MockedType;
