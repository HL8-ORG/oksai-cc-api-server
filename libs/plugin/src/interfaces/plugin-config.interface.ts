/**
 * 插件配置接口
 *
 * 定义插件系统的配置结构
 * 支持分类插件系统
 */
export interface IPluginConfig {
	/**
	 * 系统插件列表
	 *
	 * 系统插件必须加载，不能被禁用或卸载
	 * 示例：['auth', 'tenant', 'user', 'permission', 'database']
	 */
	systemPlugins: string[];

	/**
	 * 功能插件配置
	 *
	 * 功能插件可选加载，支持启用/禁用
	 * 键为插件名称，值为配置对象
	 */
	featurePlugins: Record<
		string,
		{
			/**
			 * 是否启用此插件
			 */
			enabled: boolean;

			/**
			 * 插件特定配置
			 */
			config?: Record<string, any>;
		}
	>;

	/**
	 * 插件全局配置
	 *
	 * 为特定插件提供配置参数
	 * 键为插件名称，值为配置对象
	 */
	plugins: Record<string, Record<string, any>>;

	/**
	 * 是否自动加载所有插件
	 *
	 * 为 true 时，系统会自动加载所有已注册的插件
	 * 为 false 时，需要手动调用加载方法
	 */
	autoLoad?: boolean;

	/**
	 * 插件加载超时时间（毫秒）
	 *
	 * 插件加载的超时时间，超过此时间会标记为加载失败
	 * 默认：30000 毫秒（30 秒）
	 */
	loadTimeout?: number;
}

/**
 * 插件加载选项接口
 */
export interface IPluginLoadOptions {
	/**
	 * 是否强制重新加载
	 *
	 * 为 true 时，即使插件已加载也会重新加载
	 */
	force?: boolean;

	/**
	 * 加载超时时间（毫秒）
	 *
	 * 覆盖全局配置的超时时间
	 */
	timeout?: number;
}

/**
 * 插件卸载选项接口
 */
export interface IPluginUnloadOptions {
	/**
	 * 是否强制卸载
	 *
	 * 为 true 时，即使插件被其他插件依赖也会卸载
	 */
	force?: boolean;
}
