'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@mikro-orm/core');
const better_sqlite_1 = require('@mikro-orm/better-sqlite');
const mysql_1 = require('@mikro-orm/mysql');
const postgresql_1 = require('@mikro-orm/postgresql');
// Entities will be auto-discovered from plugins
exports.default = (0, core_1.defineConfig)({
	driver:
		process.env.DATABASE_TYPE === 'postgresql'
			? postgresql_1.PostgreSqlDriver
			: process.env.DATABASE_TYPE === 'mysql'
			? mysql_1.MySqlDriver
			: better_sqlite_1.BetterSqliteDriver,
	host: process.env.DATABASE_HOST || 'localhost',
	port: Number(process.env.DATABASE_PORT) || 3306,
	user: process.env.DATABASE_USERNAME || 'root',
	password: process.env.DATABASE_PASSWORD || '',
	dbName: process.env.DATABASE_NAME || './oksai_dev.db',
	entities: ['dist/**/*.entity.js'],
	entitiesTs: ['src/**/*.entity.ts'],
	migrations: {
		path: './dist/migrations',
		pathTs: './src/migrations'
	},
	allowGlobalContext: true,
	debug: process.env.NODE_ENV === 'development'
});
//# sourceMappingURL=mikro-orm.config.js.map
