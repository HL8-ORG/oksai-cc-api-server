"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantBaseEntity = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@mikro-orm/core");
const core_2 = require("@oksai/core");
const tenant_entity_1 = require("./tenant.entity");
class TenantBaseEntity extends core_2.BaseEntity {
    tenant;
    tenantId;
}
exports.TenantBaseEntity = TenantBaseEntity;
tslib_1.__decorate([
    (0, core_1.ManyToOne)({ entity: () => tenant_entity_1.Tenant, nullable: true }),
    tslib_1.__metadata("design:type", tenant_entity_1.Tenant)
], TenantBaseEntity.prototype, "tenant", void 0);
//# sourceMappingURL=tenant-base.entity.js.map