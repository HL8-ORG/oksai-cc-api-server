import { Controller, Get } from '@nestjs/common';
import { PrometheusAdapter } from './prometheus.adapter';

/**
 * Prometheus 监控控制器
 *
 * 提供 Prometheus 指标导出端点
 */
@Controller('metrics')
export class PrometheusController {
	constructor(private readonly prometheusAdapter: PrometheusAdapter) {}

	/**
	 * 导出 Prometheus 指标
	 *
	 * @returns Prometheus 指标数据（Prometheus 格式）
	 */
	@Get()
	async getMetrics(): Promise<string> {
		return await this.prometheusAdapter.getMetrics();
	}
}
