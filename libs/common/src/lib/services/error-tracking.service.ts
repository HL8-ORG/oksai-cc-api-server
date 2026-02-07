import { Injectable, Logger } from '@nestjs/common';

interface ErrorTrackingData {
	error: Error;
	timestamp: Date;
	stack?: string;
	correlationId?: string;
	userId?: string;
	request?: {
		method: string;
		path: string;
		query?: any;
		body?: any;
	};
}

interface ErrorStatistics {
	totalErrors: number;
	errorsByType: Map<string, number>;
	errorsByPath: Map<string, number>;
	recentErrors: ErrorTrackingData[];
}

@Injectable()
export class ErrorTrackingService {
	private readonly logger = new Logger('ErrorTrackingService');
	private errors: ErrorTrackingData[] = [];
	private readonly MAX_ERRORS = 1000;

	/**
	 * 记录错误
	 *
	 * @param error - 错误对象
	 * @param context - 错误上下文信息
	 */
	trackError(error: Error, context?: Partial<ErrorTrackingData>): void {
		const errorData: ErrorTrackingData = {
			error,
			timestamp: new Date(),
			stack: error.stack,
			...context
		};

		this.errors.unshift(errorData);

		if (this.errors.length > this.MAX_ERRORS) {
			this.errors.pop();
		}

		this.logger.error(`跟踪错误: ${error.message} - 关联 ID: ${errorData.correlationId || 'N/A'}`);

		if (context?.request) {
			this.logger.error(`请求信息: ${context.request.method} ${context.request.path}`);
		}
	}

	/**
	 * 获取错误统计信息
	 *
	 * @returns 错误统计
	 */
	getErrorStatistics(): ErrorStatistics {
		const errorsByType = new Map<string, number>();
		const errorsByPath = new Map<string, number>();

		for (const error of this.errors) {
			const errorType = error.error.constructor.name;
			errorsByType.set(errorType, (errorsByType.get(errorType) || 0) + 1);

			if (error.request) {
				const path = error.request.path;
				errorsByPath.set(path, (errorsByPath.get(path) || 0) + 1);
			}
		}

		return {
			totalErrors: this.errors.length,
			errorsByType,
			errorsByPath,
			recentErrors: this.errors.slice(0, 50)
		};
	}

	/**
	 * 根据错误类型获取错误列表
	 *
	 * @param errorType - 错误类型名称
	 * @returns 匹配的错误列表
	 */
	getErrorsByType(errorType: string): ErrorTrackingData[] {
		return this.errors.filter((e) => e.error.constructor.name === errorType);
	}

	/**
	 * 根据路径获取错误列表
	 *
	 * @param path - 请求路径
	 * @returns 匹配的错误列表
	 */
	getErrorsByPath(path: string): ErrorTrackingData[] {
		return this.errors.filter((e) => e.request?.path === path);
	}

	/**
	 * 根据关联 ID 获取错误列表
	 *
	 * @param correlationId - 关联 ID
	 * @returns 匹配的错误列表
	 */
	getErrorsByCorrelationId(correlationId: string): ErrorTrackingData[] {
		return this.errors.filter((e) => e.correlationId === correlationId);
	}

	/**
	 * 清除所有错误记录
	 */
	clearErrors(): void {
		this.errors = [];
		this.logger.debug('清除所有错误记录');
	}

	/**
	 * 获取最近的错误列表
	 *
	 * @param limit - 返回数量限制，默认 50
	 * @returns 最近的错误列表
	 */
	getRecentErrors(limit: number = 50): ErrorTrackingData[] {
		return this.errors.slice(0, limit);
	}
}
