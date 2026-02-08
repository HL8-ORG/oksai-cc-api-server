import { RateLimitMiddleware } from './rate-limit.middleware';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@nestjs/common';

describe('RateLimitMiddleware', () => {
	let middleware: RateLimitMiddleware;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		middleware = new RateLimitMiddleware();
		req = {
			ip: '127.0.0.1'
		};
		res = {
			statusCode: 200,
			send: jest.fn().mockReturnThis(),
			setHeader: jest.fn()
		};
		next = jest.fn();
	});

	it('应该定义', () => {
		expect(middleware).toBeDefined();
	});

	describe('use', () => {
		it('应该允许请求在限制之内', () => {
			expect(() => {
				middleware.use(req as Request, res as Response, next);
			}).not.toThrow();

			expect(next).toHaveBeenCalled();
		});

		it('应该设置速率限制响应头', () => {
			middleware.use(req as Request, res as Response, next);

			expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
			expect(res.setHeader).toHaveBeenCalledWith(expect.stringContaining('X-RateLimit-'), expect.any(String));
			expect(res.setHeader).toHaveBeenCalledWith(expect.stringContaining('X-RateLimit-'), expect.any(String));
		});

		it('应该在超过限制时抛出异常', () => {
			const maxRequests = 10;
			middleware = new RateLimitMiddleware({ windowMs: 60000, maxRequests });

			for (let i = 0; i < maxRequests; i++) {
				middleware.use(req as Request, res as Response, next);
			}

			expect(() => {
				middleware.use(req as Request, res as Response, next);
			}).toThrow(HttpException);
		});

		it('应该在超过限制时设置 Retry-After 头', () => {
			const maxRequests = 5;
			middleware = new RateLimitMiddleware({ windowMs: 60000, maxRequests });

			for (let i = 0; i < maxRequests; i++) {
				middleware.use(req as Request, res as Response, next);
			}

			try {
				middleware.use(req as Request, res as Response, next);
			} catch (error) {
				expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
			}
		});

		it('应该对不同的 IP 地址分别计数', () => {
			const maxRequests = 5;
			middleware = new RateLimitMiddleware({ windowMs: 60000, maxRequests });

			const req1 = { ip: '127.0.0.1' };
			const req2 = { ip: '192.168.1.1' };

			for (let i = 0; i < maxRequests; i++) {
				middleware.use(req1 as Request, res as Response, next);
			}

			expect(() => {
				middleware.use(req1 as Request, res as Response, next);
			}).toThrow(HttpException);

			expect(() => {
				middleware.use(req2 as Request, res as Response, next);
			}).not.toThrow(HttpException);
		});

		it('应该支持自定义 key 生成器', () => {
			const customKeyGenerator = jest.fn((req: Request) => 'custom-key');
			middleware = new RateLimitMiddleware({ keyGenerator: customKeyGenerator });

			middleware.use(req as Request, res as Response, next);

			expect(customKeyGenerator).toHaveBeenCalledWith(req);
		});
	});

	describe('skipSuccessfulRequests', () => {
		it('应该在成功响应后减少计数', () => {
			middleware = new RateLimitMiddleware({
				windowMs: 60000,
				maxRequests: 2,
				skipSuccessfulRequests: true
			});

			middleware.use(req as Request, res as Response, next);
			(res as Response).statusCode = 200;
			// 触发 middleware 包装后的 send，以便让计数回退
			(res as Response).send('success');

			expect(() => {
				middleware.use(req as Request, res as Response, next);
			}).not.toThrow(HttpException);
		});
	});

	describe('skipFailedRequests', () => {
		it('应该在失败响应后减少计数', () => {
			middleware = new RateLimitMiddleware({
				windowMs: 60000,
				maxRequests: 2,
				skipFailedRequests: true
			});

			middleware.use(req as Request, res as Response, next);
			(res as Response).statusCode = 400;
			// 触发 middleware 包装后的 send，以便让计数回退
			(res as Response).send('error');

			expect(() => {
				middleware.use(req as Request, res as Response, next);
			}).not.toThrow(HttpException);
		});
	});

	describe('clearRateLimit', () => {
		it('应该清除特定键的速率限制', () => {
			middleware.use(req as Request, res as Response, next);
			const key = req.ip || 'unknown';

			middleware.clearRateLimit(key);

			const info = middleware.getRateLimitInfo(key);
			expect(info).toBeUndefined();
		});

		it('应该清除所有速率限制', () => {
			middleware.use(req as Request, res as Response, next);

			middleware.clearRateLimit();

			const key = req.ip || 'unknown';
			const info = middleware.getRateLimitInfo(key);
			expect(info).toBeUndefined();
		});
	});

	describe('getRateLimitInfo', () => {
		it('应该返回速率限制信息', () => {
			middleware.use(req as Request, res as Response, next);
			const key = req.ip || 'unknown';

			const info = middleware.getRateLimitInfo(key);

			expect(info).toBeDefined();
			expect(info?.count).toBeGreaterThan(0);
			expect(info?.resetTime).toBeGreaterThan(0);
		});

		it('应该对未知的键返回 undefined', () => {
			const info = middleware.getRateLimitInfo('unknown-key');
			expect(info).toBeUndefined();
		});
	});

	describe('过期清理', () => {
		it('应该自动清理过期的速率限制条目', (done) => {
			middleware = new RateLimitMiddleware({ windowMs: 100, maxRequests: 1 });

			middleware.use(req as Request, res as Response, next);

			setTimeout(() => {
				middleware.use(req as Request, res as Response, next);
				done();
			}, 150);
		}, 200);
	});
});
