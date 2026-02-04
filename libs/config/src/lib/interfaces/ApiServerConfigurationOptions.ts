/**
 * API 服务器配置选项接口
 *
 * 定义 API 服务器的配置选项
 */
import { GraphqlConfigurationOptions } from './GraphqlConfigurationOptions';

/**
 * API 服务器配置选项
 */
export interface ApiServerConfigurationOptions {
	/**
	 * API 服务器主机地址
	 *
	 * 指定 API 服务器的主机地址
	 */
	host?: string;

	/**
	 * API 服务器监听端口
	 *
	 * 指定 API 服务器监听的端口号
	 */
	port: number | string;

	/**
	 * API 服务器基础 URL
	 *
	 * 定义 API 服务器的基础 URL
	 */
	baseUrl?: string;

	/**
	 * 中间件配置
	 *
	 * 定义 API 服务器的中间件配置
	 */
	middleware?: any;

	/**
	 * GraphQL 配置选项
	 *
	 * 指定 API 服务器的 GraphQL 配置选项
	 */
	graphqlConfigOptions: GraphqlConfigurationOptions;
}
