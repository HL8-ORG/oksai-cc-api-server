import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

/**
 * 登录 DTO
 *
 * 用于用户登录的数据传输对象
 */
export class LoginDto {
	/** 用户邮箱 */
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	/** 用户密码（最少 8 位） */
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	password!: string;
}

/**
 * 注册 DTO
 *
 * 用于用户注册的数据传输对象
 */
export class RegisterDto {
	/** 用户邮箱 */
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	/** 用户密码（最少 8 位） */
	@IsString()
	@MinLength(8)
	password!: string;

	/** 用户名（2-50 位） */
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	firstName!: string;

	/** 用户姓（2-50 位） */
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	lastName!: string;

	/** 用户角色（可选：ADMIN、USER、GUEST） */
	@IsOptional()
	@IsString()
	role?: 'ADMIN' | 'USER' | 'GUEST';
}

/**
 * 刷新令牌 DTO
 *
 * 用于刷新访问令牌的数据传输对象
 */
export class RefreshTokenDto {
	/** 刷新令牌 */
	@IsString()
	@IsNotEmpty()
	refreshToken!: string;
}

/**
 * 忘记密码 DTO
 *
 * 用于请求密码重置的数据传输对象
 */
export class ForgotPasswordDto {
	/** 用户邮箱 */
	@IsEmail()
	@IsNotEmpty()
	email!: string;
}

/**
 * 重置密码 DTO
 *
 * 用于重置密码的数据传输对象
 */
export class ResetPasswordDto {
	/** 用户邮箱 */
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	/** 密码重置令牌 */
	@IsString()
	@IsNotEmpty()
	resetToken!: string;

	/** 新密码（8-50 位） */
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(50)
	newPassword!: string;
}

/**
 * 验证邮箱 DTO
 *
 * 用于验证用户邮箱的数据传输对象
 */
export class VerifyEmailDto {
	/** 验证令牌 */
	@IsString()
	@IsNotEmpty()
	verificationToken!: string;

	/** 用户邮箱 */
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	/** 验证码（6-10 位） */
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(10)
	verificationCode!: string;
}

/**
 * 修改密码 DTO
 *
 * 用于用户修改密码的数据传输对象
 */
export class ChangePasswordDto {
	/** 当前密码（OAuth 用户可选） */
	@IsOptional()
	@IsString()
	currentPassword?: string;

	/** 新密码（8-50 位） */
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(50)
	newPassword!: string;
}

/**
 * 绑定 OAuth 账号 DTO
 *
 * 用于绑定 OAuth 账号到已有账号的数据传输对象
 */
export class BindOAuthAccountDto {
	/** OAuth 提供者 */
	@IsString()
	@IsNotEmpty()
	provider!: string;

	/** OAuth 提供者的用户 ID */
	@IsString()
	@IsNotEmpty()
	providerId!: string;

	/** 是否设为主账号 */
	@IsOptional()
	@IsBoolean()
	isPrimary?: boolean;
}

/**
 * 解绑 OAuth 账号 DTO
 *
 * 用于解绑 OAuth 账号的数据传输对象
 */
export class UnbindOAuthAccountDto {
	/** OAuth 提供者 */
	@IsString()
	@IsNotEmpty()
	provider!: string;

	/** OAuth 提供者的用户 ID */
	@IsString()
	@IsNotEmpty()
	providerId!: string;
}

/**
 * 启用双因素认证 DTO
 *
 * 用于启用双因素认证的数据传输对象
 */
export class EnableTwoFactorAuthDto {
	/** 验证代码 */
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(6)
	code!: string;
}

/**
 * 禁用双因素认证 DTO
 *
 * 用于禁用双因素认证的数据传输对象
 */
export class DisableTwoFactorAuthDto {
	/** 当前密码 */
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	password!: string;
}

/**
 * 验证双因素认证 DTO
 *
 * 用于验证双因素认证的数据传输对象
 */
export class VerifyTwoFactorAuthDto {
	/** 验证代码 */
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(6)
	code!: string;
}
