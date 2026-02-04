import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { CreateAuditLogDto, QueryAuditLogDto } from './dto/audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';

describe('AuditController', () => {
	let controller: AuditController;
	let service: AuditService;

	const mockAuditLog: AuditLog = {
		id: 'test-audit-id',
		userId: 'test-user-id',
		tenantId: 'default',
		entityType: 'USER',
		action: 'CREATE',
		entityId: 'test-entity-id',
		entityName: 'test-entity',
		description: 'Test audit log',
		logLevel: 'INFO'
	} as any;

	beforeEach(async () => {
		const mockAuditService = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			findByUserId: jest.fn(),
			findByTenantId: jest.fn(),
			getAuditStats: jest.fn(),
			cleanupOldLogs: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuditController],
			providers: [
				{
					provide: AuditService,
					useValue: mockAuditService
				}
			]
		}).compile();

		controller = module.get<AuditController>(AuditController);
		service = module.get<AuditService>(AuditService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new audit log', async () => {
			const createAuditLogDto: CreateAuditLogDto = {
				tenantId: 'default',
				entityType: 'USER',
				action: 'CREATE',
				entityId: 'test-entity-id',
				description: 'Test audit log'
			};

			jest.spyOn(service, 'create').mockResolvedValue(mockAuditLog);

			const result = await controller.create(createAuditLogDto);

			expect(service.create).toHaveBeenCalledWith(createAuditLogDto);
			expect(result).toEqual(mockAuditLog);
		});
	});

	describe('findAll', () => {
		it('should return all audit logs', async () => {
			const query: QueryAuditLogDto = {};
			const expectedResponse = {
				data: [mockAuditLog],
				total: 1
			};

			jest.spyOn(service, 'findAll').mockResolvedValue(expectedResponse);

			const result = await controller.findAll(query);

			expect(service.findAll).toHaveBeenCalledWith(query);
			expect(result).toEqual(expectedResponse);
		});
	});

	describe('findOne', () => {
		it('should return an audit log by id', async () => {
			jest.spyOn(service, 'findOne').mockResolvedValue(mockAuditLog);

			const result = await controller.findOne('test-audit-id');

			expect(service.findOne).toHaveBeenCalledWith('test-audit-id');
			expect(result).toEqual(mockAuditLog);
		});
	});

	describe('findByUserId', () => {
		it('should return audit logs for a user', async () => {
			const query: QueryAuditLogDto = {};
			const expectedResponse = {
				data: [mockAuditLog],
				total: 1
			};

			jest.spyOn(service, 'findByUserId').mockResolvedValue(expectedResponse);

			const result = await controller.findByUserId('test-user-id', query);

			expect(service.findByUserId).toHaveBeenCalledWith('test-user-id', query);
			expect(result).toEqual(expectedResponse);
		});
	});

	describe('findByTenantId', () => {
		it('should return audit logs for a tenant', async () => {
			const query: QueryAuditLogDto = {};
			const expectedResponse = {
				data: [mockAuditLog],
				total: 1
			};

			jest.spyOn(service, 'findByTenantId').mockResolvedValue(expectedResponse);

			const result = await controller.findByTenantId('default', query);

			expect(service.findByTenantId).toHaveBeenCalledWith('default', query);
			expect(result).toEqual(expectedResponse);
		});
	});

	describe('getStats', () => {
		it('should return audit statistics', async () => {
			const expectedStats = {
				totalLogs: 1,
				actionCounts: {} as Record<string, number>,
				entityTypeCounts: {} as Record<string, number>,
				userActivityCounts: {} as Record<string, number>,
				logLevelCounts: {} as Record<string, number>
			};

			jest.spyOn(service, 'getAuditStats').mockResolvedValue(expectedStats);

			const result = await controller.getStats('default', {});

			expect(service.getAuditStats).toHaveBeenCalledWith('default', undefined, undefined);
			expect(result).toEqual(expectedStats);
		});

		it('should return audit statistics for date range', async () => {
			const expectedStats = {
				totalLogs: 5,
				actionCounts: {} as Record<string, number>,
				entityTypeCounts: {} as Record<string, number>,
				userActivityCounts: {} as Record<string, number>,
				logLevelCounts: {} as Record<string, number>
			};

			jest.spyOn(service, 'getAuditStats').mockResolvedValue(expectedStats);

			const result = await controller.getStats('default', {
				startDate: '2026-01-01T00:00:00.000Z',
				endDate: '2026-01-31T23:59:59.999Z'
			});

			expect(service.getAuditStats).toHaveBeenCalledWith(
				'default',
				'2026-01-01T00:00:00.000Z',
				'2026-01-31T23:59:59.999Z'
			);
			expect(result).toEqual(expectedStats);
		});
	});

	describe('cleanup', () => {
		it('should cleanup old audit logs', async () => {
			const expectedResult = { deletedCount: 0 };

			jest.spyOn(service, 'cleanupOldLogs').mockResolvedValue(0);

			const result = await controller.cleanup({ daysToKeep: 90 });

			expect(service.cleanupOldLogs).toHaveBeenCalledWith(90);
			expect(result).toEqual(expectedResult);
		});
	});
});
