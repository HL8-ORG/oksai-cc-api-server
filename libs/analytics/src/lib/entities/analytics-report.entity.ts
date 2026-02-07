import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, ManyToMany, ManyToOneOptions, OneToManyOptions, ManyToManyOptions, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 报表状态枚举
 */
export enum AnalyticsReportStatus {
	/** 生成中 */
	GENERATING = 'GENERATING',
	/** 已完成 */
	COMPLETED = 'COMPLETED',
	/** 生成失败 */
	FAILED = 'FAILED',
	/** 已删除 */
	DELETED = 'DELETED'
}

/**
 * 报表类型枚举
 */
export enum AnalyticsReportType {
	/** 用户报表 */
	USER_REPORT = 'USER_REPORT',
	/** 业务报表 */
	BUSINESS_REPORT = 'BUSINESS_REPORT',
	/** 系统报表 */
	SYSTEM_REPORT = 'SYSTEM_REPORT',
	/** 自定义报表 */
	CUSTOM_REPORT = 'CUSTOM_REPORT'
}

/**
 * 分析报表实体
 *
 * 存储各种分析报表的定义和生成状态
 */
@Entity({ tableName: 'analytics_reports' })
@Index({ name: 'idx_analytics_report_type', properties: ['type'] })
@Index({ name: 'idx_analytics_report_status', properties: ['status'] })
@Index({ name: 'idx_analytics_report_tenant_id', properties: ['tenantId'] })
@Index({ name: 'idx_analytics_report_created_by', properties: ['createdBy'] })
@Index({ name: 'idx_analytics_report_generated_at', properties: ['generatedAt'] })
export class AnalyticsReport extends BaseEntity {
	/** 报表名称 */
	@Property()
	name!: string;

	/** 报表描述 */
	@Property({ nullable: true })
	description?: string;

	/** 报表类型 */
	@Property()
	@Enum(() => AnalyticsReportType)
	type!: AnalyticsReportType;

	/** 报表状态 */
	@Property()
	@Enum(() => AnalyticsReportStatus)
	status: AnalyticsReportStatus = AnalyticsReportStatus.GENERATING;

	/** 数据日期范围 - 开始日期 */
	@Property()
	dateRangeStart!: Date;

	/** 数据日期范围 - 结束日期 */
	@Property()
	dateRangeEnd!: Date;

	/** 指标列表（JSON 格式） */
	@Property({ type: 'json', nullable: true })
	metrics?: string[];

	/** 过滤条件（JSON 格式） */
	@Property({ type: 'json', nullable: true })
	filters?: Record<string, any>;

	/** 报表数据（JSON 格式） */
	@Property({ type: 'json', nullable: true })
	data?: Record<string, any>;

	/** 生成时间 */
	@Property({ index: true, nullable: true })
	generatedAt?: Date;

	/** 创建人 ID */
	@Property({ index: true, nullable: true })
	createdBy?: string;

	/** 租户 ID（可选） */
	@Property({ index: true, nullable: true })
	tenantId?: string;

	/** 报表文件路径（如果导出为文件） */
	@Property({ nullable: true })
	filePath?: string;

	/** 报表文件类型（pdf、xlsx 等） */
	@Property({ nullable: true })
	fileType?: string;

	/** 报表大小（字节） */
	@Property({ nullable: true })
	fileSize?: number;

	/** 报表 URL（可下载链接） */
	@Property({ nullable: true })
	fileUrl?: string;

	/** 报表过期时间 */
	@Property({ nullable: true })
	expiresAt?: Date;

	/** 错误信息（如果生成失败） */
	@Property({ nullable: true })
	errorMessage?: string;
}
