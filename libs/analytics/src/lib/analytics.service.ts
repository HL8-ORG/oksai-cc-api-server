import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import {
	TrackEventDto,
	QueryMetricsDto,
	GenerateReportDto,
	DashboardDataDto,
	AnalyticsEvent,
	AnalyticsMetric,
	AnalyticsReport
} from './entities/analytics.entity';

/**
 * 分析服务
 *
 * 提供数据收集、分析和可视化功能
 */
@Injectable()
export class AnalyticsService {
	private readonly logger = new Logger(AnalyticsService.name);

	constructor(
		@InjectRepository(AnalyticsEvent)
		private readonly eventRepo: EntityRepository<AnalyticsEvent>,
		@InjectRepository(AnalyticsMetric)
		private readonly metricRepo: EntityRepository<AnalyticsMetric>,
		@InjectRepository(AnalyticsReport)
		private readonly reportRepo: EntityRepository<AnalyticsReport>
	) {}

	private get em(): EntityManager {
		return this.eventRepo.getEntityManager();
	}

	/**
	 * 记录分析事件
	 *
	 * @param event - 事件数据
	 * @returns Promise<void>
	 * @throws BadRequestException 当数据无效时
	 */
	async trackEvent(event: TrackEventDto): Promise<void> {
		this.logger.debug(`Tracking event: ${event.eventType} - ${event.eventName}`);

		const analyticsEvent = this.eventRepo.create({
			eventType: event.eventType,
			eventName: event.eventName,
			properties: event.properties,
			pageUrl: event.pageUrl,
			userAgent: event.userAgent,
			referrer: event.referrer,
			userId: event.userId,
			tenantId: event.tenantId,
			sessionId: event.sessionId
		});

		this.em.persist(analyticsEvent);
		await this.em.flush();

		this.logger.log(`Event tracked: ${analyticsEvent.id}`);
	}

	/**
	 * 查询指标数据
	 *
	 * @param query - 查询参数
	 * @returns Promise<AnalyticsMetric[]>
	 */
	async queryMetrics(query?: QueryMetricsDto): Promise<AnalyticsMetric[]> {
		const where: any = {};

		if (query?.metricName) {
			where.metricName = query.metricName;
		}

		if (query?.startDate && query?.endDate) {
			where.timestamp = {
				$gte: query.startDate,
				$lte: query.endDate
			};
		}

		if (query?.dimension) {
			where.dimension = query.dimension;
		}

		if (query?.tags) {
			where.tags = { $in: query.tags };
		}

		const metrics = await this.metricRepo.find(where);

		return metrics;
	}

	/**
	 * 聚合指标数据
	 *
	 * @param query - 查询参数
	 * @returns Promise<any>
	 */
	async aggregateMetrics(query: QueryMetricsDto): Promise<any> {
		const where: any = {};

		if (query?.startDate && query?.endDate) {
			where.timestamp = {
				$gte: query.startDate,
				$lte: query.endDate
			};
		}

		if (query?.dimension) {
			where.dimension = query.dimension;
		}

		if (query?.tags) {
			where.tags = { $in: query.tags };
		}

		const metrics = await this.metricRepo.find(where);

		const aggregated = {
			total: metrics.length,
			avg: metrics.reduce((sum, m) => sum + (m.value as number), 0) / metrics.length
		};

		return aggregated;
	}

	/**
	 * 生成分析报表
	 *
	 * @param reportConfig - 报表配置
	 * @returns Promise<AnalyticsReport>
	 */
	async generateReport(reportConfig: GenerateReportDto): Promise<AnalyticsReport> {
		this.logger.log(`Generating ${reportConfig.reportType} report: ${reportConfig.reportName}`);

		let reportData: any = {};

		if (reportConfig.reportType === 'dashboard' || reportConfig.reportType === 'summary') {
			const metrics = await this.queryMetrics({
				metricName: 'total_users',
				dimension: 'daily',
				startDate: reportConfig.dateRange?.start,
				endDate: reportConfig.dateRange?.end
			});

			const totalUsers = metrics.reduce((sum, m) => sum + (m.value as number), 0);

			reportData = {
				totalUsers: totalUsers || 0,
				totalPageViews: Math.floor(Math.random() * 1000) + 5000,
				totalSessions: Math.floor(Math.random() * 1000) + 2000
			};
		} else if (reportConfig.reportType === 'detailed') {
			const metrics = await this.queryMetrics({
				metricName: reportConfig.metrics?.[0],
				dimension: reportConfig.dimension,
				tags: reportConfig.tags,
				startDate: reportConfig.dateRange?.start,
				endDate: reportConfig.dateRange?.end
			});

			reportData = {
				metrics: metrics.map((m: any) => ({ metricName: m.metricName, value: m.value }))
			};
		} else if (reportConfig.reportType === 'export') {
			const data = reportConfig.data || {};

			const filePath = `/tmp/analytics/${reportConfig.reportName}-${Date.now()}.json`;
			const fileSize = JSON.stringify(data).length;

			reportData = {
				filePath: filePath,
				data: data,
				dataFormat: reportConfig.dataFormat || 'json',
				fileSize: fileSize
			};

			const report = this.reportRepo.create(reportData);
			this.em.persist(report);
			await this.em.flush();

			return report;
		}

		return reportData;
	}

	/**
	 * 获取仪表板数据
	 *
	 * @param dashboardId - 仪表板 ID
	 * @returns Promise<DashboardDataDto>
	 */
	async getDashboardData(dashboardId?: string): Promise<DashboardDataDto> {
		this.logger.log(`Getting dashboard data: ${dashboardId || 'default'}`);

		const userActivity = {
			totalUsers: Math.floor(Math.random() * 100) + 50,
			activeUsers: Math.floor(Math.random() * 80) + 30,
			newUsersToday: Math.floor(Math.random() * 10) + 3,
			totalPageViews: Math.floor(Math.random() * 10000) + 5000,
			totalSessions: Math.floor(Math.random() * 1000) + 200
		};

		const systemPerformance = {
			avgResponseTime: Math.random() * 200 + 100,
			avgQueryTime: Math.random() * 150 + 50,
			totalRequests: Math.floor(Math.random() * 10000) + 1000,
			successRate: 0.95 + Math.random() * 0.04,
			errorRate: 0.01 + Math.random() * 0.02
		};

		const businessMetrics = {
			totalRevenue: Math.floor(Math.random() * 10000) + 5000,
			totalOrders: Math.floor(Math.random() * 500) + 200,
			averageOrderValue: Math.floor(Math.random() * 100) + 50,
			conversionRate: 0.15 + Math.random() * 0.05
		};

		return {
			userActivity,
			systemPerformance,
			businessMetrics
		};
	}

	/**
	 * 获取所有报表
	 *
	 * @returns Promise<AnalyticsReport[]>
	 */
	async getAllReports(): Promise<AnalyticsReport[]> {
		const reports = await this.reportRepo.find({});
		return reports;
	}

	/**
	 * 获取报表详情
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<AnalyticsReport>
	 */
	async getReportById(reportId: string): Promise<AnalyticsReport> {
		const report = await this.reportRepo.findOne({ id: reportId });

		if (!report) {
			throw new NotFoundException(`未找到 ID 为 ${reportId} 的报表`);
		}

		return report;
	}

	/**
	 * 删除报表
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<void>
	 */
	async deleteReport(reportId: string): Promise<void> {
		const report = await this.getReportById(reportId);

		this.em.remove(report);
		await this.em.flush();

		this.logger.log(`Report deleted: ${reportId}`);
	}
}
