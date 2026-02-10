import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { User, UserRole } from './entities/user.entity';
import { JwtPayload, getJwtUtils, hashPassword } from '@oksai/core';

/**
 * 社交认证请求上下文接口
 */
export interface IOAuthRequestContext {
	user: {
		id: string;
		emails: string[];
		displayName: string;
		firstName?: string;
		lastName?: string;
		picture?: string;
	};
}

/**
 * 社交认证响应接口
 */
export interface IOAuthResponse {
	success: boolean;
	authData?: {
		jwt: string;
		userId: string;
	};
	error?: string;
}

/**
 * 社交认证服务
 *
 * 提供 OAuth 登录的基础功能，包括用户验证、JWT 生成和路由重定向
 */
@Injectable()
export class SocialAuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>
	) {}

	private get em(): EntityManager {
		return this.userRepo.getEntityManager();
	}

	/**
	 * 获取客户端基础 URL
	 *
	 * @returns 客户端基础 URL
	 */
	private get clientBaseUrl(): string {
		return process.env.CLIENT_BASE_URL || 'http://localhost:4200';
	}

	/**
	 * 验证 OAuth 登录邮箱
	 *
	 * 检查用户是否存在，如果不存在则创建新用户，然后生成 JWT
	 *
	 * @param context - OAuth 请求上下文，包含用户信息
	 * @returns OAuth 响应，包含成功状态、JWT 和用户 ID
	 *
	 * @example
	 * ```typescript
	 * const result = await socialAuthService.validateOAuthLoginEmail({
	 *   user: {
	 *     emails: ['user@example.com'],
	 *     displayName: 'John Doe',
	 *     firstName: 'John',
	 *     lastName: 'Doe'
	 *   }
	 * });
	 * ```
	 */
	async validateOAuthLoginEmail(context: IOAuthRequestContext): Promise<IOAuthResponse> {
		const { user } = context;
		const email = user.emails[0];

		if (!email) {
			return {
				success: false,
				error: '邮箱地址缺失'
			};
		}

		// 查找或创建用户
		let dbUser = await this.userRepo.findOne({ email });

		if (!dbUser) {
			// 创建新用户
			const tempPassword = await this.generateTempPassword();
			const hashedPassword = await hashPassword(tempPassword);

			// 从显示名称中提取姓名
			const names = this.extractNames(user.displayName);

			dbUser = this.userRepo.create({
				email,
				password: hashedPassword,
				firstName: names.firstName || user.firstName || '',
				lastName: names.lastName || user.lastName || '',
				isActive: true,
				tenantId: 'default',
				emailVerifiedAt: new Date(),
				role: UserRole.USER,
				createdAt: new Date(),
				updatedAt: new Date()
			} as any);

			this.em.persist(dbUser);
			await this.em.flush();
		}

		// 生成 JWT
		const jwtUtils = getJwtUtils();
		const payload: JwtPayload = {
			sub: dbUser.id,
			email: dbUser.email,
			tenantId: dbUser.tenantId,
			role: dbUser.role || UserRole.USER
		};

		const tokens = jwtUtils.generateTokenPair(payload);

		return {
			success: true,
			authData: {
				jwt: tokens.accessToken,
				userId: dbUser.id
			}
		};
	}

	/**
	 * 生成临时密码
	 *
	 * 用于 OAuth 注册的新用户，生成一个安全的随机密码
	 *
	 * @returns Promise<string> 临时密码
	 *
	 * @example
	 * ```typescript
	 * const tempPassword = await this.generateTempPassword();
	 * console.log(tempPassword); // 'Xk9#mP2$nL7'
	 * ```
	 */
	private async generateTempPassword(): Promise<string> {
		const { randomBytes } = await import('crypto');
		const password = randomBytes(12).toString('base64').slice(0, 16);
		return password;
	}

	/**
	 * 从显示名称中提取姓名
	 *
	 * @param displayName - 显示名称（如 "John Doe"）
	 * @returns 包含名和姓的对象
	 *
	 * @example
	 * ```typescript
	 * const names = this.extractNames('John Doe');
	 * console.log(names); // { firstName: 'John', lastName: 'Doe' }
	 * ```
	 */
	private extractNames(displayName: string): { firstName: string; lastName: string } {
		const names = displayName.trim().split(/\s+/);
		if (names.length === 1) {
			return { firstName: names[0], lastName: '' };
		}
		return {
			firstName: names.slice(0, -1).join(' '),
			lastName: names[names.length - 1]
		};
	}

	/**
	 * 根据成功状态重定向用户
	 *
	 * @param success - 操作是否成功
	 * @param auth - 包含 JWT 和用户 ID 的对象
	 * @param res - Express 响应对象
	 * @returns 重定向响应
	 *
	 * @example
	 * ```typescript
	 * await this.routeRedirect(true, {
	 *   jwt: 'eyJhbGci...',
	 *   userId: 'user-123'
	 * }, res);
	 * ```
	 */
	async routeRedirect(success: boolean, auth: { jwt: string; userId: string }, res: any): Promise<any> {
		const { userId, jwt } = auth;

		const redirectPath = success ? `/sign-in/success?jwt=${jwt}&userId=${userId}` : `/auth/register`;
		const redirectUrl = `${this.clientBaseUrl}${redirectPath}`;

		return res.redirect(redirectUrl);
	}
}
