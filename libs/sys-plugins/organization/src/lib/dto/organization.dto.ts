import { IsNotEmpty, IsString, IsOptional, IsEnum, MaxLength, IsEmail, IsUrl } from 'class-validator';
import { OrganizationStatus } from '../entities/organization.entity';

/**
 * 创建组织 DTO
 *
 * 用于创建新组织的数据传输对象
 */
export class CreateOrganizationDto {
	/** 组织名称（非空，最多 100 位） */
	@IsNotEmpty()
	@IsString()
	@MaxLength(100)
	name!: string;

	/** 组织标识（非空，最多 100 位） */
	@IsNotEmpty()
	@IsString()
	@MaxLength(100)
	slug!: string;

	/** 组织 Logo URL（可选，最多 500 位） */
	@IsOptional()
	@IsString()
	@MaxLength(500)
	logo?: string;

	/** 组织网站地址（可选，最多 5000 位） */
	@IsOptional()
	@IsString()
	@MaxLength(5000)
	website?: string;

	/** 组织电话号码（可选） */
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	/** 组织邮箱（可选） */
	@IsOptional()
	@IsEmail()
	email?: string;

	/** 货币代码（可选，最多 20 位） */
	@IsOptional()
	@IsString()
	@MaxLength(20)
	currency?: string;

	/** 时区设置（可选，最多 50 位） */
	@IsOptional()
	@IsString()
	@MaxLength(50)
	timeZone?: string;

	/** 组织地址（可选） */
	@IsOptional()
	@IsString()
	address?: string;

	/** 组织所在城市（可选） */
	@IsOptional()
	@IsString()
	city?: string;

	/** 组织所在国家（可选） */
	@IsOptional()
	@IsString()
	country?: string;

	/** 邮政编码（可选，最多 10 位） */
	@IsOptional()
	@IsString()
	@MaxLength(10)
	postalCode?: string;

	/** 组织描述信息（可选，最多 5000 位） */
	@IsOptional()
	@IsString()
	@MaxLength(5000)
	description?: string;

	/** 组织状态（可选） */
	@IsOptional()
	@IsEnum(OrganizationStatus)
	status?: OrganizationStatus;

	/** 所属租户 ID（可选） */
	@IsOptional()
	@IsString()
	tenantId?: string;
}

/**
 * 更新组织 DTO
 *
 * 用于更新组织信息的数据传输对象
 */
export class UpdateOrganizationDto {
	/** 组织 ID（可选） */
	@IsOptional()
	@IsString()
	id?: string;

	/** 组织名称（可选，最多 100 位） */
	@IsOptional()
	@IsString()
	@MaxLength(100)
	name?: string;

	/** 组织标识（可选，最多 100 位） */
	@IsOptional()
	@IsString()
	@MaxLength(100)
	slug?: string;

	/** 组织 Logo URL（可选，最多 500 位） */
	@IsOptional()
	@IsString()
	@MaxLength(500)
	logo?: string;

	/** 组织网站地址（可选，最多 5000 位） */
	@IsOptional()
	@IsString()
	@MaxLength(5000)
	website?: string;

	/** 组织电话号码（可选） */
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	/** 组织邮箱（可选） */
	@IsOptional()
	@IsEmail()
	email?: string;

	/** 货币代码（可选，最多 20 位） */
	@IsOptional()
	@IsString()
	@MaxLength(20)
	currency?: string;

	/** 时区设置（可选，最多 50 位） */
	@IsOptional()
	@IsString()
	@MaxLength(50)
	timeZone?: string;

	/** 组织地址（可选） */
	@IsOptional()
	@IsString()
	address?: string;

	/** 组织所在城市（可选） */
	@IsOptional()
	@IsString()
	city?: string;

	/** 组织所在国家（可选） */
	@IsOptional()
	@IsString()
	country?: string;

	/** 邮政编码（可选，最多 10 位） */
	@IsOptional()
	@IsString()
	@MaxLength(10)
	postalCode?: string;

	/** 组织描述信息（可选，最多 5000 位） */
	@IsOptional()
	@IsString()
	@MaxLength(5000)
	description?: string;

	/** 组织状态（可选） */
	@IsOptional()
	@IsEnum(OrganizationStatus)
	status?: OrganizationStatus;
}

/**
 * 查询组织 DTO
 *
 * 用于查询组织列表的数据传输对象
 */
export class QueryOrganizationDto {
	/** 搜索关键词（可选，用于搜索名称和标识） */
	@IsOptional()
	@IsString()
	search?: string;

	/** 组织状态（可选） */
	@IsOptional()
	@IsEnum(OrganizationStatus)
	status?: OrganizationStatus;

	/** 租户 ID（可选） */
	@IsOptional()
	@IsString()
	tenantId?: string;

	/** 页码（可选） */
	@IsOptional()
	page?: number;

	/** 每页数量（可选） */
	@IsOptional()
	limit?: number;
}
