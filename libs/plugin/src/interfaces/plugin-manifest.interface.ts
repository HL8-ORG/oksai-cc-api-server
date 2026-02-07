import { PluginType, PluginPriority } from '../enums/plugin-type.enum';

/**
 * 插件清单接口
 *
 * 定义插件 package.json 或 plugin-manifest.json 的元数据结构
 * 用于描述插件的基本信息、功能、依赖等
 */
export interface IPluginManifest {
	/**
	 * 插件名称（唯一标识）
	 *
	 * 遵循 npm 包名规范
	 * 对于 OKSAI 插件，应该使用 @oksai/ 前缀
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
	 * 格式：MAJOR.MINOR.PATCH
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
	 * 系统插件（SYSTEM）：系统运行必需，强制加载，不能禁用
	 * 功能插件（FEATURE）：可选安装，可动态管理
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
	 * 示例：Authentication, Analytics, Reporting
	 */
	category?: string;

	/**
	 * 插件图标
	 *
	 * 插件的图标 URL 或 Base64 编码
	 * 推荐：使用 SVG 格式或高分辨率 PNG
	 */
	icon?: string;

	/**
	 * 插件截图
	 *
	 * 插件的演示截图数组
	 * 用于展示插件界面和功能
	 */
	screenshots?: string[];

	/**
	 * 插件主入口文件
	 *
	 * 插件的主入口文件路径
	 * 默认：./dist/index.js
	 */
	main?: string;

	/**
	 * 插件模块
	 *
	 * 插件的模块文件路径
	 * 对于 NestJS 插件，可以指定模块类
	 */
	module?: string;

	/**
	 * 配置 schema
	 *
	 * 使用 JSON Schema 定义插件配置的结构
	 * 用于前端生成配置表单和验证配置
	 */
	configSchema?: any;

	/**
	 * 默认配置
	 *
	 * 插件的默认配置值
	 * 安装插件时会自动应用这些默认值
	 */
	defaultConfig?: Record<string, any>;

	/**
	 * 权限要求
	 *
	 * 插件需要的权限列表
	 * 示例：['users:read', 'users:write']
	 */
	permissions?: string[];

	/**
	 * API 端点
	 *
	 * 插件提供的 API 端点定义
	 * 用于文档生成和权限控制
	 */
	api?: Array<{
		/**
		 * API 路径
		 */
		path: string;

		/**
		 * HTTP 方法
		 */
		method: string;

		/**
		 * API 描述
		 */
		description: string;
	}>;

	/**
	 * 特定属性
	 *
	 * 插件特定扩展属性
	 * 可以包含任何插件需要的自定义元数据
	 */
	specificProperties?: Record<string, any>;

	/**
	 * 数据库实体
	 *
	 * 插件包含的数据库实体路径列表
	 * 相对于插件根目录
	 */
	entities?: string[];

	/**
	 * 订阅者
	 *
	 * 插件包含的订阅者路径列表
	 * 相对于插件根目录
	 */
	subscribers?: string[];

	/**
	 * 是否受保护
	 *
	 * 标记插件是否受保护（系统插件或关键功能插件）
	 * 受保护的插件不能被意外禁用或卸载
	 * 默认：false（功能插件）
	 */
	isProtected?: boolean;

	/**
	 * 是否可配置
	 *
	 * 插件是否支持运行时配置
	 * 默认：true
	 */
	isConfigurable?: boolean;

	/**
	 * 是否可安装（仅功能插件）
	 *
	 * 标记插件是否可以通过动态方式安装
	 * 系统插件不支持动态安装，只能通过代码更新
	 * 默认：true（功能插件）
	 */
	installable?: boolean;

	/**
	 * 是否可卸载（仅功能插件）
	 *
	 * 标记插件是否可以通过动态方式卸载
	 * 系统插件不能被卸载，只能通过代码更新
	 * 默认：true（功能插件）
	 */
	uninstallable?: boolean;

	/**
	 * 是否可更新
	 *
	 * 标记插件是否支持动态版本更新
	 * 默认：true（功能插件）
	 */
	updatable?: boolean;

	/**
	 * 系统支持类型
	 *
	 * 插件支持的系统类型
	 * - 'system': 仅系统插件
	 * - 'feature': 仅功能插件
	 * - 'both': 支持两种类型
	 */
	supportedSystem?: 'system' | 'feature' | 'both';

	/**
	 * 最小兼容版本
	 *
	 * 插件兼容的系统最低版本
	 * 格式与 package.json 中的 version 字段相同
	 */
	minVersion?: string;

	/**
	 * 最大兼容版本
	 *
	 * 插件兼容的系统最高版本
	 * 格式与 package.json 中的 version 字段相同
	 */
	maxVersion?: string;

	/**
	 * 被阻塞的版本
	 *
	 * 插件不兼容的特定版本列表
	 * 用于阻止用户安装不兼容版本
	 */
	blockedVersion?: string;

	/**
	 * 许可证
	 *
	 * 插件的许可证信息
	 */
	license?: {
		/**
		 * 许可证类型
		 * 例如：MIT, Apache-2.0, GPL-3.0
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
	 * 插件的问题反馈 URL（GitHub Issues 等）
	 */
	issues?: string;

	/**
	 * 下载 URL（仅功能插件）
	 *
	 * 功能插件的下载 URL
	 * 用于插件商店下载和安装
	 */
	downloadUrl?: string;

	/**
	 * 校验和（仅功能插件）
	 *
	 * 功能插件的校验和（SHA256）
	 * 用于验证插件完整性和安全性
	 */
	checksum?: string;

	/**
	 * 创建时间
	 *
	 * 插件的创建时间
	 * 格式：ISO 8601 字符串
	 */
	createdAt?: string;

	/**
	 * 更新时间
	 *
	 * 插件的更新时间
	 * 格式：ISO 8601 字符串
	 */
	updatedAt?: string;

	/**
	 * 用户信息
	 *
	 * 插件上传者或维护者信息
	 */
	userInfo?: {
		/**
		 * 用户 ID
		 */
		userId: string;

		/**
		 * 租户 ID
		 */
		tenantId: string;
	};
}
