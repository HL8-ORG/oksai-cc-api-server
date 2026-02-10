import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant, TenantStatus, TenantType } from './entities/tenant.entity';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';

describe('TenantService', () => {
	let service: TenantService;
	let tenantRepo: any;
	let em: any;

	beforeEach(async () => {
		tenantRepo = {
			findOne: jest.fn(),
			create: jest.fn(),
			find: jest.fn(),
			findAndCount: jest.fn(),
			getEntityManager: jest.fn()
		};

		em = {
			persist: jest.fn(),
			flush: jest.fn(),
			remove: jest.fn()
		};

		tenantRepo.getEntityManager.mockReturnValue(em);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TenantService,
				{
					provide: getRepositoryToken(Tenant),
					useValue: tenantRepo
				}
			]
		}).compile();

		service = module.get<TenantService>(TenantService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should successfully create a new tenant', async () => {
			tenantRepo.findOne.mockResolvedValue(null);

			const createdTenant = {
				id: 'new-tenant-123',
				name: 'Test Organization',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION,
				maxUsers: 100,
				allowSelfRegistration: true,
				locale: 'en',
				timezone: 'UTC'
			} as any;

			tenantRepo.create.mockReturnValue(createdTenant);

			const createTenantDto = {
				name: 'Test Organization',
				slug: 'test-org',
				maxUsers: 100
			};

			const result = await service.create(createTenantDto);

			expect(result).toBeDefined();
			expect(result.slug).toBe('test-org');
			expect(result.status).toBe(TenantStatus.ACTIVE);
			expect(result.type).toBe(TenantType.ORGANIZATION);
			expect(em.persist).toHaveBeenCalledWith(createdTenant);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw BadRequestException when slug already exists', async () => {
			const existingTenant = {
				id: 'existing123',
				name: 'Existing Org',
				slug: 'test-org'
			} as any;

			tenantRepo.findOne.mockResolvedValue(existingTenant);

			const createTenantDto = {
				name: 'New Org',
				slug: 'test-org',
				maxUsers: 50
			};

			await expect(service.create(createTenantDto)).rejects.toThrow(BadRequestException);
		});

		it('should use default values when not provided', async () => {
			tenantRepo.findOne.mockResolvedValue(null);

			const createdTenant = {
				id: 'new-tenant-123',
				name: 'Test Org',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION,
				maxUsers: 0,
				allowSelfRegistration: true,
				locale: 'en',
				timezone: 'UTC'
			} as any;

			tenantRepo.create.mockReturnValue(createdTenant);

			const createTenantDto = { name: 'Test Org', slug: 'test-org' };

			const result = await service.create(createTenantDto);

			expect(result.status).toBe(TenantStatus.ACTIVE);
			expect(result.type).toBe(TenantType.ORGANIZATION);
			expect(result.maxUsers).toBe(0);
			expect(result.allowSelfRegistration).toBe(true);
			expect(result.locale).toBe('en');
			expect(result.timezone).toBe('UTC');
		});
	});

	describe('findAll', () => {
		it('should return all tenants', async () => {
			const mockTenants: Tenant[] = [
				{
					id: 'tenant1',
					name: 'Org 1',
					slug: 'org1',
					status: TenantStatus.ACTIVE,
					type: TenantType.ORGANIZATION
				} as any,
				{
					id: 'tenant2',
					name: 'Org 2',
					slug: 'org2',
					status: TenantStatus.ACTIVE,
					type: TenantType.ORGANIZATION
				} as any
			];

			tenantRepo.findAndCount.mockResolvedValue([mockTenants, mockTenants.length]);

			const result = await service.findAll({});

			expect(result.data).toHaveLength(2);
			expect(result.total).toBe(2);
		});

		it('should filter tenants by status', async () => {
			const mockTenants: Tenant[] = [
				{
					id: 'tenant1',
					name: 'Active Org',
					slug: 'active',
					status: TenantStatus.ACTIVE,
					type: TenantType.ORGANIZATION
				} as any
			];

			tenantRepo.findAndCount.mockResolvedValue([mockTenants, mockTenants.length]);

			const result = await service.findAll({ status: 'ACTIVE' });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].status).toBe(TenantStatus.ACTIVE);
		});

		it('should filter tenants by type', async () => {
			const mockTenants: Tenant[] = [
				{
					id: 'tenant1',
					name: 'Individual Workspace',
					slug: 'individual',
					status: TenantStatus.ACTIVE,
					type: TenantType.INDIVIDUAL
				} as any
			];

			tenantRepo.findAndCount.mockResolvedValue([mockTenants, mockTenants.length]);

			const result = await service.findAll({ type: 'INDIVIDUAL' });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].type).toBe(TenantType.INDIVIDUAL);
		});

		it('should filter tenants by subscription plan', async () => {
			const mockTenants: Tenant[] = [
				{
					id: 'tenant1',
					name: 'Pro Org',
					slug: 'pro',
					status: TenantStatus.ACTIVE,
					type: TenantType.ORGANIZATION,
					subscriptionPlan: 'pro'
				} as any
			];

			tenantRepo.findAndCount.mockResolvedValue([mockTenants, mockTenants.length]);

			const result = await service.findAll({ subscriptionPlan: 'pro' });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].subscriptionPlan).toBe('pro');
		});

		it('should search tenants by keyword', async () => {
			const mockTenants: Tenant[] = [
				{
					id: 'tenant1',
					name: 'Search Org',
					slug: 'search',
					status: TenantStatus.ACTIVE,
					type: TenantType.ORGANIZATION
				} as any
			];

			tenantRepo.findAndCount.mockResolvedValue([mockTenants, mockTenants.length]);

			const result = await service.findAll({ search: 'Search' });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].name).toContain('Search');
		});
	});

	describe('findOne', () => {
		it('should find tenant by id', async () => {
			const mockTenant: Tenant = {
				id: 'tenant123',
				name: 'Test Org',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION
			} as any;

			tenantRepo.findOne.mockResolvedValue(mockTenant);

			const result = await service.findOne('tenant123');

			expect(result).toBeDefined();
			expect(result.id).toBe('tenant123');
		});

		it('should throw NotFoundException when tenant not found', async () => {
			tenantRepo.findOne.mockResolvedValue(null);

			await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
		});
	});

	describe('findBySlug', () => {
		it('should find tenant by slug', async () => {
			const mockTenant: Tenant = {
				id: 'tenant123',
				name: 'Test Org',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION
			} as any;

			tenantRepo.findOne.mockResolvedValue(mockTenant);

			const result = await service.findBySlug('test-org');

			expect(result).toBeDefined();
			expect(result.slug).toBe('test-org');
		});

		it('should throw NotFoundException when tenant not found by slug', async () => {
			tenantRepo.findOne.mockResolvedValue(null);

			await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should successfully update tenant', async () => {
			const mockTenant: Tenant = {
				id: 'tenant123',
				name: 'Old Name',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION
			} as any;

			tenantRepo.findOne.mockResolvedValue(mockTenant);

			const updateTenantDto = { name: 'New Name', maxUsers: 200 };

			const result = await service.update('tenant123', updateTenantDto);

			expect(result.name).toBe('New Name');
			expect(em.persist).toHaveBeenCalledWith(mockTenant);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when tenant not found', async () => {
			tenantRepo.findOne.mockResolvedValue(null);

			const updateTenantDto = { name: 'Updated Name' };

			await expect(service.update('nonexistent', updateTenantDto)).rejects.toThrow(NotFoundException);
		});

		it('should throw BadRequestException when slug conflicts', async () => {
			const existingTenant = {
				id: 'other-tenant',
				name: 'Other Org',
				slug: 'new-slug'
			} as any;

			const mockTenant: Tenant = {
				id: 'tenant123',
				name: 'Test Org',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION
			} as any;

			tenantRepo.findOne.mockResolvedValueOnce(mockTenant).mockResolvedValueOnce(existingTenant);

			const updateTenantDto = { slug: 'new-slug' };

			await expect(service.update('tenant123', updateTenantDto)).rejects.toThrow(BadRequestException);
		});

		it('should update status when provided', async () => {
			const mockTenant: Tenant = {
				id: 'tenant123',
				name: 'Test Org',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION
			} as any;

			tenantRepo.findOne.mockResolvedValue(mockTenant);

			const updateTenantDto = { status: 'SUSPENDED' as any };

			const result = await service.update('tenant123', updateTenantDto);

			expect(result.status).toBe(TenantStatus.SUSPENDED);
		});

		it('should update type when provided', async () => {
			const mockTenant: Tenant = {
				id: 'tenant123',
				name: 'Test Org',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION
			} as any;

			tenantRepo.findOne.mockResolvedValue(mockTenant);

			const updateTenantDto = { type: 'INDIVIDUAL' as any };

			const result = await service.update('tenant123', updateTenantDto);

			expect(result.type).toBe(TenantType.INDIVIDUAL);
		});
	});

	describe('remove', () => {
		it('should successfully delete tenant', async () => {
			const mockTenant: Tenant = {
				id: 'tenant123',
				name: 'Test Org',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION
			} as any;

			tenantRepo.findOne.mockResolvedValue(mockTenant);

			await service.remove('tenant123');

			expect(em.remove).toHaveBeenCalledWith(mockTenant);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when tenant not found', async () => {
			tenantRepo.findOne.mockResolvedValue(null);

			await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
		});
	});

	describe('suspend', () => {
		it('should successfully suspend tenant', async () => {
			const mockTenant: Tenant = {
				id: 'tenant123',
				name: 'Test Org',
				slug: 'test-org',
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION
			} as any;

			tenantRepo.findOne.mockResolvedValue(mockTenant);

			const result = await service.suspend('tenant123');

			expect(result.status).toBe(TenantStatus.SUSPENDED);
			expect(em.persist).toHaveBeenCalledWith(mockTenant);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when tenant not found', async () => {
			tenantRepo.findOne.mockResolvedValue(null);

			await expect(service.suspend('nonexistent')).rejects.toThrow(NotFoundException);
		});
	});

	describe('activate', () => {
		it('should successfully activate tenant', async () => {
			const mockTenant: Tenant = {
				id: 'tenant123',
				name: 'Test Org',
				slug: 'test-org',
				status: TenantStatus.SUSPENDED,
				type: TenantType.ORGANIZATION
			} as any;

			tenantRepo.findOne.mockResolvedValue(mockTenant);

			const result = await service.activate('tenant123');

			expect(result.status).toBe(TenantStatus.ACTIVE);
			expect(em.persist).toHaveBeenCalledWith(mockTenant);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when tenant not found', async () => {
			tenantRepo.findOne.mockResolvedValue(null);

			await expect(service.activate('nonexistent')).rejects.toThrow(NotFoundException);
		});
	});
});
