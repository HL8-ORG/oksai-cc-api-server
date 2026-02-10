import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository, wrap } from '@mikro-orm/core';
import { RoleService } from './role.service';
import { Role, RoleType } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, AssignPermissionsDto, RevokePermissionsDto } from './dto/role.dto';

jest.mock('@oksai/common', () => ({
	validatePasswordStrength: jest.fn().mockReturnValue(true)
}));

const mockWrap = jest.fn((obj: any) => ({
	assign: jest.fn((data: any) => Object.assign(obj, data)),
	init: jest.fn()
}));

jest.doMock('@mikro-orm/core', () => {
	const actualModule = jest.requireActual('@mikro-orm/core');
	return {
		...actualModule,
		wrap: mockWrap
	};
});

describe('RoleService', () => {
	let service: RoleService;
	let roleRepo: any;
	let permissionRepo: any;
	let em: any;

	let mockRole: Role;

	const createMockRole = () =>
		({
			id: 'test-role-id',
			name: 'Admin Role',
			slug: 'admin-role',
			type: RoleType.ADMIN,
			description: 'Admin role description',
			tenantId: 'default',
			isEnabled: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			permissions: {
				contains: jest.fn(),
				add: jest.fn(),
				remove: jest.fn()
			} as any
		} as Role);

	const mockPermission: Permission = {
		id: 'test-perm-id',
		name: 'Read Permission',
		type: 'PERMISSION' as any,
		action: 'VIEW' as any,
		description: 'Read permission description',
		resource: 'users',
		tenantId: 'default',
		isEnabled: true,
		createdAt: new Date(),
		updatedAt: new Date()
	} as Permission;

	beforeEach(async () => {
		mockRole = createMockRole();
		((mockRole.permissions as any).contains as jest.Mock).mockReturnValue(false);

		em = {
			persist: jest.fn(),
			persistAndFlush: jest.fn().mockResolvedValue(undefined),
			remove: jest.fn(),
			removeAndFlush: jest.fn().mockResolvedValue(undefined),
			flush: jest.fn().mockResolvedValue(undefined)
		};

		roleRepo = {
			create: jest.fn(),
			findOne: jest.fn(),
			find: jest.fn(),
			findAndCount: jest.fn(),
			getEntityManager: jest.fn(() => em)
		};

		permissionRepo = {
			create: jest.fn(),
			findOne: jest.fn(),
			find: jest.fn().mockResolvedValue([mockPermission]),
			findAndCount: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RoleService,
				{
					provide: getRepositoryToken(Role),
					useValue: roleRepo
				},
				{
					provide: getRepositoryToken(Permission),
					useValue: permissionRepo
				}
			]
		}).compile();

		service = module.get<RoleService>(RoleService);
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new role successfully', async () => {
			const createDto: CreateRoleDto = {
				name: 'Admin Role',
				slug: 'admin-role',
				description: 'Administrator role with full access',
				type: RoleType.ADMIN,
				permissionIds: ['perm-1', 'perm-2']
			};

			roleRepo.findOne.mockResolvedValue(null);
			roleRepo.create.mockReturnValue(mockRole);

			const result = await service.create(createDto, 'default');

			expect(roleRepo.findOne).toHaveBeenCalledWith({ slug: 'admin-role', tenantId: 'default' });
			expect(roleRepo.create).toHaveBeenCalledWith({
				...createDto,
				tenantId: 'default',
				isEnabled: true
			});
			expect(em.persist).toHaveBeenCalledWith(mockRole);
			expect(em.flush).toHaveBeenCalled();
			expect(result).toEqual(mockRole);
		});

		it('should throw BadRequestException if role slug already exists', async () => {
			const createDto: CreateRoleDto = {
				name: 'Admin Role',
				slug: 'admin-role',
				description: 'Administrator role with full access',
				type: RoleType.ADMIN,
				permissionIds: ['perm-1', 'perm-2']
			};

			roleRepo.findOne.mockResolvedValue(mockRole);

			await expect(service.create(createDto, 'default')).rejects.toThrow(BadRequestException);
		});
	});

	describe('findAll', () => {
		it('should return paginated roles', async () => {
			const query: QueryRoleDto = { page: 1, limit: 10 };
			roleRepo.findAndCount.mockResolvedValue([[mockRole], 1]);

			const result = await service.findAll(query);

			expect(roleRepo.findAndCount).toHaveBeenCalled();
			expect(result).toEqual({ data: [mockRole], total: 1 });
		});

		it('should filter by search keyword', async () => {
			const query: QueryRoleDto = { search: 'admin' };
			roleRepo.findAndCount.mockResolvedValue([[mockRole], 1]);

			await service.findAll(query);

			const calledWith = roleRepo.findAndCount.mock.calls[0][0];
			expect(calledWith.$or).toBeDefined();
		});

		it('should filter by type', async () => {
			const query: QueryRoleDto = { type: RoleType.ADMIN };
			roleRepo.findAndCount.mockResolvedValue([[mockRole], 1]);

			await service.findAll(query);

			const calledWith = roleRepo.findAndCount.mock.calls[0][0];
			expect(calledWith.type).toBe(RoleType.ADMIN);
		});

		it('should filter by isEnabled status', async () => {
			const query: QueryRoleDto = { isEnabled: 'true' };
			roleRepo.findAndCount.mockResolvedValue([[mockRole], 1]);

			await service.findAll(query);

			const calledWith = roleRepo.findAndCount.mock.calls[0][0];
			expect(calledWith.isEnabled).toBe(true);
		});
	});

	describe('findOne', () => {
		it('should return a role by id', async () => {
			roleRepo.findOne.mockResolvedValue(mockRole);

			const result = await service.findOne('test-role-id');

			expect(roleRepo.findOne).toHaveBeenCalledWith('test-role-id');
			expect(result).toEqual(mockRole);
		});

		it('should throw NotFoundException if role not found', async () => {
			roleRepo.findOne.mockResolvedValue(null);

			await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
		});
	});

	describe('findBySlug', () => {
		it('should return a role by slug', async () => {
			roleRepo.findOne.mockResolvedValue(mockRole);

			const result = await service.findBySlug('admin-role', 'default');

			expect(roleRepo.findOne).toHaveBeenCalledWith({ slug: 'admin-role', tenantId: 'default' });
			expect(result).toEqual(mockRole);
		});

		it('should throw NotFoundException if role not found', async () => {
			roleRepo.findOne.mockResolvedValue(null);

			await expect(service.findBySlug('invalid-slug', 'default')).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should update a role successfully', async () => {
			const updateDto: UpdateRoleDto = {
				name: 'Updated Admin Role',
				slug: 'updated-admin-role',
				description: 'Updated description'
			};
			roleRepo.findOne.mockResolvedValue(mockRole).mockResolvedValueOnce(mockRole).mockResolvedValueOnce(null);

			await service.update('test-role-id', updateDto);

			expect(em.persist).toHaveBeenCalledWith(mockRole);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw BadRequestException if slug already exists', async () => {
			const updateDto: UpdateRoleDto = {
				name: 'Updated Admin Role',
				slug: 'existing-slug',
				description: 'Updated description'
			};
			roleRepo.findOne
				.mockResolvedValue(mockRole)
				.mockResolvedValueOnce(mockRole)
				.mockResolvedValueOnce(mockRole);

			await expect(service.update('test-role-id', updateDto)).rejects.toThrow(BadRequestException);
		});
	});

	describe('remove', () => {
		it('should remove a role successfully', async () => {
			roleRepo.findOne.mockResolvedValue(mockRole);

			await service.remove('test-role-id');

			expect(em.remove).toHaveBeenCalledWith(mockRole);
			expect(em.flush).toHaveBeenCalled();
		});
	});

	describe('assignPermissions', () => {
		it('should assign permissions to a role', async () => {
			const dto: AssignPermissionsDto = { permissionIds: ['perm-1'] };
			roleRepo.findOne.mockResolvedValue(mockRole);
			permissionRepo.find.mockResolvedValue([mockPermission]);

			const result = await service.assignPermissions('test-role-id', dto);

			expect(em.persist).toHaveBeenCalledWith(mockRole);
			expect(em.flush).toHaveBeenCalled();
			expect(result).toEqual(mockRole);
		});

		it('should throw BadRequestException if no permission IDs provided', async () => {
			const dto: AssignPermissionsDto = { permissionIds: [] };
			roleRepo.findOne.mockResolvedValue(mockRole);

			await expect(service.assignPermissions('test-role-id', dto)).rejects.toThrow(BadRequestException);
		});
	});

	describe('revokePermissions', () => {
		it('should revoke permissions from a role', async () => {
			const dto: RevokePermissionsDto = { permissionIds: ['perm-1'] };
			roleRepo.findOne.mockResolvedValue(mockRole);
			permissionRepo.find.mockResolvedValue([mockPermission]);

			const result = await service.revokePermissions('test-role-id', dto);

			expect(em.persist).toHaveBeenCalledWith(mockRole);
			expect(em.flush).toHaveBeenCalled();
			expect(result).toEqual(mockRole);
		});

		it('should throw BadRequestException if no permission IDs provided', async () => {
			const dto: RevokePermissionsDto = { permissionIds: [] };
			roleRepo.findOne.mockResolvedValue(mockRole);

			await expect(service.revokePermissions('test-role-id', dto)).rejects.toThrow(BadRequestException);
		});
	});

	describe('enable', () => {
		it('should enable a role', async () => {
			mockRole.isEnabled = false;
			roleRepo.findOne.mockResolvedValue(mockRole);

			const result = await service.enable('test-role-id');

			expect(mockRole.isEnabled).toBe(true);
			expect(em.persist).toHaveBeenCalledWith(mockRole);
			expect(em.flush).toHaveBeenCalled();
			expect(result).toEqual(mockRole);
		});
	});

	describe('disable', () => {
		it('should disable a role', async () => {
			mockRole.isEnabled = true;
			roleRepo.findOne.mockResolvedValue(mockRole);

			const result = await service.disable('test-role-id');

			expect(mockRole.isEnabled).toBe(false);
			expect(em.persist).toHaveBeenCalledWith(mockRole);
			expect(em.flush).toHaveBeenCalled();
			expect(result).toEqual(mockRole);
		});
	});
});
