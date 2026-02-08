import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Permission, PermissionType, PermissionAction } from './entities/permission.entity';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';

describe('PermissionService', () => {
	let service: PermissionService;
	let permissionRepo: any;
	let em: any;

	beforeEach(async () => {
		permissionRepo = {
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

		permissionRepo.getEntityManager.mockReturnValue(em);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PermissionService,
				{
					provide: getRepositoryToken(Permission),
					useValue: permissionRepo
				}
			]
		}).compile();

		service = module.get<PermissionService>(PermissionService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should successfully create a new permission', async () => {
			permissionRepo.findOne.mockResolvedValue(null);

			const createdPermission = {
				id: 'perm-123',
				name: '查看用户',
				type: PermissionType.USER,
				action: PermissionAction.VIEW,
				resource: 'user',
				tenantId: 'tenant-123',
				isEnabled: true
			} as any;

			permissionRepo.create.mockReturnValue(createdPermission);

			const createPermissionDto = {
				name: '查看用户',
				type: PermissionType.USER,
				action: PermissionAction.VIEW,
				resource: 'user',
				tenantId: 'tenant-123'
			};

			const result = await service.create(createPermissionDto);

			expect(result).toBeDefined();
			expect(result.name).toBe('查看用户');
			expect(result.type).toBe(PermissionType.USER);
			expect(result.action).toBe(PermissionAction.VIEW);
			expect(result.resource).toBe('user');
			expect(result.isEnabled).toBe(true);
			expect(em.persist).toHaveBeenCalledWith(createdPermission);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw BadRequestException when permission already exists', async () => {
			const existingPermission = {
				id: 'existing-123',
				name: '查看用户',
				type: PermissionType.USER,
				action: PermissionAction.VIEW,
				resource: 'user'
			} as any;

			permissionRepo.findOne.mockResolvedValue(existingPermission);

			const createPermissionDto = {
				name: '查看用户',
				type: PermissionType.USER,
				action: PermissionAction.VIEW,
				resource: 'user',
				tenantId: 'tenant-123'
			};

			await expect(service.create(createPermissionDto)).rejects.toThrow(BadRequestException);
		});
	});

	describe('findAll', () => {
		it('should return all permissions', async () => {
			const mockPermissions: Permission[] = [
				{
					id: 'perm1',
					name: '查看用户',
					type: 'USER',
					action: 'VIEW',
					resource: 'user',
					isEnabled: true
				} as any,
				{
					id: 'perm2',
					name: '创建用户',
					type: 'USER',
					action: 'CREATE',
					resource: 'user',
					isEnabled: true
				} as any
			];

			permissionRepo.findAndCount.mockResolvedValue([mockPermissions, mockPermissions.length]);

			const result = await service.findAll({});

			expect(result.data).toHaveLength(2);
			expect(result.total).toBe(2);
		});

		it('should filter permissions by type', async () => {
			const mockPermissions: Permission[] = [
				{
					id: 'perm1',
					name: '查看用户',
					type: PermissionType.USER,
					action: PermissionAction.VIEW,
					resource: 'user',
					isEnabled: true
				} as any
			];

			permissionRepo.findAndCount.mockResolvedValue([mockPermissions, mockPermissions.length]);

			const result = await service.findAll({ type: PermissionType.USER });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].type).toBe(PermissionType.USER);
		});

		it('should filter permissions by action', async () => {
			const mockPermissions: Permission[] = [
				{
					id: 'perm1',
					name: '查看用户',
					type: PermissionType.USER,
					action: PermissionAction.VIEW,
					resource: 'user',
					isEnabled: true
				} as any
			];

			permissionRepo.findAndCount.mockResolvedValue([mockPermissions, mockPermissions.length]);

			const result = await service.findAll({ action: PermissionAction.VIEW });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].action).toBe(PermissionAction.VIEW);
		});

		it('should filter permissions by resource', async () => {
			const mockPermissions: Permission[] = [
				{
					id: 'perm1',
					name: '查看用户',
					type: 'USER',
					action: 'VIEW',
					resource: 'user',
					isEnabled: true
				} as any
			];

			permissionRepo.findAndCount.mockResolvedValue([mockPermissions, mockPermissions.length]);

			const result = await service.findAll({ resource: 'user' });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].resource).toBe('user');
		});

		it('should filter permissions by enabled status', async () => {
			const mockPermissions: Permission[] = [
				{
					id: 'perm1',
					name: '查看用户',
					type: 'USER',
					action: 'VIEW',
					resource: 'user',
					isEnabled: true
				} as any
			];

			permissionRepo.findAndCount.mockResolvedValue([mockPermissions, mockPermissions.length]);

			const result = await service.findAll({ isEnabled: 'true' });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].isEnabled).toBe(true);
		});

		it('should search permissions by keyword', async () => {
			const mockPermissions: Permission[] = [
				{
					id: 'perm1',
					name: '查看用户',
					type: 'USER',
					action: 'VIEW',
					resource: 'user',
					isEnabled: true
				} as any
			];

			permissionRepo.findAndCount.mockResolvedValue([mockPermissions, mockPermissions.length]);

			const result = await service.findAll({ search: '查看' });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].name).toContain('查看');
		});
	});

	describe('findOne', () => {
		it('should find permission by id', async () => {
			const mockPermission: Permission = {
				id: 'perm123',
				name: '查看用户',
				type: 'USER',
				action: 'VIEW',
				resource: 'user',
				isEnabled: true
			} as any;

			permissionRepo.findOne.mockResolvedValue(mockPermission);

			const result = await service.findOne('perm123');

			expect(result).toBeDefined();
			expect(result.id).toBe('perm123');
		});

		it('should throw NotFoundException when permission not found', async () => {
			permissionRepo.findOne.mockResolvedValue(null);

			await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
		});
	});

	describe('findByTenantId', () => {
		it('should find permissions by tenant id', async () => {
			const mockPermissions: Permission[] = [
				{
					id: 'perm1',
					name: '查看用户',
					type: 'USER',
					action: 'VIEW',
					resource: 'user',
					isEnabled: true,
					tenantId: 'tenant-123'
				} as any
			];

			permissionRepo.findAndCount.mockResolvedValue([mockPermissions, mockPermissions.length]);

			const result = await service.findByTenantId('tenant-123');

			expect(result.data).toHaveLength(1);
			expect(result.data[0].tenantId).toBe('tenant-123');
		});
	});

	describe('update', () => {
		it('should successfully update permission', async () => {
			const mockPermission: Permission = {
				id: 'perm123',
				name: '查看用户',
				type: 'USER',
				action: 'VIEW',
				resource: 'user',
				isEnabled: true
			} as any;

			permissionRepo.findOne.mockResolvedValue(mockPermission);

			const updatePermissionDto = { name: '查看所有用户', description: '可以查看所有用户的详细信息' };

			const result = await service.update('perm123', updatePermissionDto);

			expect(result.name).toBe('查看所有用户');
			expect(em.persist).toHaveBeenCalledWith(mockPermission);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when permission not found', async () => {
			permissionRepo.findOne.mockResolvedValue(null);

			const updatePermissionDto = { name: 'Updated Name' };

			await expect(service.update('nonexistent', updatePermissionDto)).rejects.toThrow(NotFoundException);
		});

		it('should throw BadRequestException when permission conflicts', async () => {
			const existingPermission = {
				id: 'other-perm',
				name: '查看用户',
				type: PermissionType.USER,
				action: PermissionAction.VIEW,
				resource: 'user'
			} as any;

			const mockPermission: Permission = {
				id: 'perm123',
				name: '创建用户',
				type: PermissionType.USER,
				action: PermissionAction.CREATE,
				resource: 'user',
				isEnabled: true
			} as any;

			permissionRepo.findOne.mockResolvedValueOnce(mockPermission).mockResolvedValueOnce(existingPermission);

			const updatePermissionDto = {
				type: PermissionType.USER,
				action: PermissionAction.VIEW,
				resource: 'user'
			};

			await expect(service.update('perm123', updatePermissionDto)).rejects.toThrow(BadRequestException);
		});
	});

	describe('remove', () => {
		it('should successfully delete permission', async () => {
			const mockPermission: Permission = {
				id: 'perm123',
				name: '查看用户',
				type: 'USER',
				action: 'VIEW',
				resource: 'user',
				isEnabled: true
			} as any;

			permissionRepo.findOne.mockResolvedValue(mockPermission);

			await service.remove('perm123');

			expect(em.remove).toHaveBeenCalledWith(mockPermission);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when permission not found', async () => {
			permissionRepo.findOne.mockResolvedValue(null);

			await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
		});
	});

	describe('enable', () => {
		it('should successfully enable permission', async () => {
			const mockPermission: Permission = {
				id: 'perm123',
				name: '查看用户',
				type: 'USER',
				action: 'VIEW',
				resource: 'user',
				isEnabled: false
			} as any;

			permissionRepo.findOne.mockResolvedValue(mockPermission);

			const result = await service.enable('perm123');

			expect(result.isEnabled).toBe(true);
			expect(em.persist).toHaveBeenCalledWith(mockPermission);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when permission not found', async () => {
			permissionRepo.findOne.mockResolvedValue(null);

			await expect(service.enable('nonexistent')).rejects.toThrow(NotFoundException);
		});
	});

	describe('disable', () => {
		it('should successfully disable permission', async () => {
			const mockPermission: Permission = {
				id: 'perm123',
				name: '查看用户',
				type: 'USER',
				action: 'VIEW',
				resource: 'user',
				isEnabled: true
			} as any;

			permissionRepo.findOne.mockResolvedValue(mockPermission);

			const result = await service.disable('perm123');

			expect(result.isEnabled).toBe(false);
			expect(em.persist).toHaveBeenCalledWith(mockPermission);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when permission not found', async () => {
			permissionRepo.findOne.mockResolvedValue(null);

			await expect(service.disable('nonexistent')).rejects.toThrow(NotFoundException);
		});
	});
});
