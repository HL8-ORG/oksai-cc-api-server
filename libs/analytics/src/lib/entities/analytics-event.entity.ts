import { Entity, Property, Index, Enum } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 分析事件类型枚举
 */
export enum AnalyticsEventType {
	/** 页面浏览 */
	PAGE_VIEW = 'PAGE_VIEW',
	/** 用户操作 */
	USER_ACTION = 'USER_ACTION',
	/** 系统事件 */
	SYSTEM_EVENT = 'SYSTEM_EVENT',
	/** 业务事件 */
	BUSINESS_EVENT = 'BUSINESS_EVENT',
	/** 错误事件 */
	ERROR_EVENT = 'ERROR_EVENT'
}

/**
 * 分析事件实体
 *
 * 记录系统中的各种分析事件，用于数据追踪和用户行为分析
 */
@Entity({ tableName: 'analytics_events' })
@Index({ name: 'idx_analytics_event_type', properties: ['type'] })
@Index({ name: 'idx_analytics_event_name', properties: ['name'] })
@Index({ name: 'idx_analytics_event_user_id', properties: ['userId'] })
@Index({ name: 'idx_analytics_event_tenant_id', properties: ['tenantId'] })
@Index({ name: 'idx_analytics_event_timestamp', properties: ['timestamp'] })
@Index({ name: 'idx_analytics_event_type_timestamp', properties: ['type', 'timestamp'] })
export class AnalyticsEvent extends BaseEntity {
	/** 事件类型 */
	@Property()
	@Enum(() => AnalyticsEventType)
	type!: AnalyticsEventType;

	/** 事件名称 */
	@Property({ index: true })
	name!: string;

	/** 事件属性（JSON 格式） */
	@Property({ type: 'json', nullable: true })
	properties?: Record<string, any>;

	/** 用户 ID（可选） */
	@Property({ index: true, nullable: true })
	userId?: string;

	/** 租户 ID（可选） */
	@Property({ index: true, nullable: true })
	tenantId?: string;

	/** 事件时间戳 */
	@Property({ index: true, defaultRaw: 'now()' })
	timestamp?: Date = new Date();

	/** 会话 ID（可选） */
	@Property({ nullable: true })
	sessionId?: string;

	/** IP 地址（可选） */
	@Property({ nullable: true })
	ipAddress?: string;

	/** 用户代理（可选） */
	@Property({ nullable: true })
	userAgent?: string;

	/** 来源 URL（可选） */
	@Property({ nullable: true })
	referrerUrl?: string;

	/** 页面 URL（可选） */
	@Property({ nullable: true })
	pageUrl?: string;
}
