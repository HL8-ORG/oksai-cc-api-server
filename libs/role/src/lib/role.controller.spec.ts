import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role, RoleType } from './entities/role.entity';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, AssignPermissionsDto, RevokePermissionsDto } from './dto/role.dto';

jest.mock('@oksai/common', () => ({
	validatePasswordStrength: jest.fn().mockReturnValue(true)
}));

describe('RoleController', () => {
	let controller: RoleController;
	let service: RoleService;
	let roleService: any;

	const mockRole: Role = {
		id: 'test-role-id',
		name: 'Admin Role',
		slug: 'admin-role',
		type: RoleType.ADMIN,
		description: 'Admin role description',
		tenantId: 'default',
		isEnabled: true,
		createdAt: new Date(),
		updatedAt: new Date()
	} as Role;

	beforeEach(async () => {
		roleService = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			findBySlug: jest.fn(),
			update: jest.fn(),
			remove: jest.fn(),
			assignPermissions: jest.fn(),
			revokePermissions: jest.fn(),
			enable: jest.fn(),
			disable: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [RoleController],
			providers: [
				{
					provide: RoleService,
					useValue: roleService
				}
			]
		}).compile();

		controller = module.get<RoleController>(RoleController);
		service = module.get<RoleService>(RoleService);
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new role', async () => {
			const createDto: CreateRoleDto = {
				name: 'Admin Role',
				slug: 'admin-role',
				description: 'Admin role description',
				type: RoleType.ADMIN,
				permissionIds: ['perm-1', 'perm-2']
			};

			(roleService.create as jest.Mock).mockResolvedValue(mockRole);

			const result = await controller.create(createDto);

			expect(roleService.create).toHaveBeenCalledWith(createDto, '');
			expect(result).toEqual(mockRole);
		});
	});

	describe('findAll', () => {
		it('should return paginated roles', async () => {
			const query: QueryRoleDto = { page: 1, limit: 10 };
			(roleService.findAll as jest.Mock).mockResolvedValue({ data: [mockRole], total: 1 });

			const result = await controller.findAll(query);

			expect(roleService.findAll).toHaveBeenCalledWith(query);
			expect(result).toEqual({ data: [mockRole], total: 1 });
		});
	});

	describe('findOne', () => {
		it('should return a single role', async () => {
			(roleService.findOne as jest.Mock).mockResolvedValue(mockRole);

			const result = await controller.findOne('test-role-id');

			expect(roleService.findOne).toHaveBeenCalledWith('test-role-id');
			expect(result).toEqual(mockRole);
		});
	});

	describe('findBySlug', () => {
		it('should return a role by slug', async () => {
			(roleService.findBySlug as jest.Mock).mockResolvedValue(mockRole);

			const result = await controller.findBySlug('admin-role', 'default');

			expect(roleService.findBySlug).toHaveBeenCalledWith('admin-role', 'default');
			expect(result).toEqual(mockRole);
		});
	});

	describe('update', () => {
		it('should update a role', async () => {
			const updateDto: UpdateRoleDto = {
				name: 'Updated Role',
				slug: 'updated-role',
				description: 'Updated description'
			};

			(roleService.update as jest.Mock).mockResolvedValue(mockRole);

			const result = await controller.update('test-role-id', updateDto);

			expect(roleService.update).toHaveBeenCalledWith('test-role-id', updateDto);
			expect(result).toEqual(mockRole);
		});
	});

	describe('remove', () => {
		it('should remove a role', async () => {
			(roleService.remove as jest.Mock).mockResolvedValue(undefined);

			await controller.remove('test-role-id');

			expect(roleService.remove).toHaveBeenCalledWith('test-role-id');
		});
	});

	describe('assignPermissions', () => {
		it('should assign permissions to a role', async () => {
			const dto: AssignPermissionsDto = { permissionIds: ['perm-1', 'perm-2'] };
			(roleService.assignPermissions as jest.Mock).mockResolvedValue(mockRole);

			const result = await controller.assignPermissions('test-role-id', dto);

			expect(roleService.assignPermissions).toHaveBeenCalledWith('test-role-id', dto);
			expect(result).toEqual(mockRole);
		});
	});

	describe('revokePermissions', () => {
		it('should revoke permissions from a role', async () => {
			const dto: RevokePermissionsDto = { permissionIds: ['perm-1', 'perm-2'] };
			(roleService.revokePermissions as jest.Mock).mockResolvedValue(mockRole);

			const result = await controller.revokePermissions('test-role-id', dto);

			expect(roleService.revokePermissions).toHaveBeenCalledWith('test-role-id', dto);
			expect(result).toEqual(mockRole);
		});
	});

	describe('enable', () => {
		it('should enable a role', async () => {
			(roleService.enable as jest.Mock).mockResolvedValue(mockRole);

			const result = await controller.enable('test-role-id');

			expect(roleService.enable).toHaveBeenCalledWith('test-role-id');
			expect(result).toEqual(mockRole);
		});
	});

	describe('disable', () => {
		it('should disable a role', async () => {
			(roleService.disable as jest.Mock).mockResolvedValue(mockRole);

			const result = await controller.disable('test-role-id');

			expect(roleService.disable).toHaveBeenCalledWith('test-role-id');
			expect(result).toEqual(mockRole);
		});
	});
});
