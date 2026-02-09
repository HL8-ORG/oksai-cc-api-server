import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/tests'],
	testMatch: ['**/*.e2e-spec.ts'],
	moduleNameMapper: {
		'^@oksai/(.*)$': '<rootDir>/../libs/$1/src'
	},
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	globals: {
		'ts-jest': {
			tsconfig: {
				esModuleInterop: true,
				allowSyntheticDefaultImports: true
			},
			diagnostics: {
				warnOnly: true
			}
		}
	},
	testTimeout: 30000
};

export default config;
