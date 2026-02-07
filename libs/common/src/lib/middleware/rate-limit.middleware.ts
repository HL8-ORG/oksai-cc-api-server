import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
	windowMs: number;
	maxRequests: number;
	keyGenerator?: (req: Request) => string;
	skipSuccessfulRequests?: boolean;
	skipFailedRequests?: boolean;
}

interface RateLimitInfo {
	count: number;
	resetTime: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
	private readonly rateLimitStore = new Map<string, RateLimitInfo>();
	private readonly windowMs: number;
	private readonly maxRequests: number;
	private readonly keyGenerator: (req: Request) => string;
	private readonly skipSuccessfulRequests: boolean;
	private readonly skipFailedRequests: boolean;

	constructor(options?: Partial<RateLimitOptions>) {
		this.windowMs = options?.windowMs || 60000;
		this.maxRequests = options?.maxRequests || 100;
		this.keyGenerator = options?.keyGenerator || this.defaultKeyGenerator;
		this.skipSuccessfulRequests = options?.skipSuccessfulRequests || false;
		this.skipFailedRequests = options?.skipFailedRequests || false;

		setInterval(() => {
			this.cleanupExpiredEntries();
		}, this.windowMs);
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
}
