import {
	IsString,
	IsOptional,
	IsEnum,
	IsEmail,
	IsBoolean,
	IsInt,
	Min,
	IsDateString,
	IsNotEmpty
} from 'class-validator';

/**
 * 创建租户 DTO
 *
 * 用于创建新租户的数据传输对象
 */
export class CreateTenantDto {
	/** 租户名称（非空） */
	@IsString()
	@IsNotEmpty()
	name!: string;

	/** 租户标识（非空，唯一） */
	@IsString()
	@IsNotEmpty()
	slug!: string;

	/** 租户 Logo URL（可选） */
	@IsOptional()
	@IsString()
	logo?: string;

	/** 租户网站地址（可选） */
	@IsOptional()
	@IsString()
	website?: string;

	/** 租户描述信息（可选） */
	@IsOptional()
	@IsString()
	description?: string;

	/** 租户状态（可选：ACTIVE、SUSPENDED、INACTIVE） */
	@IsOptional()
	@IsEnum(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
	status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

	/** 租户类型（可选：ORGANIZATION、INDIVIDUAL） */
	@IsOptional()
	@IsEnum(['ORGANIZATION', 'INDIVIDUAL'])
	type?: 'ORGANIZATION' | 'INDIVIDUAL';

	/** 试用结束日期（可选） */
	@IsOptional()
	@IsDateString()
	trialEndDate?: string;

	/** 订阅计划（可选） */
	@IsOptional()
	@IsString()
	subscriptionPlan?: string;

	/** 最大用户数（可选，最小 0） */
	@IsOptional()
	@IsInt()
	@Min(0)
	maxUsers?: number;

	/** 是否允许用户自行注册（可选） */
	@IsOptional()
	@IsBoolean()
	allowSelfRegistration?: boolean;

	/** 联系邮箱（可选） */
	@IsOptional()
	@IsEmail()
	contactEmail?: string;

	/** 联系电话（可选） */
	@IsOptional()
	@IsString()
	contactPhone?: string;

	/** 地址信息（可选） */
	@IsOptional()
	@IsString()
	address?: string;

	/** 城市信息（可选） */
	@IsOptional()
	@IsString()
	city?: string;

	/** 国家信息（可选） */
	@IsOptional()
	@IsString()
	country?: string;

	/** 语言设置（可选） */
	@IsOptional()
	@IsString()
	locale?: string;

	/** 时区设置（可选） */
	@IsOptional()
	@IsString()
	timezone?: string;
}

/**
 * 更新租户 DTO
 *
 * 用于更新租户信息的数据传输对象
 */
export class UpdateTenantDto {
	/** 租户名称（可选） */
	@IsOptional()
	@IsString()
	name?: string;

	/** 租户标识（可选） */
	@IsOptional()
	@IsString()
	slug?: string;

	/** 租户 Logo URL（可选） */
	@IsOptional()
	@IsString()
	logo?: string;

	/** 租户网站地址（可选） */
	@IsOptional()
	@IsString()
	website?: string;

	/** 租户描述信息（可选） */
	@IsOptional()
	@IsString()
	description?: string;

	/** 租户状态（可选） */
	@IsOptional()
	@IsEnum(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
	status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

	/** 租户类型（可选） */
	@IsOptional()
	@IsEnum(['ORGANIZATION', 'INDIVIDUAL'])
	type?: 'ORGANIZATION' | 'INDIVIDUAL';

	/** 试用结束日期（可选） */
	@IsOptional()
	@IsDateString()
	trialEndDate?: string;

	/** 订阅计划（可选） */
	@IsOptional()
	@IsString()
	subscriptionPlan?: string;

	/** 最大用户数（可选，最小 0） */
	@IsOptional()
	@IsInt()
	@Min(0)
	maxUsers?: number;

	/** 是否允许用户自行注册（可选） */
	@IsOptional()
	@IsBoolean()
	allowSelfRegistration?: boolean;

	/** 联系邮箱（可选） */
	@IsOptional()
	@IsEmail()
	contactEmail?: string;

	/** 联系电话（可选） */
	@IsOptional()
	@IsString()
	contactPhone?: string;

	/** 地址信息（可选） */
	@IsOptional()
	@IsString()
	address?: string;

	/** 城市信息（可选） */
	@IsOptional()
	@IsString()
	city?: string;

	/** 国家信息（可选） */
	@IsOptional()
	@IsString()
	country?: string;

	/** 语言设置（可选） */
	@IsOptional()
	@IsString()
	locale?: string;

	/** 时区设置（可选） */
	@IsOptional()
	@IsString()
	timezone?: string;
}

/**
 * 查询租户 DTO
 *
 * 用于查询租户列表的数据传输对象
 */
export class QueryTenantDto {
	/** 搜索关键词（可选，用于搜索名称和标识） */
	@IsOptional()
	@IsString()
	search?: string;

	/** 租户状态（可选） */
	@IsOptional()
	@IsEnum(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
	status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

	/** 租户类型（可选） */
	@IsOptional()
	@IsEnum(['ORGANIZATION', 'INDIVIDUAL'])
	type?: 'ORGANIZATION' | 'INDIVIDUAL';

	/** 订阅计划（可选） */
	@IsOptional()
	@IsString()
	subscriptionPlan?: string;
}
