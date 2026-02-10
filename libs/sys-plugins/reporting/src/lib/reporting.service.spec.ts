import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { ReportingService } from './reporting.service';
import { Report, GenerateReportDto, ReportType, ReportStatus } from './entities/reporting.entity';

describe('ReportingService', () => {
	let service: ReportingService;
	let reportRepo: EntityRepository<Report>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ReportingService,
				{
					provide: getRepositoryToken(Report),
					useValue: {
						create: jest.fn(),
						find: jest.fn(),
						findOne: jest.fn(),
						findAll: jest.fn(),
						getEntityManager: jest.fn()
					}
				}
			]
		}).compile();

		service = module.get<ReportingService>(ReportingService);
		reportRepo = module.get(getRepositoryToken(Report));
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('generateReport', () => {
		it('should generate a new report', async () => {
			const reportConfig: GenerateReportDto = {
				reportName: 'Test Report',
				reportType: 'PDF',
				description: 'Test Description',
				templateId: 'template123',
				data: { key: 'value' },
				options: { option1: 'value1' },
				userId: 'user123',
				tenantId: 'tenant123'
			};

			const mockReport: Report = {
				id: 'report123',
				name: 'Test Report',
				type: ReportType.PDF,
				description: 'Test Description',
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

			const mockEntityManager = {
				persist: jest.fn(),
				flush: jest.fn().mockResolvedValue(undefined)
			};

			(reportRepo.create as jest.Mock).mockReturnValue(mockReport);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue(mockEntityManager);

			const result = await service.generateReport(reportConfig);

			expect(reportRepo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					name: reportConfig.reportName,
					type: reportConfig.reportType,
					description: reportConfig.description,
					templateId: reportConfig.templateId,
					data: reportConfig.data,
					options: reportConfig.options,
					createdBy: reportConfig.userId,
					tenantId: reportConfig.tenantId,
					status: ReportStatus.GENERATING,
					generationStartedAt: expect.any(Date)
				})
			);
			expect(mockEntityManager.persist).toHaveBeenCalledWith(mockReport);
			expect(mockEntityManager.flush).toHaveBeenCalled();
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

			(reportRepo.findAll as jest.Mock).mockResolvedValue(mockReports);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const result = await service.getAllReports();

			expect(reportRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockReports);
			expect(result.length).toBe(2);
		});
	});

	describe('getReportById', () => {
		it('should return report by id', async () => {
			const mockReport: Report = {
				id: 'report1',
				name: 'Report 1',
				type: ReportType.PDF,
				status: ReportStatus.COMPLETED,
				data: { key: 'value' },
				createdAt: new Date(),
				updatedAt: new Date()
			};

			(reportRepo.findOne as jest.Mock).mockResolvedValue(mockReport);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const result = await service.getReportById('report1');

			expect(reportRepo.findOne).toHaveBeenCalledWith({ id: 'report1' });
			expect(result).toEqual(mockReport);
			expect(result.name).toBe('Report 1');
		});

		it('should throw NotFoundException when report not found', async () => {
			(reportRepo.findOne as jest.Mock).mockResolvedValue(null);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			await expect(service.getReportById('nonexistent')).rejects.toThrow('未找到 ID 为 nonexistent 的报表');
		});
	});

	describe('deleteReport', () => {
		it('should delete report by id', async () => {
			const mockReport: Report = {
				id: 'report1',
				name: 'Report 1',
				type: ReportType.PDF,
				status: ReportStatus.COMPLETED,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			(reportRepo.findOne as jest.Mock).mockResolvedValue(mockReport);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const mockEntityManager = {
				remove: jest.fn(),
				flush: jest.fn().mockResolvedValue(undefined)
			};

			(reportRepo.getEntityManager as jest.Mock).mockReturnValue(mockEntityManager);

			await service.deleteReport('report1');

			expect(mockEntityManager.remove).toHaveBeenCalledWith(mockReport);
			expect(mockEntityManager.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when trying to delete non-existent report', async () => {
			(reportRepo.findOne as jest.Mock).mockResolvedValue(null);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			await expect(service.deleteReport('nonexistent')).rejects.toThrow('未找到 ID 为 nonexistent 的报表');
		});
	});

	describe('getReportData', () => {
		it('should return report data', async () => {
			const mockReport: Report = {
				id: 'report1',
				name: 'Report 1',
				type: ReportType.PDF,
				status: ReportStatus.COMPLETED,
				data: { key: 'value', metrics: [1, 2, 3] },
				filePath: '/tmp/reports/report1.pdf',
				fileUrl: 'https://example.com/reports/report1.pdf',
				createdAt: new Date(),
				updatedAt: new Date()
			};

			(reportRepo.findOne as jest.Mock).mockResolvedValue(mockReport);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			const result = await service.getReportData('report1');

			expect(result).toEqual(mockReport);
			expect(result.data).toEqual({ key: 'value', metrics: [1, 2, 3] });
		});

		it('should throw NotFoundException when report data not found', async () => {
			(reportRepo.findOne as jest.Mock).mockResolvedValue(null);
			(reportRepo.getEntityManager as jest.Mock).mockReturnValue({} as EntityManager);

			await expect(service.getReportData('nonexistent')).rejects.toThrow('未找到 ID 为 nonexistent 的报表');
		});
	});
});
