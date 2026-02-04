import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { AuditLog, AuditLogAction, AuditLogEntityType } from './entities/audit-log.entity';

import { CreateAuditLogDto, QueryAuditLogDto } from './dto/audit-log.dto';

@Injectable()
export class AuditService {
	constructor(
		@InjectRepository(AuditLog)
		private readonly auditLogRepo: EntityRepository<AuditLog>
	) {}

	private get em(): EntityManager {
		return this.auditLogRepo.getEntityManager();
	}

	/**
	 * 创建审计日志
	 *
	 * 记录系统操作和变更的审计日志
	 *
	 * @param createAuditLogDto - 审计日志创建数据
	 * @returns 已创建的审计日志
	 *
	 * @example
	 * ```typescript
	 * const auditLog = await auditService.create({
	 *   entityType: 'USER',
	 *   action: 'CREATE',
	 *   entityId: 'user-123',
	 *   entityName: 'John Doe',
	 *   userId: 'admin-123',
	 *   tenantId: 'tenant-123',
	 *   description: '创建新用户',
	 *   metadata: { role: 'USER' }
	 * });
	 * ```
	 */
	async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
		const auditLog = this.auditLogRepo.create({
			...createAuditLogDto,
			entityType: AuditLogEntityType[createAuditLogDto.entityType],
			action: AuditLogAction[createAuditLogDto.action],
			logLevel: createAuditLogDto.logLevel || 'INFO'
		} as any);

		this.em.persist(auditLog);
		await this.em.flush();

		return auditLog;
	}

	/**
	 * 查询审计日志列表
	 *
	 * 分页查询审计日志，支持按多种条件筛选
	 *
	 * @param query - 查询参数（实体类型、操作、用户 ID、租户 ID、日志级别、日期范围、搜索关键词、分页）
	 * @returns 包含审计日志列表和总数的响应
	 *
	 * @example
	 * ```typescript
	 * const result = await auditService.findAll({
	 *   entityType: 'USER',
	 *   action: 'CREATE',
	 *   tenantId: 'tenant-123',
	 *   logLevel: 'INFO',
	 *   startDate: '2024-01-01',
	 *   endDate: '2024-12-31',
	 *   search: '创建',
	 *   page: 1,
	 *   limit: 10
	 * });
	 * ```
	 */
	async findAll(query: QueryAuditLogDto = {}): Promise<{ data: AuditLog[]; total: number }> {
		const where: any = {};

		if (query.entityType) {
			where.entityType = AuditLogEntityType[query.entityType];
		}

		if (query.action) {
			where.action = AuditLogAction[query.action];
		}

		if (query.userId) {
			where.userId = query.userId;
		}

		if (query.tenantId) {
			where.tenantId = query.tenantId;
		}

		if (query.logLevel) {
			where.logLevel = query.logLevel;
		}

		if (query.startDate || query.endDate) {
			where.createdAt = {};
			if (query.startDate) {
				where.createdAt.$gte = new Date(query.startDate);
			}
			if (query.endDate) {
				where.createdAt.$lte = new Date(query.endDate);
			}
		}

		if (query.search) {
			where.$or = [
				{ entityName: { $like: `%${query.search}%` } },
				{ description: { $like: `%${query.search}%` } }
			];
		}

		const page = query.page || 1;
		const limit = query.limit || 10;
		const offset = (page - 1) * limit;

		const [data, total] = await this.auditLogRepo.findAndCount(where, {
			limit,
			offset,
			orderBy: { createdAt: 'DESC' }
		});

		return { data, total };
	}

	/**
	 * 根据 ID 查找审计日志
	 *
	 * @param id - 审计日志 ID
	 * @returns 审计日志实体（如果找到），否则抛出异常
	 * @throws NotFoundException 当审计日志不存在时
	 *
	 * @example
	 * ```typescript
	 * const auditLog = await auditService.findOne('audit-123');
	 * ```
	 */
	async findOne(id: string): Promise<AuditLog> {
		const auditLog = await this.auditLogRepo.findOne({ id });

		if (!auditLog) {
			throw new NotFoundException(`未找到 ID 为 ${id} 的审计日志`);
		}

		return auditLog;
	}

	/**
	 * 根据用户 ID 查询审计日志
	 *
	 * 查询指定用户的所有审计日志
	 *
	 * @param userId - 用户 ID
	 * @param query - 查询参数
	 * @returns 包含审计日志列表和总数的响应
	 *
	 * @example
	 * ```typescript
	 * const result = await auditService.findByUserId('user-123', {
	 *   page: 1,
	 *   limit: 10
	 * });
	 * ```
	 */
	async findByUserId(userId: string, query: QueryAuditLogDto = {}): Promise<{ data: AuditLog[]; total: number }> {
		return this.findAll({ ...query, userId });
	}

	/**
	 * 根据租户 ID 查询审计日志
	 *
	 * 查询指定租户的所有审计日志
	 *
	 * @param tenantId - 租户 ID
	 * @param query - 查询参数
	 * @returns 包含审计日志列表和总数的响应
	 *
	 * @example
	 * ```typescript
	 * const result = await auditService.findByTenantId('tenant-123', {
	 *   page: 1,
	 *   limit: 10
	 * });
	 * ```
	 */
	async findByTenantId(tenantId: string, query: QueryAuditLogDto = {}): Promise<{ data: AuditLog[]; total: number }> {
		return this.findAll({ ...query, tenantId });
	}

	/**
	 * 清理旧审计日志
	 *
	 * 删除指定天数之前的所有审计日志
	 *
	 * @param daysToKeep - 保留天数，默认 90 天
	 * @returns 已删除的日志数量
	 *
	 * @example
	 * ```typescript
	 * const count = await auditService.cleanupOldLogs(90);
	 * console.log(`已删除 ${count} 条旧日志`);
	 * ```
	 */
	async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
		// 计算截止日期
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

		// 查找旧日志
		const oldLogs = await this.auditLogRepo.find({
			createdAt: { $lt: cutoffDate }
		});

		let deletedCount = 0;
		for (const log of oldLogs) {
			this.em.remove(log);
			deletedCount++;
		}

		await this.em.flush();

		return deletedCount;
	}

	/**
	 * 获取审计统计信息
	 *
	 * 统计指定租户在指定时间范围内的审计日志数据
	 *
	 * @param tenantId - 租户 ID
	 * @param startDate - 开始日期（可选）
	 * @param endDate - 结束日期（可选）
	 * @returns 审计统计信息，包括总日志数、操作计数、实体类型计数、用户活动计数、日志级别计数
	 *
	 * @example
	 * ```typescript
	 * const stats = await auditService.getAuditStats('tenant-123', '2024-01-01', '2024-12-31');
	 * console.log('总日志数:', stats.totalLogs);
	 * console.log('创建操作数:', stats.actionCounts.CREATE);
	 * ```
	 */
	async getAuditStats(tenantId: string, startDate?: string, endDate?: string): Promise<any> {
		const where: any = { tenantId };

		if (startDate || endDate) {
			where.createdAt = {};
			if (startDate) {
				where.createdAt.$gte = new Date(startDate);
			}
			if (endDate) {
				where.createdAt.$lte = new Date(endDate);
			}
		}

		const logs = await this.auditLogRepo.find(where);

		// 初始化统计对象
		const stats = {
			totalLogs: logs.length,
			actionCounts: {} as Record<string, number>,
			entityTypeCounts: {} as Record<string, number>,
			userActivityCounts: {} as Record<string, number>,
			logLevelCounts: {} as Record<string, number>
		};

		// 统计各项数据
		logs.forEach((log) => {
			stats.actionCounts[log.action] = (stats.actionCounts[log.action] || 0) + 1;
			stats.entityTypeCounts[log.entityType] = (stats.entityTypeCounts[log.entityType] || 0) + 1;
			stats.logLevelCounts[log.logLevel] = (stats.logLevelCounts[log.logLevel] || 0) + 1;

			if (log.userId) {
				stats.userActivityCounts[log.userId] = (stats.userActivityCounts[log.userId] || 0) + 1;
			}
		});

		return stats;
	}
}
