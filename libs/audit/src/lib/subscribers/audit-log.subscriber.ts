import { EntityName, EventArgs, EventSubscriber, AnyEntity } from '@mikro-orm/core';
import { AuditLog, AuditLogAction, AuditLogEntityType } from '../entities/audit-log.entity';
import { AuditService } from '../audit.service';
import { Injectable } from '@nestjs/common';

/**
 * 审计日志订阅器
 *
 * 监听实体的创建、更新和删除操作，自动记录审计日志
 */
@Injectable()
export class AuditLogSubscriber implements EventSubscriber<AnyEntity> {
	constructor(private readonly auditService: AuditService) {}

	/**
	 * 订阅所有实体
	 */
	subscribeTo(): string {
		return 'AnyEntity';
	}

	/**
	 * 在实体创建后记录审计日志
	 *
	 * @param args - 事件参数
	 */
	async afterCreate(args: EventArgs<AnyEntity>): Promise<void> {
		const { entity } = args;

		// 只记录特定实体的变更
		if (!this.shouldAudit(entity)) {
			return;
		}

		const entityType = this.getEntityType(entity);
		if (!entityType) {
			return;
		}

		// 提取实体信息
		const entityId = this.extractEntityId(entity);
		const entityName = this.extractEntityName(entity);
		const tenantId = this.extractTenantId(entity);

		if (!tenantId) {
			return;
		}

		// 创建审计日志
		await this.auditService.create({
			tenantId,
			entityType,
			action: AuditLogAction.CREATE,
			entityId,
			entityName,
			description: `创建了 ${this.getEntityTypeLabel(entityType)}`
		});
	}

	/**
	 * 在实体更新后记录审计日志
	 *
	 * @param args - 事件参数
	 */
	async afterUpdate(args: EventArgs<AnyEntity>): Promise<void> {
		const { entity } = args;

		// 只记录特定实体的变更
		if (!this.shouldAudit(entity)) {
			return;
		}

		const entityType = this.getEntityType(entity);
		if (!entityType) {
			return;
		}

		// 提取实体信息
		const entityId = this.extractEntityId(entity);
		const entityName = this.extractEntityName(entity);
		const tenantId = this.extractTenantId(entity);

		if (!tenantId) {
			return;
		}

		// 提取变更的数据
		const oldValue = this.serializeEntity((args as any).changeSet?.originalEntity);
		const newValue = this.serializeEntity(entity);

		// 创建审计日志
		await this.auditService.create({
			tenantId,
			entityType,
			action: AuditLogAction.UPDATE,
			entityId,
			entityName,
			oldValue,
			newValue,
			description: `更新了 ${this.getEntityTypeLabel(entityType)}`
		});
	}

	/**
	 * 在实体删除后记录审计日志
	 *
	 * @param args - 事件参数
	 */
	async afterDelete(args: EventArgs<AnyEntity>): Promise<void> {
		const { entity } = args;

		// 只记录特定实体的变更
		if (!this.shouldAudit(entity)) {
			return;
		}

		const entityType = this.getEntityType(entity);
		if (!entityType) {
			return;
		}

		// 提取实体信息
		const entityId = this.extractEntityId(entity);
		const entityName = this.extractEntityName(entity);
		const tenantId = this.extractTenantId(entity);

		if (!tenantId) {
			return;
		}

		// 创建审计日志
		await this.auditService.create({
			tenantId,
			entityType,
			action: AuditLogAction.DELETE,
			entityId,
			entityName,
			description: `删除了 ${this.getEntityTypeLabel(entityType)}`
		});
	}

	/**
	 * 检查是否需要审计此实体
	 *
	 * @param entity - 实体对象
	 * @returns 如果需要审计返回 true，否则返回 false
	 */
	private shouldAudit(entity: AnyEntity): boolean {
		// 排除审计日志本身，避免无限循环
		if (entity instanceof AuditLog) {
			return false;
		}

		// 只审计带有 id 字段的实体
		return typeof entity === 'object' && 'id' in entity;
	}

	/**
	 * 获取实体类型
	 *
	 * @param entity - 实体对象
	 * @returns 实体类型枚举值，如果不是审计实体则返回 undefined
	 */
	private getEntityType(entity: AnyEntity): AuditLogEntityType | undefined {
		const entityName = entity.constructor.name;

		switch (entityName) {
			case 'User':
				return AuditLogEntityType.USER;
			case 'Tenant':
				return AuditLogEntityType.TENANT;
			case 'Organization':
				return AuditLogEntityType.ORGANIZATION;
			case 'Role':
				return AuditLogEntityType.ROLE;
			case 'Permission':
				return AuditLogEntityType.PERMISSION;
			default:
				return undefined;
		}
	}

	/**
	 * 获取实体类型标签
	 *
	 * @param entityType - 实体类型
	 * @returns 实体类型的中文名称
	 */
	private getEntityTypeLabel(entityType: AuditLogEntityType): string {
		const labels: Record<AuditLogEntityType, string> = {
			[AuditLogEntityType.USER]: '用户',
			[AuditLogEntityType.TENANT]: '租户',
			[AuditLogEntityType.ORGANIZATION]: '组织',
			[AuditLogEntityType.ROLE]: '角色',
			[AuditLogEntityType.PERMISSION]: '权限'
		};

		return labels[entityType] || '实体';
	}

	/**
	 * 提取实体 ID
	 *
	 * @param entity - 实体对象
	 * @returns 实体 ID
	 */
	private extractEntityId(entity: AnyEntity): string | undefined {
		return (entity as any).id;
	}

	/**
	 * 提取实体名称
	 *
	 * @param entity - 实体对象
	 * @returns 实体名称
	 */
	private extractEntityName(entity: AnyEntity): string | undefined {
		// 尝试从实体中提取可读的名称
		if ('name' in entity && typeof entity.name === 'string') {
			return entity.name;
		}
		if ('email' in entity && typeof entity.email === 'string') {
			return entity.email;
		}
		if ('slug' in entity && typeof entity.slug === 'string') {
			return entity.slug;
		}

		return undefined;
	}

	/**
	 * 提取租户 ID
	 *
	 * @param entity - 实体对象
	 * @returns 租户 ID
	 */
	private extractTenantId(entity: AnyEntity): string | undefined {
		return (entity as any).tenantId;
	}

	/**
	 * 序列化实体为字符串
	 *
	 * @param entity - 实体对象
	 * @returns 序列化后的字符串
	 */
	private serializeEntity(entity: AnyEntity): string {
		try {
			return JSON.stringify(entity);
		} catch (error) {
			return String(entity);
		}
	}
}
