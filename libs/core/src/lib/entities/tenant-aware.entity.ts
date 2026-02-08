import { Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { RequestContext } from '../context/request-context.service';

/**
 * 租户感知实体基类
 *
 * 所有需要租户隔离的实体应继承此类
 * 自动包含 tenantId 字段
 * 租户过滤通过 MikroORM Filter 在应用层自动设置
 */
export abstract class TenantAwareEntity extends BaseEntity {
	/**
	 * 租户 ID
	 *
	 * 用于多租户数据隔离
	 * 由 RequestContext 自动设置
	 */
	@Property({ nullable: false })
	tenantId!: string;
}
