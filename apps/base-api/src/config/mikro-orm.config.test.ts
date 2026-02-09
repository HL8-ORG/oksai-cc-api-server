import { defineConfig } from '@mikro-orm/sqlite';

const mikroOrmTestConfig = defineConfig({
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

export default mikroOrmTestConfig;

describe('mikro-orm.config.test', () => {
	it('应该导出 MikroORM 测试配置', () => {
		expect(mikroOrmTestConfig).toBeDefined();
		expect(mikroOrmTestConfig.dbName).toBe(':memory:');
	});
});
