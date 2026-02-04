/**
 * GraphQL 配置选项接口
 *
 * 定义 GraphQL API 的配置选项
 */
import { ApolloServerPlugin } from '@apollo/server';

/**
 * GraphQL 配置选项
 */
export interface GraphqlConfigurationOptions {
	/**
	 * GraphQL API 访问路径
	 *
	 * 指定访问 GraphQL 的端点路径
	 */
	path: string;

	/**
	 * 是否启用 GraphQL Playground
	 *
	 * 指示是否启用 GraphQL Playground 交互式调试界面
	 */
	playground: boolean;

	/**
	 * 是否启用调试模式
	 *
	 * 指定是否启用调试功能
	 */
	debug: boolean;

	/**
	 * Apollo Server 插件数组
	 *
	 * 定义 Apollo Server 的插件列表
	 */
	apolloServerPlugins?: ApolloServerPlugin[];
}
