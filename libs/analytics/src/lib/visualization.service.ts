import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import {
	ChartDataDto,
	ChartSeriesDto,
	ChartConfigDto,
	TrendAnalysisDto,
	ComparisonAnalysisDto,
	VisualizationDto
} from './dto/visualization.dto';
import { QueryMetricsDto, AnalyticsMetric } from './entities/analytics.entity';
import { AnalyticsService } from './analytics.service';

/**
 * 可视化服务
 *
 * 提供数据可视化和图表生成功能
 */
@Injectable()
export class VisualizationService {
	private readonly logger = new Logger(VisualizationService.name);

	constructor(
		@InjectRepository(AnalyticsMetric)
		private readonly metricRepo: EntityRepository<AnalyticsMetric>,
		private readonly analyticsService: AnalyticsService
	) {}

	private get em(): EntityManager {
		return this.metricRepo.getEntityManager();
	}

	/**
	 * 生成趋势图表
	 *
	 * @param analysis - 趋势分析参数
	 * @returns Promise<ChartConfigDto>
	 */
	async generateTrendChart(analysis: TrendAnalysisDto): Promise<ChartConfigDto> {
		this.logger.debug(`Generating trend chart for metric: ${analysis.metricName}`);

		const metrics = await this.getMetricsByTimeDimension(analysis);

		const aggregatedData = this.aggregateByTimeDimension(metrics, analysis.timeDimension);

		const series: ChartSeriesDto[] = [
			{
				name: analysis.metricName,
				data: aggregatedData.map((item) => ({
					label: item.label,
					value: item.value,
					timestamp: item.timestamp ? new Date(item.timestamp).toISOString() : undefined
				}))
			}
		];

		return {
			chartType: 'line',
			title: `${analysis.metricName} 趋势图`,
			xAxisLabel: '时间',
			yAxisLabel: analysis.metricName,
			series
		};
	}

	/**
	 * 生成对比图表
	 *
	 * @param analysis - 对比分析参数
	 * @returns Promise<ChartConfigDto>
	 */
	async generateComparisonChart(analysis: ComparisonAnalysisDto): Promise<ChartConfigDto> {
		this.logger.debug(`Generating comparison chart for metrics: ${analysis.metrics.join(', ')}`);

		const series: ChartSeriesDto[] = [];

		for (const metricName of analysis.metrics) {
			const metrics = await this.analyticsService.queryMetrics({
				metricName,
				startDate: new Date(analysis.timeRange.start),
				endDate: new Date(analysis.timeRange.end),
				dimension: analysis.comparisonBy === 'dimension' ? undefined : undefined,
				tags: analysis.comparisonBy === 'tag' ? [] : undefined
			});

			const aggregated = await this.analyticsService.aggregateMetrics({
				metricName,
				startDate: new Date(analysis.timeRange.start),
				endDate: new Date(analysis.timeRange.end),
				dimension: analysis.comparisonBy === 'dimension' ? analysis.dimensionValues?.[0] : undefined,
				tags: analysis.comparisonBy === 'tag' ? analysis.dimensionValues : undefined
			});

			series.push({
				name: metricName,
				data: [
					{
						label: '总计',
						value: aggregated.total || 0,
						timestamp: new Date().toISOString()
					}
				]
			});
		}

		return {
			chartType: 'bar',
			title: '指标对比',
			xAxisLabel: '指标',
			yAxisLabel: '值',
			series
		};
	}

	/**
	 * 生成 KPI 仪表板数据
	 *
	 * @param kpis - KPI 指标列表
	 * @returns Promise<any>
	 */
	async generateKpiDashboard(kpis: string[]): Promise<any> {
		this.logger.debug(`Generating KPI dashboard for ${kpis.length} metrics`);

		const kpiData: any = {};

		for (const kpi of kpis) {
			const metrics = await this.analyticsService.queryMetrics({
				metricName: kpi,
				dimension: 'daily'
			});

			const aggregated = await this.analyticsService.aggregateMetrics({
				metricName: kpi,
				dimension: 'daily'
			});

			const latest = metrics[metrics.length - 1];

			kpiData[kpi] = {
				currentValue: latest?.value || 0,
				average: aggregated.avg || 0,
				trend: this.calculateTrend(metrics),
				target: Math.floor(Math.random() * 100) + 100,
				progress: Math.floor(Math.random() * 100)
			};
		}

		return kpiData;
	}

	/**
	 * 生成可视化数据
	 *
	 * @param visualization - 可视化配置
	 * @returns Promise<any>
	 */
	async generateVisualization(visualization: VisualizationDto): Promise<any> {
		this.logger.debug(`Generating visualization of type: ${visualization.type}`);

		switch (visualization.type) {
			case 'chart':
				if (visualization.chart) {
					return visualization.chart.chartType === 'line' || visualization.chart.chartType === 'area'
						? this.generateTrendChart(visualization.trend!)
						: this.generateComparisonChart(visualization.comparison!);
				}
				break;
			case 'table':
				return this.generateTableData(visualization);
			case 'kpi':
				return this.generateKpiDashboard(visualization.kpis!);
			default:
				throw new Error(`不支持的可视化类型: ${visualization.type}`);
		}
	}

	/**
	 * 生成表格数据
	 *
	 * @param visualization - 可视化配置
	 * @returns Promise<any>
	 */
	private async generateTableData(visualization: VisualizationDto): Promise<any> {
		const metrics = await this.analyticsService.queryMetrics({});

		const tableData = {
			columns: ['指标名称', '值', '时间戳', '维度', '标签'],
			rows: metrics.map((m: any) => ({
				指标名称: m.metricName,
				值: m.value,
				时间戳: m.timestamp,
				维度: m.dimension,
				标签: m.tags?.join(', ')
			}))
		};

		return tableData;
	}

	/**
	 * 根据时间维度获取指标
	 *
	 * @param analysis - 趋势分析参数
	 * @returns Promise<AnalyticsMetric[]>
	 */
	private async getMetricsByTimeDimension(analysis: TrendAnalysisDto): Promise<AnalyticsMetric[]> {
		const query: QueryMetricsDto = {
			metricName: analysis.metricName,
			dimension: analysis.dimension,
			tags: analysis.tags
		};

		if (analysis.startDate) {
			query.startDate = new Date(analysis.startDate);
		}

		if (analysis.endDate) {
			query.endDate = new Date(analysis.endDate);
		}

		return await this.analyticsService.queryMetrics(query);
	}

	/**
	 * 按时间维度聚合数据
	 *
	 * @param metrics - 指标数据
	 * @param timeDimension - 时间维度
	 * @returns 任意
	 */
	private aggregateByTimeDimension(metrics: AnalyticsMetric[], timeDimension: string): any[] {
		const grouped = new Map<string, number[]>();

		metrics.forEach((metric) => {
			const key = this.getTimeKey(metric.timestamp, timeDimension);
			if (!grouped.has(key)) {
				grouped.set(key, []);
			}
			grouped.get(key)!.push(metric.value as number);
		});

		const aggregated = Array.from(grouped.entries()).map(([label, values]) => ({
			label,
			value: values.reduce((sum, v) => sum + v, 0) / values.length,
			timestamp: new Date(label)
		}));

		aggregated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

		return aggregated;
	}

	/**
	 * 获取时间分组键
	 *
	 * @param timestamp - 时间戳
	 * @param dimension - 时间维度
	 * @returns 时间分组键
	 */
	private getTimeKey(timestamp: Date, dimension: string): string {
		const date = new Date(timestamp);

		switch (dimension) {
			case 'hourly':
				return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
			case 'daily':
				return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
			case 'weekly':
				return `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
			case 'monthly':
				return `${date.getFullYear()}-${date.getMonth() + 1}`;
			default:
				return date.toISOString();
		}
	}

	/**
	 * 获取周数
	 *
	 * @param date - 日期
	 * @returns 周数
	 */
	private getWeekNumber(date: Date): number {
		const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
		const dayNum = d.getUTCDay() || 7;
		const result = (dayNum + 6) % 7;
		return Math.ceil((d.getTime() - new Date(Date.UTC(d.getFullYear(), 0, 1)).getTime()) / 86400000);
	}

	/**
	 * 计算趋势
	 *
	 * @param metrics - 指标数据
	 * @returns 趋势方向
	 */
	private calculateTrend(metrics: AnalyticsMetric[]): 'up' | 'down' | 'stable' {
		if (metrics.length < 2) {
			return 'stable';
		}

		const recent = metrics.slice(-10);
		const values = recent.map((m) => m.value as number);
		const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
		const first = values[0];
		const last = values[values.length - 1];

		if (last > first * 1.05) {
			return 'up';
		} else if (last < first * 0.95) {
			return 'down';
		} else {
			return 'stable';
		}
	}
}
