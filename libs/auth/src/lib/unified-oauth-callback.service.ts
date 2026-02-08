import { Injectable, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { User, UserRole } from './entities/user.entity';
import { JwtPayload, getJwtUtils } from '@oksai/core';

/**
 * OAuth 提供者类型
 */
export enum OAuthProvider {
	GOOGLE = 'google',
	MICROSOFT = 'microsoft',
	GITHUB = 'github',
	AUTH0 = 'auth0'
}

/**
 * OAuth 用户信息
 */
export interface IOAuthUser {
	id: string;
	email: string;
	displayName: string;
	firstName?: string;
	lastName?: string;
	picture?: string;
}

/**
 * OAuth 回调响应接口
 */
export interface IOAuthCallbackResponse {
	success: boolean;
	authData?: {
		jwt: string;
		userId: string;
		provider: string;
	};
	error?: string;
	redirectUrl?: string;
}

/**
 * 统一 OAuth 回调服务
 *
 * 提供统一的 OAuth 回调处理链路
 * 所有 OAuth Provider 回调都通过此服务处理，确保一致性
 */
@Injectable()
export class UnifiedOAuthCallbackService {
	private readonly logger = new Logger(UnifiedOAuthCallbackService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>
	) {}

	private get em(): EntityManager {
		return this.userRepo.getEntityManager();
	}

	/**
	 * 处理 OAuth 回调
	 *
	 * 统一的 OAuth 回调处理链路：
	 * 1. 从 OAuth Provider 获取用户信息
	 * 2. 验证/查找或创建用户
	 * 3. 生成 JWT 令牌
	 * 4. 重定向到客户端
	 *
	 * @param provider - OAuth 提供者
	 * @param oAuthUser - OAuth 用户信息
	 * @returns OAuth 回调响应
	 */
	async handleOAuthCallback(provider: OAuthProvider, oAuthUser: IOAuthUser): Promise<IOAuthCallbackResponse> {
		this.logger.log(`处理 ${provider} OAuth 回调，邮箱：${oAuthUser.email}`);

		const email = oAuthUser.email;

		if (!email) {
			return {
				success: false,
				error: '邮箱地址缺失'
			};
		}

		try {
			let user = await this.userRepo.findOne({ email });

			if (!user) {
				user = await this.createUser(oAuthUser);
			}

			const jwtUtils = getJwtUtils();
			const payload: JwtPayload = {
				sub: user.id,
				email: user.email,
				tenantId: user.tenantId || 'default',
				role: user.role || UserRole.USER
			};

			const tokens = jwtUtils.generateTokenPair(payload);

			this.logger.log(`用户 ${user.email} OAuth 认证成功`);

			return {
				success: true,
				authData: {
					jwt: tokens.accessToken,
					userId: user.id,
					provider
				}
			};
		} catch (error) {
			this.logger.error(`处理 ${provider} OAuth 回调失败`, error);

			return {
				success: false,
				error: 'OAuth 认证失败，请稍后重试'
			};
		}
	}

	/**
	 * 创建 OAuth 用户
	 *
	 * 根据 OAuth 用户信息创建新用户
	 *
	 * @param oAuthUser - OAuth 用户信息
	 * @returns 已创建的用户
	 */
	private async createUser(oAuthUser: IOAuthUser): Promise<User> {
		const { randomBytes } = await import('crypto');
		const tempPassword = randomBytes(16).toString('hex');

		const { hashPassword } = await import('@oksai/core');
		const hashedPassword = await hashPassword(tempPassword);

		const user = this.userRepo.create({
			email: oAuthUser.email,
			password: hashedPassword,
			firstName: oAuthUser.firstName || '',
			lastName: oAuthUser.lastName || '',
			isActive: true,
			tenantId: 'default',
			emailVerifiedAt: new Date(),
			role: UserRole.USER,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		this.em.persist(user);
		await this.em.flush();

		this.logger.log(`创建新 OAuth 用户：${oAuthUser.email}`);

		return user;
	}

	/**
	 * 生成重定向 URL
	 *
	 * 根据客户端基础 URL 和路径生成重定向 URL
	 *
	 * @param path - 重定向路径
	 * @returns 重定向 URL
	 */
	private getRedirectUrl(path: string): string {
		const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:4200';
		return `${clientBaseUrl}${path}`;
	}

	/**
	 * 生成成功重定向 URL
	 *
	 * @param jwt - JWT 令牌
	 * @param userId - 用户 ID
	 * @returns 重定向 URL
	 */
	generateSuccessRedirect(jwt: string, userId: string): string {
		const redirectPath = `/sign-in/success?jwt=${jwt}&userId=${userId}`;
		return this.getRedirectUrl(redirectPath);
	}

	/**
	 * 生成失败重定向 URL
	 *
	 * @returns 重定向 URL
	 */
	generateFailureRedirect(): string {
		const redirectPath = '/auth/register';
		return this.getRedirectUrl(redirectPath);
	}
}
