import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, wrap, Collection, EntityManager } from '@mikro-orm/core';
import { Role, RoleType } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, AssignPermissionsDto, RevokePermissionsDto } from './dto/role.dto';

@Injectable()
export class RoleService {
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
	 * 创建新角色
	 *
	 * 在指定租户下创建新角色，包含角色标识唯一性检查
	 *
	 * @param dto - 角色创建数据
	 * @param tenantId - 租户 ID
	 * @returns 已创建的角色
	 * @throws BadRequestException 当角色标识已存在时
	 *
	 * @example
	 * ```typescript
	 * const role = await roleService.create({
	 *   name: '管理员',
	 *   slug: 'admin',
	 *   description: '系统管理员角色',
	 *   type: 'SYSTEM'
	 * }, 'tenant-123');
	 * ```
	 */
	async create(dto: CreateRoleDto, tenantId: string): Promise<Role> {
		// 检查角色标识在租户内是否已存在
		const existingRole = await this.roleRepo.findOne({ slug: dto.slug, tenantId });

		if (existingRole) {
			throw new BadRequestException('已存在使用此角色标识的角色');
		}

		// 创建新角色并设置为启用状态
		const role = this.roleRepo.create({
			...dto,
			tenantId,
			isEnabled: true
		} as any);

		await this.em.persist(role);
		await this.em.flush();

		return role;
	}

	/**
	 * 查询角色列表
	 *
	 * 分页查询角色列表，支持按类型、启用状态、关键词筛选
	 *
	 * @param query - 查询参数（类型、启用状态、搜索关键词、分页）
	 * @returns 包含角色列表和总数的响应
	 *
	 * @example
	 * ```typescript
	 * const result = await roleService.findAll({
	 *   type: 'SYSTEM',
	 *   isEnabled: 'true',
	 *   search: '管理员',
	 *   page: 1,
	 *   limit: 10
	 * });
	 * ```
	 */
	async findAll(query: QueryRoleDto = {}): Promise<{ data: Role[]; total: number }> {
		const where: any = {};

		if (query.search) {
			where.$or = [
				{ name: { $like: `%${query.search}%` } },
				{ slug: { $like: `%${query.search}%` } },
				{ description: { $like: `%${query.search}%` } }
			];
		}

		if (query.type) {
			where.type = query.type;
		}

		if (query.isEnabled !== undefined) {
			where.isEnabled = query.isEnabled === 'true';
		}

		const page = query.page || 1;
		const limit = query.limit || 10;
		const offset = (page - 1) * limit;

		const [data, total] = await this.roleRepo.findAndCount(where, {
			limit,
			offset
		});

		return { data, total };
	}

	/**
	 * 根据 ID 查找角色
	 *
	 * @param id - 角色 ID
	 * @returns 角色实体（如果找到），否则抛出异常
	 * @throws NotFoundException 当角色不存在时
	 *
	 * @example
	 * ```typescript
	 * const role = await roleService.findOne('role-123');
	 * ```
	 */
	async findOne(id: string): Promise<Role> {
		const role = await this.roleRepo.findOne(id);

		if (!role) {
			throw new NotFoundException(`未找到 ID 为 ${id} 的角色`);
		}

		return role;
	}

	/**
	 * 根据标识查找角色
	 *
	 * 在指定租户下根据角色标识查找角色
	 *
	 * @param slug - 角色标识
	 * @param tenantId - 租户 ID
	 * @returns 角色实体（如果找到），否则抛出异常
	 * @throws NotFoundException 当角色不存在时
	 *
	 * @example
	 * ```typescript
	 * const role = await roleService.findBySlug('admin', 'tenant-123');
	 * ```
	 */
	async findBySlug(slug: string, tenantId: string): Promise<Role> {
		const role = await this.roleRepo.findOne({ slug, tenantId });

		if (!role) {
			throw new NotFoundException(`未找到标识为 ${slug} 的角色`);
		}

		return role;
	}

	/**
	 * 更新角色
	 *
	 * 更新角色信息，包含角色标识冲突检查
	 *
	 * @param id - 角色 ID
	 * @param dto - 更新数据
	 * @returns 已更新的角色
	 * @throws NotFoundException 当角色不存在时
	 * @throws BadRequestException 当角色标识已存在时
	 *
	 * @example
	 * ```typescript
	 * const role = await roleService.update('role-123', {
	 *   name: '超级管理员',
	 *   description: '拥有所有权限的管理员'
	 * });
	 * ```
	 */
	async update(id: string, dto: UpdateRoleDto): Promise<Role> {
		const role = await this.findOne(id);

		// 检查新角色标识是否冲突
		if (dto.slug && dto.slug !== role.slug) {
			const existingRole = await this.roleRepo.findOne({ slug: dto.slug, tenantId: role.tenantId });

			if (existingRole) {
				throw new BadRequestException('已存在使用此角色标识的角色');
			}
		}

		Object.assign(role, dto);
		await this.em.persist(role);
		await this.em.flush();

		return role;
	}

	/**
	 * 删除角色
	 *
	 * 删除指定角色
	 *
	 * @param id - 角色 ID
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当角色不存在时
	 *
	 * @example
	 * ```typescript
	 * await roleService.remove('role-123');
	 * ```
	 */
	async remove(id: string): Promise<void> {
		const role = await this.findOne(id);

		await this.em.remove(role);
		await this.em.flush();
	}

	/**
	 * 为角色分配权限
	 *
	 * 将指定的权限列表分配给角色，避免重复添加
	 *
	 * @param id - 角色 ID
	 * @param dto - 权限分配数据（权限 ID 列表）
	 * @returns 已更新权限的角色
	 * @throws NotFoundException 当角色不存在时
	 * @throws BadRequestException 当未提供权限 ID 时
	 *
	 * @example
	 * ```typescript
	 * const role = await roleService.assignPermissions('role-123', {
	 *   permissionIds: ['perm-1', 'perm-2', 'perm-3']
	 * });
	 * ```
	 */
	async assignPermissions(id: string, dto: AssignPermissionsDto): Promise<Role> {
		const role = await this.findOne(id);

		if (!dto.permissionIds || dto.permissionIds.length === 0) {
			throw new BadRequestException('至少需要提供一个权限 ID');
		}

		// 查找权限实体
		const permissions = await this.permissionRepo.find(dto.permissionIds as any);

		if (!role.permissions) {
			role.permissions = new Collection<Permission>(role);
		}

		// 添加不存在的权限
		for (const permission of permissions) {
			if (!role.permissions.contains(permission)) {
				role.permissions.add(permission);
			}
		}

		await this.em.persist(role);
		await this.em.flush();

		return role;
	}

	/**
	 * 撤销角色的权限
	 *
	 * 从角色中移除指定的权限列表
	 *
	 * @param id - 角色 ID
	 * @param dto - 权限撤销数据（权限 ID 列表）
	 * @returns 已更新权限的角色
	 * @throws NotFoundException 当角色不存在时
	 * @throws BadRequestException 当未提供权限 ID 时
	 *
	 * @example
	 * ```typescript
	 * const role = await roleService.revokePermissions('role-123', {
	 *   permissionIds: ['perm-1', 'perm-2']
	 * });
	 * ```
	 */
	async revokePermissions(id: string, dto: RevokePermissionsDto): Promise<Role> {
		const role = await this.findOne(id);

		if (!dto.permissionIds || dto.permissionIds.length === 0) {
			throw new BadRequestException('至少需要提供一个权限 ID');
		}

		// 如果角色没有权限，直接返回
		if (!role.permissions) {
			return role;
		}

		// 查找权限实体
		const permissions = await this.permissionRepo.find(dto.permissionIds as any);

		// 移除存在的权限
		for (const permission of permissions) {
			if (role.permissions.contains(permission)) {
				role.permissions.remove(permission);
			}
		}

		await this.em.persist(role);
		await this.em.flush();

		return role;
	}

	/**
	 * 启用角色
	 *
	 * 将角色状态设置为启用
	 *
	 * @param id - 角色 ID
	 * @returns 已启用的角色
	 * @throws NotFoundException 当角色不存在时
	 *
	 * @example
	 * ```typescript
	 * const role = await roleService.enable('role-123');
	 * ```
	 */
	async enable(id: string): Promise<Role> {
		const role = await this.findOne(id);

		if (!role.isEnabled) {
			role.isEnabled = true;
			await this.em.persist(role);
			await this.em.flush();
		}

		return role;
	}

	/**
	 * 停用角色
	 *
	 * 将角色状态设置为停用
	 *
	 * @param id - 角色 ID
	 * @returns 已停用的角色
	 * @throws NotFoundException 当角色不存在时
	 *
	 * @example
	 * ```typescript
	 * const role = await roleService.disable('role-123');
	 * ```
	 */
	async disable(id: string): Promise<Role> {
		const role = await this.findOne(id);

		if (role.isEnabled) {
			role.isEnabled = false;
			await this.em.persist(role);
			await this.em.flush();
		}

		return role;
	}
}
