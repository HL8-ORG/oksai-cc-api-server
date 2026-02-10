import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 租户状态枚举
 */
export enum TenantStatus {
	/** 活跃状态 */
	ACTIVE = 'ACTIVE',
	/** 暂停状态 */
	SUSPENDED = 'SUSPENDED',
	/** 非活跃状态 */
	INACTIVE = 'INACTIVE'
}

/**
 * 租户类型枚举
 */
export enum TenantType {
	/** 组织类型 */
	ORGANIZATION = 'ORGANIZATION',
	/** 个人类型 */
	INDIVIDUAL = 'INDIVIDUAL'
}

/**
 * 租户实体
 *
 * 表示多租户系统中的租户，包含租户的基本信息、配置和订阅状态
 */
@Entity({ tableName: 'tenants' })
@Index({ name: 'idx_tenant_status', properties: ['status'] })
@Index({ name: 'idx_tenant_type', properties: ['type'] })
@Index({ name: 'idx_tenant_status_slug', properties: ['status', 'slug'] })
export class Tenant extends BaseEntity {
	/** 租户名称（唯一） */
	@Property({ unique: true })
	name!: string;

	/** 租户标识（唯一，用于 URL 和查询） */
	@Property({ unique: true })
	slug!: string;

	/** 租户 Logo URL */
	@Property({ nullable: true })
	logo?: string;

	/** 租户网站地址 */
	@Property({ nullable: true })
	website?: string;

	/** 租户描述信息 */
	@Property({ nullable: true })
	description?: string;

	/** 租户状态（默认：ACTIVE） */
	@Property({ default: TenantStatus.ACTIVE })
	@Enum(() => TenantStatus)
	status: TenantStatus = TenantStatus.ACTIVE;

	/** 租户类型（默认：ORGANIZATION） */
	@Property({ default: TenantType.ORGANIZATION })
	@Enum(() => TenantType)
	type: TenantType = TenantType.ORGANIZATION;

	/** 试用结束日期 */
	@Property({ defaultRaw: 'now()' })
	trialEndDate?: Date;

	/** 订阅计划 */
	@Property({ nullable: true })
	subscriptionPlan?: string;

	/** 最大用户数（默认：0 表示无限制） */
	@Property({ default: 0 })
	maxUsers?: number = 0;

	/** 是否允许用户自行注册（默认：true） */
	@Property({ default: true })
	allowSelfRegistration?: boolean = true;

	/** 联系邮箱 */
	@Property({ nullable: true })
	contactEmail?: string;

	/** 联系电话 */
	@Property({ nullable: true })
	contactPhone?: string;

	/** 地址信息 */
	@Property({ nullable: true })
	address?: string;

	/** 城市信息 */
	@Property({ nullable: true })
	city?: string;

	/** 国家信息 */
	@Property({ nullable: true })
	country?: string;

	/** 语言设置（默认：en） */
	@Property({ nullable: true })
	locale?: string = 'en';

	/** 时区设置（默认：UTC） */
	@Property({ nullable: true })
	timezone?: string = 'UTC';
}
