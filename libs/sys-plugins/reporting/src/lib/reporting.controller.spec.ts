import { Test, TestingModule } from '@nestjs/testing';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { GenerateReportDto, Report, ReportStatus, ReportType } from './entities/reporting.entity';

describe('ReportingController', () => {
	let controller: ReportingController;
	let service: ReportingService;

	beforeEach(async () => {
		const mockService = {
			generateReport: jest.fn(),
			getAllReports: jest.fn(),
			getReportById: jest.fn(),
			getReportData: jest.fn(),
			deleteReport: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [ReportingController],
			providers: [
				{
					provide: ReportingService,
					useValue: mockService
				}
			]
		}).compile();

		controller = module.get<ReportingController>(ReportingController);
		service = module.get<ReportingService>(ReportingService);
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('generateReport', () => {
		it('should generate a new report', async () => {
			const reportConfig: GenerateReportDto = {
				reportName: 'Test PDF Report',
				reportType: 'PDF',
				description: 'Test description',
				templateId: 'template123',
				data: { key: 'value' },
				options: { option1: 'value1' },
				userId: 'user123',
				tenantId: 'tenant123'
			};

			const mockReport: Report = {
				id: 'report123',
				name: 'Test PDF Report',
				type: ReportType.PDF,
				description: 'Test description',
				templateId: 'template123',
				data: { key: 'value' },
				options: { option1: 'value1' },
				createdBy: 'user123',
				tenantId: 'tenant123',
				status: ReportStatus.GENERATING,
				generationStartedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			};

			(service.generateReport as jest.Mock).mockResolvedValue(mockReport);

			const result = await controller.generateReport(reportConfig);

			expect(service.generateReport).toHaveBeenCalledWith(reportConfig);
			expect(result).toEqual(mockReport);
		});

		it('should generate an EXCEL report', async () => {
			const reportConfig: GenerateReportDto = {
				reportName: 'Test Excel Report',
				reportType: 'EXCEL',
				userId: 'user456',
				tenantId: 'tenant456'
			};

			const mockReport: Report = {
				id: 'report456',
				name: 'Test Excel Report',
				type: ReportType.EXCEL,
				createdBy: 'user456',
				tenantId: 'tenant456',
				status: ReportStatus.GENERATING,
				generationStartedAt: new Date(),
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
			const mockReports: Report[] = [
				{
					id: 'report1',
					name: 'Report 1',
					type: ReportType.PDF,
					status: ReportStatus.COMPLETED,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					id: 'report2',
					name: 'Report 2',
					type: ReportType.EXCEL,
					status: ReportStatus.COMPLETED,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			];

			(service.getAllReports as jest.Mock).mockResolvedValue(mockReports);

			const result = await controller.getAllReports();

			expect(service.getAllReports).toHaveBeenCalled();
			expect(result).toEqual(mockReports);
			expect(result.length).toBe(2);
		});
	});

	describe('getReportById', () => {
		it('should return a single report', async () => {
			const mockReport: Report = {
				id: 'report123',
				name: 'Test Report',
				type: ReportType.PDF,
				status: ReportStatus.COMPLETED,
				data: { key: 'value' },
				filePath: '/tmp/reports/test.pdf',
				fileUrl: 'https://example.com/reports/test.pdf',
				generationCompletedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			};

			(service.getReportById as jest.Mock).mockResolvedValue(mockReport);

			const result = await controller.getReportById('report123');

			expect(service.getReportById).toHaveBeenCalledWith('report123');
			expect(result).toEqual(mockReport);
		});

		it('should return the same report for data endpoint', async () => {
			const mockReport: Report = {
				id: 'report123',
				name: 'Test Report',
				type: ReportType.PDF,
				status: ReportStatus.COMPLETED,
				data: { key: 'value' },
				filePath: '/tmp/reports/test.pdf',
				generationCompletedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			};

			(service.getReportById as jest.Mock).mockResolvedValue(mockReport);

			const result = await controller.getReportById('report123');

			expect(service.getReportById).toHaveBeenCalledWith('report123');
			expect(result).toEqual(mockReport);
		});
	});

	describe('getReportData', () => {
		it('should return report data', async () => {
			const mockReport: Report = {
				id: 'report123',
				name: 'Test Report',
				type: ReportType.PDF,
				status: ReportStatus.COMPLETED,
				data: { metrics: [1, 2, 3], summary: 'Test summary' },
				filePath: '/tmp/reports/test.pdf',
				fileUrl: 'https://example.com/reports/test.pdf',
				fileSize: 1024,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			(service.getReportById as jest.Mock).mockResolvedValue(mockReport);

			const result = await controller.getReportData('report123');

			expect(service.getReportById).toHaveBeenCalledWith('report123');
			expect(result).toEqual(mockReport);
			expect(result.data).toEqual({ metrics: [1, 2, 3], summary: 'Test summary' });
		});
	});

	describe('deleteReport', () => {
		it('should delete a report', async () => {
			(service.deleteReport as jest.Mock).mockResolvedValue(undefined);

			await controller.deleteReport('report123');

			expect(service.deleteReport).toHaveBeenCalledWith('report123');
		});

		it('should delete multiple reports', async () => {
			(service.deleteReport as jest.Mock).mockResolvedValue(undefined);

			await controller.deleteReport('report1');
			await controller.deleteReport('report2');
			await controller.deleteReport('report3');

			expect(service.deleteReport).toHaveBeenCalledTimes(3);
			expect(service.deleteReport).toHaveBeenCalledWith('report1');
			expect(service.deleteReport).toHaveBeenCalledWith('report2');
			expect(service.deleteReport).toHaveBeenCalledWith('report3');
		});
	});
});
