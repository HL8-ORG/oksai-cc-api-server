import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Organization, OrganizationStatus } from './entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto, QueryOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationService {
	constructor(
		@InjectRepository(Organization)
		private readonly organizationRepo: EntityRepository<Organization>
	) {}

	/**
	 * 创建新组织
	 *
	 * @param dto 组织创建数据
	 * @param tenantId 租户 ID
	 * @returns 已创建的组织
	 * @throws BadRequestException 如果租户标识或组织标识已存在
	 *
	 * @example
	 * ```typescript
	 * const organization = await organizationService.create({
	 *   name: 'My Company',
	 *   slug: 'my-company',
	 *   tenantId: 'tenant-123'
	 * });
	 * ```
	 */
	async create(dto: CreateOrganizationDto, tenantId: string): Promise<Organization> {
		// 检查组织标识在租户内是否已存在
		const existingOrg = await this.organizationRepo.findOne({ slug: dto.slug, tenantId });

		if (existingOrg) {
			throw new BadRequestException('已存在使用此组织标识的租户');
		}

		// 创建新组织并设置默认状态
		const organization = this.organizationRepo.create({
			...dto,
			tenantId,
			status: dto.status || OrganizationStatus.ACTIVE
		} as any);

		await this.organizationRepo.getEntityManager().persistAndFlush(organization);
		return organization;
	}

	/**
	 * 查询组织列表
	 *
	 * @param query 查询参数（状态、搜索关键词、租户 ID）
	 * @returns 包含组织列表和总数的响应
	 *
	 * @example
	 * ```typescript
	 * const result = await organizationService.findAll({
	 *   tenantId: 'tenant-123',
	 *   search: 'test'
	 * });
	 * ```
	 */
	async findAll(query: QueryOrganizationDto = {}): Promise<{ data: Organization[]; total: number }> {
		const where: any = {};

		if (query.search) {
			where.$or = [
				{ name: { $like: `%${query.search}%` } },
				{ slug: { $like: `%${query.search}%` } },
				{ description: { $like: `%${query.search}%` } }
			];
		}

		if (query.status) {
			where.status = query.status;
		}

		if (query.tenantId) {
			where.tenantId = query.tenantId;
		}

		const page = query.page || 1;
		const limit = query.limit || 10;
		const offset = (page - 1) * limit;

		const [data, total] = await this.organizationRepo.findAndCount(where, {
			limit,
			offset
		});

		return { data, total };
	}

	async findOne(id: string): Promise<Organization> {
		const organization = await this.organizationRepo.findOne({ id });

		if (!organization) {
			throw new NotFoundException('Organization not found');
		}

		return organization;
	}

	async findBySlug(slug: string, tenantId: string): Promise<Organization> {
		const organization = await this.organizationRepo.findOne({ slug, tenantId });

		if (!organization) {
			throw new NotFoundException('Organization not found');
		}

		return organization;
	}

	async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
		const organization = await this.findOne(id);

		if (dto.slug && dto.slug !== organization.slug) {
			const existingOrg = await this.organizationRepo.findOne({
				slug: dto.slug,
				tenantId: organization.tenantId
			});

			if (existingOrg) {
				throw new BadRequestException('Organization with this slug already exists');
			}
		}

		Object.assign(organization, dto);
		await this.organizationRepo.getEntityManager().persistAndFlush(organization);

		return organization;
	}

	async remove(id: string): Promise<void> {
		const organization = await this.findOne(id);
		await this.organizationRepo.getEntityManager().removeAndFlush(organization);
	}

	async suspend(id: string): Promise<Organization> {
		const organization = await this.findOne(id);
		organization.status = OrganizationStatus.SUSPENDED;
		await this.organizationRepo.getEntityManager().persistAndFlush(organization);
		return organization;
	}

	async activate(id: string): Promise<Organization> {
		const organization = await this.findOne(id);
		organization.status = OrganizationStatus.ACTIVE;
		await this.organizationRepo.getEntityManager().persistAndFlush(organization);
		return organization;
	}

	async findByTenantId(
		tenantId: string,
		query: QueryOrganizationDto = {}
	): Promise<{ data: Organization[]; total: number }> {
		return this.findAll({ ...query, tenantId });
	}
}
