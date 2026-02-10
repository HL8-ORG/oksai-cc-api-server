import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';

/**
 * Auth0 OAuth 策略
 *
 * 实现 Auth0 OAuth 2.0 登录流程
 */
@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
	constructor() {
		const auth0Config = {
			clientID: process.env.AUTH0_CLIENT_ID || 'disabled',
			clientSecret: process.env.AUTH0_CLIENT_SECRET || 'disabled',
			domain: process.env.AUTH0_DOMAIN || 'disabled',
			callbackURL: `${process.env.API_BASE_URL ?? 'http://localhost:3000'}/api/auth/auth0/callback`,
			scope: ['openid', 'profile', 'email']
		};

		super(auth0Config);
	}

	/**
	 * 验证用户信息并构造简化的用户对象
	 *
	 * @param accessToken - Auth0 访问令牌
	 * @param refreshToken - Auth0 刷新令牌
	 * @param extraParams - 额外的 OAuth 参数
	 * @param profile - Auth0 用户资料
	 * @param done - Passport 回调函数
	 * @returns void 通过 done 回调返回结果
	 *
	 * @example
	 * // Passport 会自动调用此方法
	 * async validate(accessToken, refreshToken, extraParams, profile, done) {
	 *   done(null, user);
	 * }
	 * ```
	 */
	async validate(
		accessToken: string,
		refreshToken: string,
		extraParams: any,
		profile: any,
		done: (error: any, user: any, info?: any) => void
	): Promise<void> {
		try {
			const { email, name, picture } = profile;
			const emails = [{ value: email, verified: Boolean(email) }];

			const user = {
				id: profile.user_id || profile.sub,
				emails,
				displayName: name,
				picture,
				accessToken,
				refreshToken
			};

			done(null, user);
		} catch (error) {
			console.error('Auth0 OAuth 验证错误:', error);
			done(error, false);
		}
	}
}
