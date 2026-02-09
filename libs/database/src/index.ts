/**
 * 数据库相关包
 *
 * 提供数据库相关类型和工具函数
 */

export interface DatabaseConfig {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
}

export function createDatabaseConfig(config: Partial<DatabaseConfig>): DatabaseConfig {
	return {
		host: config.host || 'localhost',
		port: config.port || 5432,
		database: config.database || 'oksai',
		username: config.username || 'postgres',
		password: config.password || ''
	};
}
