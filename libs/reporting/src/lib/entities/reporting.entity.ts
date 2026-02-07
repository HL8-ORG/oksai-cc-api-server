import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, ManyToMany, ManyToOneOptions, OneToManyOptions, ManyToManyOptions, Enum, Index } from '@mikro-orm/core';
import { Report, ReportStatus, ReportType } from './report.entity';
import { ReportTemplate, TemplateType } from './report-template.entity';
import { ReportSchedule, ScheduleFrequency } from './report-schedule.entity';

export { Report, ReportStatus, ReportType };
export { ReportTemplate, TemplateType };
export { ReportSchedule, ScheduleFrequency };

/**
 * 生成报表 DTO
 *
 * 用于生成报表的数据传输对象
 */
export class GenerateReportDto {
	/** 报表名称 */
	reportName!: string;

	/** 报表描述 */
	description?: string;

	/** 报表类型（PDF 或 EXCEL） */
	reportType!: 'PDF' | 'EXCEL';

	/** 使用的模板 ID */
	templateId?: string;

	/** 报表数据 */
	data?: Record<string, any>;

	/** 报表选项 */
	options?: Record<string, any>;

	/** 用户 ID */
	userId?: string;

	/** 租户 ID */
	tenantId?: string;
}

/**
 * 查询报表 DTO
 *
 * 用于查询报表列表的参数
 */
export class QueryReportsDto {
	/** 报表类型 */
	type?: 'PDF' | 'EXCEL';

	/** 报表状态 */
	status?: ReportStatus;

	/** 创建人 ID */
	createdBy?: string;

	/** 租户 ID */
	tenantId?: string;

	/** 模板 ID */
	templateId?: string;

	/** 页码（从 0 开始） */
	page?: number;

	/** 每页数量 */
	limit?: number;
}
