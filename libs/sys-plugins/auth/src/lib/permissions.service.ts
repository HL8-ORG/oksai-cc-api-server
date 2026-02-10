import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permissions.entity';

export interface CreateRoleDto {
	code: string;
	name: string;
	description?: string;
}

export interface UpdateRoleDto {
	name?: string;
	description?: string;
}

export interface CreatePermissionDto {
	code: string;
	name: string;
	description?: string;
	resource: string;
	action: string;
	effect?: 'allow' | 'deny';
	conditions?: any;
}

export interface UpdatePermissionDto {
	name?: string;
	description?: string;
	effect?: 'allow' | 'deny';
	conditions?: any;
}

export interface AssignPermissionToRoleDto {
	roleId: string;
	permissionId: string;
}

export interface AssignRoleToUserDto {
	userId: string;
	roleIds: string[];
}

@Injectable()
export class PermissionsService {
	constructor(
		@InjectRepository(Role)
		private readonly roleRepo: EntityRepository<Role>,
		@InjectRepository(Permission)
		private readonly permissionRepo: EntityRepository<Permission>
	) {}

	private get em(): EntityManager {
		return this.roleRepo.getEntityManager();
	}

	/**
	 * 创建角色
	 *
	 * @param data - 角色数据
	 * @returns 已创建的角色
	 * @throws BadRequestException 当角色代码已存在时
	 */
	async createRole(data: CreateRoleDto): Promise<Role> {
		const existing = await this.roleRepo.findOne({ code: data.code });
		if (existing) {
			throw new BadRequestException('角色代码已存在');
		}

		const role = this.roleRepo.create({
			code: data.code,
			name: data.name,
			description: data.description,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		this.em.persist(role);
		await this.em.flush();

		return role;
	}

	/**
	 * 更新角色
	 *
	 * @param id - 角色 ID
	 * @param data - 更新数据
	 * @returns 已更新的角色
	 * @throws NotFoundException 当角色不存在时
	 */
	async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
		const role = await this.roleRepo.findOne({ id });
		if (!role) {
			throw new NotFoundException('未找到该角色');
		}

		if (data.name !== undefined) {
			role.name = data.name;
		}
		if (data.description !== undefined) {
			role.description = data.description;
		}
		role.updatedAt = new Date();

		this.em.persist(role);
		await this.em.flush();

		return role;
	}

	/**
	 * 删除角色
	 *
	 * @param id - 角色 ID
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当角色不存在时
	 */
	async deleteRole(id: string): Promise<void> {
		const role = await this.roleRepo.findOne({ id });
		if (!role) {
			throw new NotFoundException('未找到该角色');
		}

		this.em.remove(role);
		await this.em.flush();
	}

	/**
	 * 获取所有角色
	 *
	 * @returns 角色列表
	 */
	async findAllRoles(): Promise<Role[]> {
		return await this.roleRepo.findAll();
	}

	/**
	 * 根据代码查找角色
	 *
	 * @param code - 角色代码
	 * @returns 角色（如果找到），否则返回 null
	 */
	async findRoleByCode(code: string): Promise<Role | null> {
		return await this.roleRepo.findOne({ code });
	}

	/**
	 * 创建权限
	 *
	 * @param data - 权限数据
	 * @returns 已创建的权限
	 * @throws BadRequestException 当权限代码已存在时
	 */
	async createPermission(data: CreatePermissionDto): Promise<Permission> {
		const existing = await this.permissionRepo.findOne({ code: data.code });
		if (existing) {
			throw new BadRequestException('权限代码已存在');
		}

		const permission = this.permissionRepo.create({
			code: data.code,
			name: data.name,
			description: data.description,
			resource: data.resource,
			action: data.action,
			effect: data.effect || 'allow',
			conditions: data.conditions,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		this.em.persist(permission);
		await this.em.flush();

		return permission;
	}

	/**
	 * 更新权限
	 *
	 * @param id - 权限 ID
	 * @param data - 更新数据
	 * @returns 已更新的权限
	 * @throws NotFoundException 当权限不存在时
	 */
	async updatePermission(id: string, data: UpdatePermissionDto): Promise<Permission> {
		const permission = await this.permissionRepo.findOne({ id });
		if (!permission) {
			throw new NotFoundException('未找到该权限');
		}

		if (data.name !== undefined) {
			permission.name = data.name;
		}
		if (data.description !== undefined) {
			permission.description = data.description;
		}
		if (data.effect !== undefined) {
			permission.effect = data.effect;
		}
		if (data.conditions !== undefined) {
			permission.conditions = data.conditions;
		}
		permission.updatedAt = new Date();

		this.em.persist(permission);
		await this.em.flush();

		return permission;
	}

	/**
	 * 删除权限
	 *
	 * @param id - 权限 ID
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当权限不存在时
	 */
	async deletePermission(id: string): Promise<void> {
		const permission = await this.permissionRepo.findOne({ id });
		if (!permission) {
			throw new NotFoundException('未找到该权限');
		}

		this.em.remove(permission);
		await this.em.flush();
	}

	/**
	 * 获取所有权限
	 *
	 * @returns 权限列表
	 */
	async findAllPermissions(): Promise<Permission[]> {
		return await this.permissionRepo.findAll();
	}

	/**
	 * 根据代码查找权限
	 *
	 * @param code - 权限代码
	 * @returns 权限（如果找到），否则返回 null
	 */
	async findPermissionByCode(code: string): Promise<Permission | null> {
		return await this.permissionRepo.findOne({ code });
	}

	/**
	 * 为角色分配权限
	 *
	 * @param data - 分配数据
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当角色或权限不存在时
	 */
	async assignPermissionToRole(data: AssignPermissionToRoleDto): Promise<void> {
		const role = await this.roleRepo.findOne({ id: data.roleId });
		if (!role) {
			throw new NotFoundException('未找到该角色');
		}

		const permission = await this.permissionRepo.findOne({ id: data.permissionId });
		if (!permission) {
			throw new NotFoundException('未找到该权限');
		}

		if (!role.permissions.includes(permission)) {
			role.permissions.push(permission);
			role.updatedAt = new Date();
			this.em.persist(role);
			await this.em.flush();
		}
	}

	/**
	 * 从角色移除权限
	 *
	 * @param roleId - 角色 ID
	 * @param permissionId - 权限 ID
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当角色或权限不存在时
	 */
	async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
		const role = await this.roleRepo.findOne({ id: roleId }, { populate: ['permissions'] });

		if (!role) {
			throw new NotFoundException('未找到该角色');
		}

		const permission = role.permissions.find((p) => p.id === permissionId);
		if (permission) {
			const index = role.permissions.indexOf(permission);
			role.permissions.splice(index, 1);
			role.updatedAt = new Date();
			this.em.persist(role);
			await this.em.flush();
		}
	}

	/**
	 * 为用户分配角色
	 *
	 * @param data - 分配数据
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当用户或角色不存在时
	 */
	async assignRolesToUser(data: AssignRoleToUserDto): Promise<void> {
		const { User } = await import('./entities/user.entity');
		const userRepo = this.em.getRepository(User);

		const user = await userRepo.findOne({ id: data.userId });
		if (!user) {
			throw new NotFoundException('未找到该用户');
		}

		for (const roleId of data.roleIds) {
			const role = await this.roleRepo.findOne({ id: roleId });
			if (role && !user.roles.includes(role)) {
				user.roles.push(role);
			}
		}

		user.updatedAt = new Date();
		this.em.persist(user);
		await this.em.flush();
	}

	/**
	 * 从用户移除角色
	 *
	 * @param userId - 用户 ID
	 * @param roleId - 角色 ID
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当用户或角色不存在时
	 */
	async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
		const { User } = await import('./entities/user.entity');
		const userRepo = this.em.getRepository(User);

		const user = await userRepo.findOne({ id: userId }, { populate: ['roles'] });

		if (!user) {
			throw new NotFoundException('未找到该用户');
		}

		const role = user.roles.find((r) => r.id === roleId);
		if (role) {
			const index = user.roles.indexOf(role);
			user.roles.splice(index, 1);
			user.updatedAt = new Date();
			this.em.persist(user);
			await this.em.flush();
		}
	}

	/**
	 * 获取角色的所有权限
	 *
	 * @param roleId - 角色 ID
	 * @returns 权限列表
	 * @throws NotFoundException 当角色不存在时
	 */
	async getRolePermissions(roleId: string): Promise<Permission[]> {
		const role = await this.roleRepo.findOne({ id: roleId }, { populate: ['permissions'] });

		if (!role) {
			throw new NotFoundException('未找到该角色');
		}

		return role.permissions;
	}

	/**
	 * 获取用户的所有角色
	 *
	 * @param userId - 用户 ID
	 * @returns 角色列表
	 * @throws NotFoundException 当用户不存在时
	 */
	async getUserRoles(userId: string): Promise<Role[]> {
		const { User } = await import('./entities/user.entity');
		const userRepo = this.em.getRepository(User);

		const user = await userRepo.findOne({ id: userId }, { populate: ['roles'] });

		if (!user) {
			throw new NotFoundException('未找到该用户');
		}

		return user.roles;
	}

	/**
	 * 获取用户的所有权限（通过角色）
	 *
	 * @param userId - 用户 ID
	 * @returns 权限列表
	 * @throws NotFoundException 当用户不存在时
	 */
	async getUserPermissions(userId: string): Promise<Permission[]> {
		const roles = await this.getUserRoles(userId);
		const permissions: Permission[] = [];

		for (const role of roles) {
			const roleWithPermissions = await this.roleRepo.findOne({ id: role.id }, { populate: ['permissions'] });
			if (roleWithPermissions) {
				permissions.push(...roleWithPermissions.permissions);
			}
		}

		return permissions;
	}
}
