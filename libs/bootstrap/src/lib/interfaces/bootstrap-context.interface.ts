import { NestExpressApplication } from '@nestjs/platform-express';
import { MikroORM } from '@mikro-orm/core';
import { IPlugin } from '@oksai/plugin';

/**
 * 启动上下文接口
 *
 * 包含启动过程中收集的所有上下文信息
 */
export interface BootstrapContext {
	/**
	 * NestJS 应用实例
	 */
	readonly app: NestExpressApplication;

	/**
	 * MikroORM 实例
	 */
	readonly orm: MikroORM;

	/**
	 * 服务类型
	 */
	readonly serviceType: string;

	/**
	 * 服务名称
	 */
	readonly serviceName: string;

	/**
	 * 已注册的插件列表
	 */
	readonly plugins: IPlugin[];

	/**
	 * 已加载的插件列表
	 */
	readonly loadedPlugins: IPlugin[];

	/**
	 * 启动时间戳
	 */
	readonly startTime: number;

	/**
	 * 环境变量
	 */
	readonly env: {
		readonly NODE_ENV: string;
		readonly PORT?: number;
		readonly HOST?: string;
	};
}
