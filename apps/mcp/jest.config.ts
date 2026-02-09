export default {
	displayName: 'MCP App',
	preset: '../../jest.preset.js',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.app.json' }]
	},
	moduleFileExtensions: ['ts', 'js'],
	testMatch: ['**/*.spec.ts', '**/*.test.ts'],
	collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.spec.ts', '!src/**/*.test.ts', '!src/**/*.d.ts'],
	coverageDirectory: '../../coverage/apps/mcp',
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80
		}
	}
};
