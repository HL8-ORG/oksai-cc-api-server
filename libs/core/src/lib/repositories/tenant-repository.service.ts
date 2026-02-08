import { ForbiddenException } from '@nestjs/common';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { TenantFilterService } from '../filters/tenant-filter.service';
import { TenantAwareEntity } from '../entities/tenant-aware.entity';

/**
 * 租户感知仓储工具类
 *
 * 提供自动租户过滤的数据访问方法
 * 在服务层使用 EntityRepository 时，配合此类进行租户过滤
 */
export class TenantRepository<T extends TenantAwareEntity> {
	/**
	 * 应用租户过滤器到查询条件
	 *
	 * @param repository - EntityRepository 实例
	 * @param query - 原始查询条件
	 * @returns 包含租户过滤的查询条件
	 */
	static applyTenantFilter<T extends TenantAwareEntity>(
		repository: EntityRepository<T>,
		query: FilterQuery<T> = {}
	): FilterQuery<T> {
		const tenantId = TenantFilterService.getCurrentTenantId();

		if (!tenantId) {
			throw new ForbiddenException('租户上下文缺失，无法应用租户过滤器');
		}

		return Object.assign({}, query, { tenantId }) as FilterQuery<T>;
	}

	/**
	 * 查找单个实体（自动应用租户过滤器）
	 *
	 * @param repository - EntityRepository 实例
	 * @param query - 查询条件
	 * @returns 实体或 null
	 */
	static async findOne<T extends TenantAwareEntity>(
		repository: EntityRepository<T>,
		query: FilterQuery<T> = {}
	): Promise<T | null> {
		return repository.findOne(TenantRepository.applyTenantFilter(repository, query));
	}

	/**
	 * 根据ID查找实体（自动应用租户过滤器）
	 *
	 * @param repository - EntityRepository 实例
	 * @param id - 实体 ID
	 * @returns 实体或 null
	 */
	static async findById<T extends TenantAwareEntity>(repository: EntityRepository<T>, id: string): Promise<T | null> {
		const tenantId = TenantFilterService.getCurrentTenantId();

		if (!tenantId) {
			throw new ForbiddenException('租户上下文缺失，无法应用租户过滤器');
		}

		return repository.findOne({ id, tenantId } as FilterQuery<T>);
	}

	/**
	 * 查找所有实体（自动应用租户过滤器）
	 *
	 * @param repository - EntityRepository 实例
	 * @param query - 查询条件
	 * @returns 实体数组
	 */
	static async find<T extends TenantAwareEntity>(
		repository: EntityRepository<T>,
		query: FilterQuery<T> = {}
	): Promise<T[]> {
		return repository.find(TenantRepository.applyTenantFilter(repository, query));
	}

	/**
	 * 统计实体数量（自动应用租户过滤器）
	 *
	 * @param repository - EntityRepository 实例
	 * @param query - 查询条件
	 * @returns 实体数量
	 */
	static async count<T extends TenantAwareEntity>(
		repository: EntityRepository<T>,
		query: FilterQuery<T> = {}
	): Promise<number> {
		return repository.count(TenantRepository.applyTenantFilter(repository, query));
	}

	/**
	 * 验证租户 ID
	 *
	 * 在创建/更新/删除实体前验证租户 ID 匹配
	 *
	 * @param tenantId - 待验证的租户 ID
	 */
	static validateTenantId(tenantId?: string): void {
		const currentTenantId = TenantFilterService.getCurrentTenantId();

		if (!currentTenantId) {
			throw new ForbiddenException('租户上下文缺失');
		}

		if (tenantId && tenantId !== currentTenantId) {
			throw new ForbiddenException('无法访问其他租户的数据');
		}
	}
}
