import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { BaseEntity } from '@oksai/core';
import { User } from './user.entity';

/**
 * 登录状态
 */
export enum LoginStatus {
	SUCCESS = 'success',
	FAILED = 'failed',
	LOCKED = 'locked'
}

/**
 * 登录历史实体
 *
 * 记录用户的登录历史，用于审计和安全监控
 */
@Entity()
export class LoginHistory extends BaseEntity {
	/** 主键 ID */
	@PrimaryKey()
	id: string = randomUUID();

	/** 用户 ID */
	@Property({ nullable: false })
	userId!: string;

	/** 登录方式（password, google, github, microsoft, auth0） */
	@Property({ nullable: false })
	loginMethod!: string;

	/** 登录状态 */
	@Property({ nullable: false })
	status!: LoginStatus;

	/** IP 地址 */
	@Property({ nullable: true })
	ipAddress?: string;

	/** 用户代理 */
	@Property({ nullable: true })
	userAgent?: string;

	/** 登录位置（国家/地区） */
	@Property({ nullable: true })
	location?: string;

	/** 登录设备类型（desktop, mobile, tablet） */
	@Property({ nullable: true })
	deviceType?: string;

	/** 登录成功时的备注 */
	@Property({ nullable: true })
	remark?: string;
}
