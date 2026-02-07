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
 * 模板类型枚举
 */
export enum TemplateType {
	/** PDF 模板 */
	PDF = 'PDF',
	/** Excel 模板 */
	EXCEL = 'EXCEL'
}

/**
 * 报表模板实体
 *
 * 存储报表模板的定义
 */
@Entity({ tableName: 'report_templates' })
@Index({ name: 'idx_report_template_type', properties: ['type'] })
@Index({ name: 'idx_report_template_tenant_id', properties: ['tenantId'] })
@Index({ name: 'idx_report_template_is_default', properties: ['isDefault'] })
export class ReportTemplate extends BaseEntity {
	/** 模板名称 */
	@Property()
	name!: string;

	/** 模板描述 */
	@Property({ nullable: true })
	description?: string;

	/** 模板类型 */
	@Property()
	@Enum(() => TemplateType)
	type!: TemplateType;

	/** 是否为默认模板 */
	@Property({ default: false })
	isDefault: boolean = false;

	/** 模板内容（JSON 格式） */
	@Property({ type: 'json' })
	content!: Record<string, any>;

	/** 模板缩略图 */
	@Property({ nullable: true })
	thumbnail?: string;

	/** 预览图片 */
	@Property({ nullable: true })
	preview?: string;

	/** 标签（用于分类和筛选） */
	@Property({ type: 'json', nullable: true })
	tags?: string[];

	/** 模板版本 */
	@Property({ default: '1.0.0' })
	version: string = '1.0.0';

	/** 是否激活 */
	@Property({ default: true })
	isActive: boolean = true;

	/** 创建人 ID */
	@Property({ index: true, nullable: true })
	createdBy?: string;

	/** 租户 ID（可选，null 表示全局模板） */
	@Property({ index: true, nullable: true })
	tenantId?: string;

	/** 使用次数（统计） */
	@Property({ default: 0 })
	usageCount: number = 0;

	/** 最后使用时间 */
	@Property({ nullable: true })
	lastUsedAt?: Date;
}
