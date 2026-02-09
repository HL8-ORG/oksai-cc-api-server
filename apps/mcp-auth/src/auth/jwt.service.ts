/**
 * JWT 令牌服务
 *
 * 使用 jsonwebtoken 库进行 JWT 签名和验证
 */

import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

/**
 * JWT 载荷接口
 */
export interface JwtPayload {
	/** 用户 ID */
	sub: string;
	/** 用户名或邮箱 */
	name?: string;
	/** 邮箱 */
	email?: string;
	/** 租户 ID */
	tenantId?: string;
	/** 组织 ID */
	organizationId?: string;
	/** 角色 */
	roles?: string[];
	/** 权限 */
	permissions?: string[];
	/** 令牌类型 */
	tokenType?: 'access' | 'refresh';
	/** 发行时间 */
	iat?: number;
	/** 过期时间 */
	exp?: number;
}

/**
 * JWT 令牌对
 */
export interface JwtTokenPair {
	/** 访问令牌 */
	accessToken: string;
	/** 刷新令牌 */
	refreshToken: string;
	/** 过期时间（秒） */
	expiresIn: number;
}

/**
 * JWT 令牌验证结果
 */
export interface JwtVerifyResult {
	/** 是否有效 */
	valid: boolean;
	/** JWT 载荷 */
	payload: JwtPayload | null;
	/** 错误消息 */
	error?: string;
}

@Injectable()
export class JwtService {
	private readonly logger = new Logger('JwtService');
	private privateKey: string;
	private publicKey?: string;
	private accessTokenExpiry: number;
	private refreshTokenExpiry: number;
	private issuer: string;
	private audience: string;

	constructor() {
		// 从环境变量或配置中加载
		this.accessTokenExpiry = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRY || '3600', 10);
		this.refreshTokenExpiry = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY || '86400', 10);
		this.issuer = process.env.JWT_ISSUER || 'oksai-mcp-auth';
		this.audience = process.env.JWT_AUDIENCE || 'oksai-mcp';
		this.privateKey = process.env.JWT_PRIVATE_KEY || 'test-private-key';
		this.publicKey = process.env.JWT_PUBLIC_KEY || 'test-public-key';

		if (this.privateKey === 'test-private-key') {
			// 开发环境生成测试密钥对
			this.generateTestKeys();
		}
	}

	/**
	 * 生成测试密钥对（仅用于开发环境）
	 */
	private generateTestKeys(): void {
		this.logger.warn('使用生成的测试密钥，仅适用于开发环境');
		const privateKey = randomBytes(32).toString('hex');
		this.privateKey = privateKey;
		this.publicKey = privateKey; // HS256 使用相同的密钥
		process.env.JWT_PRIVATE_KEY = privateKey;
		process.env.JWT_PUBLIC_KEY = privateKey;
	}

	/**
	 * 签名 JWT 令牌
	 *
	 * @param payload - JWT 载荷
	 * @param expiresIn - 过期时间（秒）
	 * @returns JWT 令牌字符串
	 */
	sign(payload: JwtPayload, expiresIn: number): string {
		try {
			this.logger.debug('签名 JWT 令牌');

			return jwt.sign(payload, this.privateKey, {
				algorithm: 'HS256',
				expiresIn: expiresIn,
				issuer: this.issuer,
				audience: this.audience,
				jwtid: payload.sub // 使用用户 ID 作为 jti
			});
		} catch (error) {
			this.logger.error('签名 JWT 令牌失败', error);
			throw new Error('JWT 签名失败');
		}
	}

	/**
	 * 验证 JWT 令牌
	 *
	 * @param token - JWT 令牌字符串
	 * @returns 验证结果
	 */
	verify(token: string): JwtVerifyResult {
		try {
			this.logger.debug('验证 JWT 令牌');

			const payload = jwt.verify(token, this.publicKey || this.privateKey, {
				issuer: this.issuer,
				audience: this.audience
			}) as JwtPayload;

			return {
				valid: true,
				payload
			};
		} catch (error) {
			this.logger.error('验证 JWT 令牌失败', error);
			return {
				valid: false,
				payload: null,
				error: error instanceof Error ? error.message : 'JWT 验证失败'
			};
		}
	}

	/**
	 * 生成访问令牌和刷新令牌对
	 *
	 * @param payload - JWT 载荷
	 * @returns JWT 令牌对
	 */
	generateTokenPair(payload: JwtPayload): JwtTokenPair {
		this.logger.debug('生成 JWT 令牌对');

		const accessTokenPayload: JwtPayload = {
			...payload,
			tokenType: 'access'
		};

		const refreshTokenPayload: JwtPayload = {
			...payload,
			tokenType: 'refresh'
		};

		const accessToken = this.sign(accessTokenPayload, this.accessTokenExpiry);
		const refreshToken = this.sign(refreshTokenPayload, this.refreshTokenExpiry);

		return {
			accessToken,
			refreshToken,
			expiresIn: this.accessTokenExpiry
		};
	}

	/**
	 * 刷新访问令牌
	 *
	 * @param refreshToken - 刷新令牌
	 * @returns 新的访问令牌
	 */
	refreshAccessToken(refreshToken: string): string | null {
		try {
			this.logger.debug('刷新访问令牌');

			const result = this.verify(refreshToken);

			if (!result.valid || !result.payload) {
				this.logger.warn('刷新令牌无效');
				return null;
			}

			if (result.payload.tokenType !== 'refresh') {
				this.logger.warn('令牌类型不是刷新令牌');
				return null;
			}

			// 生成新的访问令牌（不包含 exp 和 iat）
			const accessTokenPayload: JwtPayload = {
				sub: result.payload.sub,
				name: result.payload.name,
				email: result.payload.email,
				tenantId: result.payload.tenantId,
				organizationId: result.payload.organizationId,
				roles: result.payload.roles,
				permissions: result.payload.permissions,
				tokenType: 'access'
			};

			return this.sign(accessTokenPayload, this.accessTokenExpiry);
		} catch (error) {
			this.logger.error('刷新访问令牌失败', error);
			return null;
		}
	}

	/**
	 * 解码 JWT 令牌（不验证签名）
	 *
	 * @param token - JWT 令牌字符串
	 * @returns JWT 载荷
	 */
	decode(token: string): JwtPayload | null {
		try {
			const decoded = jwt.decode(token) as JwtPayload;
			return decoded;
		} catch (error) {
			this.logger.error('解码 JWT 令牌失败', error);
			return null;
		}
	}
}

export const jwtService = new JwtService();
