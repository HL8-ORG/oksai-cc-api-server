import { ManyToOne, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';
import { Organization } from './organization.entity';

/**
 * 租户组织基础实体
 *
 * 为需要租户和组织隔离的实体提供基类
 * 所有此类实体都会自动添加 tenantId 和 organizationId 字段
 */
export abstract class TenantOrganizationBaseEntity extends BaseEntity {
	/**
	 * 租户 ID
	 */
	@Index()
	tenantId?: string;

	/**
	 * 组织 (外键)
	 */
	@ManyToOne({ entity: () => Organization, nullable: true })
	organization?: Organization;

	/**
	 * 组织 ID
	 */
	@Index()
	organizationId?: string;
}
