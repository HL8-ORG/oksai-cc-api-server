import { Controller, Get, Param } from '@nestjs/common';
import { Logger, Injectable } from '@nestjs/common';

interface IMetricsService {
	getPerformanceSummary(method: string, path: string): PerformanceSummary | null;
	getAllPerformanceSummaries(): Map<string, PerformanceSummary>;
	getSlowRequests(threshold?: number): RequestMetric[];
	getErrorRequests(): RequestMetric[];
}

interface RequestMetric {
	path: string;
	method: string;
	statusCode: number;
	duration: number;
	timestamp: Date;
	correlationId?: string;
	userId?: string;
}

interface PerformanceSummary {
	totalRequests: number;
	averageResponseTime: number;
	maxResponseTime: number;
	minResponseTime: number;
	requestsPerMinute: number;
	errorRate: number;
}

interface PrometheusHealthResponse {
	status: 'up' | 'unknown' | 'not_found';
	service: string;
	timestamp?: string;
	data?: {
		health?: string;
		status?: string;
		total?: number;
		count?: number;
		requests?: RequestMetric[];
		threshold?: number;
	};
}

interface PrometheusRouteSummaryResponse {
	health: 'ok' | 'unknown' | 'not_found';
	status: 'found' | 'not_found';
	data?: PerformanceSummary;
}

interface PrometheusSlowRequestsResponse {
	health: 'ok' | 'unknown' | 'not_found';
	status: 'found' | 'not_found';
	data?: {
		threshold: number;
		count: number;
		requests: RequestMetric[];
	};
}

interface PrometheusErrorRequestsResponse {
	health: 'ok' | 'unknown' | 'not_found';
	status: 'found' | 'not_found';
	data?: {
		count: number;
		requests: RequestMetric[];
	};
}

/**
 * Prometheus 指标控制器
 *
 * 提供 Prometheus 格式的性能指标端点
 * 支持指标查询和监控
 */
@Controller('metrics')
export class PrometheusController {
	private readonly logger = new Logger(PrometheusController.name);

	constructor(private readonly metricsService: IMetricsService) {}

	/**
	 * 健康检查端点
	 *
	 * @returns 健康状态
	 */
	@Get('health')
	health(): PrometheusHealthResponse {
		this.logger.debug('Prometheus 指标服务运行正常');

		return {
			status: 'up',
			service: 'prometheus',
			timestamp: new Date().toISOString()
		};
	}

	/**
	 * 获取所有路由的性能摘要
	 *
	 * @returns 所有路由的性能摘要映射
	 */
	@Get()
	getAllSummaries(): Map<string, PerformanceSummary> {
		return this.metricsService.getAllPerformanceSummaries();
	}

	/**
	 * 获取指定路由的性能摘要
	 *
	 * @param method - HTTP 方法
	 * @param path - 路由路径
	 * @returns 性能摘要
	 */
	@Get(':method/:path')
	getRouteSummary(@Param('method') method: string, @Param('path') path: string): PrometheusRouteSummaryResponse {
		const summary = this.metricsService.getPerformanceSummary(method, path);

		if (!summary) {
			this.logger.warn(`未找到路由 ${method}:${path} 的性能数据`);
			return { health: 'unknown', status: 'not_found' };
		}

		this.logger.debug(`获取路由 ${method}:${path} 性能数据：${JSON.stringify(summary)}`);

		return {
			health: 'ok',
			status: 'found',
			data: summary
		};
	}

	/**
	 * 获取慢请求列表
	 *
	 * @param threshold - 响应时间阈值（毫秒），默认 1000ms
	 * @returns 慢请求列表
	 */
	@Get('slow-requests')
	getSlowRequests(@Param('threshold') threshold: string = '1000'): PrometheusSlowRequestsResponse {
		const slowRequests = this.metricsService.getSlowRequests(Number(threshold));

		this.logger.debug(`查询到 ${threshold}ms 以上的慢请求：${slowRequests.length} 条`);

		return {
			health: 'ok',
			status: 'found',
			data: {
				threshold: Number(threshold),
				count: slowRequests.length,
				requests: slowRequests
			}
		};
	}

	/**
	 * 获取错误请求列表
	 *
	 * @returns 错误请求列表（状态码 >= 400）
	 */
	@Get('error-requests')
	getErrorRequests(): PrometheusErrorRequestsResponse {
		const errorRequests = this.metricsService.getErrorRequests();

		this.logger.debug(`查询错误请求：${errorRequests.length} 条`);

		return {
			health: 'ok',
			status: 'found',
			data: {
				count: errorRequests.length,
				requests: errorRequests
			}
		};
	}
}
