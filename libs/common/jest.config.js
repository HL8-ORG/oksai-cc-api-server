module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
	transform: {
		'^.+\\\\\.ts$': 'ts-jest'
	},
	moduleNameMapper: {
		'^@oksai/core$': '<rootDir>/../core/src',
		'^@oksai/plugin$': '<rootDir>/../plugin/src',
		'^@oksai/(.*)$': '<rootDir>/../sys-plugins/$1/src'
	},
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.interface.ts'],
	coverageDirectory: './coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tsconfig.lib.json'
		}
	}
};
