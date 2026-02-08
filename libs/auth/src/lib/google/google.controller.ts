import { Controller, Get } from '@nestjs/common';
import { Public } from '@oksai/core';
import { SocialAuthService } from './../social-auth.service';

/**
 * Google 认证控制器
 *
 * 提供 Google OAuth 登录和回调端点
 *
 * @remarks
 * 此控制器需要配合 @nestjs/passport 和 passport-google-oauth20 使用
 * 需要在模块中提供 GoogleStrategy 策略
 */
@Controller('/auth')
export class GoogleController {
	constructor(public readonly service: SocialAuthService) {}

	/**
	 * 启动 Google 登录
	 *
	 * 此端点用于启动 Google OAuth 流程
	 * 需要配合 AuthGuard('google') 使用
	 *
	 * @example
	 * ```bash
	 * GET /api/auth/google
	 * ```
	 */
	@Get('/google')
	@Public()
	googleLogin() {
		// 此方法由 AuthGuard('google') 处理实际的 OAuth 重定向
	}

	/**
	 * Google 登录回调端点
	 *
	 * 处理 Google OAuth 回调，验证用户信息并生成 JWT
	 *
	 * @example
	 * ```bash
	 * GET /api/auth/google/callback
	 * ```
	 */
	@Get('/google/callback')
	@Public()
	async googleLoginCallback(): Promise<void> {
		// 实际实现由 AuthGuard 处理请求上下文并调用社交认证服务
	}
}
