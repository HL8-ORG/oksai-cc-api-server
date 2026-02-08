import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/libs', '<rootDir>/apps'],
	testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec|test).ts', '**/*.e2e-spec.ts'],
	moduleNameMapper: {
		'^@oksai/(.*)$': '<rootDir>/libs/$1/src',
		'^@app/(.*)$': '<rootDir>/apps/base-api/src/$1'
	},
	collectCoverageFrom: [
		'libs/**/*.ts',
		'apps/base-api/src/**/*.ts',
		'!**/*.spec.ts',
		'!**/*.e2e-spec.ts',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!**/dist/**'
	],
	coverageDirectory: './coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 75,
			lines: 75,
			statements: 75
		}
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
	testTimeout: 30000,
	projects: ['<rootDir>/apps/*', '<rootDir>/libs/*']
};

export default config;
