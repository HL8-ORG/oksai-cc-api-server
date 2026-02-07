import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IPlugin, PluginStatus } from '../interfaces/plugin.interface';
import { IPluginConfig } from '../interfaces/plugin-config.interface';
import { PluginType } from '../enums/plugin-type.enum';

/**
 * 插件注册服务
 *
 * 负责插件的注册、注销和状态管理
 * 实现插件注册表接口
 */
@Injectable()
export class PluginRegistryService implements OnModuleInit {
	private readonly logger = new Logger(PluginRegistryService.name);

	/** 已注册的插件映射 */
	private readonly plugins = new Map<string, IPlugin>();

	/** 插件状态映射 */
	private readonly pluginStatuses = new Map<string, PluginStatus>();

	constructor() {}

	/**
	 * 模块初始化时调用
	 */
	onModuleInit(): void {
		this.logger.log('插件注册服务已初始化');
	}

	/**
	 * 注册插件
	 *
	 * 将插件添加到注册表中
	 *
	 * @param plugin - 插件实例
	 * @throws Error 如果插件名称已存在
	 */
	register(plugin: IPlugin): void {
		if (!plugin.name) {
			throw new Error('插件名称不能为空');
		}

		if (this.plugins.has(plugin.name)) {
			throw new Error(`插件 ${plugin.name} 已注册`);
		}

		this.plugins.set(plugin.name, plugin);
		this.pluginStatuses.set(plugin.name, PluginStatus.UNLOADED);

		this.logger.log(`插件 ${plugin.name} 已注册`);
	}

	/**
	 * 注销插件
	 *
	 * 从注册表中移除插件
	 *
	 * @param name - 插件名称
	 * @throws Error 如果插件未注册
	 */
	unregister(name: string): void {
		if (!this.plugins.has(name)) {
			throw new Error(`插件 ${name} 未注册`);
		}

		const plugin = this.plugins.get(name);

		if (plugin?.destroy) {
			plugin.destroy();
		}

		this.plugins.delete(name);
		this.pluginStatuses.delete(name);

		this.logger.log(`插件 ${name} 已注销`);
	}

	/**
	 * 获取插件
	 *
	 * 根据插件名称获取插件实例
	 *
	 * @param name - 插件名称
	 * @returns 插件实例（如果存在），否则返回 undefined
	 */
	get(name: string): IPlugin | undefined {
		return this.plugins.get(name);
	}

	/**
	 * 获取所有插件
	 *
	 * 返回所有已注册的插件
	 *
	 * @returns 插件数组
	 */
	getAll(): IPlugin[] {
		return Array.from(this.plugins.values());
	}

	/**
	 * 获取已启用的插件
	 *
	 * 返回所有已启用状态的插件
	 *
	 * @returns 已启用的插件数组
	 */
	getEnabled(): IPlugin[] {
		return Array.from(this.plugins.values()).filter((plugin) => {
			const status = this.pluginStatuses.get(plugin.name) || PluginStatus.UNLOADED;
			return status === PluginStatus.INITIALIZED;
		});
	}

	/**
	 * 获取系统插件
	 *
	 * 返回所有系统插件
	 *
	 * @returns 系统插件数组
	 */
	getSystemPlugins(): IPlugin[] {
		return Array.from(this.plugins.values()).filter((plugin) => plugin.type === PluginType.SYSTEM);
	}

	/**
	 * 获取功能插件
	 *
	 * 返回所有功能插件
	 *
	 * @returns 功能插件数组
	 */
	getFeaturePlugins(): IPlugin[] {
		return Array.from(this.plugins.values()).filter((plugin) => plugin.type === PluginType.FEATURE);
	}

	/**
	 * 获取插件状态
	 *
	 * 获取指定插件的状态信息
	 *
	 * @param name - 插件名称
	 * @returns 插件状态（如果存在），否则返回 undefined
	 */
	getStatus(name: string): PluginStatus | undefined {
		return this.pluginStatuses.get(name);
	}

	/**
	 * 获取所有插件状态
	 *
	 * 返回所有已注册插件的状态信息
	 *
	 * @returns 插件状态映射
	 */
	getAllStatus(): Map<string, PluginStatus> {
		return new Map(this.pluginStatuses);
	}

	/**
	 * 检查插件是否已注册
	 *
	 * @param name - 插件名称
	 * @returns 如果插件已注册返回 true，否则返回 false
	 */
	has(name: string): boolean {
		return this.plugins.has(name);
	}

	/**
	 * 更新插件状态
	 *
	 * 更新指定插件的状态
	 *
	 * @param name - 插件名称
	 * @param status - 新状态
	 */
	updateStatus(name: string, status: PluginStatus): void {
		this.pluginStatuses.set(name, status);
		this.logger.debug(`插件 ${name} 状态已更新为 ${status}`);
	}

	/**
	 * 清空注册表
	 *
	 * 移除所有已注册的插件
	 */
	clear(): void {
		this.logger.warn('清空插件注册表');

		for (const plugin of this.plugins.values()) {
			if (plugin.destroy) {
				try {
					plugin.destroy();
				} catch (error) {
					this.logger.error(`销毁插件 ${plugin.name} 失败`, error);
				}
			}
		}

		this.plugins.clear();
		this.pluginStatuses.clear();
		this.logger.log('插件注册表已清空');
	}
}
