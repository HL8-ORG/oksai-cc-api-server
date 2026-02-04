import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { OrganizationService } from './organization.service';
import { Organization, OrganizationStatus } from './entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto, QueryOrganizationDto } from './dto/organization.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrganizationService', () => {
	let service: OrganizationService;
	let organizationRepo: any;
	let em: any;

	const mockOrganization: Organization = {
		id: 'test-org-id',
		name: 'Test Organization',
		slug: 'test-org',
		status: OrganizationStatus.ACTIVE,
		tenantId: 'user-id',
		createdAt: new Date(),
		updatedAt: new Date()
	} as Organization;

	beforeEach(async () => {
		em = {
			persist: jest.fn(),
			persistAndFlush: jest.fn().mockResolvedValue(undefined),
			remove: jest.fn(),
			removeAndFlush: jest.fn().mockResolvedValue(undefined),
			flush: jest.fn().mockResolvedValue(undefined)
		};

		organizationRepo = {
			create: jest.fn(),
			findOne: jest.fn(),
			find: jest.fn(),
			findAndCount: jest.fn(),
			getEntityManager: jest.fn(() => em)
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OrganizationService,
				{
					provide: getRepositoryToken(Organization),
					useValue: organizationRepo
				}
			]
		}).compile();

		service = module.get<OrganizationService>(OrganizationService);
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new organization successfully', async () => {
			const createDto: CreateOrganizationDto = {
				name: 'New Organization',
				slug: 'new-org'
			};

			organizationRepo.findOne.mockResolvedValue(null);
			organizationRepo.create.mockReturnValue(mockOrganization);

			const result = await service.create(createDto, 'user-id');

			expect(organizationRepo.create).toHaveBeenCalledWith({
				...createDto,
				tenantId: 'user-id',
				status: OrganizationStatus.ACTIVE
			});
			expect(em.persistAndFlush).toHaveBeenCalled();
			expect(result).toEqual(mockOrganization);
		});

		it('should throw BadRequestException when slug already exists', async () => {
			const createDto: CreateOrganizationDto = {
				name: 'Existing Organization',
				slug: 'existing-org'
			};

			organizationRepo.findOne.mockResolvedValue(mockOrganization);

			await expect(service.create(createDto, 'user-id')).rejects.toThrow(BadRequestException);
		});
	});

	describe('findAll', () => {
		it('should return paginated organizations', async () => {
			const query: QueryOrganizationDto = { page: 1, limit: 10 };
			organizationRepo.findAndCount.mockResolvedValue([[mockOrganization], 1]);

			const result = await service.findAll(query);

			expect(organizationRepo.findAndCount).toHaveBeenCalled();
			expect(result).toEqual({ data: [mockOrganization], total: 1 });
		});

		it('should filter organizations by status', async () => {
			organizationRepo.findAndCount.mockResolvedValue([[mockOrganization], 1]);

			await service.findAll({ status: OrganizationStatus.ACTIVE });

			expect(organizationRepo.findAndCount).toHaveBeenCalledWith(
				expect.objectContaining({ status: OrganizationStatus.ACTIVE }),
				expect.anything()
			);
		});

		it('should filter organizations by search term', async () => {
			organizationRepo.findAndCount.mockResolvedValue([[mockOrganization], 1]);

			await service.findAll({ search: 'test' });

			expect(organizationRepo.findAndCount).toHaveBeenCalledWith(
				expect.objectContaining({
					$or: expect.arrayContaining([
						expect.objectContaining({ name: expect.anything() }),
						expect.objectContaining({ slug: expect.anything() }),
						expect.objectContaining({ description: expect.anything() })
					])
				}),
				expect.anything()
			);
		});

		it('should filter organizations by tenantId', async () => {
			organizationRepo.findAndCount.mockResolvedValue([[mockOrganization], 1]);

			await service.findAll({ tenantId: 'default' });

			expect(organizationRepo.findAndCount).toHaveBeenCalledWith(
				expect.objectContaining({ tenantId: 'default' }),
				expect.anything()
			);
		});
	});

	describe('findOne', () => {
		it('should return an organization by id', async () => {
			organizationRepo.findOne.mockResolvedValue(mockOrganization);

			const result = await service.findOne('test-org-id');

			expect(organizationRepo.findOne).toHaveBeenCalledWith({ id: 'test-org-id' });
			expect(result).toEqual(mockOrganization);
		});

		it('should throw NotFoundException when organization not found', async () => {
			organizationRepo.findOne.mockResolvedValue(null);

			await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
		});
	});

	describe('findBySlug', () => {
		it('should return an organization by slug', async () => {
			organizationRepo.findOne.mockResolvedValue(mockOrganization);

			const result = await service.findBySlug('test-org', 'default');

			expect(organizationRepo.findOne).toHaveBeenCalledWith({ slug: 'test-org', tenantId: 'default' });
			expect(result).toEqual(mockOrganization);
		});

		it('should throw NotFoundException when organization not found by slug', async () => {
			organizationRepo.findOne.mockResolvedValue(null);

			await expect(service.findBySlug('invalid-slug', 'default')).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should update an organization successfully', async () => {
			const updateDto: UpdateOrganizationDto = {
				name: 'Updated Organization'
			};

			organizationRepo.findOne.mockResolvedValue(mockOrganization);

			await service.update('test-org-id', updateDto);

			expect(em.persistAndFlush).toHaveBeenCalled();
		});

		it('should throw BadRequestException when slug already exists', async () => {
			const updateDto: UpdateOrganizationDto = {
				slug: 'existing-slug'
			};

			organizationRepo.findOne
				.mockResolvedValue(mockOrganization)
				.mockResolvedValueOnce(mockOrganization)
				.mockResolvedValueOnce(mockOrganization);

			await expect(service.update('test-org-id', updateDto)).rejects.toThrow(BadRequestException);
		});
	});

	describe('remove', () => {
		it('should remove an organization successfully', async () => {
			organizationRepo.findOne.mockResolvedValue(mockOrganization);

			await service.remove('test-org-id');

			expect(em.removeAndFlush).toHaveBeenCalledWith(mockOrganization);
		});
	});

	describe('suspend', () => {
		it('should suspend an organization successfully', async () => {
			organizationRepo.findOne.mockResolvedValue(mockOrganization);

			const result = await service.suspend('test-org-id');

			expect(mockOrganization.status).toBe(OrganizationStatus.SUSPENDED);
			expect(em.persistAndFlush).toHaveBeenCalled();
			expect(result).toEqual(mockOrganization);
		});
	});

	describe('activate', () => {
		it('should activate an organization successfully', async () => {
			mockOrganization.status = OrganizationStatus.INACTIVE;
			organizationRepo.findOne.mockResolvedValue(mockOrganization);

			const result = await service.activate('test-org-id');

			expect(mockOrganization.status).toBe(OrganizationStatus.ACTIVE);
			expect(em.persistAndFlush).toHaveBeenCalled();
			expect(result).toEqual(mockOrganization);
		});
	});

	describe('findByTenantId', () => {
		it('should return organizations filtered by tenantId', async () => {
			organizationRepo.findAndCount.mockResolvedValue([[mockOrganization], 1]);

			const result = await service.findByTenantId('default');

			expect(result).toEqual({ data: [mockOrganization], total: 1 });
		});
	});
});
