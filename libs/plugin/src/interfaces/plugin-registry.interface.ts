import { IPlugin, PluginStatus } from './plugin.interface';
import { PluginType } from '../enums/plugin-type.enum';

/**
 * 插件注册表接口
 *
 * 定义插件注册和管理的操作
 */
export interface IPluginRegistry {
	/**
	 * 注册插件
	 *
	 * 将插件添加到注册表中
	 *
	 * @param plugin - 插件实例
	 * @throws Error 如果插件名称已存在
	 *
	 * @example
	 * ```typescript
	 * const plugin = new AuthPlugin();
	 * registry.register(plugin);
	 * ```
	 */
	register(plugin: IPlugin): void;

	/**
	 * 注销插件
	 *
	 * 从注册表中移除插件
	 * 系统插件受保护，不能被注销（除非使用 force 参数）
	 *
	 * @param name - 插件名称
	 * @param force - 是否强制注销（仅用于系统插件的开发/测试）
	 * @throws Error 如果插件未注册或系统插件保护
	 *
	 * @example
	 * ```typescript
	 * registry.unregister('auth');
	 * // 强制注销系统插件（仅用于开发/测试）
	 * registry.unregister('auth', true);
	 * ```
	 */
	unregister(name: string, force?: boolean): void;

	/**
	 * 获取插件
	 *
	 * 根据插件名称获取插件实例
	 *
	 * @param name - 插件名称
	 * @returns 插件实例（如果存在），否则返回 undefined
	 *
	 * @example
	 * ```typescript
	 * const plugin = registry.get('auth');
	 * if (plugin) {
	 *   console.log('Plugin found:', plugin.name);
	 * }
	 * ```
	 */
	get(name: string): IPlugin | undefined;

	/**
	 * 获取所有插件
	 *
	 * 返回所有已注册的插件
	 *
	 * @returns 插件数组
	 *
	 * @example
	 * ```typescript
	 * const allPlugins = registry.getAll();
	 * console.log('Total plugins:', allPlugins.length);
	 * ```
	 */
	getAll(): IPlugin[];

	/**
	 * 获取已启用的插件
	 *
	 * 返回所有已启用状态的插件
	 *
	 * @returns 已启用的插件数组
	 *
	 * @example
	 * ```typescript
	 * const enabledPlugins = registry.getEnabled();
	 * console.log('Enabled plugins:', enabledPlugins.length);
	 * ```
	 */
	getEnabled(): IPlugin[];

	/**
	 * 获取系统插件
	 *
	 * 返回所有系统插件
	 *
	 * @returns 系统插件数组
	 *
	 * @example
	 * ```typescript
	 * const systemPlugins = registry.getSystemPlugins();
	 * console.log('System plugins:', systemPlugins.map(p => p.name));
	 * ```
	 */
	getSystemPlugins(): IPlugin[];

	/**
	 * 获取功能插件
	 *
	 * 返回所有功能插件
	 *
	 * @returns 功能插件数组
	 *
	 * @example
	 * ```typescript
	 * const featurePlugins = registry.getFeaturePlugins();
	 * console.log('Feature plugins:', featurePlugins.map(p => p.name));
	 * ```
	 */
	getFeaturePlugins(): IPlugin[];

	/**
	 * 获取插件状态
	 *
	 * 获取指定插件的状态信息
	 *
	 * @param name - 插件名称
	 * @returns 插件状态（如果存在），否则返回 undefined
	 *
	 * @example
	 * ```typescript
	 * const status = registry.getStatus('auth');
	 * console.log('Plugin status:', status);
	 * ```
	 */
	getStatus(name: string): PluginStatus | undefined;

	/**
	 * 获取所有插件状态
	 *
	 * 返回所有已注册插件的状态信息
	 *
	 * @returns 插件状态映射
	 *
	 * @example
	 * ```typescript
	 * const allStatus = registry.getAllStatus();
	 * allStatus.forEach((status, name) => {
	 *   console.log(`${name}: ${status}`);
	 * });
	 * ```
	 */
	getAllStatus(): Map<string, PluginStatus>;

	/**
	 * 更新插件状态
	 *
	 * 更新指定插件的状态
	 *
	 * @param name - 插件名称
	 * @param status - 新状态
	 *
	 * @example
	 * ```typescript
	 * registry.updateStatus('auth', PluginStatus.INITIALIZED);
	 * ```
	 */
	updateStatus(name: string, status: PluginStatus): void;

	/**
	 * 检查插件是否已注册
	 *
	 * @param name - 插件名称
	 * @returns 如果插件已注册返回 true，否则返回 false
	 *
	 * @example
	 * ```typescript
	 * if (registry.has('auth')) {
	 *   console.log('Auth plugin is registered');
	 * }
	 * ```
	 */
	has(name: string): boolean;

	/**
	 * 清空注册表
	 *
	 * 移除所有已注册的插件
	 * 警告：此操作不可逆
	 *
	 * @example
	 * ```typescript
	 * registry.clear();
	 * ```
	 */
	clear(): void;
}
