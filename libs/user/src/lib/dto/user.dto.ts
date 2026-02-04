import {
	IsString,
	IsOptional,
	IsEmail,
	IsEnum,
	IsBoolean,
	IsDateString,
	MinLength,
	MaxLength,
	IsInt,
	Min
} from 'class-validator';

/**
 * 创建用户 DTO
 *
 * 用于创建新用户的数据传输对象
 */
export class CreateUserDto {
	/** 用户邮箱 */
	@IsEmail()
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
	@IsEnum(['ADMIN', 'USER', 'GUEST'])
	role?: 'ADMIN' | 'USER' | 'GUEST';

	/** 所属租户 ID */
	@IsString()
	tenantId!: string;

	/** 是否活跃（可选） */
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	/** 头像 URL（可选） */
	@IsOptional()
	@IsString()
	avatar?: string;

	/** 电话号码（可选） */
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	/** 时区设置（可选） */
	@IsOptional()
	@IsString()
	timezone?: string;

	/** 语言设置（可选） */
	@IsOptional()
	@IsString()
	locale?: string;

	/** 偏好语言（可选） */
	@IsOptional()
	@IsString()
	preferredLanguage?: string;
}

/**
 * 更新用户 DTO
 *
 * 用于更新用户信息的数据传输对象
 */
export class UpdateUserDto {
	/** 用户邮箱（可选） */
	@IsOptional()
	@IsEmail()
	email?: string;

	/** 用户密码（可选，最少 8 位） */
	@IsOptional()
	@IsString()
	@MinLength(8)
	password?: string;

	/** 用户名（可选，2-50 位） */
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	firstName?: string;

	/** 用户姓（可选，2-50 位） */
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	lastName?: string;

	/** 用户角色（可选） */
	@IsOptional()
	@IsEnum(['ADMIN', 'USER', 'GUEST'])
	role?: 'ADMIN' | 'USER' | 'GUEST';

	/** 是否活跃（可选） */
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	/** 头像 URL（可选） */
	@IsOptional()
	@IsString()
	avatar?: string;

	/** 电话号码（可选） */
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	/** 时区设置（可选） */
	@IsOptional()
	@IsString()
	timezone?: string;

	/** 语言设置（可选） */
	@IsOptional()
	@IsString()
	locale?: string;

	/** 偏好语言（可选） */
	@IsOptional()
	@IsString()
	preferredLanguage?: string;
}

/**
 * 查询用户 DTO
 *
 * 用于查询用户列表的数据传输对象
 */
export class QueryUserDto {
	/** 搜索关键词（可选，用于搜索邮箱、姓名） */
	@IsOptional()
	@IsString()
	search?: string;

	/** 用户角色（可选） */
	@IsOptional()
	@IsEnum(['ADMIN', 'USER', 'GUEST'])
	role?: 'ADMIN' | 'USER' | 'GUEST';

	/** 是否活跃（可选） */
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	/** 租户 ID（可选） */
	@IsOptional()
	@IsString()
	tenantId?: string;

	/** 页码（可选，最小 1） */
	@IsOptional()
	@IsInt()
	@Min(1)
	page?: number;

	/** 每页数量（可选，最小 1） */
	@IsOptional()
	@IsInt()
	@Min(1)
	limit?: number;
}

/**
 * 更新头像 DTO
 *
 * 用于更新用户头像的数据传输对象
 */
export class UpdateAvatarDto {
	/** 头像 URL */
	@IsString()
	avatar!: string;
}

/**
 * 更新密码 DTO
 *
 * 用于更新用户密码的数据传输对象
 */
export class UpdatePasswordDto {
	/** 当前密码 */
	@IsString()
	currentPassword!: string;

	/** 新密码（最少 8 位） */
	@IsString()
	@MinLength(8)
	newPassword!: string;
}
