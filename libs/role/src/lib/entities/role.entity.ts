import { Entity, Property, Enum, ManyToMany, Collection, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';
import { Permission } from './permission.entity';

/**
 * 角色类型枚举
 */
export enum RoleType {
	/** 管理员角色 */
	ADMIN = 'ADMIN',
	/** 经理角色 */
	MANAGER = 'MANAGER',
	/** 普通用户角色 */
	USER = 'USER',
	/** 访客角色 */
	GUEST = 'GUEST'
}

/**
 * 角色实体
 *
 * 表示系统中的角色，用于权限管理和访问控制
 */
@Entity({ tableName: 'roles' })
@Index({ name: 'idx_role_tenant', properties: ['tenantId'] })
@Index({ name: 'idx_role_enabled', properties: ['isEnabled'] })
@Index({ name: 'idx_role_tenant_enabled', properties: ['tenantId', 'isEnabled'] })
export class Role extends BaseEntity {
	/** 角色名称 */
	@Property()
	name!: string;

	/** 角色标识（唯一，用于查询和权限判断） */
	@Property({ unique: true })
	slug!: string;

	/** 角色类型（默认：USER） */
	@Enum(() => RoleType)
	type: RoleType = RoleType.USER;

	/** 角色描述 */
	@Property({ nullable: true, length: 1000 })
	description!: string;

	/** 所属租户 ID */
	@Property()
	tenantId!: string;

	/** 是否启用（默认：true） */
	@Property({ default: true })
	isEnabled: boolean = true;

	/** 角色关联的权限列表 */
	@ManyToMany(() => Permission, undefined, { name: 'role_permissions' })
	permissions?: Collection<Permission>;
}
