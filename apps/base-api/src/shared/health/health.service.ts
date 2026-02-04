import { Injectable } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

/**
 * 健康检查服务
 *
 * @description 提供应用健康状态检查功能
 */
@Injectable()
export class HealthService {
	constructor(private readonly orm: MikroORM) {}

	/**
	 * 获取基本健康状态
	 *
	 * @returns 基本健康状态信息
	 */
	getHealth() {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV || 'development'
		};
	}

	/**
	 * 获取详细健康状态
	 *
	 * @returns 详细的健康状态信息，包括数据库连接状态
	 */
	async getDetailedHealth() {
		const basicHealth = this.getHealth();
		let databaseStatus = 'unknown';

		try {
			const isConnected = await this.orm.isConnected();
			databaseStatus = isConnected ? 'connected' : 'disconnected';
		} catch (error) {
			databaseStatus = 'error';
		}

		return {
			...basicHealth,
			database: {
				status: databaseStatus,
				type: (this.orm.config as any).type || 'unknown'
			},
			memory: {
				used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
				total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
				unit: 'MB'
			}
		};
	}
}
