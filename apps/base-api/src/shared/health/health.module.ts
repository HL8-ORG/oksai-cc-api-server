import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * 健康检查模块
 *
 * @description 提供应用健康状态检查功能
 */
@Module({
	controllers: [HealthController],
	providers: [HealthService],
	exports: [HealthService]
})
export class HealthModule {}
