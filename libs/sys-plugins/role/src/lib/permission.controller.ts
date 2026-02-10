import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto, QueryPermissionDto } from './dto/permission.dto';

/**
 * 权限控制器
 *
 * 提供权限管理的 RESTful API 端点
 */
@Controller('permissions')
export class PermissionController {
	constructor(private readonly permissionService: PermissionService) {}

	/**
	 * 创建新权限
	 *
	 * @param dto 权限创建数据
	 * @returns 已创建的权限
	 *
	 * @example
	 * ```bash
	 * POST /api/v1/permissions
	 * {
	 *   "name": "查看用户",
	 *   "type": "USER",
	 *   "action": "VIEW",
	 *   "tenantId": "tenant-123",
	 *   "resource": "user",
	 *   "description": "可以查看所有用户的详细信息"
	 * }
	 * ```
	 */
	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() dto: CreatePermissionDto) {
		return this.permissionService.create(dto);
	}

	/**
	 * 查询权限列表
	 *
	 * @param query 查询参数
	 * @returns 权限列表和总数
	 *
	 * @example
	 * ```bash
	 * GET /api/v1/permissions?type=USER&action=VIEW&page=1&limit=10
	 * ```
	 */
	@Get()
	async findAll(@Query() query: QueryPermissionDto) {
		return this.permissionService.findAll(query);
	}

	/**
	 * 根据 ID 查找权限
	 *
	 * @param id 权限 ID
	 * @returns 权限详情
	 *
	 * @example
	 * ```bash
	 * GET /api/v1/permissions/:id
	 * ```
	 */
	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.permissionService.findOne(id);
	}

	/**
	 * 根据租户 ID 查询权限列表
	 *
	 * @param tenantId 租户 ID
	 * @param query 查询参数
	 * @returns 权限列表和总数
	 *
	 * @example
	 * ```bash
	 * GET /api/v1/permissions/tenant/:tenantId?page=1&limit=10
	 * ```
	 */
	@Get('tenant/:tenantId')
	async findByTenantId(@Param('tenantId') tenantId: string, @Query() query: QueryPermissionDto) {
		return this.permissionService.findByTenantId(tenantId, query);
	}

	/**
	 * 更新权限
	 *
	 * @param id 权限 ID
	 * @param dto 更新数据
	 * @returns 已更新的权限
	 *
	 * @example
	 * ```bash
	 * PUT /api/v1/permissions/:id
	 * {
	 *   "name": "查看所有用户",
	 *   "description": "可以查看所有用户的详细信息"
	 * }
	 * ```
	 */
	@Put(':id')
	async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
		return this.permissionService.update(id, dto);
	}

	/**
	 * 删除权限
	 *
	 * @param id 权限 ID
	 *
	 * @example
	 * ```bash
	 * DELETE /api/v1/permissions/:id
	 * ```
	 */
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async remove(@Param('id') id: string) {
		await this.permissionService.remove(id);
	}

	/**
	 * 启用权限
	 *
	 * @param id 权限 ID
	 * @returns 已启用的权限
	 *
	 * @example
	 * ```bash
	 * POST /api/v1/permissions/:id/enable
	 * ```
	 */
	@Post(':id/enable')
	async enable(@Param('id') id: string) {
		return this.permissionService.enable(id);
	}

	/**
	 * 停用权限
	 *
	 * @param id 权限 ID
	 * @returns 已停用的权限
	 *
	 * @example
	 * ```bash
	 * POST /api/v1/permissions/:id/disable
	 * ```
	 */
	@Post(':id/disable')
	async disable(@Param('id') id: string) {
		return this.permissionService.disable(id);
	}
}
