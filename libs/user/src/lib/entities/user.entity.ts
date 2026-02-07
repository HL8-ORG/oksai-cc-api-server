import {
	Entity,
	PrimaryKey,
	Property,
	ManyToOne,
	OneToMany,
	ManyToMany,
	ManyToOneOptions,
	OneToManyOptions,
	ManyToManyOptions,
	Enum,
	Index
} from '@mikro-orm/core';
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
 * 用户实体
 *
 * 表示系统中的用户，包含用户的基本信息、认证信息和偏好设置
 */
@Entity({ tableName: 'users' })
@Index({ name: 'idx_user_tenant', properties: ['tenantId'] })
@Index({ name: 'idx_user_tenant_email', properties: ['tenantId', 'email'] })
export class User extends BaseEntity {
	/** 用户邮箱（唯一） */
	@Property({ unique: true })
	email!: string;

	/** 用户密码（加密存储） */
	@Property()
	password!: string;

	/** 用户名 */
	@Property()
	firstName!: string;

	/** 用户姓 */
	@Property()
	lastName!: string;

	/** 用户角色（默认：USER） */
	@Property({ default: UserRole.USER })
	@Enum(() => UserRole)
	role: UserRole = UserRole.USER;

	/** 所属租户 ID */
	@Property()
	tenantId!: string;

	/** 是否活跃（默认：true） */
	@Property({ default: true })
	isActive: boolean = true;

	/** 邮箱验证时间 */
	@Property({ nullable: true })
	emailVerifiedAt?: Date;

	/** 头像 URL */
	@Property({ nullable: true })
	avatar?: string;

	/** 电话号码 */
	@Property({ nullable: true })
	phoneNumber?: string;

	/** 时区设置 */
	@Property({ nullable: true })
	timezone?: string;

	/** 语言设置 */
	@Property({ nullable: true })
	locale?: string;

	/** 偏好语言 */
	@Property({ nullable: true })
	preferredLanguage?: string;

	/** 最后登录时间 */
	@Property({ defaultRaw: 'now()' })
	lastLoginAt?: Date;

	/** 登录次数（默认：0） */
	@Property({ default: 0 })
	loginCount: number = 0;
}
