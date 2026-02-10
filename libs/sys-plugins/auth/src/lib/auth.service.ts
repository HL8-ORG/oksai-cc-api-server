import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, wrap, EntityManager } from '@mikro-orm/core';
import { User, UserRole } from './entities/user.entity';
import { OAuthAccount, OAuthProvider } from './entities/oauth-account.entity';
import {
	LoginDto,
	RegisterDto,
	RefreshTokenDto,
	ForgotPasswordDto,
	ResetPasswordDto,
	VerifyEmailDto,
	ChangePasswordDto,
	BindOAuthAccountDto,
	UnbindOAuthAccountDto
} from './dto/index';
import { LoginResponse, RefreshTokenResponse, VerifyEmailResponse } from './interfaces/index';
import {
	hashPassword,
	verifyPassword,
	validatePasswordStrength,
	JwtPayload,
	getJwtUtils,
	MailQueueService,
	TemplateEngineService,
	JwtBlacklistService
} from '@oksai/core';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>,
		@InjectRepository(OAuthAccount)
		private readonly oauthAccountRepo: EntityRepository<OAuthAccount>,
		private readonly mailQueueService: MailQueueService,
		private readonly templateEngine: TemplateEngineService,
		private readonly jwtBlacklistService: JwtBlacklistService
	) {}

	private get em(): EntityManager {
		return this.userRepo.getEntityManager();
	}

	/**
	 * 用户登录
	 *
	 * 验证用户凭证并生成 JWT 访问令牌和刷新令牌
	 *
	 * @param credentials - 登录凭证（邮箱和密码）
	 * @returns 包含访问令牌、刷新令牌和用户信息的响应
	 * @throws UnauthorizedException 当凭证无效时
	 * @throws BadRequestException 当密码错误时
	 *
	 * @example
	 * ```typescript
	 * const result = await authService.login({
	 *   email: 'user@example.com',
	 *   password: 'password123'
	 * });
	 * ```
	 */
	async login(credentials: LoginDto): Promise<LoginResponse> {
		const user = await this.userRepo.findOne({ email: credentials.email });

		if (!user) {
			throw new UnauthorizedException('用户名或密码错误');
		}

		const isValidPassword = await verifyPassword(credentials.password, user.password);

		if (!isValidPassword) {
			throw new UnauthorizedException('用户名或密码错误');
		}

		const jwtUtils = getJwtUtils();
		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			tenantId: user.tenantId,
			role: user.role || UserRole.USER
		};

		const tokens = jwtUtils.generateTokenPair(payload);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				tenantId: user.tenantId,
				role: user.role || UserRole.USER
			}
		};
	}

	/**
	 * 用户注册
	 *
	 * 创建新用户账号并生成 JWT 访问令牌和刷新令牌
	 *
	 * @param credentials - 注册信息（邮箱、密码、姓名等）
	 * @returns 包含访问令牌、刷新令牌和用户信息的响应
	 * @throws BadRequestException 当密码强度不足时
	 * @throws ConflictException 当邮箱已被注册时
	 *
	 * @example
	 * ```typescript
	 * const result = await authService.register({
	 *   email: 'user@example.com',
	 *   password: 'Password123!',
	 *   firstName: 'John',
	 *   lastName: 'Doe'
	 * });
	 * ```
	 */
	async register(credentials: RegisterDto): Promise<LoginResponse> {
		const passwordValidation = validatePasswordStrength(credentials.password);

		if (!passwordValidation.valid) {
			throw new BadRequestException(passwordValidation.errors.join(', '));
		}

		const existingUser = await this.userRepo.findOne({ email: credentials.email });

		if (existingUser) {
			throw new ConflictException('此邮箱已被注册');
		}

		const hashedPassword = await hashPassword(credentials.password);

		const user = this.userRepo.create({
			email: credentials.email,
			password: hashedPassword,
			firstName: credentials.firstName,
			lastName: credentials.lastName,
			role: credentials.role ? UserRole[credentials.role] : UserRole.USER,
			isActive: true,
			tenantId: 'default',
			createdAt: new Date(),
			updatedAt: new Date()
		});

		this.em.persist(user);
		await this.em.flush();

		this.logger.log(`新用户注册成功: ${credentials.email}`);

		try {
			const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:4200';
			const loginUrl = `${clientBaseUrl}/login`;
			const userName = `${user.firstName} ${user.lastName}`;

			const html = this.templateEngine.renderWelcomeEmail(userName, loginUrl);

			await this.mailQueueService.add({
				to: credentials.email,
				subject: '欢迎加入 OKSAI 平台',
				html,
				text: `亲爱的 ${userName}，\n\n感谢您注册 OKSAI 平台！我们很高兴您加入我们的社区。\n\n点击以下链接开始您的体验：\n\n${loginUrl}\n\n祝您使用愉快！`
			});
		} catch (error) {
			this.logger.error(`添加欢迎邮件到队列失败: ${credentials.email}`, error);
		}

		const jwtUtils = getJwtUtils();
		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			tenantId: user.tenantId,
			role: user.role || UserRole.USER
		};

		const tokens = jwtUtils.generateTokenPair(payload);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				tenantId: user.tenantId,
				role: user.role || UserRole.USER
			}
		};
	}

	/**
	 * 刷新 Token
	 *
	 * 验证刷新令牌的有效性并生成新的访问令牌
	 *
	 * @param credentials 刷新令牌验证凭证
	 * @returns 包含新访问令牌和刷新令牌的响应
	 * @throws UnauthorizedException 当刷新令牌无效或过期时
	 * @throws BadRequestException 当刷新令牌缺失时
	 *
	 * @example
	 * ```typescript
	 * const result = await authService.refreshToken({
	 *   refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
	 * });
	 * ```
	 */
	async refreshToken(credentials: RefreshTokenDto): Promise<RefreshTokenResponse> {
		const jwtUtils = getJwtUtils();

		let payload: JwtPayload;

		try {
			payload = jwtUtils.verifyRefreshToken(credentials.refreshToken);
		} catch (error) {
			throw new UnauthorizedException('无效的刷新令牌');
		}

		if (this.jwtBlacklistService.isAvailable()) {
			const isBlacklisted = await this.jwtBlacklistService.isBlacklisted(credentials.refreshToken);
			if (isBlacklisted) {
				throw new UnauthorizedException('刷新令牌已失效，请重新登录');
			}
		}

		const user = await this.userRepo.findOne({ id: payload.sub });

		if (!user) {
			throw new UnauthorizedException('未找到该用户');
		}

		const newPayload: JwtPayload = {
			sub: user.id,
			email: user.email,
			tenantId: user.tenantId,
			role: user.role || UserRole.USER
		};

		const tokens = jwtUtils.generateTokenPair(newPayload);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken
		};
	}

	/**
	 * 登出
	 *
	 * 清除用户的登录状态和令牌
	 *
	 * @param userId 用户 ID
	 * @param token JWT 令牌（可选）
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```typescript
	 * await authService.logout('user-123', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
	 * ```
	 */
	async logout(userId: string, token?: string): Promise<void> {
		this.logger.log(`用户 ${userId} 请求登出`);

		if (token && this.jwtBlacklistService.isAvailable()) {
			try {
				const jwtUtils = getJwtUtils();
				const payload = jwtUtils.verifyAccessToken(token);

				const expiresIn = Math.floor(payload.exp - Date.now() / 1000);

				if (expiresIn > 0) {
					await this.jwtBlacklistService.add(token, expiresIn);
					this.logger.log(`令牌已加入黑名单，有效期：${expiresIn} 秒`);
				}
			} catch (error) {
				this.logger.warn('令牌验证失败，无法加入黑名单', error.message);
			}
		}
	}

	/**
	 * 忘记密码
	 *
	 * 生成密码重置令牌并发送邮件
	 *
	 * @param credentials 忘记凭证（邮箱）
	 * @returns Promise<void> 无返回值
	 * @throws BadRequestException 当邮箱不存在时
	 *
	 * @example
	 * ```typescript
	 * await authService.forgotPassword({ email: 'user@example.com' });
	 * ```
	 */
	async forgotPassword(credentials: ForgotPasswordDto): Promise<void> {
		const user = await this.userRepo.findOne({ email: credentials.email });

		if (!user) {
			throw new BadRequestException('未找到该邮箱对应的用户');
		}

		const { randomBytes } = await import('crypto');
		const resetToken = randomBytes(32).toString('hex');
		const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

		user.resetToken = resetToken;
		user.resetTokenExpiresAt = resetTokenExpiresAt;

		this.em.persist(user);
		await this.em.flush();

		this.logger.log(`用户 ${credentials.email} 请求密码重置`);

		try {
			const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:4200';
			const resetUrl = `${clientBaseUrl}/reset-password?token=${resetToken}&email=${credentials.email}`;
			const userName = `${user.firstName} ${user.lastName}`;

			const html = this.templateEngine.renderResetPasswordEmail(resetUrl, userName, 1);

			await this.mailQueueService.add({
				to: credentials.email,
				subject: '密码重置',
				html,
				text: `尊敬的 ${userName}，\n\n我们收到了您的密码重置请求。如果这是您本人操作，请点击以下链接重置密码：\n\n${resetUrl}\n\n此链接将在 1 小时后失效。如果您没有请求密码重置，请忽略此邮件。\n\n感谢您使用 OKSAI 平台！`
			});
		} catch (error) {
			this.logger.error(`添加密码重置邮件到队列失败: ${credentials.email}`, error);
			throw new BadRequestException('发送密码重置邮件失败，请稍后重试');
		}
	}

	/**
	 * 重置密码
	 *
	 * 验证密码重置令牌并设置新密码
	 *
	 * @param credentials 重置凭证（新密码和重置令牌）
	 * @returns Promise<void> 无返回值
	 * @throws BadRequestException 当令牌无效或新密码不符合要求时
	 * @throws UnauthorizedException 当令牌过期时
	 *
	 * @example
	 * ```typescript
	 * await authService.resetPassword({
	 *   email: 'user@example.com',
	 *   token: 'reset-token-123',
	 *   newPassword: 'NewPassword123!'
	 * });
	 * ```
	 */
	async resetPassword(credentials: ResetPasswordDto): Promise<void> {
		// 查找用户
		const user = await this.userRepo.findOne({ email: credentials.email });

		if (!user) {
			throw new BadRequestException('未找到该邮箱对应的用户');
		}

		// 验证重置令牌
		if (user.resetToken !== credentials.resetToken) {
			throw new BadRequestException('无效的重置令牌');
		}

		// 验证令牌是否过期
		if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
			throw new BadRequestException('重置令牌已过期');
		}

		// 验证新密码强度
		const passwordValidation = validatePasswordStrength(credentials.newPassword);
		if (!passwordValidation.valid) {
			throw new BadRequestException(passwordValidation.errors.join(', '));
		}

		// 加密新密码
		const hashedPassword = await hashPassword(credentials.newPassword);
		user.password = hashedPassword;

		// 清除重置令牌
		user.resetToken = undefined;
		user.resetTokenExpiresAt = undefined;

		this.em.persist(user);
		await this.em.flush();
	}

	/**
	 * 验证邮箱
	 *
	 * 验证用户的邮箱地址
	 *
	 * @param credentials 验证凭证（邮箱和验证令牌）
	 * @returns 验证结果（是否成功）
	 *
	 * @throws BadRequestException 当邮箱格式无效时
	 * @throws UnauthorizedException 当验证令牌过期时
	 *
	 * @example
	 * ```typescript
	 * const result = await authService.verifyEmail({
	 *   email: 'user@example.com',
	 *   token: 'verify-token-123'
	 * });
	 * if (result.success) {
	 *   console.log('邮箱验证成功');
	 * }
	 * ```
	 */
	async verifyEmail(credentials: VerifyEmailDto): Promise<VerifyEmailResponse> {
		const user = await this.userRepo.findOne({ email: credentials.email });

		if (!user) {
			return { success: false };
		}

		if (user.verificationToken !== credentials.verificationToken) {
			throw new BadRequestException('验证令牌无效');
		}

		if (user.verificationCode !== credentials.verificationCode) {
			throw new BadRequestException('验证码无效');
		}

		if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
			throw new BadRequestException('验证码已过期');
		}

		user.emailVerifiedAt = new Date();
		user.verificationToken = undefined;
		user.verificationCode = undefined;
		user.verificationCodeExpiresAt = undefined;

		this.em.persist(user);
		await this.em.flush();

		return { success: true };
	}

	/**
	 * 修改密码
	 *
	 * 允许 OAuth 用户和普通用户修改密码
	 * OAuth 用户不需要提供当前密码，普通用户需要验证当前密码
	 *
	 * @param userId - 用户 ID
	 * @param credentials - 修改密码凭证
	 * @returns Promise<void> 无返回值
	 * @throws BadRequestException 当用户不存在或密码不符合要求时
	 * @throws UnauthorizedException 当当前密码错误时（普通用户）
	 *
	 * @example
	 * ```typescript
	 * // OAuth 用户修改密码
	 * await authService.changePassword('user123', { newPassword: 'NewSecurePass456!' });
	 *
	 * // 普通用户修改密码
	 * await authService.changePassword('user456', {
	 *   currentPassword: 'OldPassword123',
	 *   newPassword: 'NewSecurePass456!'
	 * });
	 * ```
	 */
	async changePassword(userId: string, credentials: ChangePasswordDto): Promise<void> {
		const user = await this.userRepo.findOne({ id: userId });

		if (!user) {
			throw new UnauthorizedException('未找到该用户');
		}

		// 验证新密码强度
		const passwordValidation = validatePasswordStrength(credentials.newPassword);
		if (!passwordValidation.valid) {
			throw new BadRequestException(passwordValidation.errors.join(', '));
		}

		// OAuth 用户不需要验证当前密码
		if (user.requirePasswordSetup) {
			user.requirePasswordSetup = false;
		} else {
			// 普通用户需要验证当前密码
			if (!credentials.currentPassword) {
				throw new BadRequestException('请提供当前密码');
			}

			const isValidPassword = await verifyPassword(credentials.currentPassword, user.password);
			if (!isValidPassword) {
				throw new BadRequestException('当前密码错误');
			}
		}

		// 加密并设置新密码
		const hashedPassword = await hashPassword(credentials.newPassword);
		user.password = hashedPassword;
		user.updatedAt = new Date();

		this.em.persist(user);
		await this.em.flush();

		this.logger.log(`用户 ${userId} 密码修改成功`);
	}

	/**
	 * 绑定 OAuth 账号
	 *
	 * 将 OAuth 提供者的账号绑定到已有账号
	 *
	 * @param userId - 用户 ID
	 * @param credentials - 绑定凭证（提供者、提供者用户 ID、是否主账号）
	 * @returns Promise<void> 无返回值
	 * @throws BadRequestException 当用户不存在或该 OAuth 账号已被绑定时
	 *
	 * @example
	 * ```typescript
	 * await authService.bindOAuthAccount('user123', {
	 *   provider: 'github',
	 *   providerId: 'github123',
	 *   isPrimary: true
	 * });
	 * ```
	 */
	async bindOAuthAccount(userId: string, credentials: BindOAuthAccountDto): Promise<void> {
		const user = await this.userRepo.findOne({ id: userId });

		if (!user) {
			throw new BadRequestException('未找到该用户');
		}

		// 验证并转换 OAuth 提供者
		const provider = credentials.provider.toUpperCase() as keyof typeof OAuthProvider;
		if (!OAuthProvider[provider]) {
			throw new BadRequestException(`不支持的 OAuth 提供者：${credentials.provider}`);
		}

		// 检查该 OAuth 账号是否已被其他用户绑定
		const existingAccount = await this.oauthAccountRepo.findOne({
			provider: OAuthProvider[provider],
			providerId: credentials.providerId
		});

		if (existingAccount) {
			throw new BadRequestException('该 OAuth 账号已被绑定');
		}

		// 如果设置为主账号，将其他账号的主账号状态取消
		if (credentials.isPrimary) {
			await this.oauthAccountRepo.nativeUpdate({ userId, isPrimary: true }, { isPrimary: false });
		}

		const oauthAccount = this.oauthAccountRepo.create({
			userId,
			provider: OAuthProvider[provider],
			providerId: credentials.providerId,
			isPrimary: credentials.isPrimary || false
		});

		this.em.persist(oauthAccount);
		await this.em.flush();

		this.logger.log(`用户 ${userId} 成功绑定 ${credentials.provider} 账号`);
	}

	/**
	 * 解绑 OAuth 账号
	 *
	 * 解绑用户的 OAuth 提供者账号
	 *
	 * @param userId - 用户 ID
	 * @param credentials - 解绑凭证（提供者、提供者用户 ID）
	 * @returns Promise<void> 无返回值
	 * @throws BadRequestException 当用户不存在、OAuth 账号不存在或无法解绑时
	 *
	 * @example
	 * ```typescript
	 * await authService.unbindOAuthAccount('user123', {
	 *   provider: 'github',
	 *   providerId: 'github123'
	 * });
	 * ```
	 */
	async unbindOAuthAccount(userId: string, credentials: UnbindOAuthAccountDto): Promise<void> {
		const user = await this.userRepo.findOne({ id: userId });

		if (!user) {
			throw new BadRequestException('未找到该用户');
		}

		// 验证并转换 OAuth 提供者
		const provider = credentials.provider.toUpperCase() as keyof typeof OAuthProvider;
		if (!OAuthProvider[provider]) {
			throw new BadRequestException(`不支持的 OAuth 提供者：${credentials.provider}`);
		}

		// 查找要解绑的 OAuth 账号
		const oauthAccount = await this.oauthAccountRepo.findOne({
			userId,
			provider: OAuthProvider[provider],
			providerId: credentials.providerId
		});

		if (!oauthAccount) {
			throw new BadRequestException('未找到要解绑的 OAuth 账号');
		}

		// 检查用户是否有密码，如果没有则不允许解绑主账号
		if (oauthAccount.isPrimary && user.requirePasswordSetup) {
			throw new BadRequestException('请先设置密码后再解绑主账号');
		}

		this.em.remove(oauthAccount);
		await this.em.flush();

		this.logger.log(`用户 ${userId} 成功解绑 ${credentials.provider} 账号`);
	}

	/**
	 * 获取用户的 OAuth 账号列表
	 *
	 * @param userId - 用户 ID
	 * @returns OAuth 账号列表
	 *
	 * @example
	 * ```typescript
	 * const accounts = await authService.getOAuthAccounts('user123');
	 * console.log(accounts); // [{ id, provider, providerId, ... }, ...]
	 * ```
	 */
	async getOAuthAccounts(userId: string): Promise<OAuthAccount[]> {
		const accounts = await this.oauthAccountRepo.find({ userId });
		return accounts;
	}
}
