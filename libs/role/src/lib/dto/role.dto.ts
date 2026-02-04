import { IsNotEmpty, IsString, IsOptional, IsEnum, MaxLength, IsArray } from 'class-validator';
import { RoleType } from '../entities/role.entity';
import { PermissionAction } from '../entities/permission.entity';

/**
 * 创建角色 DTO
 *
 * 用于创建新角色的数据传输对象
 */
export class CreateRoleDto {
	/** 角色名称（非空，最多 100 位） */
	@IsNotEmpty()
	@IsString()
	@MaxLength(100)
	name!: string;

	/** 角色标识（非空，最多 100 位） */
	@IsNotEmpty()
	@IsString()
	@MaxLength(100)
	slug!: string;

	/** 角色描述（非空，最多 1000 位） */
	@IsNotEmpty()
	@IsString()
	@MaxLength(1000)
	description!: string;

	/** 角色类型（非空） */
	@IsNotEmpty()
	@IsEnum(RoleType)
	type!: RoleType;

	/** 权限 ID 列表（可选） */
	@IsOptional()
	@IsArray()
	permissionIds!: string[];
}

/**
 * 更新角色 DTO
 *
 * 用于更新角色信息的数据传输对象
 */
export class UpdateRoleDto {
	/** 角色名称（可选，最多 100 位） */
	@IsNotEmpty()
	@IsString()
	@MaxLength(100)
	name!: string;

	/** 角色标识（可选，最多 100 位） */
	@IsOptional()
	@IsString()
	@MaxLength(100)
	slug!: string;

	/** 角色描述（可选，最多 1000 位） */
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	description!: string;

	/** 角色类型（可选） */
	@IsOptional()
	@IsEnum(RoleType)
	type?: RoleType;
}

/**
 * 分配权限 DTO
 *
 * 用于为角色分配权限的数据传输对象
 */
export class AssignPermissionsDto {
	/** 权限 ID 列表（非空） */
	@IsNotEmpty()
	@IsArray()
	permissionIds!: string[];
}

/**
 * 撤销权限 DTO
 *
 * 用于撤销角色权限的数据传输对象
 */
export class RevokePermissionsDto {
	/** 权限 ID 列表（非空） */
	@IsNotEmpty()
	@IsArray()
	permissionIds!: string[];
}

/**
 * 查询角色 DTO
 *
 * 用于查询角色列表的数据传输对象
 */
export class QueryRoleDto {
	/** 搜索关键词（可选，用于搜索名称、标识、描述） */
	@IsOptional()
	@IsString()
	search?: string;

	/** 角色类型（可选） */
	@IsOptional()
	@IsEnum(RoleType)
	type?: RoleType;

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
