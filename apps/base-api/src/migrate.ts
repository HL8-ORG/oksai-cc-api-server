import { MikroORM } from '@mikro-orm/core';
import config from './config/mikro-orm.config';

/**
 * 数据库迁移脚本
 *
 * 使用 MikroORM 同步数据库 schema，而不删除现有数据
 */
async function migrate() {
	try {
		console.log('==========================================');
		console.log('🔄 运行数据库迁移');
		console.log('==========================================');
		console.log('');

		console.log('📊 数据库配置:');
		console.log(`  主机: ${config.host}`);
		console.log(`  端口: ${config.port}`);
		console.log(`  名称: ${config.dbName}`);
		console.log('');

		const orm = await MikroORM.init(config);
		console.log('✅ 数据库连接成功');
		console.log('');

		const generator = orm.getSchemaGenerator();

		console.log('📊 同步数据库 Schema...');
		await generator.updateSchema();
		console.log('✅ Schema 同步完成');
		console.log('');

		console.log('📋 数据库表:');
		console.log(`  - User`);
		console.log(`  - Tenant`);
		console.log(`  - Organization`);
		console.log(`  - Role`);
		console.log(`  - Permission`);
		console.log(`  - AuditLog`);
		console.log(`  - AnalyticsEvent`);
		console.log(`  - AnalyticsMetric`);
		console.log(`  - AnalyticsReport`);
		console.log(`  - Report`);
		console.log(`  - ReportTemplate`);
		console.log(`  - ReportSchedule`);
		console.log('');

		await orm.close();

		console.log('==========================================');
		console.log('✅ 迁移完成');
		console.log('==========================================');
		console.log('');
		console.log('🚀 现在可以启动应用了:');
		console.log('  pnpm run start:dev');
	} catch (error) {
		console.error('❌ 迁移失败:', error);
		process.exit(1);
	}
}

migrate();
