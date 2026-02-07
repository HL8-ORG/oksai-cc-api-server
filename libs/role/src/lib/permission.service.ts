import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto, QueryPermissionDto } from './dto/permission.dto';

/**
 * 权限服务
 *
 * 负责权限的创建、查询、更新和删除
 */
@Injectable()
export class PermissionService {
	constructor(
		@InjectRepository(Permission)
		private readonly permissionRepo: EntityRepository<Permission>
	) {}

	private get em(): EntityManager {
		return this.permissionRepo.getEntityManager();
	}

	/**
	 * 创建新权限
	 *
	 * 在指定租户下创建新权限，包含权限唯一性检查
	 *
	 * @param dto - 权限创建数据
	 * @returns 已创建的权限
	 * @throws BadRequestException 当权限已存在时
	 *
	 * @example
	 * ```typescript
	 * const permission = await permissionService.create({
	 *   name: '查看用户',
	 *   type: 'USER',
	 *   action: 'VIEW',
	 *   tenantId: 'tenant-123',
	 *   resource: 'user'
	 * });
	 * ```
	 */
	async create(dto: CreatePermissionDto): Promise<Permission> {
		// 检查权限在租户内是否已存在
		const existingPermission = await this.permissionRepo.findOne({
			type: dto.type,
			action: dto.action,
			resource: dto.resource,
			tenantId: dto.tenantId
		});

		if (existingPermission) {
			throw new BadRequestException('已存在相同的权限');
		}

		// 创建新权限并设置为启用状态
		const permission = this.permissionRepo.create({
			...dto,
			isEnabled: true
		} as any);

		this.em.persist(permission);
		await this.em.flush();

		return permission;
	}

	/**
	 * 查询权限列表
	 *
	 * 分页查询权限列表，支持按类型、操作、资源、关键词筛选
	 *
	 * @param query - 查询参数（类型、操作、资源、启用状态、搜索关键词、分页）
	 * @returns 包含权限列表和总数的响应
	 *
	 * @example
	 * ```typescript
	 * const result = await permissionService.findAll({
	 *   type: 'USER',
	 *   action: 'VIEW',
	 *   resource: 'user',
	 *   isEnabled: 'true',
	 *   search: '查看',
	 *   page: 1,
	 *   limit: 10
	 * });
	 * ```
	 */
	async findAll(query: QueryPermissionDto = {}): Promise<{ data: Permission[]; total: number }> {
		const where: any = {};

		if (query.search) {
			where.$or = [{ name: { $like: `%${query.search}%` } }, { description: { $like: `%${query.search}%` } }];
		}

		if (query.type) {
			where.type = query.type;
		}

		if (query.action) {
			where.action = query.action;
		}

		if (query.resource) {
			where.resource = query.resource;
		}

		if (query.isEnabled !== undefined) {
			where.isEnabled = query.isEnabled === 'true';
		}

		const page = query.page || 1;
		const limit = query.limit || 10;
		const offset = (page - 1) * limit;

		const [data, total] = await this.permissionRepo.findAndCount(where, {
			limit,
			offset
		});

		return { data, total };
	}

	/**
	 * 根据 ID 查找权限
	 *
	 * @param id - 权限 ID
	 * @returns 权限实体（如果找到），否则抛出异常
	 * @throws NotFoundException 当权限不存在时
	 *
	 * @example
	 * ```typescript
	 * const permission = await permissionService.findOne('perm-123');
	 * ```
	 */
	async findOne(id: string): Promise<Permission> {
		const permission = await this.permissionRepo.findOne(id);

		if (!permission) {
			throw new NotFoundException(`未找到 ID 为 ${id} 的权限`);
		}

		return permission;
	}

	/**
	 * 根据租户 ID 查询权限列表
	 *
	 * 查询指定租户下的所有权限
	 *
	 * @param tenantId - 租户 ID
	 * @param query - 查询参数
	 * @returns 包含权限列表和总数的响应
	 *
	 * @example
	 * ```typescript
	 * const result = await permissionService.findByTenantId('tenant-123', {
	 *   page: 1,
	 *   limit: 10
	 * });
	 * ```
	 */
	async findByTenantId(
		tenantId: string,
		query: QueryPermissionDto = {}
	): Promise<{ data: Permission[]; total: number }> {
		const where: any = { tenantId };

		if (query.search) {
			where.$or = [{ name: { $like: `%${query.search}%` } }, { description: { $like: `%${query.search}%` } }];
		}

		if (query.type) {
			where.type = query.type;
		}

		if (query.action) {
			where.action = query.action;
		}

		if (query.resource) {
			where.resource = query.resource;
		}

		if (query.isEnabled !== undefined) {
			where.isEnabled = query.isEnabled === 'true';
		}

		const page = query.page || 1;
		const limit = query.limit || 10;
		const offset = (page - 1) * limit;

		const [data, total] = await this.permissionRepo.findAndCount(where, {
			limit,
			offset
		});

		return { data, total };
	}

	/**
	 * 更新权限
	 *
	 * 更新权限信息，包含权限唯一性检查
	 *
	 * @param id - 权限 ID
	 * @param dto - 更新数据
	 * @returns 已更新的权限
	 * @throws NotFoundException 当权限不存在时
	 * @throws BadRequestException 当权限已存在时
	 *
	 * @example
	 * ```typescript
	 * const permission = await permissionService.update('perm-123', {
	 *   name: '查看所有用户',
	 *   description: '可以查看所有用户的详细信息'
	 * });
	 * ```
	 */
	async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
		const permission = await this.findOne(id);

		// 检查新权限是否冲突
		if (
			(dto.type || dto.action || dto.resource) &&
			(permission.type !== dto.type || permission.action !== dto.action || permission.resource !== dto.resource)
		) {
			const existingPermission = await this.permissionRepo.findOne({
				type: dto.type || permission.type,
				action: dto.action || permission.action,
				resource: dto.resource || permission.resource,
				tenantId: permission.tenantId,
				id: { $ne: id }
			} as any);

			if (existingPermission) {
				throw new BadRequestException('已存在相同的权限');
			}
		}

		Object.assign(permission, dto);

		this.em.persist(permission);
		await this.em.flush();

		return permission;
	}

	/**
	 * 删除权限
	 *
	 * 删除指定权限
	 *
	 * @param id - 权限 ID
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当权限不存在时
	 *
	 * @example
	 * ```typescript
	 * await permissionService.remove('perm-123');
	 * ```
	 */
	async remove(id: string): Promise<void> {
		const permission = await this.findOne(id);

		this.em.remove(permission);
		await this.em.flush();
	}

	/**
	 * 启用权限
	 *
	 * 将权限状态设置为启用
	 *
	 * @param id - 权限 ID
	 * @returns 已启用的权限
	 * @throws NotFoundException 当权限不存在时
	 *
	 * @example
	 * ```typescript
	 * const permission = await permissionService.enable('perm-123');
	 * ```
	 */
	async enable(id: string): Promise<Permission> {
		const permission = await this.findOne(id);

		if (!permission.isEnabled) {
			permission.isEnabled = true;
			this.em.persist(permission);
			await this.em.flush();
		}

		return permission;
	}

	/**
	 * 停用权限
	 *
	 * 将权限状态设置为停用
	 *
	 * @param id - 权限 ID
	 * @returns 已停用的权限
	 * @throws NotFoundException 当权限不存在时
	 *
	 * @example
	 * ```typescript
	 * const permission = await permissionService.disable('perm-123');
	 * ```
	 */
	async disable(id: string): Promise<Permission> {
		const permission = await this.findOne(id);

		if (permission.isEnabled) {
			permission.isEnabled = false;
			this.em.persist(permission);
			await this.em.flush();
		}

		return permission;
	}
}
