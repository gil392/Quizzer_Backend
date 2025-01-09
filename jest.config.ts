/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    setupFiles: ['dotenv/config'],
    testMatch: ['**/*.test.ts']
};

