import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { RequestContext } from '../context/request-context.service';

/**
 * 租户过滤器服务
 *
 * 提供租户隔离的查询过滤功能
 * 确保跨租户数据不被访问
 */
export class TenantFilterService {
	/**
	 * 应用租户过滤器到查询条件
	 *
	 * @param em - EntityManager 实例
	 * @param query - 原始查询条件
	 * @returns 包含租户过滤的查询条件
	 */
	static applyTenantFilter(em: EntityManager, query: FilterQuery<any>): FilterQuery<any> {
		const tenantId = RequestContext.getCurrentTenantId();

		if (!tenantId) {
			throw new Error('租户上下文缺失，无法应用租户过滤器');
		}

		return {
			...query,
			tenantId
		};
	}

	/**
	 * 检查租户上下文是否存在
	 *
	 * @returns 如果租户上下文存在返回 true，否则返回 false
	 */
	static hasTenantContext(): boolean {
		return RequestContext.hasTenantContext();
	}

	/**
	 * 获取当前租户 ID
	 *
	 * @returns 当前租户 ID 或 null
	 */
	static getCurrentTenantId(): string | null {
		return RequestContext.getCurrentTenantId();
	}

	/**
	 * 验证租户 ID 是否匹配
	 *
	 * @param tenantId - 待验证的租户 ID
	 * @returns 如果租户 ID 匹配返回 true，否则返回 false
	 */
	static validateTenantId(tenantId: string): boolean {
		const currentTenantId = RequestContext.getCurrentTenantId();

		if (!currentTenantId) {
			throw new Error('租户上下文缺失，无法验证租户 ID');
		}

		return currentTenantId === tenantId;
	}
}
