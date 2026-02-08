module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/*.spec.ts'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.interface.ts', '!src/**/*.spec.ts'],
	coverageDirectory: './coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	moduleNameMapper: {
		'^@oksai/(.*)$': '<rootDir>/../../libs/$1/src',
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tsconfig.lib.json'
		}
	},
	presetMocks: true,
	resetModules: true,
	clearMocks: true
};
