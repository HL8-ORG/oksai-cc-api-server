import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto, QueryOrganizationDto } from './dto/organization.dto';
import { Organization, OrganizationStatus } from './entities/organization.entity';

describe('OrganizationController', () => {
	let controller: OrganizationController;
	let service: any;

	const mockOrganization: Organization = {
		id: 'test-org-id',
		name: 'Test Organization',
		slug: 'test-org',
		status: OrganizationStatus.ACTIVE,
		tenantId: 'default'
	} as Organization;

	beforeEach(async () => {
		const mockOrganizationService = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			findBySlug: jest.fn(),
			update: jest.fn(),
			remove: jest.fn(),
			suspend: jest.fn(),
			activate: jest.fn(),
			findByTenantId: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [OrganizationController],
			providers: [
				{
					provide: OrganizationService,
					useValue: mockOrganizationService
				}
			]
		}).compile();

		controller = module.get<OrganizationController>(OrganizationController);
		service = mockOrganizationService;
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new organization', async () => {
			const createDto: CreateOrganizationDto = {
				tenantId: 'default',
				name: 'New Organization',
				slug: 'new-org'
			};

			service.create.mockResolvedValue(mockOrganization);

			const result = await controller.create(createDto);

			expect(service.create).toHaveBeenCalledWith(createDto, '');
			expect(result).toEqual(mockOrganization);
		});
	});

	describe('findAll', () => {
		it('should return all organizations', async () => {
			const query: QueryOrganizationDto = {};
			const expectedResponse = { data: [mockOrganization], total: 1 };

			service.findAll.mockResolvedValue(expectedResponse);

			const result = await controller.findAll(query);

			expect(service.findAll).toHaveBeenCalledWith(query);
			expect(result).toEqual(expectedResponse);
		});
	});

	describe('findOne', () => {
		it('should return an organization by id', async () => {
			service.findOne.mockResolvedValue(mockOrganization);

			const result = await controller.findOne('test-org-id');

			expect(service.findOne).toHaveBeenCalledWith('test-org-id');
			expect(result).toEqual(mockOrganization);
		});
	});

	describe('findBySlug', () => {
		it('should return an organization by slug', async () => {
			service.findBySlug.mockResolvedValue(mockOrganization);

			const result = await controller.findBySlug('test-org', { tenantId: 'default' });

			expect(service.findBySlug).toHaveBeenCalledWith('test-org', 'default');
			expect(result).toEqual(mockOrganization);
		});
	});

	describe('update', () => {
		it('should update an organization successfully', async () => {
			const updateDto: UpdateOrganizationDto = { name: 'Updated Organization' };

			service.update.mockResolvedValue(mockOrganization);

			const result = await controller.update('test-org-id', updateDto);

			expect(service.update).toHaveBeenCalledWith('test-org-id', updateDto);
			expect(result).toEqual(mockOrganization);
		});
	});

	describe('remove', () => {
		it('should remove an organization successfully', async () => {
			service.remove.mockResolvedValue(undefined);

			await controller.remove('test-org-id');

			expect(service.remove).toHaveBeenCalledWith('test-org-id');
		});
	});

	describe('suspend', () => {
		it('should suspend an organization successfully', async () => {
			service.suspend.mockResolvedValue(mockOrganization);

			const result = await controller.suspend('test-org-id');

			expect(service.suspend).toHaveBeenCalledWith('test-org-id');
			expect(result).toEqual(mockOrganization);
		});
	});

	describe('activate', () => {
		it('should activate an organization successfully', async () => {
			service.activate.mockResolvedValue(mockOrganization);

			const result = await controller.activate('test-org-id');

			expect(service.activate).toHaveBeenCalledWith('test-org-id');
			expect(result).toEqual(mockOrganization);
		});
	});

	describe('findByTenantId', () => {
		it('should return organizations for a tenant', async () => {
			const query: QueryOrganizationDto = {};
			const expectedResponse = { data: [mockOrganization], total: 1 };

			service.findByTenantId.mockResolvedValue(expectedResponse);

			const result = await controller.findByTenantId('default', query);

			expect(service.findByTenantId).toHaveBeenCalledWith('default', query);
			expect(result).toEqual(expectedResponse);
		});
	});
});
