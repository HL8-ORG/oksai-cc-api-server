import { Controller, Get, Req, Res } from '@nestjs/common';
import { Public } from '@oksai/core';
import { UnifiedOAuthCallbackService, OAuthProvider, IOAuthUser } from './unified-oauth-callback.service';

/**
 * 统一 OAuth 回调控制器
 *
 * 提供统一的 OAuth 回调端点
 * 所有 OAuth Provider 都通过此控制器处理回调，确保一致性
 */
@Public()
@Controller('auth/oauth/callback')
export class UnifiedOAuthCallbackController {
	constructor(private readonly oauthService: UnifiedOAuthCallbackService) {}

	/**
	 * Google OAuth 回调端点
	 *
	 * 处理 Google OAuth 回调
	 *
	 * @param req - Express 请求对象
	 * @param res - Express 响应对象
	 * @returns Promise<void>
	 */
	@Get('google')
	async googleCallback(@Req() req: any, @Res() res: any): Promise<void> {
		const user = req.user;

		const oAuthUser: IOAuthUser = {
			id: user.id,
			email: user.email,
			displayName: user.displayName || `${user.firstName} ${user.lastName}`,
			firstName: user.firstName,
			lastName: user.lastName,
			picture: user.picture
		};

		const response = await this.oauthService.handleOAuthCallback(OAuthProvider.GOOGLE, oAuthUser);

		if (response.success && response.authData) {
			const redirectUrl = this.oauthService.generateSuccessRedirect(
				response.authData.jwt,
				response.authData.userId
			);
			return res.redirect(redirectUrl);
		}

		const redirectUrl = this.oauthService.generateFailureRedirect();
		return res.redirect(redirectUrl);
	}

	/**
	 * Microsoft OAuth 回调端点
	 *
	 * 处理 Microsoft OAuth 回调
	 *
	 * @param req - Express 请求对象
	 * @param res - Express 响应对象
	 * @returns Promise<void>
	 */
	@Get('microsoft')
	async microsoftCallback(@Req() req: any, @Res() res: any): Promise<void> {
		const user = req.user;

		const oAuthUser: IOAuthUser = {
			id: user.id,
			email: user.email,
			displayName: user.displayName || `${user.firstName} ${user.lastName}`,
			firstName: user.firstName,
			lastName: user.lastName,
			picture: user.picture
		};

		const response = await this.oauthService.handleOAuthCallback(OAuthProvider.MICROSOFT, oAuthUser);

		if (response.success && response.authData) {
			const redirectUrl = this.oauthService.generateSuccessRedirect(
				response.authData.jwt,
				response.authData.userId
			);
			return res.redirect(redirectUrl);
		}

		const redirectUrl = this.oauthService.generateFailureRedirect();
		return res.redirect(redirectUrl);
	}

	/**
	 * GitHub OAuth 回调端点
	 *
	 * 处理 GitHub OAuth 回调
	 *
	 * @param req - Express 请求对象
	 * @param res - Express 响应对象
	 * @returns Promise<void>
	 */
	@Get('github')
	async githubCallback(@Req() req: any, @Res() res: any): Promise<void> {
		const user = req.user;

		const oAuthUser: IOAuthUser = {
			id: user.id,
			email: user.email,
			displayName: user.displayName || `${user.firstName} ${user.lastName}`,
			firstName: user.firstName,
			lastName: user.lastName,
			picture: user.picture
		};

		const response = await this.oauthService.handleOAuthCallback(OAuthProvider.GITHUB, oAuthUser);

		if (response.success && response.authData) {
			const redirectUrl = this.oauthService.generateSuccessRedirect(
				response.authData.jwt,
				response.authData.userId
			);
			return res.redirect(redirectUrl);
		}

		const redirectUrl = this.oauthService.generateFailureRedirect();
		return res.redirect(redirectUrl);
	}

	/**
	 * Auth0 OAuth 回调端点
	 *
	 * 处理 Auth0 OAuth 回调
	 *
	 * @param req - Express 请求对象
	 * @param res - Express 响应对象
	 * @returns Promise<void>
	 */
	@Get('auth0')
	async auth0Callback(@Req() req: any, @Res() res: any): Promise<void> {
		const user = req.user;

		const oAuthUser: IOAuthUser = {
			id: user.id,
			email: user.email,
			displayName: user.displayName || `${user.firstName} ${user.lastName}`,
			firstName: user.firstName,
			lastName: user.lastName,
			picture: user.picture
		};

		const response = await this.oauthService.handleOAuthCallback(OAuthProvider.AUTH0, oAuthUser);

		if (response.success && response.authData) {
			const redirectUrl = this.oauthService.generateSuccessRedirect(
				response.authData.jwt,
				response.authData.userId
			);
			return res.redirect(redirectUrl);
		}

		const redirectUrl = this.oauthService.generateFailureRedirect();
		return res.redirect(redirectUrl);
	}
}
