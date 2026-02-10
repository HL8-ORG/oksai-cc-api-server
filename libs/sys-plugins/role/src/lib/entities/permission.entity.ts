import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, ManyToMany, ManyToOneOptions, OneToManyOptions, ManyToManyOptions, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 权限类型枚举
 */
export enum PermissionType {
	/** 组织权限 */
	ORGANIZATION = 'ORGANIZATION',
	/** 用户权限 */
	USER = 'USER',
	/** 角色权限 */
	ROLE = 'ROLE',
	/** 权限权限 */
	PERMISSION = 'PERMISSION'
}

/**
 * 权限操作枚举
 */
export enum PermissionAction {
	/** 查看权限 */
	VIEW = 'VIEW',
	/** 创建权限 */
	CREATE = 'CREATE',
	/** 编辑权限 */
	EDIT = 'EDIT',
	/** 删除权限 */
	DELETE = 'DELETE',
	/** 分配权限 */
	ASSIGN = 'ASSIGN',
	/** 撤销权限 */
	REVOKE = 'REVOKE'
}

/**
 * 权限实体
 *
 * 表示系统中的权限，用于细粒度的访问控制
 */
@Entity({ tableName: 'permissions' })
export class Permission extends BaseEntity {
	/** 权限名称 */
	@Property()
	name!: string;

	/** 权限类型 */
	@Enum(() => PermissionType)
	type!: PermissionType;

	/** 权限操作 */
	@Enum(() => PermissionAction)
	action!: PermissionAction;

	/** 权限描述 */
	@Property({ nullable: true, length: 1000 })
	description!: string;

	/** 所属租户 ID */
	@Property()
	tenantId!: string;

	/** 权限资源（如：user、tenant、organization 等） */
	@Property({ nullable: true })
	resource!: string;

	/** 是否启用（默认：true） */
	@Property({ default: true })
	isEnabled: boolean = true;
}
