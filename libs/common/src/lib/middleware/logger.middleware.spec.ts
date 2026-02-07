import { Test, TestingModule } from '@nestjs/testing';
import { LoggerMiddleware } from './logger.middleware';
import { Request, Response, NextFunction } from 'express';

describe('LoggerMiddleware', () => {
	let middleware: LoggerMiddleware;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [LoggerMiddleware]
		}).compile();

		middleware = module.get<LoggerMiddleware>(LoggerMiddleware);
		req = {
			method: 'GET',
			url: '/test',
			ip: '127.0.0.1',
			headers: {
				'user-agent': 'test-agent'
			}
		};
		res = {
			statusCode: 200,
			send: jest.fn().mockReturnThis()
		};
		next = jest.fn();
	});

	it('应该定义', () => {
		expect(middleware).toBeDefined();
	});

	describe('use', () => {
		it('应该为请求生成关联 ID', () => {
			middleware.use(req as Request, res as Response, next);

			expect(req.correlationId).toBeDefined();
			expect(typeof req.correlationId).toBe('string');
		});

		it('应该使用请求头中的关联 ID（如果存在）', () => {
			const existingCorrelationId = 'existing-id-123';
			req.headers = {
				'user-agent': 'test-agent',
				'x-correlation-id': existingCorrelationId
			};

			middleware.use(req as Request, res as Response, next);

			expect(req.correlationId).toBe(existingCorrelationId);
		});

		it('应该设置请求开始时间', () => {
			middleware.use(req as Request, res as Response, next);

			expect(req.startTime).toBeDefined();
			expect(typeof req.startTime).toBe('number');
		});

		it('应该调用 next', () => {
			middleware.use(req as Request, res as Response, next);

			expect(next).toHaveBeenCalled();
		});

		it('应该记录请求信息', () => {
			const loggerSpy = jest.spyOn((middleware as any).logger, 'log');

			middleware.use(req as Request, res as Response, next);

			expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('GET /test'));
		});

		it('应该在响应发送时记录响应信息', () => {
			const loggerSpy = jest.spyOn((middleware as any).logger, 'log');
			middleware.use(req as Request, res as Response, next);

			(res.send as jest.Mock).call(res, 'test response');

			expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('状态码: 200'));
		});
	});

	describe('correlation ID', () => {
		it('应该为不同的请求生成不同的关联 ID', () => {
			middleware.use(req as Request, res as Response, next);
			const correlationId1 = req.correlationId;

			middleware.use(req as Request, res as Response, next);
			const correlationId2 = req.correlationId;

			expect(correlationId1).not.toBe(correlationId2);
		});
	});
});
