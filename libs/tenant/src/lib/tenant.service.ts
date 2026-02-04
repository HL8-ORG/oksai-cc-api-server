import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Tenant, TenantStatus, TenantType } from './entities/tenant.entity';
import { CreateTenantDto, UpdateTenantDto, QueryTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantService {
	constructor(
		@InjectRepository(Tenant)
		private readonly tenantRepo: EntityRepository<Tenant>
	) {}

	private get em(): EntityManager {
		return this.tenantRepo.getEntityManager();
	}

	/**
	 * 创建新租户
	 *
	 * @param createTenantDto - 租户创建数据
	 * @returns 已创建的租户
	 * @throws BadRequestException 如果租户标识已存在
	 */
	async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
		const existingTenant = await this.tenantRepo.findOne({ slug: createTenantDto.slug });

		if (existingTenant) {
			throw new BadRequestException('已存在使用此租户标识的租户');
		}

		// 创建新租户并设置默认状态和必需字段
		const tenant = this.tenantRepo.create({
			...createTenantDto,
			status: createTenantDto.status ? TenantStatus[createTenantDto.status] : TenantStatus.ACTIVE,
			type: createTenantDto.type ? TenantType[createTenantDto.type] : TenantType.ORGANIZATION,
			maxUsers: createTenantDto.maxUsers ?? 0,
			allowSelfRegistration: createTenantDto.allowSelfRegistration ?? true,
			locale: createTenantDto.locale ?? 'en',
			timezone: createTenantDto.timezone ?? 'UTC'
		} as any);

		this.em.persist(tenant);
		await this.em.flush();
		return tenant;
	}

	/**
	 * 查询租户列表
	 *
	 * @param query - 查询参数（状态、类型、订阅计划、搜索关键词）
	 * @returns 包含租户列表和总数的响应
	 */
	async findAll(query: QueryTenantDto = {}): Promise<{ data: Tenant[]; total: number }> {
		const where: any = {};

		if (query.status) {
			where.status = TenantStatus[query.status];
		}

		if (query.type) {
			where.type = TenantType[query.type];
		}

		if (query.subscriptionPlan) {
			where.subscriptionPlan = query.subscriptionPlan;
		}

		if (query.search) {
			where.$or = [{ name: { $like: `%${query.search}%` } }, { slug: { $like: `%${query.search}%` } }];
		}

		const [data, total] = await this.tenantRepo.findAndCount(where);

		return { data, total };
	}

	/**
	 * 根据 ID 查找租户
	 *
	 * @param id 租户 ID
	 * @returns 租户实体（如果找到），否则抛出异常
	 * @throws NotFoundException 当租户不存在时
	 */
	async findOne(id: string): Promise<Tenant> {
		const tenant = await this.tenantRepo.findOne({ id } as any);

		if (!tenant) {
			throw new NotFoundException(`未找到 ID 为 ${id} 的租户`);
		}

		return tenant;
	}

	/**
	 * 根据标识查找租户
	 *
	 * @param slug 租户标识
	 * @returns 租户实体（如果找到），否则抛出异常
	 *
	 * @throws NotFoundException 当租户不存在时
	 */
	async findBySlug(slug: string): Promise<Tenant> {
		const tenant = await this.tenantRepo.findOne({ slug });

		if (!tenant) {
			throw new NotFoundException(`未找到标识为 ${slug} 的租户`);
		}

		return tenant;
	}

	/**
	 * 更新租户
	 *
	 * @param id 租户 ID
	 * @param updateTenantDto 更新数据
	 * @returns 已更新的租户
	 * @throws NotFoundException 当租户不存在时
	 * @throws BadRequestException 当标识冲突时
	 */
	async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
		const tenant = await this.findOne(id);

		if (updateTenantDto.slug) {
			const existingTenant = await this.tenantRepo.findOne({
				slug: updateTenantDto.slug,
				id: { $ne: id }
			} as any);

			if (existingTenant) {
				throw new BadRequestException('已存在使用此租户标识的租户');
			}
		}

		Object.assign(tenant, updateTenantDto);

		if (updateTenantDto.status) {
			tenant.status = TenantStatus[updateTenantDto.status];
		}

		if (updateTenantDto.type) {
			tenant.type = TenantType[updateTenantDto.type];
		}

		this.em.persist(tenant);
		await this.em.flush();

		return tenant;
	}

	/**
	 * 删除租户（软删除）
	 *
	 * @param id 租户 ID
	 * @returns Promise<void> 无返回值
	 */
	async remove(id: string): Promise<void> {
		const tenant = await this.findOne(id);

		this.em.remove(tenant);
		await this.em.flush();

		return;
	}

	/**
	 * 暂停租户（设置状态为 SUSPENDED）
	 *
	 * @param id 租户 ID
	 * @returns 已暂停的租户
	 * @throws NotFoundException 当租户不存在时
	 */
	async suspend(id: string): Promise<Tenant> {
		const tenant = await this.findOne(id);

		tenant.status = TenantStatus.SUSPENDED;

		this.em.persist(tenant);
		await this.em.flush();

		return tenant;
	}

	/**
	 * 激活租户（设置状态为 ACTIVE）
	 *
	 * @param id 租户 ID
	 * @returns 已激活的租户
	 * @throws NotFoundException 当租户不存在时
	 */
	async activate(id: string): Promise<Tenant> {
		const tenant = await this.findOne(id);

		tenant.status = TenantStatus.ACTIVE;

		this.em.persist(tenant);
		await this.em.flush();

		return tenant;
	}
}
