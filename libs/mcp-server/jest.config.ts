export default {
	displayName: 'MCP Server',
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^@oksai/(.*)$': '<rootDir>/../$1/src'
	},
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.lib.json' }]
	},
	moduleFileExtensions: ['ts', 'js'],
	testMatch: ['**/*.spec.ts', '**/*.test.ts'],
	collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.spec.ts', '!src/**/*.test.ts', '!src/**/*.d.ts'],
	coverageDirectory: '../../coverage/libs/mcp-server',
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80
		}
	}
};
