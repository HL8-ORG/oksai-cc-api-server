import { Injectable, ExecutionContext, UnauthorizedException, CanActivate, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtBlacklistService } from '../jwt-blacklist.service';
import { RequestContext } from '../context/request-context.service';
import { getJwtUtils } from '../utils/jwt.utils';

export const PUBLIC_KEY = 'isPublic';

/**
 * 认证守卫
 *
 * 验证 JWT 令牌并将用户载荷附加到请求
 * 路由可以使用 @Public() 装饰器标记为公开访问
 */
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		@Optional() private readonly jwtBlacklistService?: JwtBlacklistService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
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
			throw new UnauthorizedException('未提供令牌');
		}

		if (this.jwtBlacklistService && this.jwtBlacklistService.isAvailable()) {
			const isBlacklisted = await this.jwtBlacklistService.isBlacklisted(token);
			if (isBlacklisted) {
				throw new UnauthorizedException('令牌已失效，请重新登录');
			}
		}

		try {
			// 使用统一的 JwtUtils（由 AuthModule.onModuleInit 初始化），避免密钥/算法配置分叉
			const jwtUtils = getJwtUtils();
			const payload = jwtUtils.verifyAccessToken(token) as any;

			request.user = payload;

			RequestContext.setCurrentUser({
				id: payload.sub,
				email: payload.email,
				tenantId: payload.tenantId,
				role: payload.role
			});

			return true;
		} catch (error) {
			throw new UnauthorizedException('无效或已过期的令牌');
		}
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
