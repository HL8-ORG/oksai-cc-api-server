/**
 * MikroORM 数据库配置
 *
 * 支持 PostgreSQL（默认）、MongoDB 和 Better-SQLite
 */
import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { BaseEntity, Feature } from '@oksai/core';
import { TenantBaseEntity } from '@oksai/tenant';
import { User } from '@oksai/user';
import { Organization, FeatureOrganization } from '@oksai/organization';
import { Role, Permission } from '@oksai/role';
import { Tenant } from '@oksai/tenant';
import { AuditLog } from '@oksai/audit';
import { AnalyticsEvent, AnalyticsMetric, AnalyticsReport } from '@oksai/analytics';
import { Report, ReportTemplate, ReportSchedule } from '@oksai/reporting';

const isTestEnv = process.env.NODE_ENV === 'test';

// 调试：输出数据库配置（仅非测试环境）
if (!isTestEnv) {
	console.log('📊 Database Configuration:');
	console.log('  Host:', process.env.DATABASE_HOST || 'localhost');
	console.log('  Port:', process.env.DATABASE_PORT || '5432');
	console.log('  User:', process.env.DATABASE_USERNAME || 'postgres');
	console.log('  Password:', process.env.DATABASE_PASSWORD ? '***' : 'postgres (default)');
	console.log('  Database:', process.env.DATABASE_NAME || 'oksai');
}

const baseConfig = {
	// 实体类定义
	entities: [
		BaseEntity,
		Feature,
		Tenant,
		User,
		Role,
		Permission,
		Organization,
		TenantBaseEntity,
		FeatureOrganization,
		AuditLog,
		AnalyticsEvent,
		AnalyticsMetric,
		AnalyticsReport,
		Report,
		ReportTemplate,
		ReportSchedule
	],

	// 基础目录配置
	baseDir: process.env.BASE_DIR || process.cwd(),

	// 自动同步和迁移
	sync: false,
	migrations: {
		path: './migrations',
		pathTs: './migrations'
	},

	// 调试选项（仅开发环境）
	debug: process.env.NODE_ENV === 'development',

	// 自动加载实体
	loadStrategy: 'select-in' as const,

	// 日志选项（默认使用 console.logger）
	logger: console.log,

	// 连接池配置
	pool: {
		min: parseInt(process.env.DB_POOL_MIN || '2'),
		max: parseInt(process.env.DB_POOL_MAX || '10')
	}
};

export default isTestEnv
	? {
			...baseConfig,
			// 测试环境使用 SQLite 内存库，避免依赖外部 PostgreSQL
			driver: BetterSqliteDriver,
			dbName: ':memory:',
			allowGlobalContext: true,
			debug: false
		}
	: {
			...baseConfig,
			// 数据库驱动配置（MikroORM v6 使用 driver 替代 type）
			driver: PostgreSqlDriver,
			// PostgreSQL 配置（默认）
			host: process.env.DATABASE_HOST || 'localhost',
			port: parseInt(process.env.DATABASE_PORT || '5432'),
			user: process.env.DATABASE_USERNAME || 'postgres',
			password: process.env.DATABASE_PASSWORD || 'postgres',
			dbName: process.env.DATABASE_NAME || 'oksai'
		};
