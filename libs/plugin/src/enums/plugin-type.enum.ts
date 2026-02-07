/**
 * 插件类型枚举
 *
 * 定义插件的类型分类
 */
export enum PluginType {
	/**
	 * 系统必须插件
	 *
	 * 系统运行必需的插件，应用启动时自动加载
	 * 不能被禁用或卸载（除非使用 force 参数）
	 */
	SYSTEM = 'system',

	/**
	 * 功能性插件
	 *
	 * 可根据业务需求选择安装的插件
	 * 可以动态启用、禁用、卸载
	 */
	FEATURE = 'feature'
}

/**
 * 插件优先级枚举
 *
 * 定义系统插件的加载优先级
 * 仅对系统插件有效，功能插件按照配置顺序加载
 */
export enum PluginPriority {
	/**
	 * P0 - 最高优先级
	 *
	 * 系统核心插件，必须最先加载
	 * 例如：认证、租户、用户、权限
	 */
	P0 = 0,

	/**
	 * P1 - 高优先级
	 *
	 * 重要的系统插件
	 * 例如：数据库扩展、缓存系统
	 */
	P1 = 1,

	/**
	 * P2 - 中等优先级
	 *
	 * 辅助系统插件
	 * 例如：日志系统、通知系统
	 */
	P2 = 2,

	/**
	 * P3 - 低优先级
	 *
	 * 可选系统插件
	 * 例如：监控、备份
	 */
	P3 = 3
}

/**
 * 插件状态枚举
 *
 * 定义插件的所有可能状态
 */
export enum PluginStatus {
	/**
	 * 未加载
	 *
	 * 插件已注册但未加载
	 */
	UNLOADED = 'UNLOADED',

	/**
	 * 已加载但未初始化
	 *
	 * 插件模块已加载，但 initialize 方法未调用
	 */
	LOADED = 'LOADED',

	/**
	 * 已加载并初始化
	 *
	 * 插件已完全加载并初始化，可以正常使用
	 */
	INITIALIZED = 'INITIALIZED',

	/**
	 * 加载失败
	 *
	 * 插件加载过程中发生错误
	 */
	FAILED = 'FAILED',

	/**
	 * 已禁用
	 *
	 * 插件已安装但被禁用，不会被加载
	 */
	DISABLED = 'DISABLED',

	/**
	 * 安装中
	 *
	 * 插件正在安装过程中
	 */
	INSTALLING = 'INSTALLING',

	/**
	 * 卸载中
	 *
	 * 插件正在卸载过程中
	 */
	UNINSTALLING = 'UNINSTALLING',

	/**
	 * 更新中
	 *
	 * 插件正在更新过程中
	 */
	UPDATING = 'UPDATING',

	/**
	 * 已删除
	 *
	 * 插件已被删除
	 */
	DELETED = 'DELETED',

	/**
	 * 依赖错误
	 *
	 * 插件依赖不满足要求
	 */
	DEPENDENCY_ERROR = 'DEPENDENCY_ERROR'
}
