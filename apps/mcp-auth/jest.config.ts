import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
	collectCoverageFrom: ['src/**/*.(t|j)s', '!src/**/*.spec.ts', '!src/**/*.e2e-spec.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	}
};

export default config;
