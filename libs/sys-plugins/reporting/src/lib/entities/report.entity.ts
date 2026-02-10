import {
	Entity,
	PrimaryKey,
	Property,
	ManyToOne,
	OneToMany,
	ManyToMany,
	ManyToOneOptions,
	OneToManyOptions,
	ManyToManyOptions,
	Enum,
	Index
} from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 报表状态枚举
 */
export enum ReportStatus {
	/** 等待中 */
	PENDING = 'PENDING',
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
export enum ReportType {
	/** PDF 报表 */
	PDF = 'PDF',
	/** Excel 报表 */
	EXCEL = 'EXCEL'
}

/**
 * 报表实体
 *
 * 存储生成的报表记录
 */
@Entity({ tableName: 'reports' })
@Index({ name: 'idx_report_type', properties: ['type'] })
@Index({ name: 'idx_report_status', properties: ['status'] })
@Index({ name: 'idx_report_tenant_id', properties: ['tenantId'] })
@Index({ name: 'idx_report_created_by', properties: ['createdBy'] })
@Index({ name: 'idx_report_created_at', properties: ['createdAt'] })
export class Report extends BaseEntity {
	/** 报表名称 */
	@Property()
	name!: string;

	/** 报表描述 */
	@Property({ nullable: true })
	description?: string;

	/** 报表类型 */
	@Property()
	@Enum(() => ReportType)
	type!: ReportType;

	/** 报表状态 */
	@Property()
	@Enum(() => ReportStatus)
	status: ReportStatus = ReportStatus.PENDING;

	/** 使用的模板 ID */
	@Property({ nullable: true })
	templateId?: string;

	/** 报表数据（JSON 格式） */
	@Property({ type: 'json', nullable: true })
	data?: Record<string, any>;

	/** 报表选项（JSON 格式） */
	@Property({ type: 'json', nullable: true })
	options?: Record<string, any>;

	/** 文件路径 */
	@Property({ nullable: true })
	filePath?: string;

	/** 文件 URL */
	@Property({ nullable: true })
	fileUrl?: string;

	/** 文件大小（字节） */
	@Property({ nullable: true })
	fileSize?: number;

	/** 文件哈希（用于去重） */
	@Property({ nullable: true })
	fileHash?: string;

	/** 生成开始时间 */
	@Property({ nullable: true })
	generationStartedAt?: Date;

	/** 生成完成时间 */
	@Property({ nullable: true })
	generationCompletedAt?: Date;

	/** 错误信息（如果生成失败） */
	@Property({ nullable: true })
	errorMessage?: string;

	/** 创建人 ID */
	@Property({ index: true, nullable: true })
	createdBy?: string;

	/** 租户 ID（可选） */
	@Property({ index: true, nullable: true })
	tenantId?: string;

	/** 过期时间 */
	@Property({ nullable: true })
	expiresAt?: Date;
}
