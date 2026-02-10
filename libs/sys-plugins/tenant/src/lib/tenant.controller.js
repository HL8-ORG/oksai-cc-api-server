"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const tenant_service_1 = require("./tenant.service");
const tenant_dto_1 = require("./dto/tenant.dto");
let TenantController = class TenantController {
    tenantService;
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    async create(createTenantDto) {
        return await this.tenantService.create(createTenantDto);
    }
    async findAll(query) {
        return await this.tenantService.findAll(query);
    }
    async findOne(id) {
        return await this.tenantService.findOne(id);
    }
    async findBySlug(slug) {
        return await this.tenantService.findBySlug(slug);
    }
    async update(id, updateTenantDto) {
        return await this.tenantService.update(id, updateTenantDto);
    }
    async remove(id) {
        return await this.tenantService.remove(id);
    }
    async suspend(id) {
        return await this.tenantService.suspend(id);
    }
    async activate(id) {
        return await this.tenantService.activate(id);
    }
};
exports.TenantController = TenantController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [tenant_dto_1.CreateTenantDto]),
    tslib_1.__metadata("design:returntype", Promise)
], TenantController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [tenant_dto_1.QueryTenantDto]),
    tslib_1.__metadata("design:returntype", Promise)
], TenantController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], TenantController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Get)('slug/:slug'),
    tslib_1.__param(0, (0, common_1.Param)('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], TenantController.prototype, "findBySlug", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, tenant_dto_1.UpdateTenantDto]),
    tslib_1.__metadata("design:returntype", Promise)
], TenantController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], TenantController.prototype, "remove", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/suspend'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], TenantController.prototype, "suspend", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/activate'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], TenantController.prototype, "activate", null);
exports.TenantController = TenantController = tslib_1.__decorate([
    (0, common_1.Controller)('tenants'),
    tslib_1.__metadata("design:paramtypes", [tenant_service_1.TenantService])
], TenantController);
//# sourceMappingURL=tenant.controller.js.map