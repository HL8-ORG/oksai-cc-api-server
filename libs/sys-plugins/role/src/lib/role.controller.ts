import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, AssignPermissionsDto, RevokePermissionsDto } from './dto/role.dto';
import { Role } from './entities/role.entity';

/**
 * 角色控制器
 *
 * 提供角色管理相关的 API 端点，包括角色的增删改查、权限分配和撤销、启用和停用
 */
@Controller('roles')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	/**
	 * 创建新角色
	 *
	 * 在指定租户下创建新的角色
	 *
	 * @param dto - 角色创建数据
	 * @returns 已创建的角色
	 *
	 * @example
	 * ```bash
	 * POST /roles
	 * {
	 *   "name": "管理员",
	 *   "slug": "admin",
	 *   "description": "系统管理员角色",
	 *   "type": "SYSTEM",
	 *   "tenantId": "tenant-123"
	 * }
	 * ```
	 */
	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() dto: CreateRoleDto): Promise<Role> {
		const tenantId = (dto as any).tenantId || '';
		return await this.roleService.create(dto, tenantId);
	}

	/**
	 * 查询角色列表
	 *
	 * 分页查询角色列表，支持按类型、启用状态、关键词筛选
	 *
	 * @param query - 查询参数
	 * @returns 包含角色列表和总数的响应
	 *
	 * @example
	 * ```bash
	 * GET /roles?type=SYSTEM&isEnabled=true&search=管理员&page=1&limit=10
	 * ```
	 */
	@Get()
	async findAll(@Query() query: QueryRoleDto): Promise<{ data: Role[]; total: number }> {
		return await this.roleService.findAll(query);
	}

	/**
	 * 根据 ID 查找角色
	 *
	 * @param id - 角色 ID
	 * @returns 角色实体
	 *
	 * @example
	 * ```bash
	 * GET /roles/:id
	 * ```
	 */
	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Role> {
		return await this.roleService.findOne(id);
	}

	/**
	 * 根据标识查找角色
	 *
	 * 在指定租户下根据角色标识查找角色
	 *
	 * @param slug - 角色标识
	 * @param tenantId - 租户 ID
	 * @returns 角色实体
	 *
	 * @example
	 * ```bash
	 * GET /roles/slug/:slug?tenantId=tenant-123
	 * ```
	 */
	@Get('slug/:slug')
	async findBySlug(@Param('slug') slug: string, @Query('tenantId') tenantId: string): Promise<Role> {
		return await this.roleService.findBySlug(slug, tenantId);
	}

	/**
	 * 更新角色
	 *
	 * 更新角色信息
	 *
	 * @param id - 角色 ID
	 * @param dto - 更新数据
	 * @returns 已更新的角色
	 *
	 * @example
	 * ```bash
	 * PUT /roles/:id
	 * {
	 *   "name": "超级管理员",
	 *   "description": "拥有所有权限的管理员"
	 * }
	 * ```
	 */
	@Put(':id')
	async update(@Param('id') id: string, @Body() dto: UpdateRoleDto): Promise<Role> {
		return await this.roleService.update(id, dto);
	}

	/**
	 * 删除角色
	 *
	 * 删除指定角色
	 *
	 * @param id - 角色 ID
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * DELETE /roles/:id
	 * ```
	 */
	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		await this.roleService.remove(id);
	}

	/**
	 * 为角色分配权限
	 *
	 * 将指定的权限列表分配给角色
	 *
	 * @param id - 角色 ID
	 * @param dto - 权限分配数据（权限 ID 列表）
	 * @returns 已更新权限的角色
	 *
	 * @example
	 * ```bash
	 * PUT /roles/:id/permissions
	 * {
	 *   "permissionIds": ["perm-1", "perm-2", "perm-3"]
	 * }
	 * ```
	 */
	@Put(':id/permissions')
	async assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto): Promise<Role> {
		return await this.roleService.assignPermissions(id, dto);
	}

	/**
	 * 撤销角色的权限
	 *
	 * 从角色中移除指定的权限列表
	 *
	 * @param id - 角色 ID
	 * @param dto - 权限撤销数据（权限 ID 列表）
	 * @returns 已更新权限的角色
	 *
	 * @example
	 * ```bash
	 * PUT /roles/:id/permissions/revoke
	 * {
	 *   "permissionIds": ["perm-1", "perm-2"]
	 * }
	 * ```
	 */
	@Put(':id/permissions/revoke')
	async revokePermissions(@Param('id') id: string, @Body() dto: RevokePermissionsDto): Promise<Role> {
		return await this.roleService.revokePermissions(id, dto);
	}

	/**
	 * 启用角色
	 *
	 * 将角色状态设置为启用
	 *
	 * @param id - 角色 ID
	 * @returns 已启用的角色
	 *
	 * @example
	 * ```bash
	 * PUT /roles/:id/enable
	 * ```
	 */
	@Put(':id/enable')
	async enable(@Param('id') id: string): Promise<Role> {
		return await this.roleService.enable(id);
	}

	/**
	 * 停用角色
	 *
	 * 将角色状态设置为停用
	 *
	 * @param id - 角色 ID
	 * @returns 已停用的角色
	 *
	 * @example
	 * ```bash
	 * PUT /roles/:id/disable
	 * ```
	 */
	@Put(':id/disable')
	async disable(@Param('id') id: string): Promise<Role> {
		return await this.roleService.disable(id);
	}
}
