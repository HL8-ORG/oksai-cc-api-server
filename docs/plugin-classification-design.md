# OKSAI 插件系统分类设计方案

## 概述

本文档详细说明 OKSAI 插件系统的分类设计方案，将插件分为两类：

1. **系统必须插件**（System Plugins）：系统运行必需，不可禁用或卸载
2. **功能性插件**（Feature Plugins）：可选安装，可动态管理

---

## 1. 插件分类定义

### 1.1 系统必须插件（System Plugins）

**定义**：

-   系统运行必需的插件
-   应用启动时自动加载
-   **不能被禁用或卸载**
-   提供核心基础设施和关键业务功能

**特性**：

-   ✅ 强制加载：应用启动时必须加载
-   ✅ 保护机制：防止被意外禁用或卸载
-   ✅ 依赖管理：系统插件之间的依赖关系
-   ✅ 版本控制：仅通过代码更新来升级
-   ✅ 状态管理：仅包含 `UNLOADED`、`LOADED`、`INITIALIZED`

**插件列表**：

| 插件名称     | 显示名称   | 描述                           | 优先级     |
| ------------ | ---------- | ------------------------------ | ---------- |
| `auth`       | 认证系统   | 提供身份认证和权限管理         | P0（最高） |
| `tenant`     | 租户系统   | 提供多租户支持                 | P0         |
| `user`       | 用户管理   | 提供用户 CRUD 和资料管理       | P0         |
| `permission` | 权限系统   | 提供基于角色的访问控制（RBAC） | P0         |
| `database`   | 数据库扩展 | 提供数据库连接和迁移支持       | P0         |
| `cache`      | 缓存系统   | 提供 Redis 缓存支持            | P1         |
| `logging`    | 日志系统   | 提供结构化日志和日志管理       | P1         |

### 1.2 功能性插件（Feature Plugins）

**定义**：

-   提供特定业务功能的插件
-   用户可选择安装或卸载
-   可以动态启用或禁用
-   不影响系统核心运行

**特性**：

-   ✅ 可选安装：用户决定是否使用
-   ✅ 动态管理：运行时可以安装、启用、禁用、卸载
-   ✅ 依赖检查：确保依赖的系统插件已安装
-   ✅ 版本管理：支持动态更新
-   ✅ 状态管理：包含 `UNLOADED`、`LOADED`、`INITIALIZED`、`DISABLED`、`FAILED`

**插件列表**：

| 插件名称              | 显示名称      | 描述                       | 分类          |
| --------------------- | ------------- | -------------------------- | ------------- |
| `analytics`           | 数据分析      | 提供数据分析和报表功能     | Analytics     |
| `reporting`           | 报表生成      | 提供自定义报表和导出       | Reporting     |
| `integration-github`  | GitHub 集成   | 集成 GitHub API 和 Webhook | Integration   |
| `integration-jira`    | Jira 集成     | 集成 Jira API 和 Webhook   | Integration   |
| `integration-slack`   | Slack 集成    | 集成 Slack 消息通知        | Integration   |
| `email-smtp`          | SMTP 邮件     | 提供 SMTP 邮件发送         | Communication |
| `email-sendgrid`      | SendGrid 邮件 | 提供 SendGrid 邮件发送     | Communication |
| `notification-sms`    | SMS 通知      | 提供 SMS 短信通知          | Communication |
| `file-storage-s3`     | S3 存储       | 提供 AWS S3 文件存储       | Storage       |
| `file-storage-minio`  | MinIO 存储    | 提供 MinIO 文件存储        | Storage       |
| `workflow-approval`   | 审批流程      | 提供自定义审批工作流       | Workflow      |
| `workflow-automation` | 自动化流程    | 提供流程自动化规则引擎     | Workflow      |
| `knowledge-base`      | 知识库        | 提供知识库和文档管理       | Content       |
| `blog`                | 博客          | 提供博客和文章发布         | Content       |
| `forum`               | 论坛          | 提供社区论坛功能           | Community     |

---

## 2. 插件清单接口更新

### 2.1 更新的 IPluginManifest 接口

```typescript
// libs/plugin/src/interfaces/plugin-manifest.interface.ts
/**
 * 插件清单接口
 *
 * 定义插件的元数据和配置信息
 */
export interface IPluginManifest {
	/** 插件名称（唯一标识）*/
	name: string;

	/** 插件显示名称 */
	displayName: string;

	/** 插件描述 */
	description: string;

	/** 插件版本 */
	version: string;

	/** 插件类型：系统插件或功能插件 */
	type: PluginType;

	/** 插件分类（仅功能插件使用）*/
	category?: string;

	/** 插件优先级（仅系统插件使用）*/
	priority?: PluginPriority;

	/** 插件作者 */
	author?: {
		name: string;
		email?: string;
		url?: string;
	};

	/** 插件依赖 */
	dependencies?: Array<{
		name: string;
		version?: string;
		type?: PluginType; // 依赖的插件类型
	}>;

	/** 插件图标 */
	icon?: string;

	/** 插件截图 */
	screenshots?: string[];

	/** 主入口文件 */
	main: string;

	/** 插件模块 */
	module: string;

	/** 配置 schema */
	configSchema?: JSONSchema7;

	/** 默认配置 */
	defaultConfig?: Record<string, any>;

	/** 权限要求 */
	permissions?: string[];

	/** API 端点 */
	api?: Array<{
		path: string;
		method: string;
		description: string;
	}>;

	/** 数据库实体 */
	entities?: string[];

	/** 订阅者 */
	subscribers?: string[];

	/** 安装后钩子 */
	afterInstall?: string;

	/** 卸载前钩子 */
	beforeUninstall?: string;

	/** 兼容的系统版本 */
	compatibility?: {
		minVersion?: string;
		maxVersion?: string;
	};

	/** 许可证 */
	license?: {
		type: string;
		url?: string;
	};

	/** 主页 */
	homepage?: string;

	/** 文档 */
	documentation?: string;

	/** 问题反馈 */
	issues?: string;

	/** 下载 URL（仅功能插件）*/
	downloadUrl?: string;

	/** 校验和（仅功能插件）*/
	checksum?: string;

	/** 创建时间 */
	createdAt?: string;

	/** 更新时间 */
	updatedAt?: string;
}

/**
 * 插件类型枚举
 */
export enum PluginType {
	/** 系统必须插件 */
	SYSTEM = 'system',

	/** 功能性插件 */
	FEATURE = 'feature'
}

/**
 * 插件优先级枚举（仅系统插件使用）
 */
export enum PluginPriority {
	/** P0 - 最高优先级，系统核心插件 */
	P0 = 0,

	/** P1 - 高优先级，重要系统插件 */
	P1 = 1,

	/** P2 - 中等优先级，辅助系统插件 */
	P2 = 2
}
```

### 2.2 示例：系统插件清单

```json
{
	"name": "auth",
	"displayName": "认证系统",
	"description": "提供身份认证和权限管理",
	"version": "1.0.0",
	"type": "system",
	"priority": "P0",
	"author": {
		"name": "OKSAI Team",
		"email": "team@oksai.io",
		"url": "https://oksai.io"
	},
	"dependencies": [],
	"main": "./dist/index.js",
	"module": "./dist/index.js",
	"entities": ["./dist/entities/*.entity.js"],
	"subscribers": ["./dist/subscribers/*.subscriber.js"],
	"permissions": [],
	"license": {
		"type": "MIT",
		"url": "https://opensource.org/licenses/MIT"
	},
	"compatibility": {
		"minVersion": "1.0.0",
		"maxVersion": "2.0.0"
	}
}
```

### 2.3 示例：功能插件清单

```json
{
	"name": "analytics",
	"displayName": "数据分析",
	"description": "提供数据分析和报表功能",
	"version": "1.0.0",
	"type": "feature",
	"category": "Analytics",
	"author": {
		"name": "OKSAI Team",
		"email": "team@oksai.io",
		"url": "https://oksai.io"
	},
	"dependencies": [
		{
			"name": "auth",
			"version": ">=1.0.0",
			"type": "system"
		},
		{
			"name": "tenant",
			"version": ">=1.0.0",
			"type": "system"
		}
	],
	"main": "./dist/index.js",
	"module": "./dist/index.js",
	"entities": ["./dist/entities/*.entity.js"],
	"permissions": ["read:analytics", "write:analytics"],
	"configSchema": {
		"type": "object",
		"properties": {
			"enabled": {
				"type": "boolean",
				"default": true
			},
			"provider": {
				"type": "string",
				"enum": ["google-analytics", "mixpanel", "amplitude"],
				"default": "google-analytics"
			}
		}
	},
	"downloadUrl": "https://registry.oksai.io/plugins/analytics/v1.0.0.tar.gz",
	"checksum": "sha256:abc123...",
	"license": {
		"type": "MIT",
		"url": "https://opensource.org/licenses/MIT"
	}
}
```

---

## 3. 数据库实体更新

### 3.1 更新的 PluginInfo 实体

```typescript
// libs/plugin/src/entities/plugin-info.entity.ts
import { Entity, PrimaryKey, Property, ManyToMany, JoinTable, Index } from '@mikro-orm/core';
import { PluginType, PluginPriority } from '../enums/plugin-manifest.enum';
import { PluginDependency } from './plugin-dependency.entity';

/**
 * 插件信息实体
 *
 * 存储已安装插件的基本信息
 */
@Entity()
export class PluginInfo {
	@PrimaryKey()
	id: string = crypto.randomUUID();

	/** 插件名称（唯一标识）*/
	@Property({ unique: true })
	name!: string;

	/** 插件显示名称 */
	@Property()
	displayName!: string;

	/** 插件描述 */
	@Property({ nullable: true })
	description?: string;

	/** 当前版本 */
	@Property()
	version!: string;

	/** 插件类型 */
	@Enum(() => PluginType)
	type: PluginType;

	/** 插件优先级（仅系统插件）*/
	@Enum(() => PluginPriority, { nullable: true })
	priority?: PluginPriority;

	/** 插件分类（仅功能插件）*/
	@Property({ nullable: true })
	category?: string;

	/** 插件作者 */
	@Property({ nullable: true, type: 'json' })
	author?: Record<string, any>;

	/** 插件图标 */
	@Property({ nullable: true })
	icon?: string;

	/** 插件截图 */
	@Property({ nullable: true, type: 'json' })
	screenshots?: string[];

	/** 是否已启用 */
	@Property({ default: false })
	enabled: boolean = false;

	/** 是否为核心插件（已弃用，使用 type 字段）*/
	@Property({ default: false })
	isCore: boolean = false;

	/** 是否为系统插件 */
	@Property({ default: false })
	isSystem: boolean = false;

	/** 安装路径 */
	@Property()
	installPath!: string;

	/** 下载 URL（仅功能插件）*/
	@Property({ nullable: true })
	downloadUrl?: string;

	/** 校验和（仅功能插件）*/
	@Property({ nullable: true })
	checksum?: string;

	/** 安装时间 */
	@Property()
	installedAt: Date = new Date();

	/** 更新时间 */
	@Property({ onUpdate: () => new Date() })
	updatedAt: Date = new Date();

	/** 最后启用时间 */
	@Property({ nullable: true })
	enabledAt?: Date;

	/** 最后禁用时间 */
	@Property({ nullable: true })
	disabledAt?: Date;

	/** 依赖的插件 */
	@ManyToMany(() => PluginDependency, (dep) => dep.dependent, { owner: true })
	dependencies: PluginDependency[] = [];

	/** 被依赖的插件 */
	@ManyToMany(() => PluginDependency, (dep) => dep.dependency, { owner: true })
	dependents: PluginDependency[] = [];

	/** 创建索引 */
	@Index({ properties: ['type', 'priority'] })
	typePriorityIndex!: string;
}
```

---

## 4. 插件加载服务更新

### 4.1 更新的 PluginLoaderService

```typescript
// libs/plugin/src/services/plugin-loader.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginStatus, PluginType, PluginPriority } from '../interfaces/plugin.interface';
import { IPluginConfig, IPluginLoadOptions, IPluginUnloadOptions } from '../interfaces/plugin-config.interface';
import { PluginRegistryService } from './plugin-registry.service';
import { getPluginMetadata } from '../decorators/plugin.decorator';
import { isCorePlugin, CorePlugin } from '../enums/core-plugin.enum';

/**
 * 插件加载服务
 *
 * 负责插件的加载、初始化和卸载
 * 区分系统插件和功能插件
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
	 * 区分系统插件和功能插件的加载方式
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

		// 加载系统插件（强制加载）
		await this.loadSystemPlugins(config.systemPlugins, plugins);

		// 加载功能插件（可选加载）
		await this.loadFeaturePlugins(config.featurePlugins, plugins);

		this.logger.log(`插件加载完成，共加载 ${plugins.length} 个插件`);
	}

	/**
	 * 加载系统插件
	 *
	 * 系统插件必须加载，不能被禁用或卸载
	 *
	 * @param systemPlugins - 系统插件配置
	 * @param plugins - 所有已注册的插件
	 * @returns Promise<void>
	 */
	private async loadSystemPlugins(systemPlugins: string[], plugins: IPlugin[]): Promise<void> {
		this.logger.log(`加载系统插件：${systemPlugins.join(', ')}`);

		// 过滤系统插件
		const systemPluginsList = plugins.filter((plugin) => plugin.type === PluginType.SYSTEM);

		// 按优先级排序
		const sortedPlugins = systemPluginsList.sort((a, b) => {
			const priorityA = a.priority ?? PluginPriority.P0;
			const priorityB = b.priority ?? PluginPriority.P0;
			return priorityA - priorityB;
		});

		for (const plugin of sortedPlugins) {
			try {
				// 强制加载系统插件
				await this.loadSystemPlugin(plugin);
				this.logger.log(`系统插件 ${plugin.name} 加载成功`);
			} catch (error) {
				this.logger.error(`系统插件 ${plugin.name} 加载失败`, error);
				this.registry.updateStatus(plugin.name, PluginStatus.FAILED);
				// 系统插件加载失败应该阻止应用启动
				throw error;
			}
		}
	}

	/**
	 * 加载系统插件
	 *
	 * 系统插件强制加载，忽略 force 选项
	 *
	 * @param plugin - 插件实例
	 * @returns Promise<void>
	 */
	private async loadSystemPlugin(plugin: IPlugin): Promise<void> {
		const currentStatus = this.registry.getStatus(plugin.name);

		if (currentStatus === PluginStatus.INITIALIZED) {
			this.logger.debug(`系统插件 ${plugin.name} 已初始化，跳过`);
			return;
		}

		// 更新状态为 LOADED
		this.registry.updateStatus(plugin.name, PluginStatus.LOADED);

		// 调用插件初始化
		if (plugin.initialize) {
			// 系统插件使用默认配置
			await plugin.initialize({});
		}

		// 更新状态为 INITIALIZED
		this.registry.updateStatus(plugin.name, PluginStatus.INITIALIZED);

		// 调用应用启动钩子
		if (plugin.onApplicationBootstrap && this.moduleRef) {
			await plugin.onApplicationBootstrap(this.moduleRef);
		}
	}

	/**
	 * 加载功能插件
	 *
	 * 功能插件可选加载，支持启用/禁用
	 *
	 * @param featurePlugins - 功能插件配置
	 * @param plugins - 所有已注册的插件
	 * @returns Promise<void>
	 */
	private async loadFeaturePlugins(
		featurePlugins: Record<string, { enabled: boolean; config?: Record<string, any> }>,
		plugins: IPlugin[]
	): Promise<void> {
		this.logger.log(`加载功能插件：${Object.keys(featurePlugins).join(', ')}`);

		// 过滤功能插件
		const featurePluginsList = plugins.filter((plugin) => plugin.type === PluginType.FEATURE);

		for (const plugin of featurePluginsList) {
			const pluginConfig = featurePlugins[plugin.name];

			// 检查插件是否启用
			if (!pluginConfig || !pluginConfig.enabled) {
				this.logger.debug(`功能插件 ${plugin.name} 未启用，跳过`);
				this.registry.updateStatus(plugin.name, PluginStatus.DISABLED);
				continue;
			}

			try {
				// 加载功能插件
				await this.loadFeaturePlugin(plugin, pluginConfig.config);
				this.logger.log(`功能插件 ${plugin.name} 加载成功`);
			} catch (error) {
				this.logger.error(`功能插件 ${plugin.name} 加载失败`, error);
				this.registry.updateStatus(plugin.name, PluginStatus.FAILED);
				// 功能插件加载失败不影响其他插件
			}
		}
	}

	/**
	 * 加载功能插件
	 *
	 * 功能插件支持配置和选项
	 *
	 * @param plugin - 插件实例
	 * @param config - 插件配置
	 * @param options - 加载选项
	 * @returns Promise<void>
	 */
	private async loadFeaturePlugin(
		plugin: IPlugin,
		config?: Record<string, any>,
		options?: IPluginLoadOptions
	): Promise<void> {
		const currentStatus = this.registry.getStatus(plugin.name);

		// 如果插件已初始化且不强制重新加载，则跳过
		if (currentStatus === PluginStatus.INITIALIZED && !options?.force) {
			this.logger.debug(`功能插件 ${plugin.name} 已初始化，跳过`);
			return;
		}

		// 更新状态为 LOADED
		this.registry.updateStatus(plugin.name, PluginStatus.LOADED);

		// 调用插件初始化
		if (plugin.initialize && config) {
			await plugin.initialize(config);
		}

		// 更新状态为 INITIALIZED
		this.registry.updateStatus(plugin.name, PluginStatus.INITIALIZED);

		// 调用应用启动钩子
		if (plugin.onApplicationBootstrap && this.moduleRef) {
			await plugin.onApplicationBootstrap(this.moduleRef);
		}
	}

	/**
	 * 卸载插件
	 *
	 * 系统插件不能被卸载
	 * 功能插件可以被卸载
	 *
	 * @param name - 插件名称
	 * @param options - 卸载选项
	 * @returns Promise<void>
	 */
	async unloadPlugin(name: string, options?: IPluginUnloadOptions): Promise<void> {
		const plugin = this.registry.get(name);

		if (!plugin) {
			throw new Error(`插件 ${name} 未注册`);
		}

		// 系统插件不能被卸载
		if (plugin.type === PluginType.SYSTEM && !options?.force) {
			throw new Error(`系统插件 ${name} 不能被卸载`);
		}

		// 检查依赖者
		const dependents = this.getDependents(name);

		if (dependents.length > 0 && !options?.force) {
			throw new Error(`插件 ${name} 被以下插件依赖：${dependents.join(', ')}`);
		}

		this.logger.log(`卸载插件 ${name}...`);

		// 调用应用关闭钩子
		if (plugin.onApplicationShutdown && this.moduleRef) {
			await plugin.onApplicationShutdown(this.moduleRef);
		}

		// 调用插件销毁
		if (plugin.destroy) {
			await plugin.destroy();
		}

		this.registry.unregister(name);
		this.logger.log(`插件 ${name} 已卸载`);
	}

	/**
	 * 获取依赖此插件的其他插件
	 *
	 * @param name - 插件名称
	 * @returns 依赖此插件的插件名称数组
	 */
	private getDependents(name: string): string[] {
		const dependents: string[] = [];

		for (const plugin of this.registry.getAll()) {
			if (plugin.dependencies?.includes(name)) {
				dependents.push(plugin.name);
			}
		}

		return dependents;
	}

	/**
	 * 模块销毁时调用
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
```

### 4.2 更新的 IPluginConfig 接口

```typescript
// libs/plugin/src/interfaces/plugin-config.interface.ts
import { PluginType } from './plugin-manifest.enum';

/**
 * 插件配置接口
 *
 * 定义插件系统的配置结构
 */
export interface IPluginConfig {
	/**
	 * 系统插件列表
	 *
	 * 系统插件必须加载，不能被禁用或卸载
	 */
	systemPlugins: string[];

	/**
	 * 功能插件配置
	 *
	 * 功能插件可选加载，支持启用/禁用
	 */
	featurePlugins: Record<
		string,
		{
			/** 是否启用此插件 */
			enabled: boolean;

			/** 插件特定配置 */
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
```

---

## 5. 插件管理服务更新

### 5.1 更新的 PluginManagerService

```typescript
// libs/plugin/src/services/plugin-manager.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PluginInfo, PluginType } from '../entities/plugin-info.entity';
import { PluginConfig } from '../entities/plugin-config.entity';
import { PluginHistory } from '../entities/plugin-history.entity';
import { IPluginManifest } from '../interfaces/plugin-manifest.interface';
import { PluginStoreService } from './plugin-store.service';
import { PluginLoaderService } from './plugin-loader.service';
import { PluginRegistryService } from './plugin-registry.service';
import { DynamicPluginService } from './dynamic-plugin.service';

/**
 * 插件管理服务
 *
 * 负责插件的安装、卸载、启用、禁用和更新
 * 区分系统插件和功能插件的操作
 */
@Injectable()
export class PluginManagerService {
	private readonly logger = new Logger(PluginManagerService.name);

	constructor(
		private readonly em: EntityManager,
		private readonly pluginStore: PluginStoreService,
		private readonly pluginLoader: PluginLoaderService,
		private readonly pluginRegistry: PluginRegistryService,
		private readonly dynamicPlugin: DynamicPluginService
	) {}

	/**
	 * 安装插件
	 *
	 * 系统插件：仅支持通过代码更新安装
	 * 功能插件：支持动态安装
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<void>
	 */
	async installPlugin(manifest: IPluginManifest): Promise<void> {
		this.logger.log(`开始安装插件：${manifest.name}`);

		// 系统插件检查
		if (manifest.type === PluginType.SYSTEM) {
			this.logger.warn(`系统插件 ${manifest.name} 不能通过动态方式安装`);
			throw new Error(`系统插件 ${manifest.name} 需要通过代码更新安装`);
		}

		// 1. 验证插件
		await this.validatePlugin(manifest);

		// 2. 检查依赖
		await this.checkDependencies(manifest);

		// 3. 下载插件
		const pluginPath = await this.pluginStore.downloadPlugin(manifest);

		// 4. 解压插件
		await this.pluginStore.extractPlugin(pluginPath, manifest.name);

		// 5. 安装依赖
		await this.installDependencies(manifest);

		// 6. 创建数据库记录
		const pluginInfo = await this.createPluginInfo(manifest);

		// 7. 加载插件模块
		await this.dynamicPlugin.loadPlugin(manifest);

		// 8. 初始化插件
		await this.initializePlugin(pluginInfo);

		// 9. 记录历史
		await this.recordHistory(pluginInfo, 'install', null, manifest.version, 'success');

		this.logger.log(`插件 ${manifest.name} 安装成功`);
	}

	/**
	 * 卸载插件
	 *
	 * 系统插件：不能卸载
	 * 功能插件：支持动态卸载
	 *
	 * @param name - 插件名称
	 * @param force - 是否强制卸载（仅用于系统插件的开发/测试）
	 * @returns Promise<void>
	 */
	async uninstallPlugin(name: string, force: boolean = false): Promise<void> {
		this.logger.log(`开始卸载插件：${name}`);

		// 1. 获取插件信息
		const pluginInfo = await this.getPluginInfo(name);
		if (!pluginInfo) {
			throw new Error(`插件 ${name} 未安装`);
		}

		// 系统插件检查
		if (pluginInfo.type === PluginType.SYSTEM && !force) {
			this.logger.error(`系统插件 ${name} 不能被卸载`);
			throw new Error(`系统插件 ${name} 需要通过代码更新卸载`);
		}

		// 2. 检查是否被其他插件依赖
		await this.checkDependents(name);

		// 3. 停用插件
		if (pluginInfo.enabled) {
			await this.disablePlugin(name);
		}

		// 4. 销毁插件实例
		await this.destroyPlugin(pluginInfo);

		// 5. 卸载插件模块
		await this.dynamicPlugin.unloadPlugin(name);

		// 6. 删除插件文件
		await this.pluginStore.deletePlugin(name);

		// 7. 删除数据库记录
		await this.deletePluginInfo(name);

		// 8. 记录历史
		await this.recordHistory(pluginInfo, 'uninstall', pluginInfo.version, null, 'success');

		this.logger.log(`插件 ${name} 卸载成功`);
	}

	/**
	 * 启用插件
	 *
	 * 系统插件：默认启用，不能禁用
	 * 功能插件：支持动态启用
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	async enablePlugin(name: string): Promise<void> {
		this.logger.log(`开始启用插件：${name}`);

		// 1. 获取插件信息
		const pluginInfo = await this.getPluginInfo(name);
		if (!pluginInfo) {
			throw new Error(`插件 ${name} 未安装`);
		}

		// 系统插件检查
		if (pluginInfo.type === PluginType.SYSTEM) {
			this.logger.warn(`系统插件 ${name} 默认启用，不能单独启用`);
			return;
		}

		if (pluginInfo.enabled) {
			this.logger.warn(`插件 ${name} 已启用`);
			return;
		}

		// 2. 检查依赖
		await this.ensureDependenciesEnabled(name);

		// 3. 加载插件模块
		await this.dynamicPlugin.loadPlugin(pluginInfo);

		// 4. 初始化插件
		await this.initializePlugin(pluginInfo);

		// 5. 更新数据库记录
		pluginInfo.enabled = true;
		pluginInfo.enabledAt = new Date();
		await this.em.persistAndFlush(pluginInfo);

		// 6. 记录历史
		await this.recordHistory(pluginInfo, 'enable', null, null, 'success');

		this.logger.log(`插件 ${name} 启用成功`);
	}

	/**
	 * 禁用插件
	 *
	 * 系统插件：不能禁用
	 * 功能插件：支持动态禁用
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	async disablePlugin(name: string): Promise<void> {
		this.logger.log(`开始禁用插件：${name}`);

		// 1. 获取插件信息
		const pluginInfo = await this.getPluginInfo(name);
		if (!pluginInfo) {
			throw new Error(`插件 ${name} 未安装`);
		}

		// 系统插件检查
		if (pluginInfo.type === PluginType.SYSTEM) {
			this.logger.error(`系统插件 ${name} 不能被禁用`);
			throw new Error(`系统插件 ${name} 需要通过代码更新禁用`);
		}

		if (!pluginInfo.enabled) {
			this.logger.warn(`插件 ${name} 已禁用`);
			return;
		}

		// 2. 检查是否被其他插件依赖
		await this.checkDependents(name);

		// 3. 销毁插件实例
		await this.destroyPlugin(pluginInfo);

		// 4. 卸载插件模块
		await this.dynamicPlugin.unloadPlugin(name);

		// 5. 更新数据库记录
		pluginInfo.enabled = false;
		pluginInfo.disabledAt = new Date();
		await this.em.persistAndFlush(pluginInfo);

		// 6. 记录历史
		await this.recordHistory(pluginInfo, 'disable', null, null, 'success');

		this.logger.log(`插件 ${name} 禁用成功`);
	}

	/**
	 * 验证插件
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<void>
	 */
	private async validatePlugin(manifest: IPluginManifest): Promise<void> {
		// 1. 验证名称格式
		if (!/^[a-z0-9-/-]+$/.test(manifest.name)) {
			throw new Error('插件名称格式不正确');
		}

		// 2. 验证版本格式
		if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
			throw new Error('插件版本格式不正确');
		}

		// 3. 验证插件类型
		if (!Object.values(PluginType).includes(manifest.type)) {
			throw new Error('插件类型不正确');
		}

		// 4. 验证主入口文件
		if (!manifest.main) {
			throw new Error('插件缺少主入口文件');
		}

		// 5. 验证系统插件权限
		if (manifest.type === PluginType.SYSTEM) {
			if (manifest.downloadUrl) {
				throw new Error('系统插件不应包含下载 URL');
			}
		}

		// 6. 验证功能插件权限
		if (manifest.type === PluginType.FEATURE) {
			if (!manifest.downloadUrl) {
				throw new Error('功能插件应包含下载 URL');
			}
		}

		// 7. 验证许可证
		if (!manifest.license) {
			throw new Error('插件缺少许可证信息');
		}
	}

	/**
	 * 检查依赖
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<void>
	 */
	private async checkDependencies(manifest: IPluginManifest): Promise<void> {
		if (!manifest.dependencies || manifest.dependencies.length === 0) {
			return;
		}

		for (const dep of manifest.dependencies) {
			// 检查依赖是否存在
			const depPluginInfo = await this.getPluginInfo(dep.name);
			if (!depPluginInfo) {
				// 系统插件依赖必须存在
				if (dep.type === PluginType.SYSTEM) {
					throw new Error(`依赖的系统插件 ${dep.name} 未安装`);
				}

				// 功能插件依赖可以不存在，稍后自动安装
				this.logger.warn(`依赖的功能插件 ${dep.name} 未安装`);
				continue;
			}

			// 检查版本满足
			if (dep.version && !this.satisfiesVersion(depPluginInfo.version, dep.version)) {
				throw new Error(`依赖插件 ${dep.name} 版本不满足要求：${dep.version}`);
			}
		}
	}

	// ... 其他辅助方法与之前相同
}
```

---

## 6. 用户界面设计更新

### 6.1 插件管理 UI - 分类显示

```
┌─────────────────────────────────────────────────────────────┐
│                      插件管理                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  系统插件 (6 个)                       功能插件 (12 个)          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────┐              │
│  │ 系统插件                                    │              │
│  │                                              │              │
│  │ [图标]  认证系统    v1.0.0  [系统插件]  │              │
│  │ [图标]  租户系统    v1.0.0  [系统插件]  │              │
│  │ [图标]  用户管理    v1.0.0  [系统插件]  │              │
│  │ [图标]  权限系统    v1.0.0  [系统插件]  │              │
│  │ [图标]  数据库扩展  v1.0.0  [系统插件]  │              │
│  │ [图标]  缓存系统    v1.0.0  [系统插件]  │              │
│  └──────────────────────────────────────────────────┘              │
│                                                             │
│  ┌──────────────────────────────────────────────────┐              │
│  │ 功能插件                                    │              │
│  │                                              │              │
│  │ [图标]  数据分析    v1.0.0  [✅ 已启用]    │              │
│  │                                    [禁用] [配置]              │
│  └──────────────────────────────────────────────────┘              │
│                                                             │
│  ┌──────────────────────────────────────────────────┐              │
│  │ 功能插件                                    │              │
│  │                                              │              │
│  │ [图标]  报表生成    v1.0.0  [⚪ 已禁用]    │              │
│  │                                    [启用] [配置]              │
│  └──────────────────────────────────────────────────┘              │
│                                                             │
│  ┌──────────────────────────────────────────────────┐              │
│  │ 功能插件                                    │              │
│  │                                              │              │
│  │ [图标]  GitHub 集成  v1.0.0  [✅ 已启用]    │              │
│  │                                    [禁用] [配置]              │
│  └──────────────────────────────────────────────────┘              │
│                                                             │
│  [安装新插件...]                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 系统插件 UI 显示

```
┌─────────────────────────────────────────────────────────────┐
│                      系统插件详情                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [图标] 认证系统                                    │
│                                                             │
│  描述：提供身份认证和权限管理                    │
│                                                             │
│  版本：v1.0.0                                        │
│  类型：系统插件 [P0 优先级]                           │
│                                                             │
│  状态：✅ 已启用                                        │
│                                                             │
│  [详细信息]  [配置]  [日志]                          │
│                                                             │
│  系统插件需要通过代码更新，无法动态安装、卸载或禁用    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 功能插件 UI 显示

```
┌─────────────────────────────────────────────────────────────┐
│                      功能插件详情                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [图标] 数据分析                                    │
│                                                             │
│  描述：提供数据分析和报表功能                      │
│                                                             │
│  版本：v1.0.0                                        │
│  类型：功能插件                                      │
│  分类：Analytics                                        │
│                                                             │
│  状态：✅ 已启用                                        │
│  安装时间：2025-01-15                                │
│  启用时间：2025-01-15                                │
│                                                             │
│  [配置] [更新] [禁用] [卸载]                    │
│                                                             │
│  依赖：                                              │
│  - 认证系统 (v1.0.0+) [✅ 已安装]                  │
│  - 租户系统 (v1.0.0+) [✅ 已安装]                  │
│                                                             │
│  版本历史：                                          │
│  - 2025-01-15: v1.0.0 (安装)                        │
│  - 2025-02-01: v1.1.0 (更新)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 配置文件示例

### 7.1 应用启动配置

```typescript
// apps/base-api/src/main.ts
import { PluginLoaderService } from '@oksai/plugin';
import { PluginType } from '@oksai/plugin';

async function bootstrap() {
	// ... 其他启动代码

	// 获取插件服务
	const loader = app.get(PluginLoaderService);

	// 加载插件（区分系统插件和功能插件）
	await loader.loadPlugins({
		// 系统插件（强制加载）
		systemPlugins: [
			'auth', // 认证系统
			'tenant', // 租户系统
			'user', // 用户管理
			'permission', // 权限系统
			'database', // 数据库扩展
			'cache' // 缓存系统
		],

		// 功能插件（可选加载）
		featurePlugins: {
			// 数据分析插件
			analytics: {
				enabled: true,
				config: {
					provider: 'google-analytics',
					trackingId: 'UA-XXXXXXXXX-1'
				}
			},

			// 报表生成插件
			reporting: {
				enabled: false
			},

			// GitHub 集成插件
			'integration-github': {
				enabled: true,
				config: {
					clientId: 'your-client-id',
					clientSecret: 'your-client-secret'
				}
			},

			// SMTP 邮件插件
			'email-smtp': {
				enabled: true,
				config: {
					host: 'smtp.example.com',
					port: 587,
					secure: false,
					auth: {
						user: 'user@example.com',
						pass: 'password'
					}
				}
			}
		},

		plugins: {
			analytics: {
				provider: 'google-analytics',
				trackingId: 'UA-XXXXXXXXX-1'
			},
			'integration-github': {
				clientId: 'your-client-id',
				clientSecret: 'your-client-secret'
			}
		},

		autoLoad: true
	});

	// ... 其他启动代码
}
```

---

## 8. 安全增强

### 8.1 系统插件保护

```typescript
/**
 * 插件注册服务更新
 *
 * 添加系统插件保护机制
 */
@Injectable()
export class PluginRegistryService implements OnModuleInit {
	// ... 其他代码

	/**
	 * 注册插件
	 *
	 * 系统插件使用特殊的注册逻辑
	 *
	 * @param plugin - 插件实例
	 * @throws Error 如果插件名称已存在或系统插件验证失败
	 */
	register(plugin: IPlugin): void {
		// 验证插件名称
		if (!plugin.name) {
			throw new Error('插件名称不能为空');
		}

		// 检查是否已注册
		if (this.plugins.has(plugin.name)) {
			throw new Error(`插件 ${plugin.name} 已注册`);
		}

		// 系统插件验证
		if (plugin.type === PluginType.SYSTEM) {
			this.validateSystemPlugin(plugin);
		}

		this.plugins.set(plugin.name, plugin);
		this.pluginStatuses.set(plugin.name, PluginStatus.UNLOADED);

		this.logger.log(`插件 ${plugin.name} 已注册`);
	}

	/**
	 * 注销插件
	 *
	 * 系统插件使用特殊的注销逻辑
	 *
	 * @param name - 插件名称
	 * @param force - 是否强制注销（仅用于系统插件的开发/测试）
	 * @throws Error 如果插件未注册或系统插件保护
	 */
	unregister(name: string, force: boolean = false): void {
		const plugin = this.plugins.get(name);
		if (!plugin) {
			throw new Error(`插件 ${name} 未注册`);
		}

		// 系统插件保护
		if (plugin.type === PluginType.SYSTEM && !force) {
			throw new Error(`系统插件 ${name} 不能被注销，请通过代码更新`);
		}

		if (plugin?.destroy) {
			plugin.destroy();
		}

		this.plugins.delete(name);
		this.pluginStatuses.delete(name);

		this.logger.log(`插件 ${name} 已注销`);
	}

	/**
	 * 验证系统插件
	 *
	 * @param plugin - 插件实例
	 * @throws Error 如果系统插件不符合要求
	 */
	private validateSystemPlugin(plugin: IPlugin): void {
		// 检查插件类型
		if (plugin.type !== PluginType.SYSTEM) {
			throw new Error('系统插件类型不正确');
		}

		// 检查插件名称是否为预定义的系统插件名称
		const validSystemPlugins = ['auth', 'tenant', 'user', 'permission', 'database', 'cache'];
		if (!validSystemPlugins.includes(plugin.name)) {
			throw new Error(`无效的系统插件名称：${plugin.name}`);
		}

		// 检查插件优先级
		if (!plugin.priority) {
			throw new Error('系统插件必须设置优先级');
		}

		this.logger.debug(`系统插件 ${plugin.name} 验证通过`);
	}
}
```

---

## 9. 实现优先级更新

### 9.1 第一阶段：基础架构（1-2 周）

-   ✅ 更新插件类型系统（PluginType、PluginPriority）
-   ✅ 更新插件清单接口（IPluginManifest）
-   ✅ 更新插件信息实体（PluginInfo）
-   ✅ 更新插件配置接口（IPluginConfig）
-   ✅ 创建系统插件和功能插件的标识机制

### 9.2 第二阶段：加载器更新（2-3 周）

-   ✅ 更新 PluginLoaderService
-   ✅ 实现系统插件强制加载
-   ✅ 实现功能插件可选加载
-   ✅ 添加系统插件保护机制
-   ✅ 实现插件优先级排序

### 9.3 第三阶段：管理器更新（2-3 周）

-   ✅ 更新 PluginManagerService
-   ✅ 实现系统插件操作限制
-   ✅ 实现功能插件动态管理
-   ✅ 添加系统插件版本控制
-   ✅ 完善依赖检查逻辑

### 9.4 第四阶段：用户界面（1-2 周）

-   ✅ 更新插件管理 UI
-   ✅ 区分系统插件和功能插件显示
-   ✅ 添加系统插件只读标识
-   ✅ 实现功能插件操作按钮
-   ✅ 添加插件类型过滤器

### 9.5 第五阶段：文档和测试（1 周）

-   ✅ 更新插件开发文档
-   ✅ 添加系统插件开发指南
-   ✅ 添加功能插件开发指南
-   ✅ 编写单元测试和集成测试

---

## 10. 总结

### 10.1 系统插件 vs 功能插件对比

| 维度          | 系统插件             | 功能插件               |
| ------------- | -------------------- | ---------------------- |
| **安装方式**  | 代码更新             | 动态安装               |
| **卸载**      | ❌ 不可卸载          | ✅ 可卸载              |
| **启用/禁用** | ❌ 不可禁用          | ✅ 可启用/禁用         |
| **版本控制**  | 代码更新             | 动态更新               |
| **依赖管理**  | 强制依赖             | 可选依赖               |
| **状态管理**  | 3 种状态             | 5 种状态               |
| **UI 显示**   | 只读，显示"系统插件" | 可操作，显示"功能插件" |
| **加载顺序**  | 按优先级排序         | 按配置顺序             |
| **失败处理**  | 阻止应用启动         | 记录错误，继续加载     |
| **用户控制**  | ❌ 用户无权控制      | ✅ 用户可自主控制      |
| **示例**      | 认证、租户、权限     | 分析、报表、集成       |

### 10.2 核心优势

1. ✅ **明确的责任边界**：

    - 系统插件：基础设施和核心功能
    - 功能插件：可选的业务功能

2. ✅ **更好的用户体验**：

    - 用户可以自由选择和配置功能插件
    - 系统插件稳定可靠，不会被误操作影响

3. ✅ **更高的系统稳定性**：

    - 系统插件受保护，不会被意外禁用或卸载
    - 功能插件独立，不会影响系统核心运行

4. ✅ **更清晰的维护路径**：

    - 系统插件随代码更新
    - 功能插件独立发布和更新

5. ✅ **更好的性能优化**：
    - 系统插件按需加载（优先级）
    - 功能插件懒加载（按需启用）

### 10.3 建议

1. **优先实现系统插件**：

    - 认证系统（auth）
    - 租户系统（tenant）
    - 用户管理（user）
    - 权限系统（permission）
    - 数据库扩展（database）
    - 缓存系统（cache）

2. **逐步添加功能插件**：

    - 分析和报表
    - 通信（邮件、短信、通知）
    - 存储（S3、MinIO）
    - 工作流（审批、自动化）
    - 第三方集成（GitHub、Jira、Slack）
    - 内容管理（知识库、博客、论坛）

3. **完善文档和示例**：
    - 系统插件开发指南
    - 功能插件开发指南
    - 最佳实践文档
    - 故障排查指南

---

**文档版本**: 2.0.0
**最后更新**: 2025-02-06
**维护者**: OKSAI Team
