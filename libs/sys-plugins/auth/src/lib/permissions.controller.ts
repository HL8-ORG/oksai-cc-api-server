import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards } from '@nestjs/common';
import {
	PermissionsService,
	CreateRoleDto,
	UpdateRoleDto,
	CreatePermissionDto,
	UpdatePermissionDto,
	AssignPermissionToRoleDto,
	AssignRoleToUserDto
} from './permissions.service';
import { RequirePermissions } from './decorators/permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guard';

/**
 * 分配角色给用户的请求体 DTO
 */
export interface AssignRolesToUserBodyDto {
	roleIds: string[];
}

/**
 * 权限管理控制器
 *
 * 提供角色和权限管理的 API 端点
 */
@UseGuards(PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
	constructor(private readonly permissionsService: PermissionsService) {}

	/**
	 * 获取所有角色
	 *
	 * @returns 角色列表
	 *
	 * @example
	 * ```bash
	 * GET /permissions/roles
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Get('roles')
	@RequirePermissions(['permissions:read'])
	async findAllRoles() {
		return this.permissionsService.findAllRoles();
	}

	/**
	 * 根据代码查找角色
	 *
	 * @param code - 角色代码
	 * @returns 角色（如果找到）
	 *
	 * @example
	 * ```bash
	 * GET /permissions/roles/ADMIN
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Get('roles/:code')
	@RequirePermissions(['permissions:read'])
	async findRoleByCode(@Param('code') code: string) {
		return this.permissionsService.findRoleByCode(code);
	}

	/**
	 * 创建角色
	 *
	 * @param data - 角色数据
	 * @returns 已创建的角色
	 *
	 * @example
	 * ```bash
	 * POST /permissions/roles
	 * Authorization: Bearer <access_token>
	 * {
	 *   "code": "EDITOR",
	 *   "name": "编辑员",
	 *   "description": "可以编辑内容的角色"
	 * }
	 * ```
	 */
	@Post('roles')
	@RequirePermissions(['permissions:write'])
	async createRole(@Body() data: CreateRoleDto) {
		return this.permissionsService.createRole(data);
	}

	/**
	 * 更新角色
	 *
	 * @param id - 角色 ID
	 * @param data - 更新数据
	 * @returns 已更新的角色
	 *
	 * @example
	 * ```bash
	 * PUT /permissions/roles/role-id
	 * Authorization: Bearer <access_token>
	 * {
	 *   "name": "高级编辑员",
	 *   "description": "可以编辑和删除内容"
	 * }
	 * ```
	 */
	@Put('roles/:id')
	@RequirePermissions(['permissions:write'])
	async updateRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
		return this.permissionsService.updateRole(id, data);
	}

	/**
	 * 删除角色
	 *
	 * @param id - 角色 ID
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * DELETE /permissions/roles/role-id
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Delete('roles/:id')
	@RequirePermissions(['permissions:delete'])
	async deleteRole(@Param('id') id: string) {
		return this.permissionsService.deleteRole(id);
	}

	/**
	 * 获取所有权限
	 *
	 * @returns 权限列表
	 *
	 * @example
	 * ```bash
	 * GET /permissions
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Get()
	@RequirePermissions(['permissions:read'])
	async findAllPermissions() {
		return this.permissionsService.findAllPermissions();
	}

	/**
	 * 根据代码查找权限
	 *
	 * @param code - 权限代码
	 * @returns 权限（如果找到）
	 *
	 * @example
	 * ```bash
	 * GET /permissions/users:write
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Get(':code')
	@RequirePermissions(['permissions:read'])
	async findPermissionByCode(@Param('code') code: string) {
		return this.permissionsService.findPermissionByCode(code);
	}

	/**
	 * 创建权限
	 *
	 * @param data - 权限数据
	 * @returns 已创建的权限
	 *
	 * @example
	 * ```bash
	 * POST /permissions
	 * Authorization: Bearer <access_token>
	 * {
	 *   "code": "users:delete",
	 *   "name": "删除用户",
	 *   "resource": "User",
	 *   "action": "delete",
	 *   "effect": "deny"
	 * }
	 * ```
	 */
	@Post()
	@RequirePermissions(['permissions:write'])
	async createPermission(@Body() data: CreatePermissionDto) {
		return this.permissionsService.createPermission(data);
	}

	/**
	 * 更新权限
	 *
	 * @param id - 权限 ID
	 * @param data - 更新数据
	 * @returns 已更新的权限
	 *
	 * @example
	 * ```bash
	 * PUT /permissions/perm-id
	 * Authorization: Bearer <access_token>
	 * {
	 *   "name": "删除用户（已禁用）",
	 *   "effect": "allow"
	 * }
	 * ```
	 */
	@Put(':id')
	@RequirePermissions(['permissions:write'])
	async updatePermission(@Param('id') id: string, @Body() data: UpdatePermissionDto) {
		return this.permissionsService.updatePermission(id, data);
	}

	/**
	 * 删除权限
	 *
	 * @param id - 权限 ID
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * DELETE /permissions/perm-id
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Delete(':id')
	@RequirePermissions(['permissions:delete'])
	async deletePermission(@Param('id') id: string) {
		return this.permissionsService.deletePermission(id);
	}

	/**
	 * 为角色分配权限
	 *
	 * @param data - 分配数据
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * POST /permissions/roles/role-id/permissions
	 * Authorization: Bearer <access_token>
	 * {
	 *   "permissionId": "perm-id"
	 * }
	 * ```
	 */
	@Post('roles/:roleId/permissions')
	@RequirePermissions(['permissions:write'])
	async assignPermissionToRole(@Param('roleId') roleId: string, @Body() data: { permissionId: string }) {
		return this.permissionsService.assignPermissionToRole({
			roleId,
			permissionId: data.permissionId
		});
	}

	/**
	 * 从角色移除权限
	 *
	 * @param roleId - 角色 ID
	 * @param permissionId - 权限 ID
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * DELETE /permissions/roles/role-id/permissions/perm-id
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Delete('roles/:roleId/permissions/:permissionId')
	@RequirePermissions(['permissions:write'])
	async removePermissionFromRole(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
		return this.permissionsService.removePermissionFromRole(roleId, permissionId);
	}

	/**
	 * 获取角色的所有权限
	 *
	 * @param roleId - 角色 ID
	 * @returns 权限列表
	 *
	 * @example
	 * ```bash
	 * GET /permissions/roles/role-id/permissions
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Get('roles/:roleId/permissions')
	@RequirePermissions(['permissions:read'])
	async getRolePermissions(@Param('roleId') roleId: string) {
		return this.permissionsService.getRolePermissions(roleId);
	}

	/**
	 * 为用户分配角色
	 *
	 * @param data - 分配数据
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * POST /permissions/users/user-id/roles
	 * Authorization: Bearer <access_token>
	 * {
	 *   "roleIds": ["role-id-1", "role-id-2"]
	 * }
	 * ```
	 */
	@Post('users/:userId/roles')
	@RequirePermissions(['permissions:write'])
	async assignRolesToUser(@Param('userId') userId: string, @Body() data: AssignRolesToUserBodyDto) {
		return this.permissionsService.assignRolesToUser({
			userId,
			roleIds: data.roleIds
		});
	}

	/**
	 * 从用户移除角色
	 *
	 * @param userId - 用户 ID
	 * @param roleId - 角色 ID
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * DELETE /permissions/users/user-id/roles/role-id
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Delete('users/:userId/roles/:roleId')
	@RequirePermissions(['permissions:write'])
	async removeRoleFromUser(@Param('userId') userId: string, @Param('roleId') roleId: string) {
		return this.permissionsService.removeRoleFromUser(userId, roleId);
	}

	/**
	 * 获取用户的所有角色
	 *
	 * @param userId - 用户 ID
	 * @returns 角色列表
	 *
	 * @example
	 * ```bash
	 * GET /permissions/users/user-id/roles
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Get('users/:userId/roles')
	@RequirePermissions(['permissions:read'])
	async getUserRoles(@Param('userId') userId: string) {
		return this.permissionsService.getUserRoles(userId);
	}

	/**
	 * 获取用户的所有权限（通过角色）
	 *
	 * @param userId - 用户 ID
	 * @returns 权限列表
	 *
	 * @example
	 * ```bash
	 * GET /permissions/users/user-id/permissions
	 * Authorization: Bearer <access_token>
	 * ```
	 */
	@Get('users/:userId/permissions')
	@RequirePermissions(['permissions:read'])
	async getUserPermissions(@Param('userId') userId: string) {
		return this.permissionsService.getUserPermissions(userId);
	}
}
