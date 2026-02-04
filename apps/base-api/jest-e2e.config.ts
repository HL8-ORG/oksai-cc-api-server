import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/e2e/**/*.ts'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.test.ts'],
	coverageDirectory: '../coverage/e2e',
	moduleNameMapper: {
		'^@oksai/(.*)$': '<rootDir>/../../libs/$1/src',
		'^chalk$': 'jest-mock'
	},
	moduleFileExtensions: ['ts', 'js', 'json'],
	testTimeout: 30000,
	setupFiles: ['<rootDir>/test-setup.ts']
};

export default config;
