import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService, RequestMetric, PerformanceSummary } from './metrics.service';

describe('MetricsService', () => {
	let service: MetricsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MetricsService]
		}).compile();

		service = module.get<MetricsService>(MetricsService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('recordMetric', () => {
		it('should record a metric', () => {
			const metric: RequestMetric = {
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 100,
				timestamp: new Date()
			};

			service.recordMetric(metric);

			const summary = service.getPerformanceSummary('GET', '/api/test');
			expect(summary).toBeDefined();
			expect(summary?.totalRequests).toBe(1);
		});

		it('should limit metrics to MAX_METRICS_PER_ROUTE', () => {
			const metric: RequestMetric = {
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 100,
				timestamp: new Date()
			};

			// 记录超过 MAX_METRICS_PER_ROUTE (1000) 的指标
			for (let i = 0; i < 1100; i++) {
				service.recordMetric({ ...metric, timestamp: new Date(i) });
			}

			const summary = service.getPerformanceSummary('GET', '/api/test');
			expect(summary).toBeDefined();
			expect(summary?.totalRequests).toBeLessThanOrEqual(1000);
		});
	});

	describe('getPerformanceSummary', () => {
		it('should return performance summary for a route', () => {
			const now = new Date();
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 100,
				timestamp: new Date(now.getTime() - 30000)
			});
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 200,
				timestamp: new Date(now.getTime() - 20000)
			});
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 400,
				duration: 50,
				timestamp: new Date(now.getTime() - 10000)
			});

			const summary = service.getPerformanceSummary('GET', '/api/test');

			expect(summary).toBeDefined();
			expect(summary?.totalRequests).toBe(3);
			expect(summary?.averageResponseTime).toBeCloseTo(116.67, 1);
			expect(summary?.maxResponseTime).toBe(200);
			expect(summary?.minResponseTime).toBe(50);
			expect(summary?.errorRate).toBeCloseTo(33.33, 2);
		});

		it('should return null for route with no metrics', () => {
			const summary = service.getPerformanceSummary('GET', '/api/nonexistent');
			expect(summary).toBeNull();
		});

		it('should calculate requests per minute correctly', () => {
			const now = new Date();
			// 记录最近 60 秒内的请求
			for (let i = 0; i < 5; i++) {
				service.recordMetric({
					path: '/api/test',
					method: 'GET',
					statusCode: 200,
					duration: 100,
					timestamp: new Date(now.getTime() - i * 10000)
				});
			}

			const summary = service.getPerformanceSummary('GET', '/api/test');
			expect(summary?.requestsPerMinute).toBe(5);
		});
	});

	describe('getAllPerformanceSummaries', () => {
		it('should return summaries for all routes', () => {
			service.recordMetric({
				path: '/api/test1',
				method: 'GET',
				statusCode: 200,
				duration: 100,
				timestamp: new Date()
			});
			service.recordMetric({
				path: '/api/test2',
				method: 'POST',
				statusCode: 200,
				duration: 200,
				timestamp: new Date()
			});

			const summaries = service.getAllPerformanceSummaries();

			expect(summaries.size).toBe(2);
			expect(summaries.has('GET:/api/test1')).toBe(true);
			expect(summaries.has('POST:/api/test2')).toBe(true);
		});

		it('should return empty map when no metrics recorded', () => {
			const summaries = service.getAllPerformanceSummaries();
			expect(summaries.size).toBe(0);
		});
	});

	describe('clearMetrics', () => {
		it('should clear metrics for a specific route', () => {
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 100,
				timestamp: new Date()
			});

			service.clearMetrics('GET', '/api/test');

			const summary = service.getPerformanceSummary('GET', '/api/test');
			expect(summary).toBeNull();
		});
	});

	describe('clearAllMetrics', () => {
		it('should clear all metrics', () => {
			service.recordMetric({
				path: '/api/test1',
				method: 'GET',
				statusCode: 200,
				duration: 100,
				timestamp: new Date()
			});
			service.recordMetric({
				path: '/api/test2',
				method: 'POST',
				statusCode: 200,
				duration: 200,
				timestamp: new Date()
			});

			service.clearAllMetrics();

			const summaries = service.getAllPerformanceSummaries();
			expect(summaries.size).toBe(0);
		});
	});

	describe('getSlowRequests', () => {
		it('should return slow requests above default threshold (1000ms)', () => {
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 500,
				timestamp: new Date()
			});
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 1500,
				timestamp: new Date()
			});
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 2000,
				timestamp: new Date()
			});

			const slowRequests = service.getSlowRequests();

			expect(slowRequests).toHaveLength(2);
			expect(slowRequests[0].duration).toBe(2000);
			expect(slowRequests[1].duration).toBe(1500);
		});

		it('should return slow requests above custom threshold', () => {
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 600,
				timestamp: new Date()
			});
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 800,
				timestamp: new Date()
			});

			const slowRequests = service.getSlowRequests(500);

			expect(slowRequests).toHaveLength(2);
		});

		it('should return empty array when no slow requests', () => {
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 100,
				timestamp: new Date()
			});

			const slowRequests = service.getSlowRequests();

			expect(slowRequests).toHaveLength(0);
		});
	});

	describe('getErrorRequests', () => {
		it('should return error requests (status code >= 400)', () => {
			const now = new Date();
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 100,
				timestamp: new Date(now.getTime() - 30000)
			});
			service.recordMetric({
				path: '/api/test',
				method: 'POST',
				statusCode: 400,
				duration: 50,
				timestamp: new Date(now.getTime() - 20000)
			});
			service.recordMetric({
				path: '/api/test',
				method: 'PUT',
				statusCode: 500,
				duration: 75,
				timestamp: new Date(now.getTime() - 10000)
			});

			const errorRequests = service.getErrorRequests();

			expect(errorRequests).toHaveLength(2);
			expect(errorRequests[0].statusCode).toBe(500);
			expect(errorRequests[1].statusCode).toBe(400);
		});

		it('should return empty array when no error requests', () => {
			service.recordMetric({
				path: '/api/test',
				method: 'GET',
				statusCode: 200,
				duration: 100,
				timestamp: new Date()
			});

			const errorRequests = service.getErrorRequests();

			expect(errorRequests).toHaveLength(0);
		});
	});
});
