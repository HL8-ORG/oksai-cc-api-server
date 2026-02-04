import { DynamicModule, Type } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { KnexModuleOptions } from 'nest-knexjs';
import { ApolloServerPlugin } from '@apollo/server';
import { ApiServerConfigurationOptions } from './ApiServerConfigurationOptions';
import { AssetConfigurationOptions } from './AssetConfigurationOptions';
import { AuthConfigurationOptions } from './AuthConfigurationOptions';
import { GraphqlConfigurationOptions } from './GraphqlConfigurationOptions';

/**
 * 应用程序插件配置接口
 *
 * 定义应用程序的核心配置选项，包括 API、数据库、认证等配置
 */

/**
 * 数据库连接选项类型
 *
 * 支持 TypeORM 和 MikroORM 的连接选项
 */
export type IDBConnectionOptions = TypeOrmModuleOptions | MikroOrmModuleOptions;

/**
 * 应用程序插件配置接口
 */
export interface ApplicationPluginConfig {
	/**
	 * API 服务器配置选项
	 *
	 * 定义 API 服务器的配置
	 */
	apiConfigOptions: ApiServerConfigurationOptions;

	/**
	 * TypeORM 数据库连接选项
	 *
	 * 指定使用 TypeORM 连接数据库的选项
	 */
	dbConnectionOptions: TypeOrmModuleOptions;

	/**
	 * MikroORM 数据库连接选项
	 *
	 * 指定使用 MikroORM 连接数据库的选项
	 */
	dbMikroOrmConnectionOptions: MikroOrmModuleOptions;

	/**
	 * Knex 数据库连接选项
	 *
	 * 指定使用 Knex 连接数据库的选项
	 */
	dbKnexConnectionOptions: KnexModuleOptions;

	/**
	 * 插件数组
	 *
	 * 定义要动态添加到应用程序的模块或类列表
	 */
	plugins?: Array<DynamicModule | Type<any>>;

	/**
	 * 日志记录器配置
	 *
	 * 定义应用程序日志记录器的配置
	 */
	logger?: any;

	/**
	 * 自定义字段配置
	 *
	 * 定义应用程序中不同实体的自定义字段
	 */
	customFields?: any;

	/**
	 * 认证配置选项
	 *
	 * 定义应用程序认证的配置选项
	 */
	authOptions?: AuthConfigurationOptions;

	/**
	 * 资源配置选项
	 *
	 * 定义应用程序资源处理的配置选项
	 */
	assetOptions?: AssetConfigurationOptions;
}

/**
 * 应用程序插件配置函数类型
 *
 * 表示配置应用程序插件的函数，接受 ApplicationPluginConfig 作为输入并返回修改后的配置
 */
export type ApplicationPluginConfigurationFn = (config: ApplicationPluginConfig) => ApplicationPluginConfig;
