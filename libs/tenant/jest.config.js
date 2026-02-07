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
		'^@nestjs/(.*)$': '<rootDir>/../../node_modules/@nestjs/$1',
		'^@mikro-orm/(.*)$': '<rootDir>/../../node_modules/@mikro-orm/$1',
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
