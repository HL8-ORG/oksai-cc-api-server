/**
 * MikroORM 数据库配置
 *
 * 支持 PostgreSQL（默认）、MongoDB 和 Better-SQLite
 */
export default {
	// 自动发现实体
	entities: [
		'libs/core/src/lib/entities/base.entity.js',
		'libs/core/src/lib/entities/index.js',
		'libs/tenant/src/lib/entities/*.entity.js',
		'libs/user/src/lib/entities/*.entity.js',
		'libs/organization/src/lib/entities/*.entity.js',
		'libs/role/src/lib/entities/*.entity.js',
		'libs/auth/src/lib/entities/*.entity.js',
		'libs/audit/src/lib/entities/*.entity.js',
		'libs/analytics/src/lib/entities/*.entity.js',
		'libs/reporting/src/lib/entities/*.entity.js'
	],

	// 数据库类型配置
	type: (process.env.DB_TYPE as any) || 'postgresql',

	// PostgreSQL 配置（默认）
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '5432'),
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'postgres',
	dbName: process.env.DB_NAME || 'oksai',

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
