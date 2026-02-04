import { defineConfig } from '@mikro-orm/better-sqlite';

export default defineConfig({
	entities: [
		'./../../libs/auth/dist/lib/entities/*.js',
		'./../../libs/tenant/dist/lib/entities/*.js',
		'./../../libs/user/dist/lib/entities/*.js',
		'./../../libs/organization/dist/lib/entities/*.js',
		'./../../libs/role/dist/lib/entities/*.js',
		'./../../libs/audit/dist/lib/entities/*.js'
	],
	dbName: ':memory:',
	allowGlobalContext: true,
	debug: true
});
