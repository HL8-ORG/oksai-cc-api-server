"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPlugin = void 0;
const plugin_1 = require("@oksai/plugin");
class TenantPlugin {
    name = 'tenant';
    displayName = '租户管理';
    version = '1.0.0';
    description = '提供多租户架构和租户隔离功能';
    type = plugin_1.PluginType.SYSTEM;
    priority = plugin_1.PluginPriority.P0;
    category = 'Tenant';
    author = {
        name: 'OKSAI Team',
        email: 'team@oksai.io'
    };
    isProtected = true;
    isConfigurable = true;
    permissions = ['tenants:read', 'tenants:write'];
    api = [
        {
            path: '/api/tenants',
            method: 'GET',
            description: '获取租户列表'
        },
        {
            path: '/api/tenants/:id',
            method: 'GET',
            description: '获取租户详情'
        },
        {
            path: '/api/tenants',
            method: 'POST',
            description: '创建租户'
        }
    ];
    logEnabled = true;
    async onApplicationBootstrap(module) {
        this.logEnabled && console.log('✓ Tenant Plugin initialized');
        await this.ensureDefaultTenant(module);
    }
    async onApplicationShutdown(_module) {
        this.logEnabled && console.log('✗ Tenant Plugin destroyed');
    }
    async initialize(_config, module) {
        if (module) {
            await this.ensureDefaultTenant(module);
        }
    }
    async ensureDefaultTenant(module) {
        const { MikroORM } = await Promise.resolve().then(() => __importStar(require('@mikro-orm/core')));
        const { Tenant, TenantStatus, TenantType } = await Promise.resolve().then(() => __importStar(require('./entities/tenant.entity')));
        try {
            const orm = module.get(MikroORM, { strict: false });
            const em = orm.em.fork();
            try {
                const defaultTenant = await em.findOne(Tenant, { slug: 'default' });
                if (!defaultTenant) {
                    console.log('正在创建默认租户...');
                    const tenant = em.create(Tenant, {
                        name: 'Default Tenant',
                        slug: 'default',
                        status: TenantStatus.ACTIVE,
                        type: TenantType.ORGANIZATION,
                        allowSelfRegistration: true,
                        maxUsers: 100
                    });
                    await em.persistAndFlush(tenant);
                    console.log('默认租户已创建');
                }
            }
            catch (error) {
                console.error('确保默认租户存在时出错:', error);
            }
        }
        catch (error) {
            console.error('从模块中获取 MikroORM 失败:', error);
        }
    }
}
exports.TenantPlugin = TenantPlugin;
//# sourceMappingURL=tenant.plugin.js.map