import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { AuditService } from './audit.service';
import { AuditLog, AuditLogAction, AuditLogEntityType } from './entities/audit-log.entity';
import { CreateAuditLogDto, QueryAuditLogDto } from './dto/audit-log.dto';

describe('AuditService', () => {
	let service: AuditService;
	let auditLogRepo: any;
	let em: any;

	const mockAuditLog: AuditLog = {
		id: 'test-audit-id',
		userId: 'test-user-id',
		tenantId: 'default',
		entityType: AuditLogEntityType.USER,
		action: AuditLogAction.CREATE,
		entityId: 'test-entity-id',
		entityName: 'test-entity',
		description: 'Test audit log',
		ipAddress: '127.0.0.1',
		logLevel: 'INFO',
		createdAt: new Date(),
		updatedAt: new Date()
	} as AuditLog;

	beforeEach(async () => {
		em = {
			persist: jest.fn(),
			flush: jest.fn().mockResolvedValue(undefined),
			remove: jest.fn()
		};

		auditLogRepo = {
			create: jest.fn(),
			findOne: jest.fn(),
			find: jest.fn(),
			findAndCount: jest.fn(),
			getEntityManager: jest.fn(() => em)
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuditService,
				{
					provide: getRepositoryToken(AuditLog),
					useValue: auditLogRepo
				}
			]
		}).compile();

		service = module.get<AuditService>(AuditService);
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new audit log successfully', async () => {
			const createAuditLogDto: CreateAuditLogDto = {
				tenantId: 'default',
				entityType: 'USER',
				action: 'CREATE',
				entityId: 'test-entity-id',
				description: 'Test audit log'
			};

			auditLogRepo.create.mockReturnValue(mockAuditLog);

			const result = await service.create(createAuditLogDto);

			expect(auditLogRepo.create).toHaveBeenCalledWith({
				...createAuditLogDto,
				entityType: AuditLogEntityType.USER,
				action: AuditLogAction.CREATE,
				logLevel: 'INFO'
			});
			expect(em.persist).toHaveBeenCalledWith(mockAuditLog);
			expect(em.flush).toHaveBeenCalled();
			expect(result).toEqual(mockAuditLog);
		});
	});

	describe('findAll', () => {
		it('should return all audit logs', async () => {
			const logs = [mockAuditLog];
			auditLogRepo.findAndCount.mockResolvedValue([logs, 1]);

			const result = await service.findAll({});

			expect(result.data).toEqual(logs);
			expect(result.total).toBe(1);
		});

		it('should filter logs by entity type', async () => {
			auditLogRepo.findAndCount.mockResolvedValue([[mockAuditLog], 1]);

			await service.findAll({ entityType: 'USER' });

			expect(auditLogRepo.findAndCount).toHaveBeenCalledWith(
				expect.objectContaining({ entityType: AuditLogEntityType.USER }),
				expect.anything()
			);
		});

		it('should filter logs by action', async () => {
			auditLogRepo.findAndCount.mockResolvedValue([[mockAuditLog], 1]);

			await service.findAll({ action: 'LOGIN' });

			expect(auditLogRepo.findAndCount).toHaveBeenCalledWith(
				expect.objectContaining({ action: AuditLogAction.LOGIN }),
				expect.anything()
			);
		});

		it('should filter logs by user ID', async () => {
			auditLogRepo.findAndCount.mockResolvedValue([[mockAuditLog], 1]);

			await service.findAll({ userId: 'test-user-id' });

			expect(auditLogRepo.findAndCount).toHaveBeenCalledWith(
				expect.objectContaining({ userId: 'test-user-id' }),
				expect.anything()
			);
		});

		it('should filter logs by date range', async () => {
			auditLogRepo.findAndCount.mockResolvedValue([[mockAuditLog], 1]);

			const startDate = '2026-01-01T00:00:00.000Z';
			const endDate = '2026-01-31T23:59:59.999Z';

			await service.findAll({ startDate, endDate });

			expect(auditLogRepo.findAndCount).toHaveBeenCalledWith(
				expect.objectContaining({
					createdAt: {
						$gte: expect.any(Date),
						$lte: expect.any(Date)
					}
				}),
				expect.anything()
			);
		});

		it('should filter logs by search term', async () => {
			auditLogRepo.findAndCount.mockResolvedValue([[mockAuditLog], 1]);

			await service.findAll({ search: 'test' });

			expect(auditLogRepo.findAndCount).toHaveBeenCalledWith(
				expect.objectContaining({
					$or: expect.arrayContaining([
						expect.objectContaining({ entityName: expect.anything() }),
						expect.objectContaining({ description: expect.anything() })
					])
				}),
				expect.anything()
			);
		});
	});

	describe('findOne', () => {
		it('should return an audit log by id', async () => {
			auditLogRepo.findOne.mockResolvedValue(mockAuditLog);

			const result = await service.findOne('test-audit-id');

			expect(result).toEqual(mockAuditLog);
			expect(auditLogRepo.findOne).toHaveBeenCalledWith({ id: 'test-audit-id' });
		});

		it('should throw error when audit log not found', async () => {
			auditLogRepo.findOne.mockResolvedValue(null);

			await expect(service.findOne('non-existent-id')).rejects.toThrow('未找到 ID 为 non-existent-id 的审计日志');
		});
	});

	describe('cleanupOldLogs', () => {
		it('should delete old logs successfully', async () => {
			const oldLogs = [mockAuditLog];
			auditLogRepo.find.mockResolvedValue(oldLogs);
			em.remove.mockResolvedValue(undefined);
			em.flush.mockResolvedValue(undefined);

			const deletedCount = await service.cleanupOldLogs(90);

			expect(auditLogRepo.find).toHaveBeenCalledWith({
				createdAt: { $lt: expect.any(Date) }
			});
			expect(em.remove).toHaveBeenCalledTimes(1);
			expect(em.flush).toHaveBeenCalledTimes(1);
			expect(deletedCount).toBe(1);
		});
	});

	describe('getAuditStats', () => {
		it('should return audit statistics', async () => {
			const logs = [mockAuditLog, { ...mockAuditLog, id: 'test-audit-id-2', action: AuditLogAction.UPDATE }];

			auditLogRepo.find.mockResolvedValue(logs);

			const stats = await service.getAuditStats('default');

			expect(stats.totalLogs).toBe(2);
			expect(stats.actionCounts).toBeDefined();
			expect(stats.entityTypeCounts).toBeDefined();
			expect(stats.userActivityCounts).toBeDefined();
			expect(stats.logLevelCounts).toBeDefined();
			expect(stats.actionCounts[AuditLogAction.CREATE]).toBe(1);
			expect(stats.actionCounts[AuditLogAction.UPDATE]).toBe(1);
			expect(stats.entityTypeCounts[AuditLogEntityType.USER]).toBe(2);
		});

		it('should return audit statistics with date range', async () => {
			const logs = [mockAuditLog];

			auditLogRepo.find.mockResolvedValue(logs);

			const stats = await service.getAuditStats(
				'default',
				'2026-01-01T00:00:00.000Z',
				'2026-01-31T23:59:59.999Z'
			);

			expect(auditLogRepo.find).toHaveBeenCalledWith(
				expect.objectContaining({
					tenantId: 'default',
					createdAt: {
						$gte: expect.any(Date),
						$lte: expect.any(Date)
					}
				})
			);
			expect(stats.totalLogs).toBe(1);
		});
	});
});
