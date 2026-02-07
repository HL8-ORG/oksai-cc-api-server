import { Controller, Get } from '@nestjs/common';
import { SocialAuthService } from './../social-auth.service';

/**
 * Microsoft 认证控制器
 *
 * 提供 Microsoft OAuth 登录和回调端点
 *
 * @remarks
 * 此控制器需要配合 @nestjs/passport 和 passport-microsoft 使用
 * 需要在模块中提供 MicrosoftStrategy 策略
 */
@Controller('/auth')
export class MicrosoftController {
	constructor(public readonly service: SocialAuthService) {}

	/**
	 * 启动 Microsoft 登录
	 *
	 * 此端点用于启动 Microsoft OAuth 流程
	 * 需要配合 AuthGuard('microsoft') 使用
	 *
	 * @example
	 * ```bash
	 * GET /api/auth/microsoft
	 * ```
	 */
	@Get('/microsoft')
	microsoftLogin() {
		// 此方法由 AuthGuard('microsoft') 处理实际的 OAuth 重定向
	}

	/**
	 * Microsoft 登录回调端点
	 *
	 * 处理 Microsoft OAuth 回调，验证用户信息并生成 JWT
	 *
	 * @example
	 * ```bash
	 * GET /api/auth/microsoft/callback
	 * ```
	 */
	@Get('/microsoft/callback')
	async microsoftLoginCallback(): Promise<void> {
		// 实际实现由 AuthGuard 处理请求上下文并调用社交认证服务
	}
}
