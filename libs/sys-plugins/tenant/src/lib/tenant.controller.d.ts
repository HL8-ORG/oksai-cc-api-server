import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto, QueryTenantDto } from './dto/tenant.dto';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    create(createTenantDto: CreateTenantDto): Promise<any>;
    findAll(query: QueryTenantDto): Promise<{
        data: any[];
        total: number;
    }>;
    findOne(id: string): Promise<any>;
    findBySlug(slug: string): Promise<any>;
    update(id: string, updateTenantDto: UpdateTenantDto): Promise<any>;
    remove(id: string): Promise<void>;
    suspend(id: string): Promise<any>;
    activate(id: string): Promise<any>;
}
