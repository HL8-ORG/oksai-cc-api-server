import type { Config } from 'jest';

const config: Config = {
	projects: [
		'<rootDir>/apps/*',
		'<rootDir>/packages/*',
		'<rootDir>/packages/plugins/*'
	],
	testTimeout: 10000
};

export default config;
