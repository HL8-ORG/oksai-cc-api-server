import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 组织状态枚举
 */
export enum OrganizationStatus {
	/** 活跃状态 */
	ACTIVE = 'ACTIVE',
	/** 暂停状态 */
	SUSPENDED = 'SUSPENDED',
	/** 非活跃状态 */
	INACTIVE = 'INACTIVE'
}

/**
 * 组织实体
 *
 * 表示租户下的组织单元，如部门、团队等
 */
@Entity({ tableName: 'organizations' })
@Index({ name: 'idx_org_tenant', properties: ['tenantId'] })
@Index({ name: 'idx_org_status', properties: ['status'] })
@Index({ name: 'idx_org_tenant_status', properties: ['tenantId', 'status'] })
export class Organization extends BaseEntity {
	/** 组织名称 */
	@Property()
	name!: string;

	/** 组织标识（唯一，用于 URL 和查询） */
	@Property({ unique: true })
	slug!: string;

	/** 组织 Logo URL */
	@Property({ nullable: true, length: 500 })
	logo?: string;

	/** 组织网站地址 */
	@Property({ nullable: true, length: 500 })
	website?: string;

	/** 组织电话号码 */
	@Property({ nullable: true })
	phoneNumber?: string;

	/** 组织邮箱 */
	@Property({ nullable: true, length: 500 })
	email?: string;

	/** 货币代码（如：USD、CNY） */
	@Property({ nullable: true, length: 20 })
	currency?: string;

	/** 时区设置 */
	@Property({ nullable: true, length: 50 })
	timeZone?: string;

	/** 组织地址 */
	@Property({ nullable: true })
	address?: string;

	/** 组织所在城市 */
	@Property({ nullable: true })
	city?: string;

	/** 组织所在国家 */
	@Property({ nullable: true })
	country?: string;

	/** 邮政编码 */
	@Property({ nullable: true, length: 10 })
	postalCode?: string;

	/** 组织描述信息 */
	@Property({ nullable: true, length: 5000 })
	description?: string;

	/** 组织状态（默认：ACTIVE） */
	@Enum(() => OrganizationStatus)
	status: OrganizationStatus = OrganizationStatus.ACTIVE;

	/** 所属租户 ID */
	@Property()
	tenantId!: string;
}
