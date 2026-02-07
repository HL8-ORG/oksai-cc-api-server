# @oksai/plugin

插件系统基础包，提供插件注册、加载和生命周期管理功能。

## 功能特性

-   插件注册与注销
-   插件加载与卸载
-   生命周期管理（bootstrap/shutdown）
-   依赖管理
-   核心插件与可选插件支持
-   插件状态跟踪

## 安装

```bash
pnpm add @oksai/plugin
```

## 使用

### 1. 导入 PluginModule

在应用的主模块中导入 `PluginModule`：

```typescript
import { Module } from '@nestjs/common';
import { PluginModule } from '@oksai/plugin';

@Module({
	imports: [PluginModule]
	// ...
})
export class AppModule {}
```

### 2. 创建插件

使用 `@Plugin` 装饰器创建插件：

```typescript
import { IPlugin } from '@oksai/plugin';

@Plugin({
	name: 'my-plugin',
	version: '1.0.0',
	description: '我的插件',
	isCore: false
})
export class MyPlugin implements IPlugin {
	async onApplicationBootstrap(): Promise<void> {
		console.log('插件初始化');
	}

	async onApplicationShutdown(): Promise<void> {
		console.log('插件销毁');
	}
}
```

### 3. 注册插件

使用 `PluginRegistryService` 注册插件：

```typescript
import { Injectable } from '@nestjs/common';
import { PluginRegistryService } from '@oksai/plugin';
import { MyPlugin } from './my-plugin';

@Injectable()
export class AppService {
	constructor(private readonly registry: PluginRegistryService) {}

	onModuleInit(): void {
		const plugin = new MyPlugin();
		this.registry.register(plugin);
	}
}
```

### 4. 加载插件

使用 `PluginLoaderService` 加载插件：

```typescript
import { Injectable } from '@nestjs/common';
import { PluginLoaderService } from '@oksai/plugin';

@Injectable()
export class AppService {
	constructor(private readonly loader: PluginLoaderService) {}

	async onApplicationBootstrap(): Promise<void> {
		await this.loader.loadPlugins({
			corePlugins: ['auth', 'tenant', 'user'],
			optionalPlugins: {
				'github-oauth': {
					enabled: true,
					config: { clientId: 'xxx', clientSecret: 'xxx' }
				}
			}
		});
	}
}
```

## 核心 API

### IPlugin 接口

所有插件必须实现 `IPlugin` 接口：

```typescript
interface IPlugin {
	// 插件元数据
	name: string;
	version: string;
	description?: string;
	author?: string;
	dependencies?: string[];
	isCore?: boolean;

	// 生命周期钩子
	onApplicationBootstrap?(module: ModuleRef): Promise<void> | void;
	onApplicationShutdown?(module: ModuleRef): Promise<void> | void;
	initialize?(config: Record<string, any>): Promise<void> | void;
	destroy?(): Promise<void> | void;
}
```

### PluginRegistryService

插件注册服务，提供插件管理功能：

```typescript
// 注册插件
registry.register(plugin: IPlugin): void;

// 注销插件
registry.unregister(name: string): void;

// 获取插件
registry.get(name: string): IPlugin | undefined;

// 获取所有插件
registry.getAll(): IPlugin[];

// 获取已启用的插件
registry.getEnabled(): IPlugin[];

// 获取核心插件
registry.getCorePlugins(): IPlugin[];

// 检查插件是否已注册
registry.has(name: string): boolean;
```

### PluginLoaderService

插件加载服务，提供插件加载和卸载功能：

```typescript
// 根据配置加载插件
loader.loadPlugins(config: IPluginConfig): Promise<void>;

// 加载单个插件
loader.loadPlugin(plugin: IPlugin, config?: Record<string, any>, options?: IPluginLoadOptions): Promise<void>;

// 卸载插件
loader.unloadPlugin(name: string, options?: IPluginUnloadOptions): Promise<void>;

// 重新加载插件
loader.reloadPlugin(name: string): Promise<void>;
```

## 核心插件

系统预定义了以下核心插件：

-   `auth` - 认证插件
-   `tenant` - 租户插件
-   `user` - 用户插件
-   `organization` - 组织插件
-   `role` - 角色插件
-   `audit` - 审计插件

核心插件会自动加载，不能被禁用。

## 可选插件

系统预定义了以下可选插件：

-   `github-oauth` - GitHub OAuth 认证插件
-   `google-oauth` - Google OAuth 认证插件
-   `microsoft-oauth` - Microsoft OAuth 认证插件
-   `analytics` - 分析插件
-   `logging` - 日志插件
-   `caching` - 缓存插件
-   `email` - 邮件插件
-   `notification` - 通知插件
-   `reporting` - 报表插件
-   `file-storage` - 文件存储插件
-   `task-scheduler` - 任务调度插件
-   `api-documentation` - API 文档插件

可选插件需要通过配置启用。

## 插件配置

插件配置示例：

```typescript
{
	corePlugins: ['auth', 'tenant', 'user'],
	optionalPlugins: {
		'github-oauth': {
			enabled: true,
			config: { clientId: 'xxx', clientSecret: 'xxx' }
		}
	},
	plugins: {
		'auth': {
			jwtSecret: 'secret',
			jwtExpiration: '7d'
		}
	},
	autoLoad: true,
	loadTimeout: 30000
}
```

## 插件状态

插件有以下状态：

-   `UNLOADED` - 未加载
-   `LOADED` - 已加载但未初始化
-   `INITIALIZED` - 已加载并初始化
-   `FAILED` - 加载失败
-   `DISABLED` - 已禁用

## 许可证

AGPL-3.0
