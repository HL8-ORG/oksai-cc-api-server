/**
 * JWKS 公钥端点服务
 *
 * 提供 JSON Web Key Set (JWKS) 端点，用于分发公钥
 * 注意：当前使用 HS256 算法，JWKS 端点仅用于兼容性，不返回实际公钥
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * JWKS 端点配置接口
 */
export interface JwksConfig {
	/** 是否启用 */
	enabled: boolean;
	/** 端点路径 */
	path: string;
	/** 密钥算法（alg） */
	keyAlg: string;
}

/**
 * JWKS 响应接口
 */
export interface JwksResponse {
	keys: Array<{
		kty: string;
		kid?: string;
		use?: string;
		alg?: string;
		n?: string;
		e?: string;
	}>;
}

/**
 * 密钥元数据接口
 */
export interface KeyMetadata {
	/** 密钥 ID */
	kid: string;
	/** 密钥算法 */
	alg: string;
	/** 创建时间 */
	created_at: number;
}

@Injectable()
export class JwksService {
	private readonly logger = new Logger('JwksService');
	private config: JwksConfig;

	constructor() {
		this.config = {
			enabled: process.env.JWT_JWKS_ENABLED === 'true',
			path: process.env.JWT_JWKS_PATH || '/.well-known/jwks.json',
			keyAlg: process.env.JWT_ALGORITHM || 'HS256'
		};

		this.initialize();
	}

	/**
	 * 初始化 JWKS
	 */
	private initialize(): void {
		try {
			this.logger.log('初始化 JWKS 服务');

			if (!this.config.enabled) {
				this.logger.log('JWKS 端点已禁用');
				return;
			}

			if (this.config.keyAlg === 'HS256') {
				this.logger.log('使用 HS256 算法，JWKS 端点将返回空列表');
			} else {
				this.logger.log(`使用 ${this.config.keyAlg} 算法`);
			}
		} catch (error) {
			this.logger.error('初始化 JWKS 服务失败', error);
		}
	}

	/**
	 * 获取 JWKS
	 *
	 * @returns JSON Web Key Set
	 */
	getJwks(): JwksResponse {
		// HS256 使用对称密钥，不返回公钥
		return {
			keys: []
		};
	}

	/**
	 * 获取 JWKS 配置
	 *
	 * @returns JWKS 配置
	 */
	getConfig(): JwksConfig {
		return { ...this.config };
	}

	/**
	 * 检查是否启用 JWKS
	 *
	 * @returns 是否启用
	 */
	isEnabled(): boolean {
		return this.config.enabled;
	}
}

export const jwksService = new JwksService();
