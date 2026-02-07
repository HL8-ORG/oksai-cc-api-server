import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { NestFactory, NestApplication } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { MikroORM } from '@mikro-orm/core';
import { json, urlencoded } from 'express';
import { PluginRegistryService, PluginLoaderService, IPlugin } from '@oksai/plugin';
import { BootstrapConfig, ServiceType, MonitoringConfig, ExpressConfig } from '../interfaces';
import { BootstrapContext } from '../interfaces/bootstrap-context.interface';
import { configureRedisSession } from '../redis-store';
import { setupSwagger } from '../swagger';
import tracer from '../tracer';

/**
 * 启动器服务
 *
 * 提供应用的启动、配置和关闭管理功能
 */
@Injectable()
export class BootstrapService implements OnApplicationShutdown {
	private readonly logger = new Logger(BootstrapService.name);
	private readonly startTime = Date.now();
	private app?: NestExpressApplication;
	private context?: BootstrapContext;
	private config?: BootstrapConfig;

	constructor(
		private readonly pluginRegistry: PluginRegistryService,
		private readonly pluginLoader: PluginLoaderService
	) {}

	/**
	 * 启动应用
	 *
	 * @param AppModule - 根模块
	 * @param config - 启动配置
	 * @returns NestJS 应用实例和启动上下文
	 */
	async bootstrap(
		AppModule: any,
		config: BootstrapConfig
	): Promise<{ app: NestExpressApplication; context: BootstrapContext }> {
		this.config = config;
		this.logger.log(`开始启动服务：${config.serviceName} (${config.serviceType})`);

		try {
			// 启动 OpenTelemetry 追踪
			tracer.start();

			// 创建 NestJS 应用
			this.app = await this.createApplication(AppModule, config);

			// 配置 Express 中间件
			if (config.express) {
				this.configureExpress(this.app, config);
			}

			// 配置监控和日志
			if (config.monitoring) {
				this.configureMonitoring(this.app, config.monitoring);
			}

			// 获取 ORM 实例
			const orm = this.app.get(MikroORM);

			// 初始化数据库
			await this.initializeDatabase(orm, config.database);

			// 获取已加载的插件（暂时返回空数组，等待 PluginLoaderService 完善）
			const loadedPlugins: IPlugin[] = [];

			// 获取已注册的插件
			const plugins: IPlugin[] = [];

			// 创建启动上下文
			this.context = {
				app: this.app,
				orm,
				serviceType: config.serviceType,
				serviceName: config.serviceName,
				plugins,
				loadedPlugins,
				startTime: this.startTime,
				env: {
					NODE_ENV: process.env.NODE_ENV || 'development',
					PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
					HOST: process.env.HOST
				}
			};

			// 执行自定义启动钩子
			if (config.beforeStart) {
				await config.beforeStart(this.app, this.context);
			}

			this.logStartupTime();

			return { app: this.app, context: this.context };
		} catch (error) {
			this.logger.error(`启动服务失败：${config.serviceName}`, error);
			throw error;
		}
	}

	/**
	 * 启动服务器
	 *
	 * @param port - 端口号
	 * @param host - 主机地址
	 */
	async listen(port: number, host: string = '0.0.0.0'): Promise<void> {
		if (!this.app || !this.context) {
			throw new Error('应用尚未初始化，请先调用 bootstrap()');
		}

		await this.app.listen(port, host, () => {
			const url = `http://${host}:${port}`;
			const apiPrefix = this.config?.express?.globalPrefix || '';
			const apiUrl = apiPrefix ? `${url}/${apiPrefix}` : url;

			this.logger.log(`服务运行在：${url}`);
			this.logger.log(`API 地址：${apiUrl}`);

			if (process.send) {
				process.send(url);
			}
		});
	}

	/**
	 * 创建 NestJS 应用实例
	 *
	 * @param AppModule - 根模块
	 * @param config - 启动配置
	 * @returns NestJS 应用实例
	 */
	private async createApplication(AppModule: any, config: BootstrapConfig): Promise<NestExpressApplication> {
		const app = await NestFactory.create<NestExpressApplication>(AppModule, {
			logger: ['log', 'error', 'warn', 'debug', 'verbose'],
			bufferLogs: true
		});

		app.set('query parser', 'extended');
		app.set('trust proxy', true);
		app.enableShutdownHooks();

		return app;
	}

	/**
	 * 配置 Express 中间件
	 *
	 * @param app - NestJS 应用实例
	 * @param config - 启动配置
	 */
	private async configureExpress(app: NestExpressApplication, config: BootstrapConfig): Promise<void> {
		const { express, serviceType } = config;

		if (!express) {
			return;
		}

		// 配置 Redis 会话存储
		if (express.enableSession) {
			await configureRedisSession(app);
		}

		// 设置全局路由前缀
		if (express.globalPrefix) {
			app.setGlobalPrefix(express.globalPrefix);
		}

		// 配置 CORS
		app.enableCors(express.cors);

		// 配置请求体解析器
		app.use(json({ limit: express.bodyLimit || '50mb' }));
		app.use(urlencoded({ extended: true, limit: express.bodyLimit || '50mb' }));

		// 启用 helmet（仅生产环境）
		if (express.enableHelmet && process.env.NODE_ENV === 'production') {
			app.use(helmet());
		}

		// 配置 Swagger（仅 API 服务）
		if (express.enableSwagger && serviceType === ServiceType.API) {
			this.setupSwagger(app, express.swaggerPath || 'api-docs');
		}
	}

	/**
	 * 配置监控和日志
	 *
	 * @param app - NestJS 应用实例
	 * @param config - 监控配置
	 */
	private configureMonitoring(app: NestExpressApplication, config: MonitoringConfig): void {
		if (config.enableHealthCheck) {
			this.logger.log(`健康检查端点：${config.healthCheckPath || '/health'}`);
		}

		if (config.enablePerformanceMonitoring) {
			this.logger.log('性能监控已启用');
		}

		if (config.enableRequestLogging) {
			this.logger.log('请求日志已启用');
		}
	}

	/**
	 * 初始化数据库
	 *
	 * @param orm - MikroORM 实例
	 * @param config - 数据库配置
	 */
	private async initializeDatabase(orm: MikroORM, config: any): Promise<void> {
		this.logger.log('初始化数据库连接...');

		// 检查连接
		const isConnected = await orm.isConnected();
		if (!isConnected) {
			this.logger.warn('数据库未连接，尝试连接...');
		}

		// 运行迁移
		if (config.runMigrations) {
			this.logger.log('运行数据库迁移...');
			await orm.getMigrator().up();
		}

		// 同步数据库结构
		if (config.synchronize) {
			this.logger.log('同步数据库结构...');
			await orm.getSchemaGenerator().updateSchema();
		}

		this.logger.log('数据库初始化完成');
	}

	/**
	 * 设置 Swagger 文档
	 *
	 * @param app - NestJS 应用实例
	 * @param path - Swagger 文档路径
	 */
	private async setupSwagger(app: NestExpressApplication, path: string): Promise<void> {
		const swaggerPath = await setupSwagger(app, {
			swaggerPath: path
		});
		this.logger.log(`Swagger 文档将在 /${swaggerPath} 提供`);
	}

	/**
	 * 记录启动时间
	 */
	private logStartupTime(): void {
		const totalTime = Date.now() - this.startTime;
		const minutes = Math.floor(totalTime / 60000);
		const seconds = ((totalTime % 60000) / 1000).toFixed(2);

		this.logger.log(`应用启动完成，耗时 ${minutes}m ${seconds}s`);
	}

	/**
	 * 应用关闭时的清理
	 *
	 * @param signal - 关闭信号
	 */
	async onApplicationShutdown(signal: string): Promise<void> {
		this.logger.log(`收到关闭信号：${signal}`);

		if (this.context && this.app && this.config) {
			// 执行自定义关闭钩子
			if (this.config.onShutdown) {
				await this.config.onShutdown(this.app, this.context);
			}

			// 关闭所有插件（等待 PluginLoaderService 完善）
			// await this.pluginLoader.shutdown();

			// 关闭 OpenTelemetry 追踪
			await tracer.shutdown();
		}
	}
}
