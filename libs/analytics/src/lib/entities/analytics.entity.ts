import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 分析事件实体
 *
 * 记录用户行为分析事件
 */
@Entity({ tableName: 'analytics_events' })
export class AnalyticsEvent extends BaseEntity {
	/** 事件 ID */
	@PrimaryKey()
	id: string = '';

	/** 事件类型（page_view, click, form_submit, api_call 等） */
	@Property()
	eventType: string;

	/** 事件名称 */
	@Property()
	eventName: string;

	/** 用户 ID */
	@Property()
	userId?: string;

	/** 租户 ID */
	@Property()
	tenantId?: string;

	/** 会话 ID */
	@Property()
	sessionId?: string;

	/** 页面 URL */
	@Property()
	pageUrl?: string;

	/** 用户代理（IP、设备等） */
	@Property()
	userAgent?: string;

	/** 引用来源（UTM parameters 等） */
	@Property()
	referrer?: string;

	/** 事件属性（自定义数据） */
	@Property()
	properties?: Record<string, any>;

	/** 事件时间戳 */
	@Property({ defaultRaw: 'now()' })
	timestamp: Date = new Date();

	/** 事件持续时间（毫秒） */
	@Property()
	duration?: number;
}

/**
 * 分析指标实体
 *
 * 存储业务指标数据
 */
@Entity({ tableName: 'analytics_metrics' })
export class AnalyticsMetric extends BaseEntity {
	/** 指标 ID */
	@PrimaryKey()
	id: string = '';

	/** 指标名称 */
	@Property()
	metricName: string;

	/** 指标值 */
	@Property()
	value: number | string;

	/** 租户 ID */
	@Property()
	tenantId?: string;

	/** 时间戳 */
	@Property({ defaultRaw: 'now()' })
	timestamp: Date = new Date();

	/** 时间维度（daily, weekly, monthly 等） */
	@Property()
	dimension?: string;

	/** 标签（用于分类和过滤） */
	@Property()
	tags?: string[];

	/** 属性（自定义元数据） */
	@Property()
	metadata?: Record<string, any>;
}

/**
 * 分析报告实体
 *
 * 存储生成的分析报告
 */
@Entity({ tableName: 'analytics_reports' })
export class AnalyticsReport extends BaseEntity {
	/** 报告 ID */
	@PrimaryKey()
	id: string = '';

	/** 报告类型（dashboard, summary, detailed, export） */
	@Property()
	reportType: 'dashboard' | 'summary' | 'detailed' | 'export';

	/** 报告名称 */
	@Property()
	reportName: string;

	/** 租户 ID */
	@Property()
	tenantId?: string;

	/** 用户 ID */
	@Property()
	userId?: string;

	/** 报告数据格式（json, csv, pdf 等） */
	@Property()
	dataFormat: 'json' | 'csv' | 'pdf';

	/** 报告生成配置 */
	@Property({ type: 'json' })
	reportConfig: Record<string, any>;

	/** 报告数据 */
	@Property({ type: 'json' })
	data: any;

	/** 报告文件路径（如果是导出文件） */
	@Property()
	filePath?: string;

	/** 报告文件大小（字节） */
	@Property()
	fileSize?: number;

	/** 生成时间 */
	@Property({ defaultRaw: 'now()' })
	generatedAt: Date = new Date();

	/** 报告状态 */
	@Property()
	status: 'generating' | 'ready' | 'error' = 'generating';
}

/**
 * 仪表板小部件实体
 *
 * 定义分析仪表板的可视化组件
 */
export interface DashboardWidget {
	/** 小部件 ID */
	id: string;

	/** 小部件类型 */
	type: 'user-activity' | 'system-performance' | 'business-metrics';

	/** 小部件名称 */
	name: string;

	/** 小部件描述 */
	description: string;

	/** 配置选项 */
	config?: Record<string, any>;

	/** 是否可见 */
	visible?: boolean;
}

/**
 * 分析事件 DTO
 *
 * 用于记录分析事件的数据传输对象
 */
export class TrackEventDto {
	/** 事件类型 */
	eventType: string;

	/** 事件名称 */
	eventName: string;

	/** 事件属性 */
	properties?: Record<string, any>;

	/** 页面 URL */
	pageUrl?: string;

	/** 用户代理 */
	userAgent?: string;

	/** 引用来源 */
	referrer?: string;

	/** 会话 ID */
	sessionId?: string;

	/** 用户 ID */
	userId?: string;

	/** 租户 ID */
	tenantId?: string;
}

/**
 * 查询指标 DTO
 *
 * 用于查询分析指标的数据传输对象
 */
export class QueryMetricsDto {
	/** 时间范围（开始日期和结束日期） */
	startDate?: Date;
	endDate?: Date;

	/** 指标名称 */
	metricName?: string;

	/** 时间维度 */
	dimension?: string;

	/** 标签过滤 */
	tags?: string[];
}

/**
 * 生成报表 DTO
 *
 * 用于生成分析报表的数据传输对象
 */
export class GenerateReportDto {
	/** 报告类型 */
	reportType: 'dashboard' | 'summary' | 'detailed' | 'export';

	/** 报告名称 */
	reportName: string;

	/** 日期范围 */
	dateRange: {
		start: Date;
		end: Date;
	};

	/** 数据格式 */
	dataFormat?: 'json' | 'csv' | 'pdf';

	/** 指标列表 */
	metrics?: string[];

	/** 时间维度 */
	dimension?: string;

	/** 标签过滤 */
	tags?: string[];

	/** 报表数据 */
	data?: Record<string, any>;

	/** 过滤器 */
	filters?: Record<string, any>;

	/** 报告配置 */
	reportConfig?: Record<string, any>;
}

/**
 * 仪表板数据 DTO
 *
 * 用于返回仪表板数据的传输对象
 */
export class DashboardDataDto {
	/** 用户活动数据 */
	userActivity?: {
		totalUsers: number;
		activeUsers: number;
		newUsersToday: number;
		totalPageViews: number;
		totalSessions: number;
	};

	/** 系统性能数据 */
	systemPerformance?: {
		avgResponseTime: number;
		avgQueryTime: number;
		totalRequests: number;
		successRate: number;
		errorRate: number;
	};

	/** 业务指标数据 */
	businessMetrics?: {
		totalRevenue: number;
		totalOrders: number;
		averageOrderValue: number;
		conversionRate: number;
	};

	/** 自定义小部件列表 */
	widgets?: DashboardWidget[];
}
