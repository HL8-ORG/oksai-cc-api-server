import { Injectable, Logger } from '@nestjs/common';

interface RequestTrace {
	correlationId: string;
	userId?: string;
	path: string;
	method: string;
	startTime: Date;
	endTime?: Date;
	duration?: number;
	statusCode?: number;
	error?: Error;
	metadata?: Record<string, any>;
}

@Injectable()
export class RequestTracingService {
	private readonly logger = new Logger('RequestTracingService');
	private traces: Map<string, RequestTrace> = new Map();
	private readonly MAX_TRACES = 5000;

	/**
	 * 开始追踪请求
	 *
	 * @param correlationId - 关联 ID
	 * @param path - 请求路径
	 * @param method - HTTP 方法
	 * @param userId - 用户 ID（可选）
	 * @param metadata - 额外元数据（可选）
	 */
	startTrace(
		correlationId: string,
		path: string,
		method: string,
		userId?: string,
		metadata?: Record<string, any>
	): void {
		const trace: RequestTrace = {
			correlationId,
			userId,
			path,
			method,
			startTime: new Date(),
			metadata
		};

		this.traces.set(correlationId, trace);

		this.logger.debug(`开始追踪: ${method} ${path} - 关联 ID: ${correlationId}`);
	}

	/**
	 * 结束追踪请求
	 *
	 * @param correlationId - 关联 ID
	 * @param statusCode - HTTP 状态码
	 * @param error - 错误对象（如果发生错误）
	 */
	endTrace(correlationId: string, statusCode: number, error?: Error): void {
		const trace = this.traces.get(correlationId);

		if (!trace) {
			this.logger.warn(`未找到追踪记录: ${correlationId}`);
			return;
		}

		trace.endTime = new Date();
		trace.duration = trace.endTime.getTime() - trace.startTime.getTime();
		trace.statusCode = statusCode;
		trace.error = error;

		this.logger.debug(
			`结束追踪: ${trace.method} ${trace.path} - 状态码: ${statusCode} - 耗时: ${trace.duration}ms`
		);

		if (error) {
			this.logger.error(`追踪错误: ${error.message} - 关联 ID: ${correlationId}`);
		}
	}

	/**
	 * 根据关联 ID 获取追踪记录
	 *
	 * @param correlationId - 关联 ID
	 * @returns 追踪记录（如果存在）
	 */
	getTrace(correlationId: string): RequestTrace | undefined {
		return this.traces.get(correlationId);
	}

	/**
	 * 根据用户 ID 获取追踪记录列表
	 *
	 * @param userId - 用户 ID
	 * @returns 用户的追踪记录列表
	 */
	getTracesByUser(userId: string): RequestTrace[] {
		const allTraces = Array.from(this.traces.values());
		return allTraces.filter((t) => t.userId === userId);
	}

	/**
	 * 根据路径获取追踪记录列表
	 *
	 * @param path - 请求路径
	 * @returns 路径的追踪记录列表
	 */
	getTracesByPath(path: string): RequestTrace[] {
		const allTraces = Array.from(this.traces.values());
		return allTraces.filter((t) => t.path === path);
	}

	/**
	 * 获取所有追踪记录
	 *
	 * @returns 所有追踪记录列表
	 */
	getAllTraces(): RequestTrace[] {
		return Array.from(this.traces.values());
	}

	/**
	 * 获取慢请求追踪列表（响应时间超过阈值）
	 *
	 * @param threshold - 阈值（毫秒），默认 3000ms
	 * @returns 慢请求追踪列表
	 */
	getSlowTraces(threshold: number = 3000): RequestTrace[] {
		const allTraces = Array.from(this.traces.values());
		return allTraces
			.filter((t) => t.duration && t.duration > threshold)
			.sort((a, b) => (b.duration || 0) - (a.duration || 0));
	}

	/**
	 * 获取失败的请求追踪列表
	 *
	 * @returns 失败的请求追踪列表
	 */
	getFailedTraces(): RequestTrace[] {
		const allTraces = Array.from(this.traces.values());
		return allTraces.filter((t) => t.statusCode && t.statusCode >= 400);
	}

	/**
	 * 根据关联 ID 删除追踪记录
	 *
	 * @param correlationId - 关联 ID
	 */
	deleteTrace(correlationId: string): boolean {
		return this.traces.delete(correlationId);
	}

	/**
	 * 清除所有追踪记录
	 */
	clearTraces(): void {
		this.traces.clear();
		this.logger.debug('清除所有追踪记录');
	}

	/**
	 * 清理过期的追踪记录
	 *
	 * @param maxAge - 最大保留时间（毫秒），默认 1 小时
	 */
	cleanupOldTraces(maxAge: number = 3600000): void {
		const now = Date.now();
		const deleted: string[] = [];

		for (const [correlationId, trace] of this.traces.entries()) {
			if (now - trace.startTime.getTime() > maxAge) {
				this.traces.delete(correlationId);
				deleted.push(correlationId);
			}
		}

		if (deleted.length > 0) {
			this.logger.debug(`清理了 ${deleted.length} 条过期的追踪记录`);
		}
	}

	/**
	 * 清理追踪记录以保持内存使用在限制内
	 */
	private cleanupIfNecessary(): void {
		if (this.traces.size > this.MAX_TRACES) {
			const allTraces = Array.from(this.traces.entries());
			const toDelete = allTraces.slice(0, allTraces.length - this.MAX_TRACES);

			for (const [correlationId] of toDelete) {
				this.traces.delete(correlationId);
			}

			this.logger.debug(`清理了 ${toDelete.length} 条追踪记录以保持内存限制`);
		}
	}
}
