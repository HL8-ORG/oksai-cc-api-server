import { Module } from '@nestjs/common';
import { PrometheusAdapter } from './prometheus.adapter';
import { PrometheusController } from './prometheus.controller';

/**
 * Prometheus 监控模块
 *
 * 提供 Prometheus 指标收集和导出功能
 */
@Module({
	providers: [PrometheusAdapter],
	controllers: [PrometheusController],
	exports: [PrometheusAdapter]
})
export class PrometheusModule {}
