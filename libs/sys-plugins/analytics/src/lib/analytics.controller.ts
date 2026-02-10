import { Controller, Get, Post, Delete, Query, Param, Body } from '@nestjs/common';
import { Public } from '@oksai/core';
import { AnalyticsService } from './analytics.service';
import { VisualizationService } from './visualization.service';
import {
	TrackEventDto,
	QueryMetricsDto,
	GenerateReportDto,
	DashboardDataDto,
	AnalyticsEvent,
	AnalyticsMetric,
	AnalyticsReport
} from './entities/analytics.entity';
import { VisualizationDto, TrendAnalysisDto, ComparisonAnalysisDto } from './dto/visualization.dto';

/**
 * 分析控制器
 *
 * 提供分析 API 端点
 */
@Controller('analytics')
export class AnalyticsController {
	constructor(
		private readonly analyticsService: AnalyticsService,
		private readonly visualizationService: VisualizationService
	) {}

	/**
	 * 获取分析模块概览
	 *
	 * 返回分析模块可用的 API 端点列表
	 *
	 * @returns 分析模块信息及可用端点
	 */
	@Get()
	@Public()
	getOverview(): Record<string, any> {
		return {
			module: 'analytics',
			description: '分析服务 API',
			endpoints: [
				{ method: 'POST', path: '/api/analytics/events', description: '记录分析事件' },
				{ method: 'GET', path: '/api/analytics/metrics', description: '查询指标数据' },
				{ method: 'GET', path: '/api/analytics/dashboard', description: '获取仪表板数据' },
				{ method: 'POST', path: '/api/analytics/reports', description: '生成报表' },
				{ method: 'GET', path: '/api/analytics/reports', description: '获取所有报表' },
				{ method: 'GET', path: '/api/analytics/reports/:id', description: '获取报表详情' },
				{ method: 'DELETE', path: '/api/analytics/reports/:id', description: '删除报表' },
				{ method: 'POST', path: '/api/analytics/visualization', description: '生成可视化数据' },
				{ method: 'POST', path: '/api/analytics/visualization/trend', description: '生成趋势图表' },
				{ method: 'POST', path: '/api/analytics/visualization/comparison', description: '生成对比图表' },
				{ method: 'POST', path: '/api/analytics/visualization/kpi', description: '生成 KPI 仪表板' }
			]
		};
	}

	/**
	 * 记录分析事件
	 *
	 * @param event - 事件数据
	 * @returns Promise<void>
	 */
	@Post('events')
	async trackEvent(@Body() event: TrackEventDto): Promise<void> {
		await this.analyticsService.trackEvent(event);
	}

	/**
	 * 查询指标数据
	 *
	 * @param query - 查询参数
	 * @returns Promise<AnalyticsMetric[]>
	 */
	@Get('metrics')
	async queryMetrics(@Query() query: QueryMetricsDto): Promise<AnalyticsMetric[]> {
		const metrics = await this.analyticsService.queryMetrics(query);
		return metrics;
	}

	/**
	 * 获取仪表板数据
	 *
	 * @param dashboardId - 仪表板 ID（可选）
	 * @returns Promise<DashboardDataDto>
	 */
	@Get('dashboard')
	async getDashboardData(@Param('dashboardId') dashboardId?: string): Promise<DashboardDataDto> {
		return await this.analyticsService.getDashboardData(dashboardId);
	}

	/**
	 * 生成报表
	 *
	 * @param reportConfig - 报表配置
	 * @returns Promise<any>
	 */
	@Post('reports')
	async generateReport(@Body() reportConfig: GenerateReportDto): Promise<any> {
		const report = await this.analyticsService.generateReport(reportConfig);
		return report;
	}

	/**
	 * 获取所有报表
	 *
	 * @returns Promise<any[]>
	 */
	@Get('reports')
	async getAllReports(): Promise<any[]> {
		return await this.analyticsService.getAllReports();
	}

	/**
	 * 获取报表详情
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<any>
	 */
	@Get('reports/:id')
	async getReportById(@Param('id') reportId: string): Promise<any> {
		return await this.analyticsService.getReportById(reportId);
	}

	/**
	 * 删除报表
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<void>
	 */
	@Delete('reports/:id')
	async deleteReport(@Param('id') reportId: string): Promise<void> {
		await this.analyticsService.deleteReport(reportId);
	}

	/**
	 * 生成可视化数据
	 *
	 * @param visualization - 可视化配置
	 * @returns Promise<any>
	 */
	@Post('visualization')
	async generateVisualization(@Body() visualization: VisualizationDto): Promise<any> {
		return await this.visualizationService.generateVisualization(visualization);
	}

	/**
	 * 生成趋势图表
	 *
	 * @param analysis - 趋势分析参数
	 * @returns Promise<ChartConfigDto>
	 */
	@Post('visualization/trend')
	async generateTrendChart(@Body() analysis: TrendAnalysisDto): Promise<any> {
		return await this.visualizationService.generateTrendChart(analysis);
	}

	/**
	 * 生成对比图表
	 *
	 * @param analysis - 对比分析参数
	 * @returns Promise<ChartConfigDto>
	 */
	@Post('visualization/comparison')
	async generateComparisonChart(@Body() analysis: ComparisonAnalysisDto): Promise<any> {
		return await this.visualizationService.generateComparisonChart(analysis);
	}

	/**
	 * 生成 KPI 仪表板数据
	 *
	 * @param body - KPI 指标列表
	 * @returns Promise<any>
	 */
	@Post('visualization/kpi')
	async generateKpiDashboard(@Body() body: { kpis: string[] }): Promise<any> {
		return await this.visualizationService.generateKpiDashboard(body.kpis);
	}
}
