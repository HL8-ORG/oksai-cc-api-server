export declare class CreateTenantDto {
    name: string;
    slug: string;
    logo?: string;
    website?: string;
    description?: string;
    status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    type?: 'ORGANIZATION' | 'INDIVIDUAL';
    trialEndDate?: string;
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
export declare class UpdateTenantDto {
    name?: string;
    slug?: string;
    logo?: string;
    website?: string;
    description?: string;
    status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    type?: 'ORGANIZATION' | 'INDIVIDUAL';
    trialEndDate?: string;
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
export declare class QueryTenantDto {
    search?: string;
    status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    type?: 'ORGANIZATION' | 'INDIVIDUAL';
    subscriptionPlan?: string;
}
