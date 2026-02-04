import { Controller, Get } from '@nestjs/common';
import { SocialAuthService } from './../social-auth.service';

/**
 * GitHub 认证控制器
 *
 * 提供 GitHub OAuth 登录和回调端点
 *
 * @remarks
 * 此控制器需要配合 @nestjs/passport 和 passport-github2 使用
 * 需要在模块中提供 GithubStrategy 策略
 */
@Controller('/auth')
export class GithubController {
	constructor(public readonly service: SocialAuthService) {}

	/**
	 * 启动 GitHub 登录
	 *
	 * 此端点用于启动 GitHub OAuth 流程
	 * 需要配合 AuthGuard('github') 使用
	 *
	 * @example
	 * ```bash
	 * GET /api/auth/github
	 * ```
	 */
	@Get('/github')
	githubLogin() {
		// 此方法由 AuthGuard('github') 处理实际的 OAuth 重定向
	}

	/**
	 * GitHub 登录回调端点
	 *
	 * 处理 GitHub OAuth 回调，验证用户信息并生成 JWT
	 *
	 * @example
	 * ```bash
	 * GET /api/auth/github/callback
	 * ```
	 */
	@Get('/github/callback')
	async githubLoginCallback(): Promise<void> {
		// 实际实现由 AuthGuard 处理请求上下文并调用社交认证服务
	}
}
