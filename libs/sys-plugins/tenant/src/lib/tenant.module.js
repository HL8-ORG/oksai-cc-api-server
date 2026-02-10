"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const tenant_service_1 = require("./tenant.service");
const tenant_controller_1 = require("./tenant.controller");
const tenant_entity_1 = require("./entities/tenant.entity");
let TenantModule = class TenantModule {
};
exports.TenantModule = TenantModule;
exports.TenantModule = TenantModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [nestjs_1.MikroOrmModule.forFeature([tenant_entity_1.Tenant])],
        controllers: [tenant_controller_1.TenantController],
        providers: [tenant_service_1.TenantService],
        exports: [tenant_service_1.TenantService]
    })
], TenantModule);
//# sourceMappingURL=tenant.module.js.map