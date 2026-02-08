import { Injectable, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

/**
 * 请求关联 ID 中间件
 *
 * 为每个请求生成唯一的关联 ID，用于追踪日志、错误和指标
 * 关联 ID 会在响应头中返回，并贯穿整个请求生命周期
 */
@Injectable()
export class CorrelationIdMiddleware {
	constructor() {}

	configure(consumer: MiddlewareConsumer): void {
		consumer
			.apply((req: any, res: any, next: () => void) => {
				const correlationId = req.headers['x-correlation-id'] || uuidv4();

				req.correlationId = correlationId;

				if (!req.headers['x-correlation-id']) {
					res.setHeader('x-correlation-id', correlationId);
				}

				next();
			})
			.forRoutes({ path: '*', method: RequestMethod.ALL });
	}
}
