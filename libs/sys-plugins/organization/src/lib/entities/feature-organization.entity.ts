import { Entity, Property, ManyToOne } from '@mikro-orm/core';
import { TenantOrganizationBaseEntity } from './tenant-organization-base.entity';
import { Feature } from '@oksai/core';
import { Organization } from './organization.entity';

/**
 * 组织功能开关实体
 *
 * 定义组织级别的功能启用/禁用状态
 */
@Entity({ tableName: 'feature_organizations' })
export class FeatureOrganization extends TenantOrganizationBaseEntity {
	/**
	 * 功能 (外键）
	 */
	@ManyToOne({ entity: () => Feature })
	feature?: Feature;

	/**
	 * 功能 ID
	 */
	featureId!: string;

	/**
	 * 是否启用该功能
	 */
	@Property({ default: true })
	isEnabled: boolean = true;
}
