import { MikroORMOptions } from '@mikro-orm/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { BootstrapContext } from './bootstrap-context.interface';

/**
 * 服务类型枚举
 */
export enum ServiceType {
	API = 'api',
	MCP = 'mcp',
	WORKER = 'worker',
	CRON = 'cron',
	GRPC = 'grpc'
}

/**
 * 数据库配置接口
 */
export interface DatabaseConfig {
	/**
	 * 数据库连接配置
	 */
	readonly connection: Partial<MikroORMOptions>;

	/**
	 * 是否在启动时运行迁移
	 */
	readonly runMigrations?: boolean;

	/**
	 * 是否在启动时同步数据库结构
	 */
	readonly synchronize?: boolean;

	/**
	 * 是否在数据库为空时自动填充数据
	 */
	readonly seedIfEmpty?: boolean;
}

/**
 * Express 配置接口
 */
export interface ExpressConfig {
	/**
	 * 全局路由前缀
	 */
	readonly globalPrefix?: string;

	/**
	 * CORS 配置
	 */
	readonly cors?: CorsOptions;

	/**
	 * 是否启用 helmet 安全中间件
	 */
	readonly enableHelmet?: boolean;

	/**
	 * 请求体大小限制（MB）
	 */
	readonly bodyLimit?: string;

	/**
	 * 是否启用 Swagger 文档
	 */
	readonly enableSwagger?: boolean;

	/**
	 * Swagger 文档路径
	 */
	readonly swaggerPath?: string;

	/**
	 * 是否启用会话管理（Redis 或内存存储）
	 */
	readonly enableSession?: boolean;
}

/**
 * 监控配置接口
 */
export interface MonitoringConfig {
	/**
	 * 是否启用健康检查
	 */
	readonly enableHealthCheck?: boolean;

	/**
	 * 健康检查端点路径
	 */
	readonly healthCheckPath?: string;

	/**
	 * 是否启用性能监控
	 */
	readonly enablePerformanceMonitoring?: boolean;

	/**
	 * 是否启用请求日志
	 */
	readonly enableRequestLogging?: boolean;
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
	/**
	 * 系统插件列表
	 */
	readonly systemPlugins?: string[];

	/**
	 * 功能插件配置
	 */
	readonly featurePlugins?: Record<string, { enabled: boolean; config?: Record<string, any> }>;

	/**
	 * 插件全局配置
	 */
	readonly plugins?: Record<string, Record<string, any>>;

	/**
	 * 是否自动加载所有已注册的插件
	 */
	readonly autoLoad?: boolean;

	/**
	 * 插件加载超时时间（毫秒）
	 */
	readonly loadTimeout?: number;
}

/**
 * 启动器配置接口
 *
 * 定义了服务启动所需的所有配置选项
 */
export interface BootstrapConfig {
	/**
	 * 服务类型
	 */
	readonly serviceType: ServiceType;

	/**
	 * 服务名称
	 */
	readonly serviceName: string;

	/**
	 * 数据库配置
	 */
	readonly database: DatabaseConfig;

	/**
	 * Express 配置（仅适用于 API 服务）
	 */
	readonly express?: ExpressConfig;

	/**
	 * 监控配置
	 */
	readonly monitoring?: MonitoringConfig;

	/**
	 * 插件配置
	 */
	readonly plugins: PluginConfig;

	/**
	 * 自定义启动钩子函数
	 *
	 * 在所有初始化完成后、开始监听端口之前调用
	 *
	 * @param app - NestJS 应用实例
	 * @param context - 启动上下文
	 */
	readonly beforeStart?: (app: NestExpressApplication, context: BootstrapContext) => Promise<void>;

	/**
	 * 自定义关闭钩子函数
	 *
	 * 在应用关闭时调用
	 *
	 * @param app - NestJS 应用实例
	 * @param context - 启动上下文
	 */
	readonly onShutdown?: (app: NestExpressApplication, context: BootstrapContext) => Promise<void>;
}
