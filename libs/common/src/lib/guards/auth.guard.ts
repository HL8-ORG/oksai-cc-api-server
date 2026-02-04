import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getJwtUtils } from '@oksai/core';

export const PUBLIC_KEY = 'isPublic';

/**
 * 认证守卫
 *
 * 验证请求中的 JWT 令牌，并将用户信息附加到请求对象
 */
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	/**
	 * 激活守卫
	 *
	 * 检查请求是否为公开路由，如果不是公开路由则验证 JWT 令牌
	 *
	 * @param context - 执行上下文
	 * @returns boolean 是否允许访问
	 * @throws UnauthorizedException 当令牌未提供、无效或已过期时
	 *
	 * @example
	 * ```typescript
	 * // 在控制器中使用
	 * @UseGuards(AuthGuard)
	 * @Controller('users')
	 * export class UserController {
	 *   @Get()
	 *   @Public() // 标记此路由为公开，无需认证
	 *   getPublicInfo() {
	 *     return { message: 'Public route' };
	 *   }
	 *
	 *   @Get('profile')
	 *   getProfile() {
	 *     return this.userService.getCurrentUser();
	 *   }
	 * }
	 * ```
	 */
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		if (isPublic) {
			return true;
		}

		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException('未提供访问令牌');
		}

		try {
			const jwtUtils = getJwtUtils();
			const payload = jwtUtils.verifyAccessToken(token);
			request.user = payload;
			return true;
		} catch (error) {
			throw new UnauthorizedException('无效的或已过期的访问令牌');
		}
	}

	/**
	 * 从请求头中提取 JWT 令牌
	 *
	 * @param request - HTTP 请求对象
	 * @returns JWT 令牌字符串，如果格式不正确则返回 undefined
	 *
	 * @private
	 */
	private extractTokenFromHeader(request: any): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
