import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionsWithRequest, VerifyCallback } from 'passport-google-oauth20';

/**
 * Google OAuth 策略
 *
 * 实现 Google OAuth 2.0 登录流程
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor() {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID || 'disabled',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'disabled',
			callbackURL: `${process.env.API_BASE_URL ?? 'http://localhost:3000'}/api/auth/google/callback`,
			passReqToCallback: true,
			scope: ['email', 'profile']
		});
	}

	/**
	 * 验证 OAuth profile 并构造简化的用户对象
	 *
	 * @param request - 传入请求对象
	 * @param accessToken - OAuth 访问令牌
	 * @param refreshToken - OAuth 刷新令牌
	 * @param profile - OAuth 提供的用户资料
	 * @param done - Passport 回调函数
	 * @returns Promise<void> 验证完成后调用回调
	 *
	 * @example
	 * // Passport 会自动调用此方法
	 * async validate(request, accessToken, refreshToken, profile, done) {
	 *   done(null, user);
	 * }
	 * ```
	 */
	async validate(
		request: any,
		accessToken: string,
		refreshToken: string,
		profile: any,
		done: VerifyCallback
	): Promise<void> {
		try {
			const { name, emails, photos } = profile;
			const { givenName, familyName } = name;

			// 安全提取第一张头像（如果有）
			const picture = Array.isArray(photos) && photos.length > 0 ? photos[0] : null;

			// 构造用户对象
			const user = {
				id: profile.id,
				emails,
				firstName: givenName,
				lastName: familyName,
				picture,
				accessToken
			};

			done(null, user);
		} catch (error) {
			console.error('Google OAuth 验证错误:', error);
			done(error, false);
		}
	}
}
