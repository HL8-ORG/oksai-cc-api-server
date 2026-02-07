import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics, register } from 'prom-client';

/**
 * Prometheus 监控适配器
 *
 * 提供 HTTP 指标收集和导出功能
 */
@Injectable()
export class PrometheusAdapter implements OnModuleDestroy {
	private readonly registry: Registry;
	private readonly httpRequestDuration: Histogram<string>;
	private readonly httpRequestCounter: Counter<string>;
	private readonly httpErrorCounter: Counter<string>;
	private readonly activeConnections: Gauge<string>;

	constructor() {
		this.registry = new Registry();

		// 注册默认指标
		collectDefaultMetrics({ register: this.registry });

		// 请求持续时间直方图
		this.httpRequestDuration = new Histogram({
			name: 'http_request_duration_seconds',
			help: 'HTTP 请求持续时间（秒）',
			labelNames: ['method', 'route', 'status_code'],
			buckets: [0.1, 0.5, 1, 2, 5, 10],
			registers: [this.registry]
		}) as Histogram<string>;

		// 请求总数计数器
		this.httpRequestCounter = new Counter({
			name: 'http_requests_total',
			help: 'HTTP 请求总数',
			labelNames: ['method', 'route', 'status_code'],
			registers: [this.registry]
		}) as Counter<string>;

		// 错误计数器
		this.httpErrorCounter = new Counter({
			name: 'http_request_errors_total',
			help: 'HTTP 请求错误总数',
			labelNames: ['method', 'route', 'error_type'],
			registers: [this.registry]
		}) as Counter<string>;

		// 活跃连接数
		this.activeConnections = new Gauge({
			name: 'active_connections',
			help: '当前活跃连接数',
			registers: [this.registry]
		}) as Gauge<string>;
	}

	/**
	 * 记录 HTTP 请求持续时间
	 *
	 * @param method - HTTP 方法
	 * @param route - 请求路由
	 * @param statusCode - 响应状态码
	 * @param duration - 持续时间（秒）
	 */
	recordRequestDuration(method: string, route: string, statusCode: number, duration: number): void {
		this.httpRequestDuration.observe(
			{
				method,
				route,
				status_code: statusCode.toString()
			},
			duration
		);
	}

	/**
	 * 增加 HTTP 请求计数
	 *
	 * @param method - HTTP 方法
	 * @param route - 请求路由
	 * @param statusCode - 响应状态码
	 */
	incrementRequestCount(method: string, route: string, statusCode: number): void {
		this.httpRequestCounter.inc({
			method,
			route,
			status_code: statusCode.toString()
		});
	}

	/**
	 * 增加 HTTP 错误计数
	 *
	 * @param method - HTTP 方法
	 * @param route - 请求路由
	 * @param errorType - 错误类型
	 */
	incrementErrorCount(method: string, route: string, errorType: string): void {
		this.httpErrorCounter.inc({
			method,
			route,
			error_type: errorType
		});
	}

	/**
	 * 设置活跃连接数
	 *
	 * @param count - 连接数
	 */
	setActiveConnections(count: number): void {
		this.activeConnections.set(count);
	}

	/**
	 * 获取 Prometheus 指标
	 *
	 * @returns Prometheus 指标数据
	 */
	async getMetrics(): Promise<string> {
		return await this.registry.metrics();
	}

	/**
	 * 模块销毁时清理
	 */
	async onModuleDestroy(): Promise<void> {
		await this.registry.clear();
	}
}
