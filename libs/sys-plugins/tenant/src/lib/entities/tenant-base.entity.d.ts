import { BaseEntity } from '@oksai/core';
import { Tenant } from './tenant.entity';
export declare abstract class TenantBaseEntity extends BaseEntity {
    tenant?: Tenant;
    tenantId?: string;
}
