import { Entity, Index, Property, ManyToOne } from '@mikro-orm/core';
import { TenantOrganizationBaseEntity } from './tenant-organization-base.entity';
import type { Feature } from '@oksai/core';
import { Organization } from './organization.entity';

/**
 * 组织功能开关实体
 *
 * 定义组织级别的功能启用/禁用状态
 */
@Entity({ tableName: 'feature_organizations' })
@Index({ name: 'idx_feature_id_org_id', properties: ['featureId', 'organizationId'] })
export class FeatureOrganization extends TenantOrganizationBaseEntity {
	/**
	 * 功能 (外键）
	 */
	@ManyToOne({ entity: () => 'Feature' })
	feature?: Feature;

	/**
	 * 功能 ID
	 */
	@Index()
	featureId!: string;

	/**
	 * 是否启用该功能
	 */
	@Property({ default: true })
	isEnabled: boolean = true;
}
