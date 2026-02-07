import { Module, Global } from '@nestjs/common';
import { PluginRegistryService } from './services/plugin-registry.service';
import { PluginLoaderService } from './services/plugin-loader.service';

/**
 * 插件模块
 *
 * 提供插件系统的基础设施
 * 标记为全局模块，使所有模块都可以访问插件系统
 */
@Global()
@Module({
	providers: [PluginRegistryService, PluginLoaderService],
	exports: [PluginRegistryService, PluginLoaderService]
})
export class PluginModule {}
