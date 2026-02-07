import { ManyToOne, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';
import { Tenant } from './tenant.entity';

/**
 * 租户基础实体
 *
 * 为需要租户隔离的实体提供基类
 * 所有此类实体都会自动添加 tenantId 字段和租户关系
 */
export abstract class TenantBaseEntity extends BaseEntity {
	/**
	 * 租户 (外键）
	 */
	@ManyToOne({ entity: () => Tenant, nullable: true })
	tenant?: Tenant;

	/**
	 * 租户 ID
	 */
	@Index()
	tenantId?: string;
}
