import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { BaseEntity } from '@oksai/core';

/**
 * 用户角色枚举
 */
export enum UserRole {
	/** 管理员 */
	ADMIN = 'ADMIN',
	/** 普通用户 */
	USER = 'USER',
	/** 访客 */
	GUEST = 'GUEST'
}

/**
 * 认证用户实体
 *
 * 表示认证模块中的用户，用于用户认证和授权
 */
@Entity()
export class User extends BaseEntity {
	/** 主键 ID */
	@PrimaryKey()
	id: string = randomUUID();

	/** 用户邮箱（唯一且非空） */
	@Property({ unique: true, nullable: false })
	email!: string;

	/** 用户密码（加密存储，非空） */
	@Property({ nullable: false })
	password!: string;

	/** 用户名（非空） */
	@Property({ nullable: false })
	firstName!: string;

	/** 用户姓（非空） */
	@Property({ nullable: false })
	lastName!: string;

	/** 用户角色（可选） */
	@Property({ nullable: true })
	role?: UserRole;

	/** 是否活跃（默认：true） */
	@Property({ default: true })
	isActive: boolean = true;

	/** 所属租户 ID（默认：default） */
	@Property({ nullable: false, default: 'default' })
	tenantId!: string;

	/** 邮箱验证时间 */
	@Property({ nullable: true })
	emailVerifiedAt?: Date;

	/** 密码重置令牌 */
	@Property({ nullable: true })
	resetToken?: string;

	/** 密码重置令牌过期时间 */
	@Property({ nullable: true })
	resetTokenExpiresAt?: Date;
}
