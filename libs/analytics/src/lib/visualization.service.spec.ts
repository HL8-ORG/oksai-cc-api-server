import { Test, TestingModule } from '@nestjs/testing';
import { VisualizationService } from './visualization.service';
import { ChartConfigDto, TrendAnalysisDto } from './dto/visualization.dto';

describe('VisualizationService', () => {
	let service: VisualizationService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [VisualizationService]
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
