import { Injectable, Logger } from '@nestjs/common';

/**
 * 请求指标接口
 */
export interface RequestMetric {
	path: string;
	method: string;
	statusCode: number;
	duration: number;
	timestamp: Date;
	correlationId?: string;
	userId?: string;
}

/**
 * 性能摘要接口
 */
export interface PerformanceSummary {
	totalRequests: number;
	averageResponseTime: number;
	maxResponseTime: number;
	minResponseTime: number;
	requestsPerMinute: number;
	errorRate: number;
}

/**
 * 请求指标服务
 *
 * 记录 HTTP 请求的性能指标，包括：
 * - 响应时间、状态码、持续时间
 * - 请求量（每分钟、错误率）
 * - 关联 ID（correlationId）、用户 ID（userId）
 *
 * 提供性能监控和查询功能
 */
@Injectable()
export class MetricsService {
	private readonly logger = new Logger('MetricsService');
	private metrics: Map<string, RequestMetric[]> = new Map();
	private readonly MAX_METRICS_PER_ROUTE = 1000;

	constructor() {}

	/**
	 * 记录请求指标
	 *
	 * @param metric - 请求指标数据
	 */
	recordMetric(metric: RequestMetric): void {
		const key = `${metric.method}:${metric.path}`;
		const routeMetrics = this.metrics.get(key) || [];

		routeMetrics.push(metric);

		if (routeMetrics.length > this.MAX_METRICS_PER_ROUTE) {
			routeMetrics.shift();
		}

		this.metrics.set(key, routeMetrics);

		this.logger.debug(
			`记录指标: ${metric.method} ${metric.path} - 状态码: ${metric.statusCode} - 耗时: ${metric.duration}ms`
		);
	}

	/**
	 * 获取指定路由的性能摘要
	 *
	 * @param method - HTTP 方法
	 * @param path - 路由路径
	 * @returns 性能摘要
	 */
	getPerformanceSummary(method: string, path: string): PerformanceSummary | null {
		const key = `${method}:${path}`;
		const routeMetrics = this.metrics.get(key);

		if (!routeMetrics || routeMetrics.length === 0) {
			return null;
		}

		const durations = routeMetrics.map((m) => m.duration);
		const errorCount = routeMetrics.filter((m) => m.statusCode >= 400).length;
		const oneMinuteAgo = new Date(Date.now() - 60000);
		const requestsPerMinute = routeMetrics.filter((m) => m.timestamp >= oneMinuteAgo).length;

		return {
			totalRequests: routeMetrics.length,
			averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
			maxResponseTime: Math.max(...durations),
			minResponseTime: Math.min(...durations),
			requestsPerMinute,
			errorRate: (errorCount / routeMetrics.length) * 100
		};
	}

	/**
	 * 获取所有路由的性能摘要
	 *
	 * @returns 所有路由的性能摘要映射
	 */
	getAllPerformanceSummaries(): Map<string, PerformanceSummary> {
		const summaries = new Map<string, PerformanceSummary>();

		for (const [key] of this.metrics.entries()) {
			const [method, path] = key.split(':');
			const summary = this.getPerformanceSummary(method, path);
			if (summary) {
				summaries.set(key, summary);
			}
		}

		return summaries;
	}

	/**
	 * 清除指定路由的指标
	 *
	 * @param method - HTTP 方法
	 * @param path - 路由路径
	 */
	clearMetrics(method: string, path: string): void {
		const key = `${method}:${path}`;
		this.metrics.delete(key);
		this.logger.debug(`清除指标: ${key}`);
	}

	/**
	 * 清除所有指标
	 */
	clearAllMetrics(): void {
		this.metrics.clear();
		this.logger.debug('清除所有指标');
	}

	/**
	 * 获取慢请求列表（响应时间超过阈值）
	 *
	 * @param threshold - 阈值（毫秒），默认 1000ms
	 * @returns 慢请求列表
	 */
	getSlowRequests(threshold: number = 1000): RequestMetric[] {
		const allMetrics: RequestMetric[] = [];
		for (const routeMetrics of this.metrics.values()) {
			allMetrics.push(...routeMetrics);
		}
		return allMetrics.filter((m) => m.duration > threshold).sort((a, b) => b.duration - a.duration);
	}

	/**
	 * 获取错误请求列表（状态码 >= 400）
	 *
	 * @returns 错误请求列表
	 */
	getErrorRequests(): RequestMetric[] {
		const allMetrics: RequestMetric[] = [];
		for (const routeMetrics of this.metrics.values()) {
			allMetrics.push(...routeMetrics);
		}
		return allMetrics
			.filter((m) => m.statusCode >= 400)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	}
}
