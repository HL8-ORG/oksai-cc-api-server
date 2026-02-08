import { Injectable, NestMiddleware, HttpException, HttpStatus, Optional, Inject, OnModuleDestroy } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 限流配置选项
 */
export interface RateLimitOptions {
	/** 时间窗口（毫秒），默认 60000（1分钟） */
	windowMs: number;
	/** 时间窗口内最大请求数，默认 100 */
	maxRequests: number;
	/** 自定义请求键生成器 */
	keyGenerator?: (req: Request) => string;
	/** 是否跳过成功请求的计数 */
	skipSuccessfulRequests?: boolean;
	/** 是否跳过失败请求的计数 */
	skipFailedRequests?: boolean;
}

/** 限流配置注入令牌 */
export const RATE_LIMIT_OPTIONS = 'RATE_LIMIT_OPTIONS';

interface RateLimitInfo {
	count: number;
	resetTime: number;
}

/**
 * 请求限流中间件
 *
 * 基于内存的滑动窗口限流实现，支持自定义时间窗口、最大请求数和键生成策略
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware, OnModuleDestroy {
	private readonly rateLimitStore = new Map<string, RateLimitInfo>();
	private readonly windowMs: number;
	private readonly maxRequests: number;
	private readonly keyGenerator: (req: Request) => string;
	private readonly skipSuccessfulRequests: boolean;
	private readonly skipFailedRequests: boolean;
	private readonly cleanupTimer: NodeJS.Timeout;

	constructor(@Optional() @Inject(RATE_LIMIT_OPTIONS) options?: Partial<RateLimitOptions>) {
		this.windowMs = options?.windowMs || 60000;
		this.maxRequests = options?.maxRequests || 100;
		this.keyGenerator = options?.keyGenerator || this.defaultKeyGenerator;
		this.skipSuccessfulRequests = options?.skipSuccessfulRequests || false;
		this.skipFailedRequests = options?.skipFailedRequests || false;

		this.cleanupTimer = setInterval(() => {
			this.cleanupExpiredEntries();
		}, this.windowMs);
		// 避免在测试环境中因未清理的 interval 导致 Jest 无法退出
		this.cleanupTimer.unref?.();
	}

	/**
	 * 中间件处理方法
	 *
	 * 检查请求是否超过速率限制，如果超过则返回 429 状态码
	 *
	 * @param req - Express 请求对象
	 * @param res - Express 响应对象
	 * @param next - 下一个中间件函数
	 * @throws TooManyRequestsException 当请求超过速率限制时
	 *
	 * @example
	 * ```typescript
	 * // 在 AppModule 中应用
	 * export class AppModule {
	 *   configure(consumer: MiddlewareBuilder) {
	 *     consumer
	 *       .apply(RateLimitMiddleware)
	 *       .forRoutes({ path: '*', method: RequestMethod.ALL });
	 *   }
	 * }
	 * ```
	 */
	use(req: Request, res: Response, next: NextFunction): void {
		const key = this.keyGenerator(req);
		const now = Date.now();

		let info = this.rateLimitStore.get(key);

		if (!info || now >= info.resetTime) {
			info = {
				count: 1,
				resetTime: now + this.windowMs
			};
			this.rateLimitStore.set(key, info);
		} else {
			info.count++;
			this.rateLimitStore.set(key, info);
		}

		const resetTime = Math.ceil(info.resetTime / 1000);
		const remaining = Math.max(0, this.maxRequests - info.count);

		res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
		res.setHeader('X-RateLimit-Remaining', remaining.toString());
		res.setHeader('X-RateLimit-Reset', resetTime.toString());

		if (info.count > this.maxRequests) {
			const retryAfter = Math.ceil((info.resetTime - now) / 1000);
			res.setHeader('Retry-After', retryAfter.toString());

			throw new HttpException(`请求过于频繁，请在 ${retryAfter} 秒后重试`, HttpStatus.TOO_MANY_REQUESTS);
		}

		if (this.skipSuccessfulRequests) {
			const originalSend = res.send;
			res.send = function (body: any) {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					info.count--;
				}
				return originalSend.call(this, body);
			}.bind(this);
		}

		if (this.skipFailedRequests) {
			const originalSend = res.send;
			res.send = function (body: any) {
				if (res.statusCode >= 400) {
					info.count--;
				}
				return originalSend.call(this, body);
			}.bind(this);
		}

		next();
	}

	private defaultKeyGenerator(req: Request): string {
		return req.ip || 'unknown';
	}

	private cleanupExpiredEntries(): void {
		const now = Date.now();
		for (const [key, info] of this.rateLimitStore.entries()) {
			if (now >= info.resetTime) {
				this.rateLimitStore.delete(key);
			}
		}
	}

	public clearRateLimit(key?: string): void {
		if (key) {
			this.rateLimitStore.delete(key);
		} else {
			this.rateLimitStore.clear();
		}
	}

	public getRateLimitInfo(key: string): RateLimitInfo | undefined {
		return this.rateLimitStore.get(key);
	}

	/**
	 * 模块销毁钩子
	 *
	 * 清理内部定时器，避免资源泄露。
	 */
	onModuleDestroy(): void {
		clearInterval(this.cleanupTimer);
	}
}
