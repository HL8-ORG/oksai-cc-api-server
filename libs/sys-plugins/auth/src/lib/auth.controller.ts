import { Body, Controller, Get, Post, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { LoginResponse, RefreshTokenResponse, VerifyEmailResponse } from './interfaces';
import { Public } from '@oksai/core';

/**
 * 认证控制器
 *
 * 提供用户认证相关的 API 端点，包括登录、注册、令牌刷新、登出、密码重置和邮箱验证
 */
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * 用户登录
	 *
	 * 验证用户凭证并返回 JWT 访问令牌和刷新令牌
	 *
	 * @param credentials - 登录凭证（邮箱和密码）
	 * @returns 包含访问令牌、刷新令牌和用户信息的响应
	 *
	 * @example
	 * ```bash
	 * POST /auth/login
	 * {
	 *   "email": "user@example.com",
	 *   "password": "password123"
	 * }
	 * ```
	 */
	@Post('login')
	@Public()
	@HttpCode(HttpStatus.OK)
	async login(@Body() credentials: LoginDto): Promise<LoginResponse> {
		return this.authService.login(credentials);
	}

	/**
	 * 用户注册
	 *
	 * 创建新用户账号并返回 JWT 访问令牌和刷新令牌
	 *
	 * @param credentials - 注册信息（邮箱、密码、姓名等）
	 * @returns 包含访问令牌、刷新令牌和用户信息的响应
	 *
	 * @example
	 * ```bash
	 * POST /auth/register
	 * {
	 *   "email": "user@example.com",
	 *   "password": "Password123!",
	 *   "firstName": "John",
	 *   "lastName": "Doe"
	 * }
	 * ```
	 */
	@Post('register')
	@Public()
	async register(@Body() credentials: RegisterDto): Promise<LoginResponse> {
		return this.authService.register(credentials);
	}

	/**
	 * 刷新令牌
	 *
	 * 使用刷新令牌获取新的访问令牌和刷新令牌
	 *
	 * @param credentials - 刷新令牌凭证
	 * @returns 包含新访问令牌和刷新令牌的响应
	 *
	 * @example
	 * ```bash
	 * POST /auth/refresh
	 * {
	 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
	 * }
	 * ```
	 */
	@Post('refresh')
	@Public()
	@HttpCode(HttpStatus.OK)
	async refresh(@Body() credentials: RefreshTokenDto): Promise<RefreshTokenResponse> {
		return this.authService.refreshToken(credentials);
	}

	/**
	 * 获取当前用户信息
	 *
	 * 根据访问令牌中的用户信息返回当前登录用户的详细信息
	 *
	 * @param req - HTTP 请求对象（包含 AuthGuard 解析的 user 信息）
	 * @returns 当前用户信息
	 *
	 * @example
	 * ```bash
	 * GET /auth/me
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Get('me')
	async me(@Request() req: unknown) {
		return (req as Record<string, unknown>).user;
	}

	/**
	 * 用户登出
	 *
	 * 清除用户的登录状态和令牌
	 *
	 * @param req - HTTP 请求对象
	 * @returns 登出成功的消息
	 *
	 * @example
	 * ```bash
	 * POST /auth/logout
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	async logout(@Request() req: any) {
		if (!req.user) {
			return { message: '成功退出登录' };
		}

		const authHeader = req.headers.authorization;
		let token: string | undefined;

		if (authHeader && authHeader.startsWith('Bearer ')) {
			token = authHeader.substring(7);
		}

		await this.authService.logout(req.user.id, token);
		return { message: '成功退出登录' };
	}

	/**
	 * 忘记密码
	 *
	 * 生成密码重置链接并发送邮件（待实现）
	 *
	 * @param credentials - 忘记凭证（邮箱）
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * POST /auth/forgot-password
	 * {
	 *   "email": "user@example.com"
	 * }
	 * ```
	 */
	@Post('forgot-password')
	@Public()
	async forgotPassword(@Body() credentials: ForgotPasswordDto) {
		await this.authService.forgotPassword(credentials);
	}

	/**
	 * 重置密码
	 *
	 * 验证密码重置令牌并设置新密码（待实现）
	 *
	 * @param credentials - 重置凭证（新密码和重置令牌）
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * POST /auth/reset-password
	 * {
	 *   "email": "user@example.com",
	 *   "token": "reset-token-123",
	 *   "newPassword": "NewPassword123!"
	 * }
	 * ```
	 */
	@Post('reset-password')
	@Public()
	async resetPassword(@Body() credentials: ResetPasswordDto) {
		await this.authService.resetPassword(credentials);
	}

	/**
	 * 验证邮箱
	 *
	 * 验证用户的邮箱地址
	 *
	 * @param credentials - 验证凭证（邮箱和验证令牌）
	 * @returns 验证结果（是否成功）
	 *
	 * @example
	 * ```bash
	 * POST /auth/verify-email
	 * {
	 *   "email": "user@example.com",
	 *   "token": "verify-token-123"
	 * }
	 * ```
	 */
	@Post('verify-email')
	@Public()
	async verifyEmail(@Body() credentials: VerifyEmailDto): Promise<VerifyEmailResponse> {
		return this.authService.verifyEmail(credentials);
	}
}
