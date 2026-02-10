import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	roots: ['<rootDir>/libs', '<rootDir>/apps'],
	testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec|test).ts', '**/*.e2e-spec.ts'],
	moduleNameMapper: {
		'^@oksai/(auth|tenant|user|organization|role|audit|analytics|reporting)$': '<rootDir>/libs/sys-plugins/$1/src',
		'^@oksai/(core|plugin)$': '<rootDir>/libs/$1/src',
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
	projects: [
		'<rootDir>/apps/base-api',
		'<rootDir>/apps/mcp',
		'<rootDir>/apps/mcp-auth',
		'<rootDir>/libs/common',
		'<rootDir>/libs/core',
		'<rootDir>/libs/plugin',
		'<rootDir>/libs/sys-plugins/*',
		'<rootDir>/libs/bootstrap',
		'<rootDir>/libs/config',
		'<rootDir>/libs/constants',
		'<rootDir>/libs/contracts',
		'<rootDir>/libs/database',
		'<rootDir>/libs/utils'
	]
};

export default config;
