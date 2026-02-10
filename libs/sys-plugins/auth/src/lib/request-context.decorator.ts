import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 请求上下文装饰器
 *
 * 用于从请求上下文中提取认证后的用户信息和相关数据
 */
export const RequestCtx = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<IncomingRequest>();
	return request;
});

/**
 * 内部请求接口
 */
export interface IncomingRequest {
	user: {
		id: string;
		emails: string[];
		displayName: string;
		firstName?: string;
		lastName?: string;
		picture?: string;
	};
}
