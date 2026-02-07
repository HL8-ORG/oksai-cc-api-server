module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/*.spec.ts'],
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.test.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	moduleFileExtensions: ['ts', 'js', 'json'],
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tsconfig.lib.json'
		}
	}
};
