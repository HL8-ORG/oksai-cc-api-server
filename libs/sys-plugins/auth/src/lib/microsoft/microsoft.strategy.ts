import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';

/**
 * Microsoft OAuth 认证策略
 *
 * 实现 Microsoft OAuth 2.0 认证流程
 * 支持用户通过 Microsoft 账号登录系统
 */
@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
	constructor() {
		const config = parseMicrosoftConfig();
		super(config);
	}

	/**
	 * 验证 Microsoft OAuth profile 并构造简化用户对象
	 *
	 * @param _request - Express 请求对象
	 * @param _accessToken - OAuth 访问令牌
	 * @param _refreshToken - OAuth 刷新令牌
	 * @param profile - Microsoft 用户资料
	 * @param done - Passport 回调函数
	 * @returns Promise<void> 通过 done 回调返回结果
	 */
	async validate(
		_request: any,
		_accessToken: string,
		_refreshToken: string,
		profile: any,
		done: (error: any, user: any, info?: any) => void
	): Promise<void> {
		try {
			const { emails, displayName, name } = profile;
			const { givenName, familyName } = name || {};

			// 构造用户对象
			const user = {
				emails,
				firstName: givenName,
				lastName: familyName,
				displayName,
				provider: 'microsoft'
			};

			done(null, user);
		} catch (error) {
			console.error('Microsoft OAuth 验证错误:', error);
			done(error, false);
		}
	}
}

/**
 * 解析 Microsoft OAuth 配置
 *
 * 从环境变量中获取 Microsoft OAuth 客户端 ID、客户端密钥、回调 URL、
 * 授权 URL 和令牌 URL。如果缺少任何必需的配置值，将记录警告并应用默认值。
 *
 * @returns 包含 Microsoft OAuth 配置参数的对象
 */
export const parseMicrosoftConfig = (): any => {
	const clientId = process.env.MICROSOFT_CLIENT_ID || '';
	const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || '';
	const callbackURL = process.env.MICROSOFT_CALLBACK_URL || '';
	const authorizationURL = process.env.MICROSOFT_AUTHORIZATION_URL || '';
	const tokenURL = process.env.MICROSOFT_TOKEN_URL || '';

	// 如果缺少任何必需的配置值，不记录警告（测试环境不打印警告）
	// if (!clientId || !clientSecret || !callbackURL) {
	// 	console.warn('⚠️ Microsoft OAuth 配置不完整。默认使用 "disabled"。');
	// }

	// 返回 Microsoft OAuth 的配置对象
	return {
		// 使用检索到的客户端 ID，如果未提供则默认为 'disabled'
		clientID: clientId || 'disabled',
		// 使用检索到的客户端密钥，如果未提供则默认为 'disabled'
		clientSecret: clientSecret || 'disabled',
		// 使用检索到的回调 URL，如果未提供则默认为 API_BASE_URL（或 localhost）加上回调路径
		callbackURL:
			callbackURL || `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/auth/microsoft/callback`,
		// Microsoft OAuth 的授权 URL
		authorizationURL,
		// Microsoft 交换授权代码以获取访问令牌的令牌 URL
		tokenURL,
		// 在回调中包含请求对象
		passReqToCallback: true,
		// 指定 Microsoft OAuth 的作用域
		scope: ['openid', 'profile', 'email', 'user.read']
	};
};
