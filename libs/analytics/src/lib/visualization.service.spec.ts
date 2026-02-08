import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { VisualizationService } from './visualization.service';
import { TrendAnalysisDto } from './dto/visualization.dto';
import { AnalyticsMetric } from './entities/analytics.entity';
import { AnalyticsService } from './analytics.service';

describe('VisualizationService', () => {
	let service: VisualizationService;
	let analyticsService: { queryMetrics: jest.Mock; aggregateMetrics: jest.Mock };

	beforeEach(async () => {
		analyticsService = {
			queryMetrics: jest.fn(),
			aggregateMetrics: jest.fn()
		};

		// 默认返回：让 daily/hourly 等维度的趋势图有数据可聚合
		analyticsService.queryMetrics.mockResolvedValue([
			{ metricName: 'mock', value: 10, timestamp: new Date('2026-01-01T00:00:00.000Z') },
			{ metricName: 'mock', value: 20, timestamp: new Date('2026-01-02T00:00:00.000Z') }
		]);
		analyticsService.aggregateMetrics.mockResolvedValue({ total: 30, avg: 15 });

		const module = await Test.createTestingModule({
			providers: [
				VisualizationService,
				{
					provide: getRepositoryToken(AnalyticsMetric),
					useValue: {
						getEntityManager: jest.fn()
					}
				},
				{
					provide: AnalyticsService,
					useValue: analyticsService
				}
			]
		}).compile();

		service = module.get(VisualizationService);
	});

	describe('generateTrendChart', () => {
		it('应该生成趋势图表', async () => {
			const analysis: TrendAnalysisDto = {
				metricName: 'page_views',
				timeDimension: 'daily',
				startDate: '2026-01-01',
				endDate: '2026-01-31'
			};

			const result = await service.generateTrendChart(analysis);

			expect(result).toBeDefined();
			expect(result.chartType).toBe('line');
			expect(result.title).toContain('page_views');
			expect(result.xAxisLabel).toBe('时间');
			expect(result.yAxisLabel).toBe('page_views');
		});

		it('应该支持 hourly 时间维度', async () => {
			const analysis: TrendAnalysisDto = {
				metricName: 'requests',
				timeDimension: 'hourly'
			};

			const result = await service.generateTrendChart(analysis);

			expect(result).toBeDefined();
			expect(result.chartType).toBe('line');
			expect(result.series).toHaveLength(1);
			expect(result.series[0].name).toBe('requests');
			expect(result.series[0].data).toBeInstanceOf(Array);
		});

		it('应该支持 daily 时间维度', async () => {
			const analysis: TrendAnalysisDto = {
				metricName: 'sessions',
				timeDimension: 'daily'
			};

			const result = await service.generateTrendChart(analysis);

			expect(result).toBeDefined();
			expect(result.series[0].data.length).toBeGreaterThan(0);
		});

		it('应该生成正确的数据结构', async () => {
			const analysis: TrendAnalysisDto = {
				metricName: 'events',
				timeDimension: 'weekly',
				startDate: '2026-01-01',
				endDate: '2026-01-31'
			};

			const result = await service.generateTrendChart(analysis);

			expect(result.series[0].data).toBeInstanceOf(Array);
			if (result.series[0].data.length > 0) {
				expect(result.series[0].data[0]).toHaveProperty('label');
				expect(result.series[0].data[0]).toHaveProperty('value');
				expect(result.series[0].data[0]).toHaveProperty('timestamp');
			}
		});
	});

	describe('generateKpiDashboard', () => {
		it('应该生成 KPI 仪表板数据', async () => {
			const kpis = ['total_users', 'active_users', 'new_users_today'];

			const result = await service.generateKpiDashboard(kpis);

			expect(result).toBeDefined();
			expect(Object.keys(result)).toHaveLength(kpis.length);
			expect(result).toHaveProperty('total_users');
			expect(result).toHaveProperty('active_users');
			expect(result).toHaveProperty('new_users_today');
		});
	});
});
