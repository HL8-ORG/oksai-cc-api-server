import { Controller, Get, UseGuards } from '@nestjs/common';
import { SocialAuthService } from './../social-auth.service';

/**
 * Auth0 认证控制器
 *
 * 提供 Auth0 OAuth 登录和回调端点
 *
 * @remarks
 * 此控制器需要配合 @nestjs/passport 和 passport-auth0 使用
 * 需要在模块中提供 Auth0Strategy 策略
 */
@Controller('/auth')
export class Auth0Controller {
	constructor(public readonly service: SocialAuthService) {}

	/**
	 * 启动 Auth0 登录
	 *
	 * 此端点用于启动 Auth0 OAuth 流程
	 * 需要配合 AuthGuard('auth0') 使用
	 *
	 * @example
	 * ```bash
	 * GET /api/auth/auth0
	 * ```
	 */
	@Get('/auth0')
	@UseGuards()
	auth0Login() {
		// 此方法由 AuthGuard('auth0') 处理实际的 OAuth 重定向
	}

	/**
	 * Auth0 登录回调端点
	 *
	 * 处理 Auth0 OAuth 回调，验证用户信息并生成 JWT
	 *
	 * @example
	 * ```bash
	 * GET /api/auth/auth0/callback
	 * ```
	 */
	@Get('/auth0/callback')
	@UseGuards()
	async auth0LoginCallback(): Promise<void> {
		// 实际实现由 AuthGuard 处理请求上下文并调用社交认证服务
	}
}
