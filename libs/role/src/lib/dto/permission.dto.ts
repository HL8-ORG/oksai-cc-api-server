import { IsNotEmpty, IsString, IsOptional, IsEnum as ClassValidatorEnum, MaxLength } from 'class-validator';
import { PermissionType, PermissionAction } from '../entities/permission.entity';

/**
 * 创建权限 DTO
 *
 * 用于创建新权限的数据传输对象
 */
export class CreatePermissionDto {
	/** 权限名称（非空，最多 100 位） */
	@IsNotEmpty()
	@IsString()
	@MaxLength(100)
	name!: string;

	/** 权限类型（非空） */
	@IsNotEmpty()
	@ClassValidatorEnum(PermissionType)
	type!: PermissionType;

	/** 权限操作（非空） */
	@IsNotEmpty()
	@ClassValidatorEnum(PermissionAction)
	action!: PermissionAction;

	/** 权限描述（可选，最多 1000 位） */
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	description?: string;

	/** 所属租户 ID（非空） */
	@IsNotEmpty()
	@IsString()
	tenantId!: string;

	/** 权限资源（可选，如：user、tenant、organization 等） */
	@IsOptional()
	@IsString()
	resource?: string;
}

/**
 * 更新权限 DTO
 *
 * 用于更新权限信息的数据传输对象
 */
export class UpdatePermissionDto {
	/** 权限名称（可选，最多 100 位） */
	@IsOptional()
	@IsString()
	@MaxLength(100)
	name?: string;

	/** 权限类型（可选） */
	@IsOptional()
	@ClassValidatorEnum(PermissionType)
	type?: PermissionType;

	/** 权限操作（可选） */
	@IsOptional()
	@ClassValidatorEnum(PermissionAction)
	action?: PermissionAction;

	/** 权限描述（可选，最多 1000 位） */
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	description?: string;

	/** 权限资源（可选） */
	@IsOptional()
	@IsString()
	resource?: string;

	/** 是否启用（可选） */
	@IsOptional()
	isEnabled?: boolean;
}

/**
 * 查询权限 DTO
 *
 * 用于查询权限列表的数据传输对象
 */
export class QueryPermissionDto {
	/** 搜索关键词（可选，用于搜索名称、描述） */
	@IsOptional()
	@IsString()
	search?: string;

	/** 权限类型（可选） */
	@IsOptional()
	@ClassValidatorEnum(PermissionType)
	type?: PermissionType;

	/** 权限操作（可选） */
	@IsOptional()
	@ClassValidatorEnum(PermissionAction)
	action?: PermissionAction;

	/** 权限资源（可选） */
	@IsOptional()
	@IsString()
	resource?: string;

	/** 是否启用（可选，字符串形式） */
	@IsOptional()
	@IsString()
	isEnabled?: string;

	/** 页码（可选） */
	@IsOptional()
	page?: number;

	/** 每页数量（可选） */
	@IsOptional()
	limit?: number;
}
