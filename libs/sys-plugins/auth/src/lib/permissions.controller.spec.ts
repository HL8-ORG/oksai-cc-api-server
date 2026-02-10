import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController, AssignRolesToUserBodyDto } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { AbilityFactory } from './abilities/ability.factory';

describe('PermissionsController', () => {
	let controller: PermissionsController;
	let service: jest.Mocked<PermissionsService>;
	let abilityFactory: jest.Mocked<AbilityFactory>;

	beforeEach(async () => {
		jest.clearAllMocks();

		service = {
			findAllRoles: jest.fn(),
			findRoleByCode: jest.fn(),
			createRole: jest.fn(),
			updateRole: jest.fn(),
			deleteRole: jest.fn(),
			findAllPermissions: jest.fn(),
			findPermissionByCode: jest.fn(),
			createPermission: jest.fn(),
			updatePermission: jest.fn(),
			deletePermission: jest.fn(),
			assignPermissionToRole: jest.fn(),
			removePermissionFromRole: jest.fn(),
			getRolePermissions: jest.fn(),
			assignRolesToUser: jest.fn(),
			removeRoleFromUser: jest.fn(),
			getUserRoles: jest.fn(),
			getUserPermissions: jest.fn()
		} as any;

		abilityFactory = {
			createForUser: jest.fn().mockResolvedValue({} as any)
		} as any;

		const mockUserRepo = {
			findOne: jest.fn(),
			getRepository: jest.fn()
		} as any;

		const mockRoleRepo = {
			findOne: jest.fn(),
			getRepository: jest.fn()
		} as any;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [PermissionsController],
			providers: [
				{
					provide: PermissionsService,
					useValue: service
				},
				{
					provide: AbilityFactory,
					useValue: abilityFactory
				},
				{
					provide: getRepositoryToken('User'),
					useValue: mockUserRepo
				},
				{
					provide: getRepositoryToken('Role'),
					useValue: mockRoleRepo
				}
			]
		}).compile();

		controller = module.get<PermissionsController>(PermissionsController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('角色管理', () => {
		describe('findAllRoles', () => {
			it('应该返回所有角色', async () => {
				const mockRoles = [
					{ id: '1', code: 'ADMIN', name: '管理员' },
					{ id: '2', code: 'USER', name: '普通用户' }
				];
				service.findAllRoles.mockResolvedValue(mockRoles as any);

				const result = await controller.findAllRoles();

				expect(service.findAllRoles).toHaveBeenCalled();
				expect(result).toEqual(mockRoles);
			});
		});

		describe('findRoleByCode', () => {
			it('应该返回指定代码的角色', async () => {
				const mockRole = { id: '1', code: 'EDITOR', name: '编辑员' };
				service.findRoleByCode.mockResolvedValue(mockRole as any);

				const result = await controller.findRoleByCode('EDITOR');

				expect(service.findRoleByCode).toHaveBeenCalledWith('EDITOR');
				expect(result).toEqual(mockRole);
			});
		});

		describe('createRole', () => {
			it('应该创建新角色', async () => {
				const createDto = {
					code: 'VIEWER',
					name: '查看者',
					description: '只读权限'
				};
				const mockRole = { id: '1', ...createDto };
				service.createRole.mockResolvedValue(mockRole as any);

				const result = await controller.createRole(createDto);

				expect(service.createRole).toHaveBeenCalledWith(createDto);
				expect(result).toEqual(mockRole);
			});
		});

		describe('updateRole', () => {
			it('应该更新角色', async () => {
				const updateDto = {
					name: '高级编辑员',
					description: '可以编辑和删除'
				};
				const mockRole = { id: '1', code: 'EDITOR', ...updateDto };
				service.updateRole.mockResolvedValue(mockRole as any);

				const result = await controller.updateRole('1', updateDto);

				expect(service.updateRole).toHaveBeenCalledWith('1', updateDto);
				expect(result).toEqual(mockRole);
			});
		});

		describe('deleteRole', () => {
			it('应该删除角色', async () => {
				service.deleteRole.mockResolvedValue(undefined as any);

				await controller.deleteRole('1');

				expect(service.deleteRole).toHaveBeenCalledWith('1');
			});
		});
	});

	describe('权限管理', () => {
		describe('findAllPermissions', () => {
			it('应该返回所有权限', async () => {
				const mockPermissions = [
					{ id: '1', code: 'users:read', name: '读取用户' },
					{ id: '2', code: 'users:write', name: '写入用户' }
				];
				service.findAllPermissions.mockResolvedValue(mockPermissions as any);

				const result = await controller.findAllPermissions();

				expect(service.findAllPermissions).toHaveBeenCalled();
				expect(result).toEqual(mockPermissions);
			});
		});

		describe('findPermissionByCode', () => {
			it('应该返回指定代码的权限', async () => {
				const mockPermission = { id: '1', code: 'users:delete', name: '删除用户' };
				service.findPermissionByCode.mockResolvedValue(mockPermission as any);

				const result = await controller.findPermissionByCode('users:delete');

				expect(service.findPermissionByCode).toHaveBeenCalledWith('users:delete');
				expect(result).toEqual(mockPermission);
			});
		});

		describe('createPermission', () => {
			it('应该创建新权限', async () => {
				const createDto = {
					code: 'roles:create',
					name: '创建角色',
					resource: 'Role',
					action: 'create',
					effect: 'allow' as const
				};
				const mockPermission = { id: '1', ...createDto };
				service.createPermission.mockResolvedValue(mockPermission as any);

				const result = await controller.createPermission(createDto);

				expect(service.createPermission).toHaveBeenCalledWith(createDto);
				expect(result).toEqual(mockPermission);
			});
		});

		describe('updatePermission', () => {
			it('应该更新权限', async () => {
				const updateDto = {
					name: '创建角色（已禁用）',
					effect: 'deny' as const
				};
				const mockPermission = { id: '1', code: 'roles:create', ...updateDto };
				service.updatePermission.mockResolvedValue(mockPermission as any);

				const result = await controller.updatePermission('1', updateDto);

				expect(service.updatePermission).toHaveBeenCalledWith('1', updateDto);
				expect(result).toEqual(mockPermission);
			});
		});

		describe('deletePermission', () => {
			it('应该删除权限', async () => {
				service.deletePermission.mockResolvedValue(undefined as any);

				await controller.deletePermission('1');

				expect(service.deletePermission).toHaveBeenCalledWith('1');
			});
		});
	});

	describe('角色权限分配', () => {
		describe('assignPermissionToRole', () => {
			it('应该为角色分配权限', async () => {
				service.assignPermissionToRole.mockResolvedValue(undefined as any);

				await controller.assignPermissionToRole('role-id', { permissionId: 'perm-id' });

				expect(service.assignPermissionToRole).toHaveBeenCalledWith({
					roleId: 'role-id',
					permissionId: 'perm-id'
				});
			});
		});

		describe('removePermissionFromRole', () => {
			it('应该从角色移除权限', async () => {
				service.removePermissionFromRole.mockResolvedValue(undefined as any);

				await controller.removePermissionFromRole('role-id', 'perm-id');

				expect(service.removePermissionFromRole).toHaveBeenCalledWith('role-id', 'perm-id');
			});
		});

		describe('getRolePermissions', () => {
			it('应该返回角色的所有权限', async () => {
				const mockPermissions = [{ id: '1', code: 'users:read', name: '读取用户' }];
				service.getRolePermissions.mockResolvedValue(mockPermissions as any);

				const result = await controller.getRolePermissions('role-id');

				expect(service.getRolePermissions).toHaveBeenCalledWith('role-id');
				expect(result).toEqual(mockPermissions);
			});
		});
	});

	describe('用户角色分配', () => {
		describe('assignRolesToUser', () => {
			it('应该为用户分配角色', async () => {
				const data = { userId: 'user-id', roleIds: ['role-id-1', 'role-id-2'] };
				service.assignRolesToUser.mockResolvedValue(undefined as any);

				await controller.assignRolesToUser('user-id', { roleIds: data.roleIds });

				expect(service.assignRolesToUser).toHaveBeenCalledWith({
					userId: 'user-id',
					roleIds: data.roleIds
				});
			});
		});

		describe('removeRoleFromUser', () => {
			it('应该从用户移除角色', async () => {
				service.removeRoleFromUser.mockResolvedValue(undefined as any);

				await controller.removeRoleFromUser('user-id', 'role-id');

				expect(service.removeRoleFromUser).toHaveBeenCalledWith('user-id', 'role-id');
			});
		});

		describe('getUserRoles', () => {
			it('应该返回用户的所有角色', async () => {
				const mockRoles = [{ id: '1', code: 'EDITOR', name: '编辑员' }];
				service.getUserRoles.mockResolvedValue(mockRoles as any);

				const result = await controller.getUserRoles('user-id');

				expect(service.getUserRoles).toHaveBeenCalledWith('user-id');
				expect(result).toEqual(mockRoles);
			});
		});

		describe('getUserPermissions', () => {
			it('应该返回用户的所有权限', async () => {
				const mockPermissions = [{ id: '1', code: 'users:read', name: '读取用户' }];
				service.getUserPermissions.mockResolvedValue(mockPermissions as any);

				const result = await controller.getUserPermissions('user-id');

				expect(service.getUserPermissions).toHaveBeenCalledWith('user-id');
				expect(result).toEqual(mockPermissions);
			});
		});
	});
});
