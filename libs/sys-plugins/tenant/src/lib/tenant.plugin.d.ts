import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginType, PluginPriority } from '@oksai/plugin';
export declare class TenantPlugin implements IPlugin {
    readonly name: string;
    readonly displayName: string;
    readonly version: string;
    readonly description: string;
    readonly type: PluginType;
    readonly priority: PluginPriority;
    readonly category: string;
    readonly author: {
        name: string;
        email?: string;
        url?: string;
    };
    readonly isProtected: boolean;
    readonly isConfigurable: boolean;
    readonly permissions: string[];
    readonly api: Array<{
        path: string;
        method: string;
        description: string;
    }>;
    private logEnabled;
    onApplicationBootstrap(module: ModuleRef): Promise<void>;
    onApplicationShutdown(_module: ModuleRef): Promise<void>;
    initialize(_config?: Record<string, any>, module?: ModuleRef): Promise<void>;
    private ensureDefaultTenant;
}
