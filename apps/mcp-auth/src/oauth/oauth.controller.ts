/**
 * OAuth 2.0 授权服务器控制器
 *
 * 提供 JWKS 端点和令牌内省端点
 */

import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { jwksService } from '../jwks/jwks.service';
import { jwtService, JwtVerifyResult } from '../auth/jwt.service';

/**
 * JWKS 响应接口
 */
interface JwksResponse {
	keys: Array<{
		kty?: string;
		kid?: string;
		use?: string;
		alg?: string;
		n?: string;
		e?: string;
	}>;
}

/**
 * 令牌内省响应接口
 */
interface IntrospectionResponse {
	active: boolean;
	sub?: string;
	scope?: string;
	client_id?: string;
	exp?: number;
	iat?: number;
	iss?: string;
	aud?: string;
	token_type?: string;
	username?: string;
}

/**
 * 错误响应接口
 */
interface ErrorResponse {
	error: string;
	error_description?: string;
}

@Controller()
export class OAuthController {
	/**
	 * JWKS 端点
	 *
	 * 提供公钥集合供客户端验证 JWT 令牌
	 *
	 * @returns JWKS 响应
	 */
	@Get('.well-known/jwks.json')
	@HttpCode(HttpStatus.OK)
	getJwks(): JwksResponse {
		const jwks = jwksService.getJwks();

		return {
			keys: jwks.keys.map((key) => ({
				kty: key.kty,
				kid: key.kid,
				use: key.use,
				alg: key.alg,
				n: key.n,
				e: key.e
			}))
		};
	}

	/**
	 * 令牌内省端点
	 *
	 * 验证令牌的有效性并返回令牌信息
	 *
	 * @param token - 要验证的令牌
	 * @returns 内省响应
	 */
	@Get('oauth/introspect')
	@HttpCode(HttpStatus.OK)
	async introspectToken(@Query('token') token: string): Promise<IntrospectionResponse | ErrorResponse> {
		if (!token) {
			return {
				error: 'invalid_request',
				error_description: '缺少 token 参数'
			};
		}

		// 验证令牌
		const result: JwtVerifyResult = await jwtService.verify(token);

		if (!result.valid || !result.payload) {
			return {
				active: false
			};
		}

		const payload = result.payload;

		return {
			active: true,
			sub: payload.sub,
			exp: payload.exp,
			iat: payload.iat,
			iss: process.env.JWT_ISSUER,
			aud: process.env.JWT_AUDIENCE,
			username: payload.name || payload.email
		};
	}

	/**
	 * 健康检查端点
	 *
	 * @returns 健康状态
	 */
	@Get('health')
	@HttpCode(HttpStatus.OK)
	health() {
		return {
			status: 'ok',
			service: 'oauth-auth-server',
			version: '0.1.0',
			timestamp: new Date().toISOString()
		};
	}
}
