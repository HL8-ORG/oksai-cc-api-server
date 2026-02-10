import { BaseEntity } from '@oksai/core';
export declare enum TenantStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    INACTIVE = "INACTIVE"
}
export declare enum TenantType {
    ORGANIZATION = "ORGANIZATION",
    INDIVIDUAL = "INDIVIDUAL"
}
export declare class Tenant extends BaseEntity {
    name: string;
    slug: string;
    logo?: string;
    website?: string;
    description?: string;
    status: TenantStatus;
    type: TenantType;
    trialEndDate?: Date;
    subscriptionPlan?: string;
    maxUsers?: number;
    allowSelfRegistration?: boolean;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    city?: string;
    country?: string;
    locale?: string;
    timezone?: string;
}
