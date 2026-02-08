import { ModuleRef } from '@nestjs/core';
import { PluginType, PluginPriority, PluginStatus } from '../enums/plugin-type.enum';

export { PluginType, PluginPriority, PluginStatus };

/**
 * 插件生命周期钩子接口
 *
 * 定义插件在不同生命周期阶段可以执行的操作
 */
export interface ILifecycleHooks {
	/**
	 * 应用启动时调用
	 *
	 * 在应用初始化完成后调用，可以用于初始化插件资源
	 *
	 * @param module - 模块引用，可用于获取其他服务
	 * @returns Promise<void>
	 */
	onApplicationBootstrap?(module: ModuleRef): Promise<void> | void;

	/**
	 * 应用关闭时调用
	 *
	 * 在应用关闭前调用，可以用于清理插件资源
	 *
	 * @param module - 模块引用，可用于获取其他服务
	 * @returns Promise<void>
	 */
	onApplicationShutdown?(module: ModuleRef): Promise<void> | void;
}

/**
 * 插件元数据接口
 *
 * 定义插件的基本信息和依赖关系
 */
export interface IPluginMetadata {
	/**
	 * 插件名称（唯一标识）
	 *
	 * 用于标识和引用插件
	 */
	name: string;

	/**
	 * 插件显示名称
	 *
	 * 插件的友好名称，用于 UI 显示
	 */
	displayName?: string;

	/**
	 * 插件版本
	 *
	 * 遵循语义化版本规范（Semantic Versioning）
	 */
	version: string;

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
	author?: {
		/**
		 * 作者名称
		 */
		name: string;

		/**
		 * 作者邮箱
		 */
		email?: string;

		/**
		 * 作者网站
		 */
		url?: string;
	};

	/**
	 * 插件类型
	 *
	 * 系统插件（System）：系统运行必需，强制加载，不能禁用
	 * 功能插件（Feature）：可选安装，可动态管理
	 */
	type?: PluginType;

	/**
	 * 插件优先级（仅系统插件使用）
	 *
	 * P0 - 最高优先级，系统核心插件
	 * P1 - 高优先级，重要系统插件
	 * P2 - 中等优先级，辅助系统插件
	 * P3 - 低优先级，可选系统插件
	 */
	priority?: PluginPriority;

	/**
	 * 插件分类（仅功能插件使用）
	 *
	 * 用于插件的分类和搜索
	 */
	category?: string;

	/**
	 * 插件图标
	 *
	 * 插件的图标 URL 或 Base64 编码
	 */
	icon?: string;

	/**
	 * 插件截图
	 *
	 * 插件的演示截图数组
	 */
	screenshots?: string[];

	/**
	 * 插件主入口文件
	 *
	 * 插件的主入口文件路径
	 */
	main?: string;

	/**
	 * 插件模块
	 *
	 * 插件的模块文件路径
	 */
	module?: string;

	/**
	 * 配置 schema
	 *
	 * 使用 JSON Schema 定义插件配置的结构
	 */
	configSchema?: any;

	/**
	 * 默认配置
	 *
	 * 插件的默认配置值
	 */
	defaultConfig?: Record<string, any>;

	/**
	 * 依赖列表
	 *
	 * 插件依赖的其他插件名称列表
	 * 用于依赖管理和冲突检测
	 */
	dependencies?: string[];

	/**
	 * API 端点
	 *
	 * 插件提供的 API 端点定义
	 */
	api?: Array<{
		path: string;
		method: string;
		description: string;
	}>;

	/**
	 * 数据库实体
	 *
	 * 插件包含的数据库实体路径列表
	 */
	entities?: string[];

	/**
	 * 订阅者
	 *
	 * 插件包含的订阅者路径列表
	 */
	subscribers?: string[];

	/**
	 * 是否受保护
	 *
	 * 标记插件是否受保护（系统插件或关键功能插件）
	 * 受保护的插件不能被意外禁用或卸载
	 */
	isProtected?: boolean;

	/**
	 * 是否可配置
	 *
	 * 插件是否支持运行时配置
	 */
	isConfigurable?: boolean;

	/**
	 * 是否可安装（仅功能插件）
	 *
	 * 标记插件是否可以通过动态方式安装
	 * 系统插件不支持动态安装，只能通过代码更新
	 */
	installable?: boolean;

	/**
	 * 是否可卸载（仅功能插件）
	 *
	 * 标记插件是否可以通过动态方式卸载
	 * 系统插件不能被卸载，只能通过代码更新
	 */
	uninstallable?: boolean;

	/**
	 * 是否可更新
	 *
	 * 标记插件是否支持动态版本更新
	 */
	updatable?: boolean;

	/**
	 * 最小兼容版本
	 *
	 * 插件兼容的系统最低版本
	 */
	minVersion?: string;

	/**
	 * 最大兼容版本
	 *
	 * 插件兼容的系统最高版本
	 */
	maxVersion?: string;

	/**
	 * 许可证
	 *
	 * 插件的许可证信息
	 */
	license?: {
		/**
		 * 许可证类型
		 */
		type: string;

		/**
		 * 许可证 URL
		 */
		url?: string;
	};

	/**
	 * 主页
	 *
	 * 插件的主页 URL
	 */
	homepage?: string;

	/**
	 * 文档
	 *
	 * 插件的文档 URL
	 */
	documentation?: string;

	/**
	 * 问题反馈
	 *
	 * 插件的问题反馈 URL
	 */
	issues?: string;

	/**
	 * 下载 URL（仅功能插件）
	 *
	 * 功能插件的下载 URL
	 */
	downloadUrl?: string;

	/**
	 * 校验和（仅功能插件）
	 *
	 * 功能插件的校验和（SHA256）
	 */
	checksum?: string;

	/**
	 * 创建时间
	 *
	 * 插件的创建时间
	 */
	createdAt?: string;

	/**
	 * 更新时间
	 *
	 * 插件的更新时间
	 */
	updatedAt?: string;
}

/**
 * 插件状态信息接口
 */
export interface IPluginStatusInfo {
	/**
	 * 插件名称
	 */
	name: string;

	/**
	 * 插件状态
	 */
	status: PluginStatus;

	/**
	 * 状态更新时间
	 */
	updatedAt: Date;

	/**
	 * 错误信息（如果加载失败）
	 */
	error?: Error;
}

/**
 * 插件接口
 *
 * 所有插件必须实现此接口
 */
export interface IPlugin extends ILifecycleHooks, IPluginMetadata {
	/**
	 * 插件类型（必需）
	 *
	 * 用于区分系统插件和功能插件
	 */
	readonly type: PluginType;

	/**
	 * 插件实例
	 *
	 * 插件类的实例，包含插件的所有功能
	 */
	instance?: any;

	/**
	 * 插件配置
	 *
	 * 插件的运行时配置，可以通过配置文件动态修改
	 */
	config?: Record<string, any>;

	/**
	 * 插件状态信息
	 *
	 * 插件的当前状态信息
	 */
	status?: IPluginStatusInfo;

	/**
	 * 初始化插件
	 *
	 * 插件启动时调用，可以用于初始化插件资源
	 *
	 * @param config - 插件配置
	 * @returns Promise<void>
	 */
	initialize?(config: Record<string, any>): Promise<void> | void;

	/**
	 * 销毁插件
	 *
	 * 插件停止时调用，可以用于清理插件资源
	 *
	 * @returns Promise<void>
	 */
	destroy?(): Promise<void> | void;
}
