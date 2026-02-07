/**
 * 默认应用配置
 *
 * 定义应用程序的默认配置，包括 API 服务器配置、数据库连接配置、认证配置等
 */

import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

import * as path from 'path';
import { ApplicationPluginConfig } from './interfaces/ApplicationPluginConfig';
import { DEFAULT_API_HOST, DEFAULT_API_PORT, DEFAULT_API_BASE_URL, DEFAULT_GRAPHQL_API_PATH } from '@oksai/constants';

process.cwd();

/** 资源文件路径 */
let assetPath: string;
/** 资源公共访问路径 */
let assetPublicPath: string;

console.log('默认配置 -> __dirname: ' + __dirname);
console.log('默认配置 -> process.cwd: ' + process.cwd);

/**
 * 根据运行环境确定资源路径
 */
if (__dirname.startsWith('/srv/gauzy')) {
	// Docker 环境特定路径设置
	assetPath = '/srv/gauzy/apps/api/src/assets';
	assetPublicPath = '/srv/gauzy/apps/api/public';
} else {
	// 判断是生产环境还是开发环境
	const isDist = __dirname.includes(path.join('dist'));
	console.log('默认配置 -> isDist: ' + isDist);

	// 根据环境调整基础路径
	const basePath = isDist
		? path.resolve(process.cwd(), 'dist/apps/api') // 生产环境
		: path.resolve(__dirname, '../../../../apps/api'); // 开发环境

	console.log('默认配置 -> basePath: ' + basePath);

	// 设置相对于 basePath 的资源路径
	assetPath = isDist ? path.join(basePath, 'assets') : path.join(basePath, 'src', 'assets');

	// 资源公共目录默认路径
	assetPublicPath = isDist
		? path.resolve(process.cwd(), 'apps/api/public')
		: path.resolve(__dirname, '../../../../apps/api/public');
}

console.log('默认配置 -> assetPath: ' + assetPath);
console.log('默认配置 -> assetPublicPath: ' + assetPublicPath);

/**
 * 应用插件默认配置
 */
export const defaultConfiguration: ApplicationPluginConfig = {
	apiConfigOptions: {
		host: process.env.API_HOST || DEFAULT_API_HOST,
		port: process.env.API_PORT || DEFAULT_API_PORT,
		baseUrl: process.env.API_BASE_URL || DEFAULT_API_BASE_URL,
		middleware: [],
		graphqlConfigOptions: {
			path: DEFAULT_GRAPHQL_API_PATH,
			playground: true,
			debug: true,
			apolloServerPlugins: []
		}
	},
	dbConnectionOptions: {
		driver: {} as any,
		host: process.env.DB_HOST || 'localhost',
		port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT, 10) : 5432,
		dbName: process.env.DB_NAME || 'postgres',
		user: process.env.DB_USER || 'postgres',
		password: process.env.DB_PASS || 'root',
		migrations: {
			path: 'dist/modules/**/*.migration{.ts,.js}'
		},
		entities: ['dist/modules/**/*.entity{.ts,.js}'],
		pool: {
			min: 0,
			max: process.env.DB_POOL_SIZE ? Number.parseInt(process.env.DB_POOL_SIZE) : 40
		},
		persistOnCreate: true
	} as any,
	plugins: [],
	customFields: {
		Employee: [],
		Organization: [],
		OrganizationProject: [],
		Tag: [],
		Tenant: [],
		User: []
	},
	authOptions: {
		expressSessionSecret: process.env.EXPRESS_SESSION_SECRET || 'gauzy',
		userPasswordBcryptSaltRounds: 12,
		jwtSecret: process.env.JWT_SECRET || 'secretKey'
	},
	assetOptions: {
		assetPath: assetPath,
		assetPublicPath: assetPublicPath
	}
};
