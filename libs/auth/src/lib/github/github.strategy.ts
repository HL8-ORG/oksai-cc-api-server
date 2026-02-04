import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptionsWithRequest } from 'passport-github2';

/**
 * GitHub OAuth 策略
 *
 * 实现 GitHub OAuth 2.0 登录流程
 */
@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
	constructor() {
		super({
			clientID: process.env.GITHUB_CLIENT_ID || 'disabled',
			clientSecret: process.env.GITHUB_CLIENT_SECRET || 'disabled',
			callbackURL: `${process.env.API_BASE_URL ?? 'http://localhost:3000'}/api/auth/github/callback`,
			userAgent: 'oksai-api',
			passReqToCallback: true,
			scope: ['read:user', 'user:email']
		});
	}

	/**
	 * 验证用户 profile 并构造简化用户对象
	 *
	 * @param _request - Express 请求对象
	 * @param _accessToken - OAuth 访问令牌
	 * @param _refreshToken - OAuth 刷新令牌
	 * @param profile - GitHub 用户资料
	 * @param done - Passport 回调函数
	 * @returns void 通过 done 回调返回结果
	 *
	 * @example
	 * // Passport 会自动调用此方法
	 * async validate(_request, _accessToken, _refreshToken, profile, done) {
	 *   done(null, user);
	 * }
	 * ```
	 */
	async validate(
		_request: Request,
		_accessToken: string,
		_refreshToken: string,
		profile: Profile,
		done: (error: any, user: any, info?: any) => void
	) {
		try {
			const { id: providerId, provider, emails, displayName, username, photos } = profile;

			// 从显示名称中提取名和姓
			const [firstName, lastName] = displayName.split(' ');

			// 提取用户头像（处理 undefined 情况）
			const photo = photos && photos.length > 0 ? photos[0] : undefined;

			// 构造用户对象
			const user = {
				emails,
				firstName,
				lastName,
				username,
				picture: photo?.value,
				providerId,
				provider
			};

			done(null, user);
		} catch (error) {
			// 将错误传递给回调
			console.error('GitHub OAuth 验证错误:', error);
			done(error, false);
		}
	}
}
