"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = exports.TenantType = exports.TenantStatus = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@mikro-orm/core");
const core_2 = require("@oksai/core");
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "ACTIVE";
    TenantStatus["SUSPENDED"] = "SUSPENDED";
    TenantStatus["INACTIVE"] = "INACTIVE";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
var TenantType;
(function (TenantType) {
    TenantType["ORGANIZATION"] = "ORGANIZATION";
    TenantType["INDIVIDUAL"] = "INDIVIDUAL";
})(TenantType || (exports.TenantType = TenantType = {}));
let Tenant = class Tenant extends core_2.BaseEntity {
    name;
    slug;
    logo;
    website;
    description;
    status = TenantStatus.ACTIVE;
    type = TenantType.ORGANIZATION;
    trialEndDate;
    subscriptionPlan;
    maxUsers = 0;
    allowSelfRegistration = true;
    contactEmail;
    contactPhone;
    address;
    city;
    country;
    locale = 'en';
    timezone = 'UTC';
};
exports.Tenant = Tenant;
tslib_1.__decorate([
    (0, core_1.Property)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "name", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "slug", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "logo", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "website", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "description", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ default: TenantStatus.ACTIVE }),
    (0, core_1.Enum)(() => TenantStatus),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "status", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ default: TenantType.ORGANIZATION }),
    (0, core_1.Enum)(() => TenantType),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "type", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ defaultRaw: 'now()' }),
    tslib_1.__metadata("design:type", Date)
], Tenant.prototype, "trialEndDate", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "subscriptionPlan", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ default: 0 }),
    tslib_1.__metadata("design:type", Number)
], Tenant.prototype, "maxUsers", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ default: true }),
    tslib_1.__metadata("design:type", Boolean)
], Tenant.prototype, "allowSelfRegistration", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "contactEmail", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "contactPhone", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "address", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "city", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "country", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "locale", void 0);
tslib_1.__decorate([
    (0, core_1.Property)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Tenant.prototype, "timezone", void 0);
exports.Tenant = Tenant = tslib_1.__decorate([
    (0, core_1.Entity)({ tableName: 'tenants' }),
    (0, core_1.Index)({ name: 'idx_tenant_status', properties: ['status'] }),
    (0, core_1.Index)({ name: 'idx_tenant_type', properties: ['type'] }),
    (0, core_1.Index)({ name: 'idx_tenant_status_slug', properties: ['status', 'slug'] })
], Tenant);
//# sourceMappingURL=tenant.entity.js.map