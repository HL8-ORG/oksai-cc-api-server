import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto, QueryTenantDto } from './dto/tenant.dto';

/**
 * 租户控制器
 *
 * 提供租户管理相关的 API 端点，包括租户的增删改查、激活和暂停
 */
@Controller('tenants')
export class TenantController {
	constructor(private readonly tenantService: TenantService) {}

	/**
	 * 创建新租户
	 *
	 * 创建新的租户实体
	 *
	 * @param createTenantDto - 租户创建数据
	 * @returns 已创建的租户
	 *
	 * @example
	 * ```bash
	 * POST /tenants
	 * {
	 *   "name": "My Company",
	 *   "slug": "my-company",
	 *   "status": "ACTIVE",
	 *   "type": "ORGANIZATION"
	 * }
	 * ```
	 */
	@Post()
	async create(@Body() createTenantDto: CreateTenantDto): Promise<any> {
		return await this.tenantService.create(createTenantDto);
	}

	/**
	 * 查询租户列表
	 *
	 * 分页查询租户列表，支持按状态、类型、订阅计划、搜索关键词筛选
	 *
	 * @param query - 查询参数
	 * @returns 包含租户列表和总数的响应
	 *
	 * @example
	 * ```bash
	 * GET /tenants?status=ACTIVE&type=ORGANIZATION&search=test&page=1&limit=10
	 * ```
	 */
	@Get()
	async findAll(@Query() query: QueryTenantDto): Promise<{ data: any[]; total: number }> {
		return await this.tenantService.findAll(query);
	}

	/**
	 * 根据 ID 查找租户
	 *
	 * @param id - 租户 ID
	 * @returns 租户实体
	 *
	 * @example
	 * ```bash
	 * GET /tenants/:id
	 * ```
	 */
	@Get(':id')
	async findOne(@Param('id') id: string): Promise<any> {
		return await this.tenantService.findOne(id);
	}

	/**
	 * 根据标识查找租户
	 *
	 * @param slug - 租户标识
	 * @returns 租户实体
	 *
	 * @example
	 * ```bash
	 * GET /tenants/slug/:slug
	 * ```
	 */
	@Get('slug/:slug')
	async findBySlug(@Param('slug') slug: string): Promise<any> {
		return await this.tenantService.findBySlug(slug);
	}

	/**
	 * 更新租户
	 *
	 * 更新租户信息
	 *
	 * @param id - 租户 ID
	 * @param updateTenantDto - 更新数据
	 * @returns 已更新的租户
	 *
	 * @example
	 * ```bash
	 * PUT /tenants/:id
	 * {
	 *   "name": "Updated Company",
	 *   "description": "Updated description"
	 * }
	 * ```
	 */
	@Put(':id')
	async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto): Promise<any> {
		return await this.tenantService.update(id, updateTenantDto);
	}

	/**
	 * 删除租户
	 *
	 * 删除指定租户（软删除）
	 *
	 * @param id - 租户 ID
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * DELETE /tenants/:id
	 * ```
	 */
	@Delete(':id')
	async remove(@Param('id') id: string): Promise<void> {
		return await this.tenantService.remove(id);
	}

	/**
	 * 暂停租户
	 *
	 * 将租户状态设置为暂停
	 *
	 * @param id - 租户 ID
	 * @returns 已暂停的租户
	 *
	 * @example
	 * ```bash
	 * POST /tenants/:id/suspend
	 * ```
	 */
	@Post(':id/suspend')
	async suspend(@Param('id') id: string): Promise<any> {
		return await this.tenantService.suspend(id);
	}

	/**
	 * 激活租户
	 *
	 * 将租户状态设置为活跃
	 *
	 * @param id - 租户 ID
	 * @returns 已激活的租户
	 *
	 * @example
	 * ```bash
	 * POST /tenants/:id/activate
	 * ```
	 */
	@Post(':id/activate')
	async activate(@Param('id') id: string): Promise<any> {
		return await this.tenantService.activate(id);
	}
}
