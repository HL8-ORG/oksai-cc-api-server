import { EntityRepository } from '@mikro-orm/core';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto, UpdateTenantDto, QueryTenantDto } from './dto/tenant.dto';
export declare class TenantService {
    private readonly tenantRepo;
    constructor(tenantRepo: EntityRepository<Tenant>);
    private get em();
    create(createTenantDto: CreateTenantDto): Promise<Tenant>;
    findAll(query?: QueryTenantDto): Promise<{
        data: Tenant[];
        total: number;
    }>;
    findOne(id: string): Promise<Tenant>;
    findBySlug(slug: string): Promise<Tenant>;
    update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant>;
    remove(id: string): Promise<void>;
    suspend(id: string): Promise<Tenant>;
    activate(id: string): Promise<Tenant>;
}
