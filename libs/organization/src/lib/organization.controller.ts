import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto, QueryOrganizationDto } from './dto/organization.dto';
import { Organization } from './entities/organization.entity';

/**
 * 组织控制器
 *
 * 提供组织管理相关的 API 端点，包括组织的增删改查、激活和暂停
 */
@Controller('organizations')
export class OrganizationController {
	constructor(private readonly organizationService: OrganizationService) {}

	/**
	 * 创建新组织
	 *
	 * 在指定租户下创建新的组织实体
	 *
	 * @param dto - 组织创建数据
	 * @returns 已创建的组织
	 *
	 * @example
	 * ```bash
	 * POST /organizations
	 * {
	 *   "name": "Engineering",
	 *   "slug": "engineering",
	 *   "tenantId": "tenant-123"
	 * }
	 * ```
	 */
	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() dto: CreateOrganizationDto): Promise<Organization> {
		return await this.organizationService.create(dto, '');
	}

	/**
	 * 查询组织列表
	 *
	 * 分页查询组织列表，支持按状态、搜索关键词、租户 ID 筛选
	 *
	 * @param query - 查询参数
	 * @returns 包含组织列表和总数的响应
	 *
	 * @example
	 * ```bash
	 * GET /organizations?status=ACTIVE&search=test&tenantId=tenant-123&page=1&limit=10
	 * ```
	 */
	@Get()
	async findAll(@Query() query: QueryOrganizationDto): Promise<{ data: Organization[]; total: number }> {
		return await this.organizationService.findAll(query);
	}

	/**
	 * 根据 ID 查找组织
	 *
	 * @param id - 组织 ID
	 * @returns 组织实体
	 *
	 * @example
	 * ```bash
	 * GET /organizations/:id
	 * ```
	 */
	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Organization> {
		return await this.organizationService.findOne(id);
	}

	/**
	 * 根据标识查找组织
	 *
	 * 在指定租户下根据组织标识查找组织
	 *
	 * @param slug - 组织标识
	 * @param query - 查询参数（包含租户 ID）
	 * @returns 组织实体
	 *
	 * @example
	 * ```bash
	 * GET /organizations/slug/:slug?tenantId=tenant-123
	 * ```
	 */
	@Get('slug/:slug')
	async findBySlug(@Param('slug') slug: string, @Query() query: QueryOrganizationDto): Promise<Organization> {
		const tenantId = query.tenantId || 'default';
		return await this.organizationService.findBySlug(slug, tenantId);
	}

	/**
	 * 更新组织
	 *
	 * 更新组织信息
	 *
	 * @param id - 组织 ID
	 * @param dto - 更新数据
	 * @returns 已更新的组织
	 *
	 * @example
	 * ```bash
	 * PUT /organizations/:id
	 * {
	 *   "name": "Updated Name",
	 *   "description": "Updated description"
	 * }
	 * ```
	 */
	@Put(':id')
	async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto): Promise<Organization> {
		return await this.organizationService.update(id, dto);
	}

	/**
	 * 删除组织
	 *
	 * 删除指定组织
	 *
	 * @param id - 组织 ID
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * DELETE /organizations/:id
	 * ```
	 */
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async remove(@Param('id') id: string): Promise<void> {
		await this.organizationService.remove(id);
	}

	/**
	 * 暂停组织
	 *
	 * 将组织状态设置为暂停
	 *
	 * @param id - 组织 ID
	 * @returns 已暂停的组织
	 *
	 * @example
	 * ```bash
	 * PUT /organizations/:id/suspend
	 * ```
	 */
	@Put(':id/suspend')
	async suspend(@Param('id') id: string): Promise<Organization> {
		return await this.organizationService.suspend(id);
	}

	/**
	 * 激活组织
	 *
	 * 将组织状态设置为活跃
	 *
	 * @param id - 组织 ID
	 * @returns 已激活的组织
	 *
	 * @example
	 * ```bash
	 * PUT /organizations/:id/activate
	 * ```
	 */
	@Put(':id/activate')
	async activate(@Param('id') id: string): Promise<Organization> {
		return await this.organizationService.activate(id);
	}

	/**
	 * 根据租户 ID 查找组织
	 *
	 * 查询指定租户下的所有组织
	 *
	 * @param tenantId - 租户 ID
	 * @param query - 查询参数
	 * @returns 包含组织列表和总数的响应
	 *
	 * @example
	 * ```bash
	 * GET /organizations/tenant/:tenantId?status=ACTIVE&page=1&limit=10
	 * ```
	 */
	@Get('tenant/:tenantId')
	async findByTenantId(
		@Param('tenantId') tenantId: string,
		@Query() query: QueryOrganizationDto
	): Promise<{ data: Organization[]; total: number }> {
		return await this.organizationService.findByTenantId(tenantId, query);
	}
}
