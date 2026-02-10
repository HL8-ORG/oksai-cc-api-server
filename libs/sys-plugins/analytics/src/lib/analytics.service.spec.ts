import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent, AnalyticsMetric, AnalyticsReport } from './entities/analytics.entity';

describe('AnalyticsService', () => {
	let service: AnalyticsService;
	let eventRepo: EntityRepository<AnalyticsEvent>;
	let metricRepo: EntityRepository<AnalyticsMetric>;
	let reportRepo: EntityRepository<AnalyticsReport>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AnalyticsService,
				{
					provide: getRepositoryToken(AnalyticsEvent),
					useValue: {
						create: jest.fn(),
						getEntityManager: jest.fn()
					}
				},
				{
					provide: getRepositoryToken(AnalyticsMetric),
					useValue: {
						find: jest.fn(),
						findOne: jest.fn(),
						getEntityManager: jest.fn()
					}
				},
				{
					provide: getRepositoryToken(AnalyticsReport),
					useValue: {
						find: jest.fn(),
						findOne: jest.fn(),
						create: jest.fn(),
						getEntityManager: jest.fn()
					}
				}
			]
		}).compile();

		service = module.get<AnalyticsService>(AnalyticsService);
		eventRepo = module.get(getRepositoryToken(AnalyticsEvent));
		metricRepo = module.get(getRepositoryToken(AnalyticsMetric));
		reportRepo = module.get(getRepositoryToken(AnalyticsReport));
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('trackEvent', () => {
		it('should record a new analytics event', async () => {
			const event = {
				eventType: 'page_view',
				eventName: 'homepage',
				properties: {},
				userId: 'user123',
				tenantId: 'tenant123',
				sessionId: 'session123'
			};

			const mockEntityManager = {
				persist: jest.fn(),
				flush: jest.fn().mockResolvedValue(undefined)
			};

			const mockEvent = { id: 'event123', ...event };
			(eventRepo.create as jest.Mock).mockReturnValue(mockEvent);
			(eventRepo.getEntityManager as jest.Mock).mockReturnValue(mockEntityManager);

			await service.trackEvent(event);

			expect(eventRepo.create).toHaveBeenCalledWith(expect.objectContaining(event));
			expect(mockEntityManager.persist).toHaveBeenCalledWith(mockEvent);
			expect(mockEntityManager.flush).toHaveBeenCalled();
		});
	});

	describe('queryMetrics', () => {
		it('should return metrics filtered by criteria', async () => {
			const query = {
				metricName: 'total_users',
				startDate: new Date('2024-01-01'),
				endDate: new Date('2024-01-31')
			};

			const mockMetrics = [
				{ id: 'metric1', metricName: 'total_users', value: 100 },
				{ id: 'metric2', metricName: 'total_users', value: 150 }
			];

			(metricRepo.find as jest.Mock).mockResolvedValue(mockMetrics);
			(metricRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const result = await service.queryMetrics(query);

			expect(metricRepo.find).toHaveBeenCalledWith(
				expect.objectContaining({
					metricName: query.metricName,
					timestamp: expect.any(Object)
				})
			);
			expect(result).toEqual(mockMetrics);
		});

		it('should return all metrics when no filter is provided', async () => {
			const mockMetrics = [{ id: 'metric1', metricName: 'total_users', value: 100 }];

			(metricRepo.find as jest.Mock).mockResolvedValue(mockMetrics);
			(metricRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const result = await service.queryMetrics();

			expect(metricRepo.find).toHaveBeenCalledWith({});
			expect(result).toEqual(mockMetrics);
		});
	});

	describe('generateReport', () => {
		it('should generate a dashboard report', async () => {
			const reportConfig = {
				reportType: 'dashboard' as const,
				reportName: 'Test Dashboard',
				dateRange: {
					start: new Date('2024-01-01'),
					end: new Date('2024-01-31')
				}
			};

			(metricRepo.find as jest.Mock).mockResolvedValue([
				{ id: 'metric1', metricName: 'total_users', value: 100 },
				{ id: 'metric2', metricName: 'total_users', value: 150 }
			]);
			(metricRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const result = await service.generateReport(reportConfig);

			expect(result).toHaveProperty('totalUsers');
			expect(result).toHaveProperty('totalPageViews');
			expect(result).toHaveProperty('totalSessions');
		});

		it('should generate an export report', async () => {
			const reportConfig = {
				reportType: 'export' as const,
				reportName: 'Test Export',
				dateRange: {
					start: new Date('2024-01-01'),
					end: new Date('2024-01-31')
				},
				dataFormat: 'json' as const,
				data: { test: 'data' }
			};

			const mockReport = {
				id: 'report123',
				filePath: '/tmp/analytics/test-export-1234567890.json',
				data: { test: 'data' },
				dataFormat: 'json',
				fileSize: JSON.stringify({ test: 'data' }).length
			};

			const mockEntityManager = {
				persist: jest.fn(),
				flush: jest.fn().mockResolvedValue(undefined)
			};

			(reportRepo.create as jest.Mock).mockReturnValue(mockReport);
			(eventRepo.getEntityManager as jest.Mock).mockReturnValue(mockEntityManager);
			(metricRepo.find as jest.Mock).mockResolvedValue([]);

			const result = await service.generateReport(reportConfig);

			expect(mockEntityManager.persist).toHaveBeenCalledWith(mockReport);
			expect(mockEntityManager.flush).toHaveBeenCalled();
			expect(result).toEqual(mockReport);
		});
	});

	describe('getDashboardData', () => {
		it('should return dashboard data', async () => {
			const result = await service.getDashboardData();

			expect(result).toHaveProperty('userActivity');
			expect(result).toHaveProperty('systemPerformance');
			expect(result).toHaveProperty('businessMetrics');
			expect(result.userActivity).toHaveProperty('totalUsers');
			expect(result.userActivity).toHaveProperty('activeUsers');
		});
	});

	describe('getAllReports', () => {
		it('should return all reports', async () => {
			const mockReports = [
				{ id: 'report1', reportName: 'Report 1' },
				{ id: 'report2', reportName: 'Report 2' }
			];

			(reportRepo.find as jest.Mock).mockResolvedValue(mockReports);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const result = await service.getAllReports();

			expect(reportRepo.find).toHaveBeenCalled();
			expect(result).toEqual(mockReports);
		});
	});

	describe('getReportById', () => {
		it('should return report by id', async () => {
			const mockReport = { id: 'report1', reportName: 'Report 1' };

			(reportRepo.findOne as jest.Mock).mockResolvedValue(mockReport);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const result = await service.getReportById('report1');

			expect(reportRepo.findOne).toHaveBeenCalledWith({ id: 'report1' });
			expect(result).toEqual(mockReport);
		});

		it('should throw NotFoundException when report not found', async () => {
			(reportRepo.findOne as jest.Mock).mockResolvedValue(null);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			await expect(service.getReportById('nonexistent')).rejects.toThrow('未找到 ID 为 nonexistent 的报表');
		});
	});

	describe('deleteReport', () => {
		it('should delete report by id', async () => {
			const mockReport = { id: 'report1', reportName: 'Report 1' };

			(reportRepo.findOne as jest.Mock).mockResolvedValue(mockReport);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const mockEntityManager = {
				remove: jest.fn(),
				flush: jest.fn().mockResolvedValue(undefined)
			};
			(eventRepo.getEntityManager as jest.Mock).mockReturnValue(mockEntityManager);

			await service.deleteReport('report1');

			expect(mockEntityManager.remove).toHaveBeenCalledWith(mockReport);
			expect(mockEntityManager.flush).toHaveBeenCalled();
		});
	});
});
