import { ManyToOne, Property } from '@mikro-orm/core';
import { TenantBaseEntity } from '@oksai/tenant';
import { Organization } from './organization.entity';

/**
 * 租户组织基础实体
 *
 * 为需要租户和组织隔离的实体提供基类
 * 所有此类实体都会自动添加 tenantId 和 organizationId 字段
 */
export abstract class TenantOrganizationBaseEntity extends TenantBaseEntity {
	/**
	 * 组织 (外键)
	 */
	@ManyToOne({ entity: () => Organization, nullable: true })
	organization?: Organization;

	/**
	 * 组织 ID
	 */
	organizationId?: string;
}
