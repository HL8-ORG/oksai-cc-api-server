/**
 * 配置服务
 *
 * 提供配置的访问和管理功能，支持配置值的读取和环境变量的动态设置
 */

import { DynamicModule, Injectable, Type, Logger } from '@nestjs/common';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import {
	ApplicationPluginConfig,
	ApiServerConfigurationOptions,
	AssetConfigurationOptions,
	GraphqlConfigurationOptions
} from './interfaces/index';
import { getConfig } from './config-loader';
import { environment } from './environments/environment';
import { IEnvironment } from './environments/ienvironment';

@Injectable()
export class ConfigService {
	/** 当前环境配置对象 */
	private readonly environment = environment;
	/** 日志记录器 */
	private readonly logger = new Logger(ConfigService.name);
	/** 应用配置对象 */
	private config: Partial<ApplicationPluginConfig>;

	constructor() {
		void this.initConfig();
	}

	/**
	 * 初始化配置和环境变量
	 *
	 * 使用异步方法，因为构造函数不能是异步的
	 */
	private async initConfig(): Promise<void> {
		this.config = getConfig();

		// 动态分配环境变量到 process.env
		Object.entries(this.environment.env).forEach(([key, value]) => {
			process.env[key] = value as string;
		});

		this.logger.log(`是否为生产环境：${this.environment.production}`);
	}

	/**
	 * 获取整个配置对象
	 *
	 * 返回当前配置对象的只读副本
	 *
	 * @returns 整个配置对象的只读副本
	 */
	public getConfig(): Readonly<Partial<ApplicationPluginConfig>> {
		return Object.freeze({ ...this.config });
	}

	/**
	 * 获取特定配置值
	 *
	 * 从应用配置中获取特定键的值
	 *
	 * @param key - 要获取的配置键
	 * @returns 请求的配置值（只读）
	 * @throws {Error} 如果配置键不存在
	 */
	public getConfigValue<K extends keyof ApplicationPluginConfig>(key: K): Readonly<ApplicationPluginConfig[K]> {
		if (!(key in this.config)) {
			throw new Error(`配置键 "${String(key)}" 不存在。`);
		}
		return this.config[key] as Readonly<ApplicationPluginConfig[K]>;
	}

	/**
	 * 获取 API 服务器配置选项
	 */
	get apiConfigOptions(): Readonly<ApiServerConfigurationOptions> {
		return this.config.apiConfigOptions;
	}

	/**
	 * 获取 GraphQL 配置选项
	 */
	get graphqlConfigOptions(): Readonly<GraphqlConfigurationOptions> {
		return this.config.apiConfigOptions?.graphqlConfigOptions;
	}

	/**
	 * 获取 MikroORM 数据库连接选项
	 */
	get dbConnectionOptions(): Readonly<MikroOrmModuleOptions> {
		return this.config.dbConnectionOptions ?? {};
	}

	/**
	 * 获取插件配置
	 */
	get plugins(): Array<Type<any> | DynamicModule> {
		return this.config.plugins ?? [];
	}

	/**
	 * 获取资源配置选项
	 */
	get assetOptions(): Readonly<AssetConfigurationOptions> {
		return this.config.assetOptions;
	}

	/**
	 * 获取环境变量值
	 *
	 * 返回环境变量值，支持类型推断
	 *
	 * @param key - 环境变量键
	 * @returns 对应的环境值
	 * @throws {Error} 如果环境变量键不存在
	 */
	get<K extends keyof IEnvironment>(key: K): IEnvironment[K] {
		if (!(key in this.environment)) {
			throw new Error(`环境变量 "${String(key)}" 未定义。`);
		}
		return this.environment[key];
	}

	/**
	 * 检查是否为生产环境
	 *
	 * @returns 如果为生产环境返回 true，否则返回 false
	 */
	isProd(): boolean {
		return this.environment.production;
	}
}
