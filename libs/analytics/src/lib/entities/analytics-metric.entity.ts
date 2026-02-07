import { Entity, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 分析指标实体
 *
 * 存储各种分析指标的聚合数据
 */
@Entity({ tableName: 'analytics_metrics' })
@Index({ name: 'idx_analytics_metric_tenant_id', properties: ['tenantId'] })
@Index({ name: 'idx_analytics_metric_type', properties: ['type'] })
@Index({ name: 'idx_analytics_metric_timestamp', properties: ['timestamp'] })
@Index({ name: 'idx_analytics_metric_type_timestamp', properties: ['type', 'timestamp'] })
export class AnalyticsMetric extends BaseEntity {
	/** 指标类型 */
	@Property({ index: true })
	type!: string;

	/** 指标名称 */
	@Property()
	name!: string;

	/** 指标值 */
	@Property()
	value!: number;

	/** 单位（可选） */
	@Property({ nullable: true })
	unit?: string;

	/** 时间戳 */
	@Property({ index: true, defaultRaw: 'now()' })
	timestamp?: Date = new Date();

	/** 租户 ID（可选） */
	@Property({ index: true, nullable: true })
	tenantId?: string;

	/** 维度数据（JSON 格式，用于多维度分析） */
	@Property({ type: 'json', nullable: true })
	dimensions?: Record<string, any>;

	/** 分组键（用于聚合统计） */
	@Property({ nullable: true })
	groupBy?: string;

	/** 标签（用于分类和筛选） */
	@Property({ type: 'json', nullable: true })
	tags?: string[];
}
