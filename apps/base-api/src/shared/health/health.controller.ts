import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * 健康检查控制器
 *
 * @description 提供应用健康状态检查端点
 */
@Controller('health')
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	/**
	 * 健康检查端点
	 *
	 * @returns 应用健康状态信息
	 */
	@Get()
	getHealth() {
		return this.healthService.getHealth();
	}

	/**
	 * 详细健康检查端点
	 *
	 * @returns 详细的应用健康状态信息，包括数据库连接状态
	 */
	@Get('detailed')
	async getDetailedHealth() {
		return this.healthService.getDetailedHealth();
	}
}
