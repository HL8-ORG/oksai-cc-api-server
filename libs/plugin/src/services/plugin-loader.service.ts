import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginStatus, PluginType } from '../interfaces/plugin.interface';
import { IPluginConfig, IPluginLoadOptions, IPluginUnloadOptions } from '../interfaces/plugin-config.interface';
import { PluginRegistryService } from './plugin-registry.service';
import { getPluginMetadata } from '../decorators/plugin.decorator';

/**
 * 插件加载服务
 *
 * 负责插件的加载、初始化和卸载
 * 管理插件生命周期
 */
@Injectable()
export class PluginLoaderService implements OnModuleDestroy {
	private readonly logger = new Logger(PluginLoaderService.name);

	/** 模块引用 */
	private moduleRef: ModuleRef | null = null;

	constructor(private readonly registry: PluginRegistryService) {}

	/**
	 * 设置模块引用
	 *
	 * @param moduleRef - 模块引用
	 */
	setModuleRef(moduleRef: ModuleRef): void {
		this.moduleRef = moduleRef;
	}

	/**
	 * 根据配置加载插件
	 *
	 * 加载配置中指定的插件
	 *
	 * @param config - 插件配置
	 * @returns Promise<void>
	 */
	async loadPlugins(config: IPluginConfig): Promise<void> {
		this.logger.log('开始加载插件...');

		const plugins = this.registry.getAll();

		if (plugins.length === 0) {
			this.logger.warn('没有注册的插件');
			return;
		}

		// 加载系统插件
		await this.loadSystemPlugins(config.systemPlugins, plugins);

		// 加载功能插件
		await this.loadFeaturePlugins(config.featurePlugins, plugins);

		this.logger.log(`插件加载完成，共加载 ${plugins.length} 个插件`);
	}

	/**
	 * 加载系统插件
	 *
	 * 加载所有系统插件，系统插件必须加载
	 *
	 * @param systemPluginNames - 系统插件名称列表
	 * @param plugins - 所有已注册的插件
	 * @returns Promise<void>
	 */
	private async loadSystemPlugins(systemPluginNames: string[], plugins: IPlugin[]): Promise<void> {
		this.logger.log(`加载系统插件：${systemPluginNames.join(', ')}`);

		const systemPlugins = plugins.filter((plugin) => plugin.type === PluginType.SYSTEM);

		for (const plugin of systemPlugins) {
			try {
				await this.loadPlugin(plugin);
				this.logger.log(`系统插件 ${plugin.name} 加载成功`);
			} catch (error) {
				this.logger.error(`系统插件 ${plugin.name} 加载失败`, error);
				this.registry.updateStatus(plugin.name, PluginStatus.FAILED);
			}
		}
	}

	/**
	 * 加载功能插件
	 *
	 * 根据配置加载功能插件
	 *
	 * @param featurePlugins - 功能插件配置
	 * @param plugins - 所有已注册的插件
	 * @returns Promise<void>
	 */
	private async loadFeaturePlugins(
		featurePlugins: Record<string, { enabled: boolean; config?: Record<string, any> }>,
		plugins: IPlugin[]
	): Promise<void> {
		const enabledPluginNames = Object.entries(featurePlugins)
			.filter(([_, config]) => config.enabled)
			.map(([name, config]) => ({ name, config }));

		if (enabledPluginNames.length === 0) {
			this.logger.log('没有启用的功能插件');
			return;
		}

		this.logger.log(`加载功能插件：${enabledPluginNames.map((p) => p.name).join(', ')}`);

		for (const { name, config } of enabledPluginNames) {
			const plugin = plugins.find((p) => p.name === name);

			if (!plugin) {
				this.logger.warn(`功能插件 ${name} 未注册，跳过`);
				continue;
			}

			try {
				await this.loadPlugin(plugin, config);
				this.logger.log(`功能插件 ${name} 加载成功`);
			} catch (error) {
				this.logger.error(`功能插件 ${name} 加载失败`, error);
				this.registry.updateStatus(name, PluginStatus.FAILED);
			}
		}
	}

	/**
	 * 加载单个插件
	 *
	 * 加载并初始化单个插件
	 *
	 * @param plugin - 插件实例
	 * @param config - 插件配置（可选）
	 * @param options - 加载选项（可选）
	 * @returns Promise<void>
	 */
	async loadPlugin(plugin: IPlugin, config?: Record<string, any>, options?: IPluginLoadOptions): Promise<void> {
		const currentStatus = this.registry.getStatus(plugin.name);

		if (currentStatus === PluginStatus.INITIALIZED && !options?.force) {
			this.logger.debug(`插件 ${plugin.name} 已初始化，跳过`);
			return;
		}

		this.registry.updateStatus(plugin.name, PluginStatus.LOADED);

		if (plugin.initialize && config) {
			await plugin.initialize(config);
		}

		this.registry.updateStatus(plugin.name, PluginStatus.INITIALIZED);

		if (plugin.onApplicationBootstrap && this.moduleRef) {
			await plugin.onApplicationBootstrap(this.moduleRef);
		}
	}

	/**
	 * 卸载插件
	 *
	 * 卸载并销毁指定的插件
	 *
	 * @param name - 插件名称
	 * @param options - 卸载选项（可选）
	 * @returns Promise<void>
	 */
	async unloadPlugin(name: string, options?: IPluginUnloadOptions): Promise<void> {
		const plugin = this.registry.get(name);

		if (!plugin) {
			throw new Error(`插件 ${name} 未注册`);
		}

		// Check dependencies
		const dependents = this.getDependents(name);

		if (dependents.length > 0 && !options?.force) {
			throw new Error(`插件 ${name} 被以下插件依赖，无法卸载：${dependents.join(', ')}`);
		}

		this.logger.log(`卸载插件 ${name}...`);

		if (plugin.onApplicationShutdown && this.moduleRef) {
			await plugin.onApplicationShutdown(this.moduleRef);
		}

		if (plugin.destroy) {
			await plugin.destroy();
		}

		this.registry.unregister(name);
		this.logger.log(`插件 ${name} 已卸载`);
	}

	/**
	 * 重新加载插件
	 *
	 * 卸载并重新加载指定的插件
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	async reloadPlugin(name: string): Promise<void> {
		this.logger.log(`重新加载插件 ${name}...`);

		await this.unloadPlugin(name, { force: true });
		await this.loadPlugin(this.registry.get(name)!, undefined, { force: true });

		this.logger.log(`插件 ${name} 已重新加载`);
	}

	/**
	 * 获取依赖此插件的其他插件
	 *
	 * @param name - 插件名称
	 * @returns 依赖此插件的插件名称数组
	 */
	private getDependents(name: string): string[] {
		return [];
	}

	/**
	 * 模块销毁时调用
	 *
	 * 销毁所有插件
	 */
	onModuleDestroy(): void {
		this.logger.log('开始销毁所有插件...');

		for (const plugin of this.registry.getAll()) {
			if (plugin.destroy) {
				try {
					plugin.destroy();
				} catch (error) {
					this.logger.error(`销毁插件 ${plugin.name} 失败`, error);
				}
			}
		}
	}
}
