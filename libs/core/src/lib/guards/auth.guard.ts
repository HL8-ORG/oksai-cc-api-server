import { Injectable, ExecutionContext, UnauthorizedException, CanActivate, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verify } from 'jsonwebtoken';
import { JwtBlacklistService } from '../jwt-blacklist.service';

export const PUBLIC_KEY = 'isPublic';

/**
 * Authentication Guard
 *
 * Validates JWT tokens and attaches user payload to request.
 * Routes can be marked as public using the @Public() decorator.
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
			const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
			const payload = verify(token, jwtSecret);
			request.user = payload;
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
