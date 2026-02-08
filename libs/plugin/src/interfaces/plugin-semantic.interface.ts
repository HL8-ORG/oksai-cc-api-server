import { DynamicModule, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PluginType, PluginStatus } from '../enums/plugin-type.enum';

/**
 * 模块插件接口
 *
 * 模块插件是通过 NestJS Module 方式实现的插件
 * 提供完整的 NestJS 模块功能（providers、controllers、imports 等）
 * 支持动态加载和卸载，可以真正实现"热拔插"
 *
 * @remarks
 * 模块插件的特点：
 * - 可以提供路由、控制器、服务等
 * - 支持完整的 NestJS 依赖注入
 * - 可以动态加载到 NestJS 应用中
 * - 卸载时可以清理路由、服务等资源
 * - 适合功能型插件
 */
export interface IModulePlugin {
	/**
	 * 插件名称（唯一标识）
	 */
	readonly name: string;

	/**
	 * 插件显示名称
	 */
	readonly displayName?: string;

	/**
	 * 插件版本
	 */
	readonly version: string;

	/**
	 * 插件描述
	 */
	readonly description?: string;

	/**
	 * 插件类型
	 */
	readonly type: PluginType;

	/**
	 * 是否受保护（系统插件不能被禁用/卸载）
	 */
	readonly isProtected?: boolean;

	/**
	 * 创建插件模块
	 *
	 * @param config - 插件配置
	 * @returns 动态模块
	 */
	createModule(config?: Record<string, any>): DynamicModule | Promise<DynamicModule>;

	/**
	 * 插件初始化
	 *
	 * 在模块加载后调用
	 *
	 * @param moduleRef - 模块引用
	 */
	onApplicationBootstrap?(moduleRef: ModuleRef): Promise<void> | void;

	/**
	 * 插件销毁
	 *
	 * 在模块卸载前调用，用于清理资源
	 *
	 * @param moduleRef - 模块引用
	 */
	onApplicationShutdown?(moduleRef: ModuleRef): Promise<void> | void;
}

/**
 * 对象插件接口
 *
 * 对象插件是通过简单的类实例实现的插件
 * 不提供路由和控制器，主要用于扩展功能
 * 不支持真正的热拔插（因为路由无法动态移除）
 *
 * @remarks
 * 对象插件的特点：
 * - 实现简单，不需要完整的 Module 结构
 * - 主要用于提供扩展功能（如工具函数、装饰器等）
 * - 不提供路由，无法通过 API 访问
 * - 适合系统核心插件
 * - 可以通过配置开关来启用/禁用功能
 */
export interface IObjectPlugin {
	/**
	 * 插件名称（唯一标识）
	 */
	readonly name: string;

	/**
	 * 插件显示名称
	 */
	readonly displayName?: string;

	/**
	 * 插件版本
	 */
	readonly version: string;

	/**
	 * 插件描述
	 */
	readonly description?: string;

	/**
	 * 插件类型
	 */
	readonly type: PluginType;

	/**
	 * 是否受保护（系统插件不能被禁用/卸载）
	 */
	readonly isProtected?: boolean;

	/**
	 * 插件初始化
	 *
	 * 在插件加载时调用
	 *
	 * @param config - 插件配置
	 */
	initialize?(config?: Record<string, any>): Promise<void> | void;

	/**
	 * 插件销毁
	 *
	 * 在插件卸载时调用，用于清理资源
	 */
	destroy?(): Promise<void> | void;

	/**
	 * 是否启用
	 *
	 * 对象插件通过此字段控制功能是否启用
	 * 用于实现"软禁用"（功能不再生效但插件仍在内存中）
	 */
	isEnabled?: boolean;
}

/**
 * 统一插件接口
 *
 * 支持模块插件和对象插件两种类型
 * 使用类型守卫来区分插件类型
 */
export type IPlugin2 = IModulePlugin | IObjectPlugin;

/**
 * 类型守卫：判断是否为模块插件
 *
 * @param plugin - 插件实例
 * @returns 如果是模块插件返回 true，否则返回 false
 */
export function isModulePlugin(plugin: IPlugin2): plugin is IModulePlugin {
	return 'createModule' in plugin;
}

/**
 * 类型守卫：判断是否为对象插件
 *
 * @param plugin - 插件实例
 * @returns 如果是对象插件返回 true，否则返回 false
 */
export function isObjectPlugin(plugin: IPlugin2): plugin is IObjectPlugin {
	return !isModulePlugin(plugin);
}

/**
 * 插件状态接口
 */
export interface IPluginState {
	/**
	 * 插件名称
	 */
	name: string;

	/**
	 * 插件状态
	 */
	status: PluginStatus;

	/**
	 * 插件类型（module 或 object）
	 */
	pluginType: 'module' | 'object';

	/**
	 * 是否启用
	 */
	enabled: boolean;

	/**
	 * 模块引用（仅模块插件）
	 */
	moduleRef?: ModuleRef;

	/**
	 * 动态模块实例（仅模块插件）
	 */
	dynamicModule?: DynamicModule;
}
