/**
 * 配置模块索引
 *
 * 导出所有配置模块，供 ConfigModule 加载使用
 */

import app from './app';

/**
 * 配置模块数组
 *
 * 包含所有可用的配置模块，这些模块将由 NestJS ConfigModule 加载
 */
export default [app];
