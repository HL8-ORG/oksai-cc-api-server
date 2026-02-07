# OKSAI 热插拔插件系统设计方案

## 概述

本文档详细说明 OKSAI 平台如何实现插件的热插拔功能，允许用户动态安装、启用、禁用和卸载插件，无需重启应用。

---

## 1. 设计目标

### 1.1 核心目标

-   ✅ **动态安装**：用户可以动态安装新插件，无需重启应用
-   ✅ **动态卸载**：用户可以动态卸载插件，无需重启应用
-   ✅ **动态启用/禁用**：用户可以启用或禁用已安装的插件
-   ✅ **依赖管理**：自动处理插件之间的依赖关系
-   ✅ **版本管理**：支持插件的版本控制
-   ✅ **安全验证**：验证插件的合法性和安全性
-   ✅ **回滚机制**：插件加载失败时能够回滚

### 1.2 非目标

-   ❌ 不支持热更新（需要重启应用才能更新插件代码）
-   ❌ 不支持跨应用共享插件状态
-   ❌ 不支持插件间的复杂通信（通过事件总线实现）

---

## 2. 架构设计

### 2.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户界面层                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  插件商店    │  │  插件管理器  │  │  插件设置    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      插件管理 API 层                         │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │           PluginManagerService (新增）                     │    │
│  │  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │ PluginStore  │  │ PluginLoader  │             │    │
│  │  │   Service   │  │   Service    │             │    │
│  │  └──────────────┘  └──────────────┘             │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────┼───────────────────────────────────────────────────┼───────┘
          │                                         │
          ▼                                         ▼
┌─────────────────────────────────────┐  ┌─────────────────────────────────┐
│        插件存储层                 │  │         数据库存储层             │
│  ┌──────────────────────────┐     │  │  ┌──────────────────────┐     │
│  │   本地插件目录        │     │  │  │  插件信息表       │     │
│  │  /plugins/local/       │     │  │  │  plugin_info       │     │
│  │  /plugins/installed/  │     │  │  │  插件配置表       │     │
│  └──────────────────────────┘     │  │  │  plugin_config     │     │
│  ┌──────────────────────────┐     │  │  │  插件依赖表       │     │
│  │   远程插件仓库        │     │  │  │  plugin_dependency │     │
│  │  npm registry        │     │  │  │  插件历史表       │     │
│  │  private registry    │     │  │  │  plugin_history   │     │
│  └──────────────────────────┘     │  │  └──────────────────────┘     │
└─────────────────────────────────────┘  └─────────────────────────────────┘
          │                                         │
          └───────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  插件运行时层                                │
│  ┌──────────────────────────────────────────────────┐    │
│  │      DynamicPluginService (新增）                   │    │
│  │  ┌──────────────┐  ┌──────────────┐          │    │
│  │  │  DynamicRoute │  │DynamicModule │          │    │
│  │  │   Service    │  │   Service    │          │    │
│  │  └──────────────┘  └──────────────┘          │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              现有插件系统层                                │
│  ┌──────────────────────────────────────────────────┐    │
│  │     PluginRegistryService (现有）                  │    │
│  │     PluginLoaderService (现有）                    │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
oksai-api-server/
├── plugins/                        # 插件存储目录（新增）
│   ├── local/                      # 本地插件
│   │   ├── @oksai/plugin-github-oauth/
│   │   ├── @oksai/plugin-google-oauth/
│   │   └── ...
│   ├── installed/                   # 已安装的插件（软链接）
│   │   └── @oksai/plugin-analytics -> ../../libs/plugin-analytics/
│   └── temp/                      # 临时解压目录
│       └── downloads/
├── libs/
│   ├── plugin/                     # 插件系统核心
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   ├── plugin-registry.service.ts      # 现有
│   │   │   │   ├── plugin-loader.service.ts        # 现有
│   │   │   │   ├── plugin-manager.service.ts    # 新增：插件管理
│   │   │   │   ├── plugin-store.service.ts      # 新增：插件存储
│   │   │   │   ├── dynamic-plugin.service.ts   # 新增：动态插件
│   │   │   │   └── plugin-validator.service.ts # 新增：插件验证
│   │   │   ├── interfaces/
│   │   │   │   ├── plugin.interface.ts         # 现有
│   │   │   │   ├── plugin-config.interface.ts  # 现有
│   │   │   │   ├── plugin-manifest.interface.ts # 新增：插件清单
│   │   │   │   ├── plugin-package.interface.ts  # 新增：插件包
│   │   │   │   └── plugin-install.interface.ts # 新增：插件安装
│   │   │   ├── entities/
│   │   │   │   ├── plugin-info.entity.ts       # 新增：插件信息
│   │   │   │   ├── plugin-config.entity.ts    # 新增：插件配置
│   │   │   │   ├── plugin-dependency.entity.ts # 新增：插件依赖
│   │   │   │   └── plugin-history.entity.ts    # 新增：插件历史
│   │   │   ├── controllers/
│   │   │   │   ├── plugin-manager.controller.ts # 新增：插件管理 API
│   │   │   │   ├── plugin-store.controller.ts   # 新增：插件商店 API
│   │   │   │   └── plugin-config.controller.ts # 新增：插件配置 API
│   │   │   └── dto/
│   │   │       ├── install-plugin.dto.ts      # 新增：安装插件 DTO
│   │   │       ├── uninstall-plugin.dto.ts    # 新增：卸载插件 DTO
│   │   │       ├── enable-plugin.dto.ts      # 新增：启用插件 DTO
│   │   │       └── disable-plugin.dto.ts     # 新增：禁用插件 DTO
│   ├── auth/                        # 认证插件（现有）
│   ├── tenant/                      # 租户插件（现有）
│   ├── user/                        # 用户插件（现有）
│   └── ...                          # 其他插件（现有）
└── apps/
    └── base-api/
        └── src/
            ├── main.ts
            └── app.module.ts
```

---

## 3. 核心组件设计

### 3.1 PluginManifest（插件清单）

每个插件必须包含一个 `plugin-manifest.json` 或 `package.json` 文件，定义插件的元数据。

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

	/** 最小兼容版本 */
	minVersion?: string;

	/** 最大兼容版本 */
	maxVersion?: string;

	/** 插件作者 */
	author: {
		name: string;
		email?: string;
		url?: string;
	};

	/** 插件类型 */
	type: 'core' | 'optional' | 'integration' | 'utility';

	/** 插件分类 */
	category: string;

	/** 插件依赖 */
	dependencies?: Array<{
		name: string;
		version?: string;
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

	/** 许可证 */
	license: {
		type: string;
		url?: string;
	};

	/** 主页 */
	homepage?: string;

	/** 文档 */
	documentation?: string;

	/** 问题反馈 */
	issues?: string;

	/** 创建时间 */
	createdAt?: string;

	/** 更新时间 */
	updatedAt?: string;
}
```

**示例**：`@oksai/plugin-analytics/package.json`

```json
{
	"name": "@oksai/plugin-analytics",
	"version": "1.0.0",
	"displayName": "分析插件",
	"description": "提供数据分析和报表功能",
	"author": {
		"name": "OKSAI Team",
		"email": "team@oksai.io",
		"url": "https://oksai.io"
	},
	"type": "optional",
	"category": "Analytics",
	"dependencies": [
		{
			"name": "auth",
			"version": ">=1.0.0"
		}
	],
	"main": "./dist/index.js",
	"module": "./dist/index.js",
	"types": "./dist/index.d.ts",
	"entities": ["./dist/entities/*.entity.js"],
	"subscribers": ["./dist/subscribers/*.subscriber.js"],
	"permissions": ["read:analytics", "write:analytics"],
	"license": {
		"type": "MIT",
		"url": "https://opensource.org/licenses/MIT"
	},
	"homepage": "https://oksai.io/plugins/analytics",
	"documentation": "https://docs.oksai.io/plugins/analytics",
	"issues": "https://github.com/oksai/analytics/issues",
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
	}
}
```

### 3.2 PluginInfo Entity（插件信息实体）

```typescript
// libs/plugin/src/entities/plugin-info.entity.ts
import { Entity, PrimaryKey, Property, ManyToMany, JoinTable } from '@mikro-orm/core';

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
	@Property()
	description?: string;

	/** 当前版本 */
	@Property()
	version!: string;

	/** 安装路径 */
	@Property()
	installPath!: string;

	/** 插件类型 */
	@Property({ nullable: true })
	type?: string;

	/** 插件分类 */
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

	/** 是否为核心插件 */
	@Property({ default: false })
	isCore: boolean = false;

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
}
```

### 3.3 PluginConfig Entity（插件配置实体）

```typescript
// libs/plugin/src/entities/plugin-config.entity.ts
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { PluginInfo } from './plugin-info.entity';

/**
 * 插件配置实体
 *
 * 存储插件的运行时配置
 */
@Entity()
export class PluginConfig {
	@PrimaryKey()
	id: string = crypto.randomUUID();

	/** 配置键 */
	@Property()
	key!: string;

	/** 配置值 */
	@Property({ type: 'json' })
	value!: any;

	/** 配置值类型 */
	@Property()
	valueType: string = 'string';

	/** 配置描述 */
	@Property({ nullable: true })
	description?: string;

	/** 是否为敏感信息 */
	@Property({ default: false })
	isSensitive: boolean = false;

	/** 配置时间 */
	@Property()
	createdAt: Date = new Date();

	/** 更新时间 */
	@Property({ onUpdate: () => new Date() })
	updatedAt: Date = new Date();

	/** 所属插件 */
	@ManyToOne(() => PluginInfo)
	plugin!: PluginInfo;
}
```

### 3.4 PluginDependency Entity（插件依赖实体）

```typescript
// libs/plugin/src/entities/plugin-dependency.entity.ts
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { PluginInfo } from './plugin-info.entity';

/**
 * 插件依赖实体
 *
 * 存储插件之间的依赖关系
 */
@Entity()
export class PluginDependency {
	@PrimaryKey()
	id: string = crypto.randomUUID();

	/** 依赖的插件 */
	@ManyToOne(() => PluginInfo, { onDelete: 'cascade' })
	dependency!: PluginInfo;

	/** 依赖版本 */
	@Property()
	version?: string;

	/** 依赖的插件 */
	@ManyToOne(() => PluginInfo, { onDelete: 'cascade' })
	dependent!: PluginInfo;
}
```

### 3.5 PluginHistory Entity（插件历史实体）

```typescript
// libs/plugin/src/entities/plugin-history.entity.ts
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { PluginInfo } from './plugin-info.entity';

/**
 * 插件历史实体
 *
 * 记录插件的安装、更新、卸载历史
 */
@Entity()
export class PluginHistory {
	@PrimaryKey()
	id: string = crypto.randomUUID();

	/** 操作类型 */
	@Property()
	action!: 'install' | 'update' | 'uninstall' | 'enable' | 'disable';

	/** 操作前的版本 */
	@Property({ nullable: true })
	fromVersion?: string;

	/** 操作后的版本 */
	@Property({ nullable: true })
	toVersion?: string;

	/** 操作状态 */
	@Property()
	status!: 'success' | 'failed';

	/** 错误信息 */
	@Property({ nullable: true, type: 'text' })
	error?: string;

	/** 操作时间 */
	@Property()
	createdAt: Date = new Date();

	/** 所属插件 */
	@ManyToOne(() => PluginInfo)
	plugin!: PluginInfo;
}
```

---

## 4. 核心服务设计

### 4.1 PluginManagerService（插件管理服务）

```typescript
// libs/plugin/src/services/plugin-manager.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PluginInfo } from '../entities/plugin-info.entity';
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
	 * @param manifest - 插件清单
	 * @returns Promise<void>
	 */
	async installPlugin(manifest: IPluginManifest): Promise<void> {
		this.logger.log(`开始安装插件：${manifest.name}`);

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
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	async uninstallPlugin(name: string): Promise<void> {
		this.logger.log(`开始卸载插件：${name}`);

		// 1. 获取插件信息
		const pluginInfo = await this.getPluginInfo(name);
		if (!pluginInfo) {
			throw new Error(`插件 ${name} 未安装`);
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
	 * 更新插件
	 *
	 * @param name - 插件名称
	 * @param manifest - 新的插件清单
	 * @returns Promise<void>
	 */
	async updatePlugin(name: string, manifest: IPluginManifest): Promise<void> {
		this.logger.log(`开始更新插件：${name}`);

		// 1. 获取当前插件信息
		const pluginInfo = await this.getPluginInfo(name);
		if (!pluginInfo) {
			throw new Error(`插件 ${name} 未安装`);
		}

		// 2. 禁用插件
		const wasEnabled = pluginInfo.enabled;
		if (wasEnabled) {
			await this.disablePlugin(name);
		}

		// 3. 卸载插件
		await this.pluginStore.deletePlugin(name);

		// 4. 安装新版本
		await this.installPlugin(manifest);

		// 5. 如果之前已启用，则重新启用
		if (wasEnabled) {
			await this.enablePlugin(name);
		}

		// 6. 记录历史
		await this.recordHistory(pluginInfo, 'update', pluginInfo.version, manifest.version, 'success');

		this.logger.log(`插件 ${name} 更新成功`);
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

		// 3. 验证主入口文件
		if (!manifest.main) {
			throw new Error('插件缺少主入口文件');
		}

		// 4. 验证许可证
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
			const pluginInfo = await this.getPluginInfo(dep.name);
			if (!pluginInfo) {
				throw new Error(`依赖插件 ${dep.name} 未安装`);
			}

			if (dep.version && !this.satisfiesVersion(pluginInfo.version, dep.version)) {
				throw new Error(`依赖插件 ${dep.name} 版本不满足要求：${dep.version}`);
			}
		}
	}

	/**
	 * 确保依赖已启用
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	private async ensureDependenciesEnabled(name: string): Promise<void> {
		const pluginInfo = await this.getPluginInfo(name);
		if (!pluginInfo.dependencies || pluginInfo.dependencies.length === 0) {
			return;
		}

		for (const dep of pluginInfo.dependencies) {
			const depPluginInfo = await this.getPluginInfo(dep.dependency.name);
			if (!depPluginInfo.enabled) {
				this.logger.warn(`依赖插件 ${dep.dependency.name} 未启用，自动启用`);
				await this.enablePlugin(dep.dependency.name);
			}
		}
	}

	/**
	 * 检查依赖者
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	private async checkDependents(name: string): Promise<void> {
		const pluginInfo = await this.getPluginInfo(name);
		if (!pluginInfo.dependents || pluginInfo.dependents.length === 0) {
			return;
		}

		const dependentNames = pluginInfo.dependents.map((d) => d.dependent.name);
		throw new Error(`插件 ${name} 被以下插件依赖：${dependentNames.join(', ')}`);
	}

	/**
	 * 安装依赖
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<void>
	 */
	private async installDependencies(manifest: IPluginManifest): Promise<void> {
		if (!manifest.dependencies || manifest.dependencies.length === 0) {
			return;
		}

		for (const dep of manifest.dependencies) {
			const pluginInfo = await this.getPluginInfo(dep.name);
			if (!pluginInfo) {
				this.logger.warn(`依赖插件 ${dep.name} 未安装，跳过自动安装`);
				continue;
			}
		}
	}

	/**
	 * 创建插件信息记录
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<PluginInfo>
	 */
	private async createPluginInfo(manifest: IPluginManifest): Promise<PluginInfo> {
		const pluginInfo = new PluginInfo();
		pluginInfo.name = manifest.name;
		pluginInfo.displayName = manifest.displayName;
		pluginInfo.description = manifest.description;
		pluginInfo.version = manifest.version;
		pluginInfo.installPath = `/plugins/installed/${manifest.name}`;
		pluginInfo.type = manifest.type;
		pluginInfo.category = manifest.category;
		pluginInfo.author = manifest.author;
		pluginInfo.icon = manifest.icon;
		pluginInfo.screenshots = manifest.screenshots;
		pluginInfo.enabled = false;
		pluginInfo.isCore = manifest.type === 'core';

		await this.em.persistAndFlush(pluginInfo);
		return pluginInfo;
	}

	/**
	 * 初始化插件
	 *
	 * @param pluginInfo - 插件信息
	 * @returns Promise<void>
	 */
	private async initializePlugin(pluginInfo: PluginInfo): Promise<void> {
		const plugin = this.pluginRegistry.get(pluginInfo.name);
		if (!plugin) {
			throw new Error(`插件 ${pluginInfo.name} 未注册`);
		}

		const config = await this.getPluginConfig(pluginInfo.name);
		await plugin.initialize(config);

		this.pluginRegistry.updateStatus(pluginInfo.name, PluginStatus.INITIALIZED);
	}

	/**
	 * 销毁插件
	 *
	 * @param pluginInfo - 插件信息
	 * @returns Promise<void>
	 */
	private async destroyPlugin(pluginInfo: PluginInfo): Promise<void> {
		const plugin = this.pluginRegistry.get(pluginInfo.name);
		if (!plugin) {
			return;
		}

		if (plugin.destroy) {
			await plugin.destroy();
		}

		this.pluginRegistry.updateStatus(pluginInfo.name, PluginStatus.UNLOADED);
	}

	/**
	 * 记录历史
	 *
	 * @param pluginInfo - 插件信息
	 * @param action - 操作类型
	 * @param fromVersion - 操作前版本
	 * @param toVersion - 操作后版本
	 * @param status - 操作状态
	 * @returns Promise<void>
	 */
	private async recordHistory(
		pluginInfo: PluginInfo,
		action: 'install' | 'update' | 'uninstall' | 'enable' | 'disable',
		fromVersion: string | null,
		toVersion: string | null,
		status: 'success' | 'failed'
	): Promise<void> {
		const history = new PluginHistory();
		history.plugin = pluginInfo;
		history.action = action;
		history.fromVersion = fromVersion;
		history.toVersion = toVersion;
		history.status = status;

		await this.em.persistAndFlush(history);
	}

	/**
	 * 版本满足检查
	 *
	 * @param currentVersion - 当前版本
	 * @param requiredVersion - 需要的版本
	 * @returns 是否满足
	 */
	private satisfiesVersion(currentVersion: string, requiredVersion: string): boolean {
		// 简化的版本比较逻辑
		const current = currentVersion.split('.').map(Number);
		const required = requiredVersion.split('.').map(Number);

		for (let i = 0; i < Math.max(current.length, required.length); i++) {
			const c = current[i] || 0;
			const r = required[i] || 0;
			if (c < r) return false;
		}

		return true;
	}

	/**
	 * 获取插件信息
	 *
	 * @param name - 插件名称
	 * @returns Promise<PluginInfo | null>
	 */
	async getPluginInfo(name: string): Promise<PluginInfo | null> {
		return await this.em.findOne(PluginInfo, { name });
	}

	/**
	 * 获取插件配置
	 *
	 * @param name - 插件名称
	 * @returns Promise<Record<string, any>>
	 */
	async getPluginConfig(name: string): Promise<Record<string, any>> {
		const configs = await this.em.find(PluginConfig, {
			plugin: { name }
		});

		const result: Record<string, any> = {};
		for (const config of configs) {
			result[config.key] = config.value;
		}

		return result;
	}

	/**
	 * 删除插件信息
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	private async deletePluginInfo(name: string): Promise<void> {
		const pluginInfo = await this.getPluginInfo(name);
		if (!pluginInfo) {
			return;
		}

		await this.em.removeAndFlush(pluginInfo);
	}
}
```

### 4.2 PluginStoreService（插件存储服务）

```typescript
// libs/plugin/src/services/plugin-store.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as tar from 'tar';
import * as crypto from 'crypto';
import { fetch } from 'undici';
import { IPluginManifest } from '../interfaces/plugin-manifest.interface';

/**
 * 插件存储服务
 *
 * 负责插件的下载、解压、删除和扫描
 */
@Injectable()
export class PluginStoreService {
	private readonly logger = new Logger(PluginStoreService.name);
	private readonly pluginsDir = path.join(process.cwd(), 'plugins');
	private readonly installedDir = path.join(this.pluginsDir, 'installed');
	private readonly tempDir = path.join(this.pluginsDir, 'temp');

	constructor() {
		this.ensureDirectories();
	}

	/**
	 * 确保目录存在
	 */
	private ensureDirectories(): void {
		const dirs = [this.pluginsDir, this.installedDir, this.tempDir];
		for (const dir of dirs) {
			fs.mkdir(dir, { recursive: true }).catch(() => {});
		}
	}

	/**
	 * 下载插件
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<string> - 下载的插件路径
	 */
	async downloadPlugin(manifest: IPluginManifest): Promise<string> {
		this.logger.log(`下载插件：${manifest.name} v${manifest.version}`);

		const downloadUrl =
			manifest.downloadUrl || `https://registry.oksai.io/plugins/${manifest.name}/v${manifest.version}.tar.gz`;
		const fileName = `${manifest.name}-${manifest.version}.tar.gz`;
		const filePath = path.join(this.tempDir, fileName);

		// 下载插件包
		const response = await fetch(downloadUrl);
		if (!response.ok) {
			throw new Error(`下载插件失败：${response.statusText}`);
		}

		// 验证文件哈希
		const buffer = Buffer.from(await response.arrayBuffer());
		const hash = crypto.createHash('sha256').update(buffer).digest('hex');

		if (manifest.checksum && hash !== manifest.checksum) {
			throw new Error('插件包校验失败');
		}

		// 保存到临时目录
		await fs.writeFile(filePath, buffer);

		this.logger.log(`插件下载完成：${filePath}`);
		return filePath;
	}

	/**
	 * 解压插件
	 *
	 * @param filePath - 插件包路径
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	async extractPlugin(filePath: string, name: string): Promise<void> {
		this.logger.log(`解压插件：${name}`);

		const targetDir = path.join(this.installedDir, name);

		// 解压 tar.gz 文件
		await tar.extract({
			file: filePath,
			cwd: this.tempDir,
			strip: 1
		});

		// 移动到安装目录
		const extractedDir = path.join(this.tempDir, 'package');
		await fs.rename(extractedDir, targetDir);

		this.logger.log(`插件解压完成：${targetDir}`);
	}

	/**
	 * 删除插件
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	async deletePlugin(name: string): Promise<void> {
		this.logger.log(`删除插件：${name}`);

		const pluginPath = path.join(this.installedDir, name);

		// 删除插件目录
		await fs.rm(pluginPath, { recursive: true, force: true });

		this.logger.log(`插件删除完成：${name}`);
	}

	/**
	 * 扫描插件目录
	 *
	 * @returns Promise<IPluginManifest[]>
	 */
	async scanPlugins(): Promise<IPluginManifest[]> {
		this.logger.log('扫描插件目录...');

		const manifests: IPluginManifest[] = [];

		// 扫描已安装的插件
		const installedPlugins = await fs.readdir(this.installedDir);
		for (const pluginName of installedPlugins) {
			try {
				const manifestPath = path.join(this.installedDir, pluginName, 'package.json');
				const manifestContent = await fs.readFile(manifestPath, 'utf-8');
				const manifest = JSON.parse(manifestContent);
				manifests.push(manifest);
			} catch (error) {
				this.logger.warn(`读取插件 ${pluginName} 清单失败`, error);
			}
		}

		this.logger.log(`扫描完成，发现 ${manifests.length} 个插件`);
		return manifests;
	}

	/**
	 * 获取插件路径
	 *
	 * @param name - 插件名称
	 * @returns 插件路径
	 */
	getPluginPath(name: string): string {
		return path.join(this.installedDir, name);
	}
}
```

### 4.3 DynamicPluginService（动态插件服务）

```typescript
// libs/plugin/src/services/dynamic-plugin.service.ts
import { Injectable, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { INestApplication, DynamicModule, ModuleMetadata } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { IPlugin } from '../interfaces/plugin.interface';
import { PluginRegistryService } from './plugin-registry.service';
import { IPluginManifest } from '../interfaces/plugin-manifest.interface';

/**
 * 动态插件服务
 *
 * 负责插件的动态加载、卸载和模块注册
 */
@Injectable()
export class DynamicPluginService implements OnModuleDestroy {
	private readonly logger = new Logger(DynamicPluginService.name);
	private readonly loadedModules = new Map<string, Module>();

	constructor(
		private readonly app: INestApplication,
		private readonly pluginRegistry: PluginRegistryService,
		private readonly orm: MikroORM
	) {}

	/**
	 * 动态加载插件
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<void>
	 */
	async loadPlugin(manifest: IPluginManifest): Promise<void> {
		this.logger.log(`动态加载插件：${manifest.name}`);

		try {
			// 1. 加载插件模块
			const pluginModule = await this.loadPluginModule(manifest);

			// 2. 注册动态模块
			await this.registerDynamicModule(manifest.name, pluginModule);

			// 3. 注册实体
			if (manifest.entities) {
				await this.registerEntities(manifest.entities);
			}

			// 4. 注册订阅者
			if (manifest.subscribers) {
				await this.registerSubscribers(manifest.subscribers);
			}

			this.logger.log(`插件 ${manifest.name} 动态加载成功`);
		} catch (error) {
			this.logger.error(`插件 ${manifest.name} 动态加载失败`, error);
			throw error;
		}
	}

	/**
	 * 动态卸载插件
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	async unloadPlugin(name: string): Promise<void> {
		this.logger.log(`动态卸载插件：${name}`);

		try {
			// 1. 销毁插件实例
			const plugin = this.pluginRegistry.get(name);
			if (plugin?.destroy) {
				await plugin.destroy();
			}

			// 2. 注销插件
			this.pluginRegistry.unregister(name);

			// 3. 卸载动态模块
			await this.unregisterDynamicModule(name);

			this.logger.log(`插件 ${name} 动态卸载成功`);
		} catch (error) {
			this.logger.error(`插件 ${name} 动态卸载失败`, error);
			throw error;
		}
	}

	/**
	 * 加载插件模块
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<ModuleMetadata>
	 */
	private async loadPluginModule(manifest: IPluginManifest): Promise<ModuleMetadata> {
		const pluginPath = `/plugins/installed/${manifest.name}`;
		const modulePath = path.join(pluginPath, manifest.module);

		// 动态导入插件模块
		const pluginModule = await import(modulePath);

		if (!pluginModule || !pluginModule[Object.keys(pluginModule)[0]]) {
			throw new Error(`插件模块无效：${modulePath}`);
		}

		// 获取模块元数据
		const moduleClass = Object.values(pluginModule)[0];
		const moduleMetadata = Reflect.getMetadata('MODULE_META', moduleClass) || {};

		return moduleMetadata;
	}

	/**
	 * 注册动态模块
	 *
	 * @param name - 插件名称
	 * @param moduleMetadata - 模块元数据
	 * @returns Promise<void>
	 */
	private async registerDynamicModule(name: string, moduleMetadata: ModuleMetadata): Promise<void> {
		// 创建动态模块
		const dynamicModule = await DynamicModule.register({
			module: moduleMetadata.module,
			providers: moduleMetadata.providers,
			controllers: moduleMetadata.controllers,
			exports: moduleMetadata.exports
		});

		// 添加到已加载模块列表
		this.loadedModules.set(name, dynamicModule);

		this.logger.debug(`动态模块 ${name} 已注册`);
	}

	/**
	 * 注销动态模块
	 *
	 * @param name - 插件名称
	 * @returns Promise<void>
	 */
	private async unregisterDynamicModule(name: string): Promise<void> {
		const module = this.loadedModules.get(name);
		if (!module) {
			return;
		}

		// 从已加载模块列表中移除
		this.loadedModules.delete(name);

		this.logger.debug(`动态模块 ${name} 已注销`);
	}

	/**
	 * 注册实体
	 *
	 * @param entities - 实体路径数组
	 * @returns Promise<void>
	 */
	private async registerEntities(entities: string[]): Promise<void> {
		const em = this.orm.em;

		for (const entityPath of entities) {
			try {
				const entityModule = await import(entityPath);
				const entityClass = Object.values(entityModule)[0];
				em.getMetadata().set(entityClass.name, em.getMetadata().get(entityClass));
				this.logger.debug(`实体 ${entityPath} 已注册`);
			} catch (error) {
				this.logger.warn(`注册实体 ${entityPath} 失败`, error);
			}
		}
	}

	/**
	 * 注册订阅者
	 *
	 * @param subscribers - 订阅者路径数组
	 * @returns Promise<void>
	 */
	private async registerSubscribers(subscribers: string[]): Promise<void> {
		const em = this.orm.em;

		for (const subscriberPath of subscribers) {
			try {
				const subscriberModule = await import(subscriberPath);
				const subscriberClass = Object.values(subscriberModule)[0];
				em.getSubscriber().add(subscriberClass);
				this.logger.debug(`订阅者 ${subscriberPath} 已注册`);
			} catch (error) {
				this.logger.warn(`注册订阅者 ${subscriberPath} 失败`, error);
			}
		}
	}

	/**
	 * 模块销毁时调用
	 */
	async onModuleDestroy(): Promise<void> {
		this.logger.log('卸载所有动态插件');

		for (const name of this.loadedModules.keys()) {
			await this.unloadPlugin(name);
		}
	}
}
```

### 4.4 PluginManagerController（插件管理控制器）

```typescript
// libs/plugin/src/controllers/plugin-manager.controller.ts
import { Controller, Post, Delete, Get, Put, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PluginManagerService } from '../services/plugin-manager.service';
import { PluginStoreService } from '../services/plugin-store.service';
import { IPluginManifest } from '../interfaces/plugin-manifest.interface';
import { InstallPluginDto, UninstallPluginDto, EnablePluginDto, DisablePluginDto } from '../dto';

/**
 * 插件管理控制器
 *
 * 提供插件安装、卸载、启用、禁用的 API 接口
 */
@Controller('plugins')
@ApiTags('插件管理')
export class PluginManagerController {
	constructor(
		private readonly pluginManager: PluginManagerService,
		private readonly pluginStore: PluginStoreService
	) {}

	/**
	 * 安装插件
	 *
	 * @param dto - 安装插件 DTO
	 * @returns Promise<{ success: boolean; message: string }>
	 */
	@Post('install')
	@ApiOperation({ summary: '安装插件' })
	@ApiResponse({ status: 201, description: '插件安装成功' })
	@ApiResponse({ status: 400, description: '请求参数错误' })
	@ApiResponse({ status: 409, description: '插件已存在' })
	@HttpCode(HttpStatus.CREATED)
	async installPlugin(@Body() dto: InstallPluginDto): Promise<{ success: boolean; message: string }> {
		await this.pluginManager.installPlugin(dto.manifest);
		return {
			success: true,
			message: `插件 ${dto.manifest.name} 安装成功`
		};
	}

	/**
	 * 卸载插件
	 *
	 * @param name - 插件名称
	 * @returns Promise<{ success: boolean; message: string }>
	 */
	@Delete(':name')
	@ApiOperation({ summary: '卸载插件' })
	@ApiResponse({ status: 200, description: '插件卸载成功' })
	@ApiResponse({ status: 404, description: '插件不存在' })
	@ApiResponse({ status: 409, description: '插件被依赖' })
	async uninstallPlugin(@Param('name') name: string): Promise<{ success: boolean; message: string }> {
		await this.pluginManager.uninstallPlugin(name);
		return {
			success: true,
			message: `插件 ${name} 卸载成功`
		};
	}

	/**
	 * 启用插件
	 *
	 * @param dto - 启用插件 DTO
	 * @returns Promise<{ success: boolean; message: string }>
	 */
	@Put(':name/enable')
	@ApiOperation({ summary: '启用插件' })
	@ApiResponse({ status: 200, description: '插件启用成功' })
	@ApiResponse({ status: 404, description: '插件不存在' })
	async enablePlugin(@Param('name') name: string): Promise<{ success: boolean; message: string }> {
		await this.pluginManager.enablePlugin(name);
		return {
			success: true,
			message: `插件 ${name} 启用成功`
		};
	}

	/**
	 * 禁用插件
	 *
	 * @param name - 插件名称
	 * @returns Promise<{ success: boolean; message: string }>
	 */
	@Put(':name/disable')
	@ApiOperation({ summary: '禁用插件' })
	@ApiResponse({ status: 200, description: '插件禁用成功' })
	@ApiResponse({ status: 404, description: '插件不存在' })
	@ApiResponse({ status: 409, description: '插件被依赖' })
	async disablePlugin(@Param('name') name: string): Promise<{ success: boolean; message: string }> {
		await this.pluginManager.disablePlugin(name);
		return {
			success: true,
			message: `插件 ${name} 禁用成功`
		};
	}

	/**
	 * 获取已安装插件列表
	 *
	 * @returns Promise<PluginInfo[]>
	 */
	@Get('installed')
	@ApiOperation({ summary: '获取已安装插件列表' })
	@ApiResponse({ status: 200, description: '成功获取插件列表' })
	async getInstalledPlugins(): Promise<any[]> {
		return await this.pluginStore.scanPlugins();
	}

	/**
	 * 从远程仓库安装插件
	 *
	 * @param name - 插件名称
	 * @returns Promise<{ success: boolean; message: string }>
	 */
	@Post('install/:name')
	@ApiOperation({ summary: '从远程仓库安装插件' })
	@ApiResponse({ status: 201, description: '插件安装成功' })
	@ApiResponse({ status: 404, description: '插件不存在' })
	async installFromRegistry(@Param('name') name: string): Promise<{ success: boolean; message: string }> {
		// 从远程仓库获取插件清单
		const manifest = await this.fetchPluginManifest(name);
		await this.pluginManager.installPlugin(manifest);
		return {
			success: true,
			message: `插件 ${name} 安装成功`
		};
	}

	/**
	 * 获取插件清单
	 *
	 * @param name - 插件名称
	 * @returns Promise<IPluginManifest>
	 */
	private async fetchPluginManifest(name: string): Promise<IPluginManifest> {
		// 从远程仓库获取插件清单
		const registryUrl = `https://registry.oksai.io/plugins/${name}/package.json`;
		const response = await fetch(registryUrl);

		if (!response.ok) {
			throw new Error(`插件 ${name} 在仓库中不存在`);
		}

		return await response.json();
	}
}
```

---

## 5. 用户界面设计

### 5.1 插件商店 UI

```
┌─────────────────────────────────────────────────────────────┐
│                      OKSAI 插件商店                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  搜索：[插件名称搜索框...]           分类：[▼分类选择器]  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 分析插件      │  │ 报表插件      │  │ 集成插件      │  │
│  │              │  │              │  │              │  │
│  │ [图标]       │  │ [图标]       │  │ [图标]       │  │
│  │              │  │              │  │              │  │
│  │ 分析插件      │  │ 报表插件      │  │ 集成插件      │  │
│  │              │  │              │  │              │  │
│  │ 提供数据分   │  │ 生成报表      │  │ 第三方平台集成  │  │
│  │ 析和可视化    │  │ 和数据可视化  │  │              │  │
│  │              │  │              │  │              │  │
│  │ 版本：1.0.0  │  │ 版本：1.0.0  │  │ 版本：1.0.0  │  │
│  │ 下载：1.2K    │  │ 下载：2.3K    │  │ 下载：3.4K    │  │
│  │ ⭐⭐⭐⭐⭐   │  │ ⭐⭐⭐      │  │ ⭐⭐⭐⭐⭐⭐  │  │
│  │              │  │              │  │              │  │
│  │ [安装按钮]    │  │ [安装按钮]    │  │ [安装按钮]    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 邮件插件      │  │ 通知插件      │  │ 缓存插件      │  │
│  │              │  │              │  │              │  │
│  │ [图标]       │  │ [图标]       │  │ [图标]       │  │
│  │              │  │              │  │              │  │
│  │ 邮件插件      │  │ 通知插件      │  │ 缓存插件      │  │
│  │              │  │              │  │              │  │
│  │ SMTP 集成    │  │ 多渠道通知    │  │ Redis 集成    │  │
│  │              │  │              │  │              │  │
│  │ 版本：1.0.0  │  │ 版本：1.0.0  │  │ 版本：1.0.0  │  │
│  │ 下载：0.8K    │  │ 下载：0.9K    │  │ 下载：1.0K    │  │
│  │ ⭐⭐⭐      │  │ ⭐⭐⭐⭐⭐   │  │ ⭐⭐⭐⭐⭐   │  │
│  │              │  │              │  │              │  │
│  │ [安装按钮]    │  │ [安装按钮]    │  │ [安装按钮]    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 插件管理 UI

```
┌─────────────────────────────────────────────────────────────┐
│                      插件管理                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  已安装的插件：                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 分析插件                                    │    │
│  │                                              │    │
│  │ [图标]  分析插件    v1.0.0                 │    │
│  │                                              │    │
│  │ 状态：✅ 已启用                             │    │
│  │ 安装时间：2025-01-15                      │    │
│  │                                              │    │
│  │ [配置] [更新] [卸载]                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 报表插件                                    │    │
│  │                                              │    │
│  │ [图标]  报表插件    v1.0.0                 │    │
│  │                                              │    │
│  │ 状态：⚪ 已禁用                            │    │
│  │ 安装时间：2025-01-20                      │    │
│  │                                              │    │
│  │ [启用] [更新] [卸载]                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 邮件插件                                    │    │
│  │                                              │    │
│  │ [图标]  邮件插件    v0.9.0                 │    │
│  │                                              │    │
│  │ 状态：⚠️  有更新（v1.0.0）                   │    │
│  │ 安装时间：2025-01-10                      │    │
│  │                                              │    │
│  │ [启用] [更新] [卸载]                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                             │
│  [刷新]                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 使用示例

### 6.1 用户安装插件

#### 步骤 1：用户在插件商店浏览插件

```bash
# 访问插件商店 UI
http://localhost:3000/api/plugins/store
```

#### 步骤 2：用户点击"安装"按钮

```typescript
// 前端调用安装 API
POST /api/plugins/install
Content-Type: application/json

{
	"manifest": {
		"name": "analytics",
		"displayName": "分析插件",
		"description": "提供数据分析和报表功能",
		"version": "1.0.0",
		"author": {
			"name": "OKSAI Team"
		},
		"type": "optional",
		"category": "Analytics",
		"dependencies": [
			{
				"name": "auth"
			}
		]
	}
}
```

#### 步骤 3：系统自动安装插件

```
[PluginManagerService] 开始安装插件：analytics
[PluginStoreService] 下载插件：analytics v1.0.0
[PluginStoreService] 插件下载完成：/plugins/temp/analytics-1.0.0.tar.gz
[PluginStoreService] 解压插件：analytics
[PluginStoreService] 插件解压完成：/plugins/installed/analytics
[DynamicPluginService] 动态加载插件：analytics
[DynamicPluginService] 插件 analytics 动态加载成功
[PluginManagerService] 插件 analytics 安装成功
```

### 6.2 用户启用插件

#### 步骤 1：用户在插件管理界面点击"启用"按钮

```bash
# 前端调用启用 API
PUT /api/plugins/analytics/enable
```

#### 步骤 2：系统自动启用插件

```
[PluginManagerService] 开始启用插件：analytics
[PluginManagerService] 依赖插件 auth 已启用
[DynamicPluginService] 动态加载插件：analytics
[DynamicPluginService] 插件 analytics 动态加载成功
[PluginManagerService] 插件 analytics 启用成功
```

### 6.3 用户禁用插件

#### 步骤 1：用户在插件管理界面点击"禁用"按钮

```bash
# 前端调用禁用 API
PUT /api/plugins/analytics/disable
```

#### 步骤 2：系统自动禁用插件

```
[PluginManagerService] 开始禁用插件：analytics
[DynamicPluginService] 动态卸载插件：analytics
[DynamicPluginService] 插件 analytics 动态卸载成功
[PluginManagerService] 插件 analytics 禁用成功
```

### 6.4 用户卸载插件

#### 步骤 1：用户在插件管理界面点击"卸载"按钮

```bash
# 前端调用卸载 API
DELETE /api/plugins/analytics
```

#### 步骤 2：系统自动卸载插件

```
[PluginManagerService] 开始卸载插件：analytics
[PluginManagerService] 插件 analytics 已禁用
[DynamicPluginService] 动态卸载插件：analytics
[DynamicPluginService] 插件 analytics 动态卸载成功
[PluginStoreService] 删除插件：analytics
[PluginStoreService] 插件删除完成：analytics
[PluginManagerService] 插件 analytics 卸载成功
```

---

## 7. 安全考虑

### 7.1 插件验证

```typescript
/**
 * 插件验证服务
 */
@Injectable()
export class PluginValidatorService {
	/**
	 * 验证插件安全性
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<boolean>
	 */
	async validatePluginSecurity(manifest: IPluginManifest): Promise<boolean> {
		// 1. 验证插件签名
		if (manifest.signature) {
			const isValid = await this.verifySignature(manifest);
			if (!isValid) {
				throw new Error('插件签名验证失败');
			}
		}

		// 2. 验证插件许可证
		if (!this.isAllowedLicense(manifest.license)) {
			throw new Error('插件许可证不允许');
		}

		// 3. 验证插件权限
		if (!this.validatePermissions(manifest.permissions)) {
			throw new Error('插件权限超出允许范围');
		}

		return true;
	}

	/**
	 * 验证插件签名
	 *
	 * @param manifest - 插件清单
	 * @returns Promise<boolean>
	 */
	private async verifySignature(manifest: IPluginManifest): Promise<boolean> {
		// 使用公钥验证插件签名
		const publicKey = await this.loadPublicKey();
		const isValid = crypto.verify(manifest.signature, publicKey);

		return isValid;
	}

	/**
	 * 验证许可证是否允许
	 *
	 * @param license - 许可证信息
	 * @returns 是否允许
	 */
	private isAllowedLicense(license: any): boolean {
		const allowedLicenses = ['MIT', 'Apache-2.0', 'GPL-3.0'];
		return allowedLicenses.includes(license.type);
	}

	/**
	 * 验证权限是否允许
	 *
	 * @param permissions - 权限列表
	 * @returns 是否允许
	 */
	private validatePermissions(permissions: string[]): boolean {
		const allowedPermissions = ['read:analytics', 'write:analytics', 'read:reports', 'write:reports'];

		return permissions.every((p) => allowedPermissions.includes(p));
	}
}
```

### 7.2 沙箱隔离

```typescript
/**
 * 插件沙箱服务
 */
@Injectable()
export class PluginSandboxService {
	/**
	 * 在沙箱中执行插件代码
	 *
	 * @param plugin - 插件实例
	 * @param code - 要执行的代码
	 * @returns Promise<any>
	 */
	async executeInSandbox(plugin: IPlugin, code: string): Promise<any> {
		// 使用 vm2 创建隔离环境
		const vm = new vm2.VM({
			timeout: 5000, // 5 秒超时
			allowAsync: true,
			require: {
				external: true,
				builtin: ['console', 'setTimeout']
			}
		});

		// 在沙箱中执行代码
		const result = await vm.run(code, {
			filename: `${plugin.name}.js`
		});

		return result;
	}
}
```

---

## 8. 实现优先级

### 8.1 阶段 1：基础架构（1-2 周）

-   ✅ 创建插件信息、配置、依赖、历史实体
-   ✅ 实现 PluginStoreService（插件存储）
-   ✅ 实现 PluginManagerService（插件管理）
-   ✅ 实现基础的安装、卸载功能
-   ✅ 创建插件管理 API 控制器

### 8.2 阶段 2：动态加载（2-3 周）

-   ✅ 实现 DynamicPluginService（动态插件）
-   ✅ 实现动态模块注册
-   ✅ 实现动态实体注册
-   ✅ 实现动态订阅者注册
-   ✅ 实现插件启用/禁用功能

### 8.3 阶段 3：用户界面（1-2 周）

-   ✅ 创建插件商店 UI
-   ✅ 创建插件管理 UI
-   ✅ 实现插件搜索和分类
-   ✅ 实现插件详情页面

### 8.4 阶段 4：安全增强（1 周）

-   ✅ 实现插件签名验证
-   ✅ 实现插件许可证验证
-   ✅ 实现插件权限验证
-   ✅ 实现插件沙箱隔离

### 8.5 阶段 5：远程仓库（1-2 周）

-   ✅ 创建插件注册表服务
-   ✅ 实现插件上传功能
-   ✅ 实现插件版本管理
-   ✅ 实现插件评分和评论

---

## 9. 总结

### 9.1 可行性分析

| 维度           | 可行性 | 说明                                       |
| -------------- | ------ | ------------------------------------------ |
| **技术可行性** | ✅ 高  | NestJS 支持动态模块，MikroORM 支持动态实体 |
| **开发成本**   | ✅ 中  | 需要 5-8 周开发时间                        |
| **维护成本**   | ✅ 低  | 架构清晰，易于维护                         |
| **用户体验**   | ✅ 高  | 用户可以自主安装和管理插件                 |
| **扩展性**     | ✅ 高  | 支持无限扩展                               |
| **安全性**     | ✅ 中  | 需要完善的验证机制                         |

### 9.2 风险分析

| 风险                 | 影响 | 概率 | 缓解措施                 |
| -------------------- | ---- | ---- | ------------------------ |
| **动态模块加载失败** | 中   | 低   | 完善错误处理和日志       |
| **插件冲突**         | 高   | 中   | 严格的依赖检查和版本管理 |
| **安全漏洞**         | 高   | 低   | 插件签名验证、沙箱隔离   |
| **性能影响**         | 中   | 低   | 插件按需加载、懒加载     |
| **数据库迁移冲突**   | 高   | 中   | 版本化的迁移脚本         |

### 9.3 建议

1. **先实现核心功能**：

    - 插件信息管理
    - 插件安装/卸载
    - 插件启用/禁用

2. **逐步增加功能**：

    - 动态模块加载
    - 插件商店 UI
    - 远程插件仓库

3. **重视安全性**：

    - 插件签名验证
    - 插件权限控制
    - 插件沙箱隔离

4. **提供良好的用户体验**：
    - 直观的 UI
    - 清晰的错误提示
    - 完善的文档

---

**文档版本**: 1.0.0
**最后更新**: 2025-02-06
**维护者**: OKSAI Team
