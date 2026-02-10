import { Entity, ManyToOne, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 邀请状态枚举
 */
export enum InviteStatus {
	/** 已邀请 */
	ACCEPTED = 'ACCEPTED',
	/** 已拒绝 */
	REJECTED = 'REJECTED',
	/** 已接受 */
	INVITED = 'INVITED',
	/** 已过期 */
	EXPIRED = 'EXPIRED'
}

/**
 * 邀请实体
 *
 * 用于管理用户邀请加入租户和组织
 */
@Entity({ tableName: 'invites' })
export class Invite extends BaseEntity {
	/**
	 * 租户 ID
	 */
	@Index()
	tenantId?: string;

	/**
	 * 组织 ID
	 */
	@Index()
	organizationId?: string;

	/**
	 * 邀请邮箱（唯一）
	 */
	@Property({ unique: true })
	email!: string;

	/**
	 * 邀请全名
	 */
	@Property({ nullable: true })
	fullName?: string;

	/**
	 * 邀请令牌（唯一）
	 */
	@Property({ unique: true })
	token!: string;

	/**
	 * 邀请状态
	 */
	@Property({ default: InviteStatus.INVITED })
	status: InviteStatus = InviteStatus.INVITED;

	/**
	 * 过期时间
	 */
	@Property()
	expireDate: Date = new Date();

	/**
	 * 操作时间
	 */
	@Property({ nullable: true })
	actionDate?: Date;

	/**
	 * 验证码
	 */
	@Property({ nullable: true })
	code?: string;

	/**
	 * 角色 ID (外键）
	 */
	@ManyToOne(() => 'Role', { nullable: true })
	roleId?: string;

	/**
	 * 用户 ID (外键）
	 */
	@ManyToOne(() => 'User', { nullable: true })
	userId?: string;

	/**
	 * 邀请人用户 ID (外键）
	 */
	@ManyToOne(() => 'User')
	invitedByUserId!: string;

	/**
	 * 组织 ID 数组（用于 ManyToMany）
	 */
	@Property({ nullable: true, defaultRaw: '[]' })
	organizationIds?: string[];
}
