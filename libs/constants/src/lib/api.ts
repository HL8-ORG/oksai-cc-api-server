/**
 * API 相关默认常量
 *
 * 提供应用程序 API 配置的默认值，包括端口、主机地址、基础 URL 和 GraphQL 路径
 */

/**
 * 默认 API 端口
 */
export const DEFAULT_API_PORT = 3000;

/**
 * 默认 API 主机地址
 */
export const DEFAULT_API_HOST = '127.0.0.1';

/**
 * 默认 API 基础 URL
 * 由主机地址和端口组成
 */
export const DEFAULT_API_BASE_URL = `http://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}`;

/**
 * 默认 GraphQL API 路径
 */
export const DEFAULT_GRAPHQL_API_PATH = 'graphql';
