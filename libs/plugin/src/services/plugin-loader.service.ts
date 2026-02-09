import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginStatus, PluginType } from '../interfaces/plugin.interface';
import { IPluginConfig, IPluginLoadOptions, IPluginUnloadOptions } from '../interfaces/plugin-config.interface';
import {
	IModulePlugin,
	IObjectPlugin,
	isModulePlugin,
	isObjectPlugin,
	IPluginState
} from '../interfaces/plugin-semantic.interface';
import { PluginRegistryService } from './plugin-registry.service';

/**
 * 插件加载服务
 *
 * 负责插件的加载、初始化和卸载
 * 支持模块插件和对象插件两种类型
 * 通过状态标志实现热拔插（启用/禁用功能）
 */
@Injectable()
export class PluginLoaderService implements OnModuleDestroy {
	private readonly logger = new Logger(PluginLoaderService.name);

	/** 模块引用（通过构造函数注入，可通过 setModuleRef 覆盖） */
	private moduleRef: ModuleRef;

	/** 插件状态映射 */
	private pluginStates = new Map<string, IPluginState>();

	constructor(
		private readonly registry: PluginRegistryService,
		moduleRef: ModuleRef
	) {
		this.moduleRef = moduleRef;
	}

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

		await this.loadSystemPlugins(config.systemPlugins, plugins);
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
		const entries = Object.entries(featurePlugins);

		if (entries.length === 0) {
			this.logger.log('没有配置功能插件');
			return;
		}

		const enabledPluginNames = entries.filter(([_, cfg]) => cfg.enabled).map(([name]) => name);
		if (enabledPluginNames.length > 0) {
			this.logger.log(`加载功能插件：${enabledPluginNames.join(', ')}`);
		} else {
			this.logger.log('没有启用的功能插件');
		}

		for (const [name, cfg] of entries) {
			const plugin = plugins.find((p) => p.name === name);

			if (!plugin) {
				this.logger.warn(`功能插件 ${name} 未注册，跳过`);
				continue;
			}

			// 未启用：仅更新状态，不执行加载。
			if (!cfg.enabled) {
				this.registry.updateStatus(name, PluginStatus.DISABLED);
				this.pluginStates.set(name, {
					name,
					status: PluginStatus.DISABLED,
					pluginType: isModulePlugin(plugin) ? 'module' : 'object',
					enabled: false
				});
				continue;
			}

			try {
				// 仅透传插件自身配置（避免把 enabled/config 包装对象传给 initialize）。
				await this.loadPlugin(plugin, cfg.config);
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
	 * 支持模块插件和对象插件
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

		if (isModulePlugin(plugin)) {
			await this.loadModulePlugin(plugin as IModulePlugin, config, options);
		} else if (isObjectPlugin(plugin)) {
			await this.loadObjectPlugin(plugin as IObjectPlugin, config);
		}

		this.registry.updateStatus(plugin.name, PluginStatus.INITIALIZED);
		this.pluginStates.set(plugin.name, {
			name: plugin.name,
			status: PluginStatus.INITIALIZED,
			pluginType: isModulePlugin(plugin) ? 'module' : 'object',
			enabled: true
		});

		// 插件生命周期钩子：优先注入 ModuleRef；若运行时尚未注入 ModuleRef，则以无参方式调用（便于单元测试与轻量插件）。
		if ((plugin as any).onApplicationBootstrap) {
			if (this.moduleRef) {
				await (plugin as any).onApplicationBootstrap(this.moduleRef);
			} else {
				await (plugin as any).onApplicationBootstrap();
			}
		}

		this.logger.log(`插件 ${plugin.name} 已加载`);
	}

	/**
	 * 加载模块插件
	 *
	 * 初始化模块插件
	 *
	 * @param plugin - 模块插件实例
	 * @param config - 插件配置
	 * @param options - 加载选项
	 * @returns Promise<void>
	 */
	private async loadModulePlugin(
		plugin: IModulePlugin,
		config?: Record<string, any>,
		options?: IPluginLoadOptions
	): Promise<void> {
		this.logger.log(`加载模块插件 ${plugin.name}...`);

		if ((plugin as any).initialize) {
			// 统一初始化语义：即使没有显式配置，也会执行 initialize（由插件内部决定默认行为）。
			await (plugin as any).initialize(config ?? {});
		}
	}

	/**
	 * 加载对象插件
	 *
	 * 初始化对象插件
	 *
	 * @param plugin - 对象插件实例
	 * @param config - 插件配置
	 * @returns Promise<void>
	 */
	private async loadObjectPlugin(plugin: IObjectPlugin, config?: Record<string, any>): Promise<void> {
		this.logger.log(`加载对象插件 ${plugin.name}...`);

		if (plugin.initialize) {
			// 统一初始化语义：即使没有显式配置，也会执行 initialize（由插件内部决定默认行为）。
			await plugin.initialize(config ?? {});
		}

		if (plugin.isEnabled !== undefined) {
			(plugin as any).isEnabled = true;
		}

		this.logger.log(`对象插件 ${plugin.name} 已加载`);
	}

	/**
	 * 卸载模块插件
	 *
	 * 销毁模块插件
	 *
	 * @param plugin - 模块插件实例
	 * @param options - 卸载选项
	 * @returns Promise<void>
	 */
	private async unloadModulePlugin(plugin: IModulePlugin, options?: IPluginUnloadOptions): Promise<void> {
		this.logger.log(`卸载模块插件 ${plugin.name}...`);

		// 插件生命周期钩子：优先注入 ModuleRef；若运行时尚未注入 ModuleRef，则以无参方式调用（便于单元测试与轻量插件）。
		if ((plugin as any).onApplicationShutdown) {
			if (this.moduleRef) {
				await (plugin as any).onApplicationShutdown(this.moduleRef);
			} else {
				await (plugin as any).onApplicationShutdown();
			}
		}
	}

	/**
	 * 卸载对象插件
	 *
	 * 销毁对象插件
	 *
	 * @param plugin - 对象插件实例
	 * @returns Promise<void>
	 */
	private async unloadObjectPlugin(plugin: IObjectPlugin): Promise<void> {
		this.logger.log(`卸载对象插件 ${plugin.name}...`);

		// 对象插件同样支持应用关闭钩子（在无 ModuleRef 时以无参方式调用）。
		if ((plugin as any).onApplicationShutdown) {
			if (this.moduleRef) {
				await (plugin as any).onApplicationShutdown(this.moduleRef);
			} else {
				await (plugin as any).onApplicationShutdown();
			}
		}

		if (plugin.destroy) {
			await plugin.destroy();
		}
	}

	/**
	 * 卸载插件
	 *
	 * 卸载并销毁指定的插件
	 * 支持模块插件和对象插件
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

		const dependents = this.getDependents(name);

		if (dependents.length > 0 && !options?.force) {
			throw new Error(`插件 ${name} 被以下插件依赖，无法卸载：${dependents.join(', ')}`);
		}

		this.logger.log(`卸载插件 ${name}...`);

		if (isModulePlugin(plugin)) {
			await this.unloadModulePlugin(plugin as IModulePlugin, options);
			// 模块插件的 destroy 由此处统一触发（对象插件在 unloadObjectPlugin 中已处理）。
			if ((plugin as any).destroy) {
				await (plugin as any).destroy();
			}
		} else if (isObjectPlugin(plugin)) {
			await this.unloadObjectPlugin(plugin as IObjectPlugin);
		}

		this.registry.unregister(name);
		this.pluginStates.delete(name);
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

		const plugin = this.registry.get(name);

		if (!plugin) {
			throw new Error(`插件 ${name} 未注册`);
		}

		try {
			// 重新加载语义：不移除注册信息，仅执行“关闭+销毁”后再强制加载，确保 initialize/onApplicationBootstrap 再次触发。
			if (isModulePlugin(plugin)) {
				await this.unloadModulePlugin(plugin as IModulePlugin, { force: true });
				if ((plugin as any).destroy) {
					await (plugin as any).destroy();
				}
			} else if (isObjectPlugin(plugin)) {
				await this.unloadObjectPlugin(plugin as IObjectPlugin);
			}

			await this.loadPlugin(plugin, (plugin as any).config, { force: true });
			this.logger.log(`插件 ${name} 已重新加载`);
		} catch (error) {
			this.logger.error(`重新加载插件 ${name} 失败`, error);
			this.registry.updateStatus(name, PluginStatus.FAILED);
		}
	}

	/**
	 * 禁用插件
	 *
	 * 禁用指定的插件（仅对功能插件有效）
	 *
	 * 系统插件不能被禁用或卸载
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	async disablePlugin(name: string): Promise<void> {
		const plugin = this.registry.get(name);

		if (!plugin) {
			throw new Error(`插件 ${name} 未注册`);
		}

		if (plugin.isProtected) {
			throw new Error(`系统插件 ${name} 不能被禁用`);
		}

		const pluginState = this.pluginStates.get(name);

		if (pluginState && pluginState.pluginType === 'module') {
			await this.unloadModulePlugin(plugin as IModulePlugin);
			this.pluginStates.set(name, {
				...pluginState,
				status: PluginStatus.DISABLED,
				enabled: false
			});
		} else if (isObjectPlugin(plugin)) {
			if ((plugin as IObjectPlugin).isEnabled !== undefined) {
				(plugin as IObjectPlugin).isEnabled = false;
			}
		}

		this.registry.updateStatus(name, PluginStatus.DISABLED);
		this.logger.log(`插件 ${name} 已禁用`);
	}

	/**
	 * 启用插件
	 *
	 * 启用指定的插件（仅对功能插件有效）
	 *
	 * 系统插件始终启用，无需手动启用
	 *
	 * @param name - 插件名称
	 * @param config - 插件配置
	 * @returns Promise<void>
	 */
	async enablePlugin(name: string, config?: Record<string, any>): Promise<void> {
		const plugin = this.registry.get(name);

		if (!plugin) {
			throw new Error(`插件 ${name} 未注册`);
		}

		if (plugin.isProtected) {
			throw new Error(`系统插件 ${name} 始终启用，无需手动启用`);
		}

		const pluginState = this.pluginStates.get(name);

		if (pluginState && pluginState.enabled) {
			this.logger.log(`插件 ${name} 已启用`);
			return;
		}

		if (isModulePlugin(plugin)) {
			await this.loadModulePlugin(plugin as IModulePlugin, config, { force: true });
		} else if (isObjectPlugin(plugin)) {
			if ((plugin as IObjectPlugin).isEnabled === false) {
				(plugin as IObjectPlugin).isEnabled = true;
			}

			if ((plugin as IObjectPlugin).initialize && config) {
				await (plugin as IObjectPlugin).initialize(config);
			}
		}

		if (pluginState) {
			this.pluginStates.set(name, {
				...pluginState,
				status: PluginStatus.INITIALIZED,
				pluginType: isModulePlugin(plugin) ? 'module' : 'object',
				enabled: true
			});
		}

		this.registry.updateStatus(name, PluginStatus.INITIALIZED);
		this.logger.log(`插件 ${name} 已启用`);
	}

	/**
	 * 获取依赖此插件的其他插件
	 *
	 * 遍历所有插件的依赖关系，返回依赖此插件的插件名称列表
	 * 支持显式依赖声明和自动依赖解析
	 *
	 * @param name - 插件名称
	 * @returns 依赖此插件的插件名称数组
	 */
	getDependents(name: string): string[] {
		const allPlugins = this.registry.getAll();
		const plugin = allPlugins.find((p) => p.name === name);

		if (!plugin) {
			return [];
		}

		const dependencies = plugin.dependencies || [];

		if (dependencies.length === 0) {
			return [];
		}

		const dependentPlugins: string[] = [];

		for (const depName of dependencies) {
			const depPlugin = allPlugins.find((p) => p.name === depName);
			if (depPlugin) {
				dependentPlugins.push(depName);
			}
		}

		return dependentPlugins;
	}

	/**
	 * 检查插件依赖冲突
	 *
	 * 检测插件系统中是否存在循环依赖
	 * 例如：插件 A 依赖 B，B 依赖 A，形成循环依赖
	 *
	 * @returns 包含冲突信息的数组，如果没有冲突返回空数组
	 */
	checkConflicts(): { plugin: string; conflicts: string[]; hasCircularDependency: boolean }[] {
		this.logger.debug('检查插件依赖冲突...');
		const conflicts: { plugin: string; conflicts: string[]; hasCircularDependency: boolean }[] = [];
		const plugins = this.registry.getAll();

		for (const plugin of plugins) {
			const dependencies = plugin.dependencies || [];

			if (dependencies.length === 0) {
				continue;
			}

			const missingDeps: string[] = [];
			for (const depName of dependencies) {
				const depPlugin = plugins.find((p) => p.name === depName);
				if (!depPlugin) {
					missingDeps.push(depName);
				}
			}

			if (missingDeps.length > 0) {
				conflicts.push({
					plugin: plugin.name,
					conflicts: missingDeps,
					hasCircularDependency: false
				});
				this.logger.warn(`插件 ${plugin.name} 依赖以下插件不存在：${missingDeps.join(', ')}`);
			}

			const visited = new Set<string>();
			const hasCircular = this.checkCircularDependencies(plugin.name, dependencies, new Set(), visited);

			if (hasCircular) {
				this.logger.error(`检测到循环依赖：${plugin.name}`);
				conflicts.push({
					plugin: plugin.name,
					conflicts: [`${plugin.name} (循环依赖)`],
					hasCircularDependency: true
				});
			}
		}

		return conflicts;
	}

	/**
	 * 检查循环依赖（深度优先搜索）
	 *
	 * @param pluginName - 要检查的插件名称
	 * @param dependencies - 插件依赖列表
	 * @param recursionStack - 递归栈（用于检测循环）
	 * @param visited - 已访问的插件集合
	 * @returns 如果发现循环依赖返回 true
	 */
	private checkCircularDependencies(
		pluginName: string,
		dependencies: string[],
		recursionStack: Set<string>,
		visited: Set<string>
	): boolean {
		if (recursionStack.has(pluginName)) {
			return true;
		}

		if (visited.has(pluginName)) {
			return false;
		}

		visited.add(pluginName);
		recursionStack.add(pluginName);

		const allPlugins = this.registry.getAll();
		for (const depName of dependencies) {
			const plugin = allPlugins.find((p) => p.name === depName);
			if (plugin && this.checkCircularDependencies(depName, plugin.dependencies || [], recursionStack, visited)) {
				return true;
			}
		}

		recursionStack.delete(pluginName);
		return false;
	}

	/**
	 * 获取插件状态
	 *
	 * @param name - 插件名称
	 * @returns 插件状态或 undefined
	 */
	getPluginState(name: string): IPluginState | undefined {
		return this.pluginStates.get(name);
	}

	/**
	 * 获取所有插件状态
	 *
	 * @returns 插件状态映射
	 */
	getAllPluginStates(): Map<string, IPluginState> {
		return new Map(this.pluginStates);
	}

	/**
	 * 模块销毁时调用
	 *
	 * 销毁所有插件
	 */
	onModuleDestroy(): void {
		this.logger.log('开始销毁所有插件...');

		const plugins = this.registry.getAll();

		for (const plugin of plugins) {
			const pluginState = this.pluginStates.get(plugin.name);

			if (isModulePlugin(plugin) && pluginState?.pluginType === 'module') {
				if ((plugin as any).onApplicationShutdown && this.moduleRef) {
					try {
						(plugin as any).onApplicationShutdown(this.moduleRef);
					} catch (error) {
						this.logger.error(`销毁模块插件 ${plugin.name} 失败`, error);
					}
				}
			}

			if ((plugin as any).destroy) {
				try {
					(plugin as any).destroy();
				} catch (error) {
					this.logger.error(`销毁插件 ${plugin.name} 失败`, error);
				}
			}
		}

		this.pluginStates.clear();
		this.logger.log('所有插件已销毁');
	}
}
