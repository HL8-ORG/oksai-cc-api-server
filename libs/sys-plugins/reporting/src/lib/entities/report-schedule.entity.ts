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
 * 计划频率枚举
 */
export enum ScheduleFrequency {
	/** 一次性 */
	ONCE = 'ONCE',
	/** 每日 */
	DAILY = 'DAILY',
	/** 每周 */
	WEEKLY = 'WEEKLY',
	/** 每月 */
	MONTHLY = 'MONTHLY',
	/** 每季 */
	QUARTERLY = 'QUARTERLY',
	/** 每年 */
	YEARLY = 'YEARLY',
	/** 自定义 */
	CUSTOM = 'CUSTOM'
}

/**
 * 报表计划实体
 *
 * 存储定期生成报表的计划配置
 */
@Entity({ tableName: 'report_schedules' })
@Index({ name: 'idx_report_schedule_tenant_id', properties: ['tenantId'] })
@Index({ name: 'idx_report_schedule_template_id', properties: ['templateId'] })
@Index({ name: 'idx_report_schedule_created_by', properties: ['createdBy'] })
@Index({ name: 'idx_report_schedule_is_active', properties: ['isActive'] })
@Index({ name: 'idx_report_schedule_next_run_at', properties: ['nextRunAt'] })
export class ReportSchedule extends BaseEntity {
	/** 计划名称 */
	@Property()
	name!: string;

	/** 计划描述 */
	@Property({ nullable: true })
	description?: string;

	/** 模板 ID */
	@Property()
	templateId!: string;

	/** 报表类型 */
	@Property()
	type!: 'PDF' | 'EXCEL';

	/** 计划频率 */
	@Property()
	@Enum(() => ScheduleFrequency)
	frequency!: ScheduleFrequency;

	/** Cron 表达式（自定义频率时使用） */
	@Property({ nullable: true })
	cronExpression?: string;

	/** 计划数据（JSON 格式） */
	@Property({ type: 'json', nullable: true })
	data?: Record<string, any>;

	/** 计划选项（JSON 格式） */
	@Property({ type: 'json', nullable: true })
	options?: Record<string, any>;

	/** 是否激活 */
	@Property({ default: true })
	isActive: boolean = true;

	/** 下次运行时间 */
	@Property({ index: true, nullable: true })
	nextRunAt?: Date;

	/** 上次运行时间 */
	@Property({ nullable: true })
	lastRunAt?: Date;

	/** 创建人 ID */
	@Property({ index: true, nullable: true })
	createdBy?: string;

	/** 租户 ID（可选） */
	@Property({ index: true, nullable: true })
	tenantId?: string;

	/** 通知邮箱（报表生成后发送到这些邮箱） */
	@Property({ type: 'json', nullable: true })
	notificationEmails?: string[];

	/** 开始日期 */
	@Property({ nullable: true })
	startDate?: Date;

	/** 结束日期 */
	@Property({ nullable: true })
	endDate?: Date;

	/** 时区 */
	@Property({ default: 'UTC' })
	timezone: string = 'UTC';

	/** 运行次数 */
	@Property({ default: 0 })
	runCount: number = 0;

	/** 失败次数 */
	@Property({ default: 0 })
	failureCount: number = 0;

	/** 最后一次失败原因 */
	@Property({ nullable: true })
	lastFailureReason?: string;
}
