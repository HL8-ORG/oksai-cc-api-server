import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { RequestContext } from './request-context.service';

/**
 * 请求上下文中间件
 *
 * 初始化请求上下文并设置到 ClsService 中
 * 需要配合 ClsModule.forRoot() 使用
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
	constructor(private readonly clsService: ClsService<any>) {
		RequestContext.setClsService(clsService);
	}

	/**
	 * 中间件处理函数
	 *
	 * 初始化请求上下文
	 *
	 * @param req - Express 请求对象
	 * @param res - Express 响应对象
	 * @param next - 下一个中间件函数
	 */
	use(req: Request, res: Response, next: NextFunction): void {
		RequestContext.initialize(req, res);
		next();
	}
}

/**
 * 中间件配置接口
 */
export interface RequestContextMiddlewareConfig {
	/** 是否排除特定路径 */
	exclude?: {
		path: string;
		method?: string;
	}[];
}
