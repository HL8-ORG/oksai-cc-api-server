/**
 * @oksai/config
 *
 * 配置管理包
 *
 * 提供应用程序配置管理功能，包括：
 * - 配置加载和合并
 * - 配置服务
 * - 环境变量管理
 * - 数据库配置
 * - 多环境支持
 * - 配置接口定义
 */

export * from './lib/config.module';
export * from './lib/config.service';
export * from './lib/config-loader';
export * from './lib/default-config';
export * from './lib/environments/environment';
export * from './lib/environments/ienvironment';
export * from './lib/environments/environment.helper';
export * from './lib/interfaces/index';
