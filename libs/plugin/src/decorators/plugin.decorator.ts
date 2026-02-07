import { IPluginMetadata, PluginStatus } from '../interfaces/plugin.interface';

/**
 * 插件装饰器选项接口
 *
 * 定义 @Plugin 装饰器的配置选项
 */
export interface PluginDecoratorOptions {
	/**
	 * 插件名称（唯一标识）
	 */
	name: string;

	/**
	 * 插件版本
	 *
	 * 遵循语义化版本规范（Semantic Versioning）
	 * 默认：1.0.0
	 */
	version?: string;

	/**
	 * 插件描述
	 *
	 * 描述插件的功能和用途
	 */
	description?: string;

	/**
	 * 插件作者
	 *
	 * 插件开发者或组织信息
	 */
	author?: string;

	/**
	 * 插件依赖列表
	 *
	 * 列出此插件依赖的其他插件名称
	 * 系统会在加载插件时确保依赖先加载
	 */
	dependencies?: string[];

	/**
	 * 是否为核心插件
	 *
	 * 核心插件是系统必需的，默认启用，不能禁用
	 * 默认：false
	 */
	isCore?: boolean;

	/**
	 * 插件状态
	 *
	 * 设置插件的初始状态
	 * 默认：PluginStatus.UNLOADED
	 */
	status?: PluginStatus;
}

/**
 * 插件存储元数据
 *
 * 存储类的插件元数据
 */
const PLUGIN_METADATA_KEY = Symbol('PLUGIN_METADATA');

/**
 * 获取插件元数据
 *
 * 从类中提取插件装饰器设置的元数据
 *
 * @param target - 目标类
 * @returns 插件元数据（如果存在），否则返回 undefined
 *
 * @example
 * ```typescript
 * @Plugin({ name: 'auth', version: '1.0.0' })
 * export class AuthPlugin {}
 *
 * const metadata = getPluginMetadata(AuthPlugin);
 * console.log(metadata.name); // 'auth'
 * ```
 */
export function getPluginMetadata(target: any): PluginDecoratorOptions | undefined {
	return Reflect.getMetadata(PLUGIN_METADATA_KEY, target);
}

/**
 * 检查类是否是插件
 *
 * @param target - 目标类
 * @returns 如果类使用 @Plugin 装饰器返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * @Plugin({ name: 'auth' })
 * export class AuthPlugin {}
 *
 * console.log(isPlugin(AuthPlugin)); // true
 * ```
 */
export function isPlugin(target: any): boolean {
	return getPluginMetadata(target) !== undefined;
}

/**
 * 插件装饰器
 *
 * 用于标记一个类为插件
 * 装饰器会将插件的元数据存储在类上
 *
 * @param options - 插件配置选项
 * @returns 类装饰器
 *
 * @example
 * ```typescript
 * @Plugin({
 *   name: 'auth',
 *   version: '1.0.0',
 *   description: '认证插件',
 *   author: 'OKSAI Team',
 *   isCore: true
 * })
 * export class AuthPlugin {
 *   async onApplicationBootstrap(module: ModuleRef): Promise<void> {
 *     console.log('Auth plugin initialized');
 *   }
 * }
 * ```
 */
export function Plugin(options: PluginDecoratorOptions): ClassDecorator {
	return (target: any) => {
		Reflect.defineMetadata(PLUGIN_METADATA_KEY, options, target);
		return target;
	};
}
