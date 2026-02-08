import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { VisualizationService } from './visualization.service';
import {
	TrackEventDto,
	QueryMetricsDto,
	GenerateReportDto,
	AnalyticsEvent,
	AnalyticsMetric,
	AnalyticsReport,
	DashboardDataDto
} from './entities/analytics.entity';

describe('AnalyticsController', () => {
	let controller: AnalyticsController;
	let service: AnalyticsService;

	beforeEach(async () => {
		const mockService = {
			trackEvent: jest.fn(),
			queryMetrics: jest.fn(),
			generateReport: jest.fn(),
			getDashboardData: jest.fn(),
			getAllReports: jest.fn(),
			getReportById: jest.fn(),
			deleteReport: jest.fn()
		};

		const mockVisualizationService = {
			generateVisualization: jest.fn(),
			generateTrendChart: jest.fn(),
			generateComparisonChart: jest.fn(),
			generateKpiDashboard: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AnalyticsController],
			providers: [
				{
					provide: AnalyticsService,
					useValue: mockService
				},
				{
					provide: VisualizationService,
					useValue: mockVisualizationService
				}
			]
		}).compile();

		controller = module.get<AnalyticsController>(AnalyticsController);
		service = module.get<AnalyticsService>(AnalyticsService);
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('trackEvent', () => {
		it('should track a new event', async () => {
			const event: TrackEventDto = {
				eventType: 'page_view',
				eventName: 'homepage',
				properties: { page: 'home' },
				pageUrl: '/home',
				userAgent: 'Mozilla/5.0',
				referrer: 'https://google.com',
				sessionId: 'session123',
				userId: 'user123',
				tenantId: 'tenant123'
			};

			(service.trackEvent as jest.Mock).mockResolvedValue(undefined);

			await controller.trackEvent(event);

			expect(service.trackEvent).toHaveBeenCalledWith(event);
		});
	});

	describe('queryMetrics', () => {
		it('should return metrics filtered by query', async () => {
			const query: QueryMetricsDto = {
				metricName: 'total_users',
				startDate: new Date('2024-01-01'),
				endDate: new Date('2024-01-31'),
				dimension: 'daily'
			};

			const mockMetrics: AnalyticsMetric[] = [
				{
					id: 'metric1',
					metricName: 'total_users',
					value: 100,
					timestamp: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					id: 'metric2',
					metricName: 'total_users',
					value: 150,
					timestamp: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				}
			];

			(service.queryMetrics as jest.Mock).mockResolvedValue(mockMetrics);

			const result = await controller.queryMetrics(query);

			expect(service.queryMetrics).toHaveBeenCalledWith(query);
			expect(result).toEqual(mockMetrics);
		});
	});

	describe('getDashboardData', () => {
		it('should return dashboard data', async () => {
			const mockDashboardData: DashboardDataDto = {
				userActivity: {
					totalUsers: 100,
					activeUsers: 50,
					newUsersToday: 10,
					totalPageViews: 5000,
					totalSessions: 200
				},
				systemPerformance: {
					avgResponseTime: 150,
					avgQueryTime: 50,
					totalRequests: 10000,
					successRate: 0.98,
					errorRate: 0.02
				},
				businessMetrics: {
					totalRevenue: 10000,
					totalOrders: 200,
					averageOrderValue: 50,
					conversionRate: 0.15
				}
			};

			(service.getDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

			const result = await controller.getDashboardData('dashboard1');

			expect(service.getDashboardData).toHaveBeenCalledWith('dashboard1');
			expect(result).toEqual(mockDashboardData);
		});

		it('should return default dashboard data when no id provided', async () => {
			const mockDashboardData: DashboardDataDto = {
				userActivity: {
					totalUsers: 50,
					activeUsers: 30,
					newUsersToday: 5,
					totalPageViews: 2500,
					totalSessions: 100
				},
				systemPerformance: {
					avgResponseTime: 100,
					avgQueryTime: 30,
					totalRequests: 5000,
					successRate: 0.99,
					errorRate: 0.01
				},
				businessMetrics: {
					totalRevenue: 5000,
					totalOrders: 100,
					averageOrderValue: 50,
					conversionRate: 0.1
				}
			};

			(service.getDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

			const result = await controller.getDashboardData();

			expect(service.getDashboardData).toHaveBeenCalledWith(undefined);
			expect(result).toEqual(mockDashboardData);
		});
	});

	describe('generateReport', () => {
		it('should generate a new report', async () => {
			const reportConfig: GenerateReportDto = {
				reportType: 'dashboard',
				reportName: 'Test Dashboard',
				dateRange: {
					start: new Date('2024-01-01'),
					end: new Date('2024-01-31')
				}
			};

			const mockReport: AnalyticsReport = {
				id: 'report123',
				reportType: 'dashboard',
				reportName: 'Test Dashboard',
				reportConfig: {},
				data: {},
				dataFormat: 'json',
				status: 'ready',
				generatedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			};

			(service.generateReport as jest.Mock).mockResolvedValue(mockReport);

			const result = await controller.generateReport(reportConfig);

			expect(service.generateReport).toHaveBeenCalledWith(reportConfig);
			expect(result).toEqual(mockReport);
		});
	});

	describe('getAllReports', () => {
		it('should return all reports', async () => {
			const mockReports: AnalyticsReport[] = [
				{
					id: 'report1',
					reportType: 'dashboard',
					reportName: 'Report 1',
					reportConfig: {},
					data: {},
					dataFormat: 'json',
					status: 'ready',
					generatedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					id: 'report2',
					reportType: 'summary',
					reportName: 'Report 2',
					reportConfig: {},
					data: {},
					dataFormat: 'json',
					status: 'ready',
					generatedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				}
			];

			(service.getAllReports as jest.Mock).mockResolvedValue(mockReports);

			const result = await controller.getAllReports();

			expect(service.getAllReports).toHaveBeenCalled();
			expect(result).toEqual(mockReports);
		});
	});

	describe('getReportById', () => {
		it('should return a single report', async () => {
			const mockReport: AnalyticsReport = {
				id: 'report123',
				reportType: 'dashboard',
				reportName: 'Test Dashboard',
				reportConfig: {},
				data: {},
				dataFormat: 'json',
				status: 'ready',
				generatedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			};

			(service.getReportById as jest.Mock).mockResolvedValue(mockReport);

			const result = await controller.getReportById('report123');

			expect(service.getReportById).toHaveBeenCalledWith('report123');
			expect(result).toEqual(mockReport);
		});
	});

	describe('deleteReport', () => {
		it('should delete a report', async () => {
			(service.deleteReport as jest.Mock).mockResolvedValue(undefined);

			await controller.deleteReport('report123');

			expect(service.deleteReport).toHaveBeenCalledWith('report123');
		});
	});
});
