"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const core_1 = require("@mikro-orm/core");
const tenant_entity_1 = require("./entities/tenant.entity");
let TenantService = class TenantService {
    tenantRepo;
    constructor(tenantRepo) {
        this.tenantRepo = tenantRepo;
    }
    get em() {
        return this.tenantRepo.getEntityManager();
    }
    async create(createTenantDto) {
        const existingTenant = await this.tenantRepo.findOne({ slug: createTenantDto.slug });
        if (existingTenant) {
            throw new common_1.BadRequestException('已存在使用此租户标识的租户');
        }
        const tenant = this.tenantRepo.create({
            ...createTenantDto,
            status: createTenantDto.status ? tenant_entity_1.TenantStatus[createTenantDto.status] : tenant_entity_1.TenantStatus.ACTIVE,
            type: createTenantDto.type ? tenant_entity_1.TenantType[createTenantDto.type] : tenant_entity_1.TenantType.ORGANIZATION,
            maxUsers: createTenantDto.maxUsers ?? 0,
            allowSelfRegistration: createTenantDto.allowSelfRegistration ?? true,
            locale: createTenantDto.locale ?? 'en',
            timezone: createTenantDto.timezone ?? 'UTC'
        });
        this.em.persist(tenant);
        await this.em.flush();
        return tenant;
    }
    async findAll(query = {}) {
        const where = {};
        if (query.status) {
            where.status = tenant_entity_1.TenantStatus[query.status];
        }
        if (query.type) {
            where.type = tenant_entity_1.TenantType[query.type];
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
    async findOne(id) {
        const tenant = await this.tenantRepo.findOne({ id });
        if (!tenant) {
            throw new common_1.NotFoundException(`未找到 ID 为 ${id} 的租户`);
        }
        return tenant;
    }
    async findBySlug(slug) {
        const tenant = await this.tenantRepo.findOne({ slug });
        if (!tenant) {
            throw new common_1.NotFoundException(`未找到标识为 ${slug} 的租户`);
        }
        return tenant;
    }
    async update(id, updateTenantDto) {
        const tenant = await this.findOne(id);
        if (updateTenantDto.slug) {
            const existingTenant = await this.tenantRepo.findOne({
                slug: updateTenantDto.slug,
                id: { $ne: id }
            });
            if (existingTenant) {
                throw new common_1.BadRequestException('已存在使用此租户标识的租户');
            }
        }
        Object.assign(tenant, updateTenantDto);
        if (updateTenantDto.status) {
            tenant.status = tenant_entity_1.TenantStatus[updateTenantDto.status];
        }
        if (updateTenantDto.type) {
            tenant.type = tenant_entity_1.TenantType[updateTenantDto.type];
        }
        this.em.persist(tenant);
        await this.em.flush();
        return tenant;
    }
    async remove(id) {
        const tenant = await this.findOne(id);
        this.em.remove(tenant);
        await this.em.flush();
        return;
    }
    async suspend(id) {
        const tenant = await this.findOne(id);
        tenant.status = tenant_entity_1.TenantStatus.SUSPENDED;
        this.em.persist(tenant);
        await this.em.flush();
        return tenant;
    }
    async activate(id) {
        const tenant = await this.findOne(id);
        tenant.status = tenant_entity_1.TenantStatus.ACTIVE;
        this.em.persist(tenant);
        await this.em.flush();
        return tenant;
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, nestjs_1.InjectRepository)(tenant_entity_1.Tenant)),
    tslib_1.__metadata("design:paramtypes", [core_1.EntityRepository])
], TenantService);
//# sourceMappingURL=tenant.service.js.map