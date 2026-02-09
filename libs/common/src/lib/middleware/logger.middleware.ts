import { Injectable, NestMiddleware, Logger, RequestMethod } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 请求日志中间件
 *
 * 为每个请求生成唯一的关联 ID，记录请求和响应信息，包括响应时间
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private readonly logger = new Logger('HTTP');

	/**
	 * 中间件处理方法
	 *
	 * 为请求生成关联 ID，记录请求信息，并在响应完成后记录响应时间和状态
	 *
	 * @param req - Express 请求对象
	 * @param res - Express 响应对象
	 * @param next - 下一个中间件函数
	 *
	 * @example
	 * ```typescript
	 * // 在 AppModule 中应用
	 * export class AppModule {
	 *   configure(consumer: MiddlewareBuilder) {
	 *     consumer.apply(LoggerMiddleware).forRoutes('*');
	 *   }
	 * }
	 * ```
	 */
	use(req: Request, res: Response, next: NextFunction): void {
		const startTime = Date.now();
		const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();

		req.correlationId = correlationId;
		req.startTime = startTime;

		const { method, url, ip, headers } = req;
		const userAgent = headers['user-agent'] || 'Unknown';

		this.logger.log(`[${correlationId}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);

		// 通过闭包捕获 logger 引用，避免 .bind(this) 破坏 res 的上下文
		const logger = this.logger;
		const originalSend = res.send;
		res.send = function (this: Response, body: any) {
			const responseTime = Date.now() - startTime;
			const statusCode = res.statusCode;

			logger.log(
				`[${correlationId}] ${method} ${url} - 状态码: ${statusCode} - 响应时间: ${responseTime}ms`
			);

			return originalSend.call(this, body);
		};

		next();
	}
}

declare global {
	namespace Express {
		interface Request {
			correlationId?: string;
			startTime?: number;
		}
	}
}
