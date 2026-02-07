# OKSAI 平台启动过程与插件系统培训教程

## 目录

1. [概述](#概述)
2. [架构设计](#架构设计)
3. [启动流程详解](#启动流程详解)
4. [插件系统详解](#插件系统详解)
5. [创建自定义插件](#创建自定义插件)
6. [配置和使用](#配置和使用)
7. [最佳实践](#最佳实践)
8. [故障排查](#故障排查)

---

## 概述

OKSAI 平台采用模块化架构，通过插件系统实现高度可扩展的功能。本教程将深入讲解平台的启动流程和插件系统的设计与使用。

### 核心特性

-   **模块化架构**：将功能分解为独立的模块和插件
-   **插件驱动**：通过插件系统实现功能的动态加载和卸载
-   **依赖注入**：基于 NestJS 的依赖注入容器
-   **生命周期管理**：完整的插件生命周期钩子
-   **配置驱动**：通过配置文件灵活控制系统行为

### 技术栈

-   **框架**：NestJS 11.x
-   **ORM**：MikroORM 6.x
-   **语言**：TypeScript 5.x
-   **包管理**：pnpm + Monorepo
-   **数据库**：PostgreSQL（默认）

---

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        应用入口层                            │
│                      (apps/base-api)                        │
│                      src/main.ts                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        启动层                               │
│                    Bootstrap 模块                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  OpenTelemetry│  │  Redis 会话   │  │   Swagger    │   │
│  │     追踪      │  │    存储       │  │   文档生成    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        应用模块层                            │
│                      AppModule                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  CoreModule  │  │ PluginModule │  │BootstrapModule│   │
│  │   核心模块   │  │  插件系统    │  │  启动模块     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       插件管理层                             │
│                   PluginLoaderService                       │
│                   PluginRegistryService                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │   Auth   │ │  Tenant  │ │   User   │ │  Audit   │   │
│  │  插件     │ │  插件     │ │  插件     │ │  插件     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐                           │
│  │   Org    │ │   Role   │                           │
│  │  插件     │ │  插件     │                           │
│  └──────────┘ └──────────┘                           │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      基础设施层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Config     │  │   Logger     │  │    ORM       │   │
│  │   配置管理    │  │   日志系统    │  │   数据库      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```
oksai-api-server/
├── apps/
│   └── base-api/              # 主应用
│       ├── src/
│       │   ├── main.ts         # 应用入口
│       │   └── app.module.ts  # 根模块
│       └── package.json
├── libs/
│   ├── bootstrap/             # 启动模块
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── services/
│   │   │   │   │   └── bootstrap.service.ts
│   │   │   │   ├── redis-store.ts
│   │   │   │   ├── swagger.ts
│   │   │   │   └── tracer.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── plugin/                # 插件系统核心
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   ├── plugin-registry.service.ts
│   │   │   │   └── plugin-loader.service.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── plugin.interface.ts
│   │   │   │   └── plugin-config.interface.ts
│   │   │   ├── decorators/
│   │   │   │   └── plugin.decorator.ts
│   │   │   ├── enums/
│   │   │   │   └── core-plugin.enum.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── core/                  # 核心模块
│   ├── auth/                  # 认证插件
│   ├── tenant/                # 租户插件
│   ├── user/                  # 用户插件
│   ├── audit/                 # 审计插件
│   ├── organization/          # 组织插件
│   └── role/                  # 角色插件
└── package.json
```

---

## 启动流程详解

### 1. 应用入口 (main.ts)

应用启动从 `apps/base-api/src/main.ts` 开始：

```typescript
import { NestFactory } from '@nestjs/core';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from './app.module';
import { PluginRegistryService, PluginLoaderService, CorePlugin } from '@oksai/plugin';
import { configureRedisSession, setupSwagger, tracer } from '@oksai/bootstrap';
import { AuthPlugin } from '@oksai/auth';
import { TenantPlugin } from '@oksai/tenant';
import { UserPlugin } from '@oksai/user';
import { AuditPlugin } from '@oksai/audit';
import { OrganizationPlugin } from '@oksai/organization';
import { RolePlugin } from '@oksai/role';

async function bootstrap() {
	// 步骤 1: 启动 OpenTelemetry 追踪
	tracer.start();

	// 步骤 2: 创建 NestJS 应用实例
	const app = await NestFactory.create(AppModule);

	// 步骤 3: 设置全局路由前缀
	app.setGlobalPrefix('api');

	// 步骤 4: 配置 Redis 会话
	await configureRedisSession(app);

	// 步骤 5: 配置 Swagger 文档
	await setupSwagger(app, {
		swaggerPath: 'api-docs',
		title: 'OKSAI API',
		version: '1.0.0',
		description: 'OKSAI 平台 API 文档'
	});

	// 步骤 6: 获取核心服务
	const registry = app.get(PluginRegistryService);
	const loader = app.get(PluginLoaderService);
	const orm = app.get(MikroORM);

	// 步骤 7: 创建并注册插件实例
	const plugins = [
		new AuthPlugin(),
		new TenantPlugin(),
		new UserPlugin(),
		new AuditPlugin(),
		new OrganizationPlugin(),
		new RolePlugin()
	];

	// 步骤 8: 注册所有插件到注册表
	for (const plugin of plugins) {
		registry.register(plugin);
	}

	// 步骤 9: 加载插件
	await loader.loadPlugins({
		corePlugins: [
			CorePlugin.AUTH,
			CorePlugin.TENANT,
			CorePlugin.USER,
			CorePlugin.AUDIT,
			CorePlugin.ORGANIZATION,
			CorePlugin.ROLE
		],
		optionalPlugins: {},
		plugins: {},
		autoLoad: true
	});

	// 步骤 10: 启动 HTTP 服务器
	await app.listen(3000);
	console.log('🚀 应用已启动: http://localhost:3000/api');
}

bootstrap();
```

### 2. 启动流程图

```
main.ts 启动
    │
    ├─→ tracer.start()                      [启动 OpenTelemetry 追踪]
    │
    ├─→ NestFactory.create()                 [创建 NestJS 应用]
    │   │
    │   ├─→ AppModule 导入
    │   │   ├─→ ConfigModule                [配置模块]
    │   │   ├─→ MikroOrmModule              [数据库模块]
    │   │   ├─→ CoreModule                  [核心模块]
    │   │   ├─→ PluginModule                [插件系统模块]
    │   │   │   ├─→ PluginRegistryService    [插件注册服务初始化]
    │   │   │   └─→ PluginLoaderService      [插件加载服务初始化]
    │   │   └─→ 各业务模块 (Auth, Tenant...)
    │
    ├─→ app.setGlobalPrefix('api')          [设置路由前缀]
    │
    ├─→ configureRedisSession(app)           [配置 Redis 会话]
    │   ├─→ 创建 Redis 客户端
    │   ├─→ 配置 session 中间件
    │   └─→ 设置会话存储
    │
    ├─→ setupSwagger(app, options)           [配置 Swagger 文档]
    │   ├─→ 创建 Swagger 文档
    │   ├─→ 配置 API 文档信息
    │   └─→ 设置文档访问路径
    │
    ├─→ app.get(PluginRegistryService)      [获取插件注册服务]
    │
    ├─→ 创建插件实例                         [实例化插件类]
    │   ├─→ new AuthPlugin()
    │   ├─→ new TenantPlugin()
    │   └─→ ...
    │
    ├─→ registry.register(plugin)           [注册插件到注册表]
    │   ├─→ 验证插件名称唯一性
    │   ├─→ 设置插件状态为 UNLOADED
    │   └─→ 记录插件信息
    │
    ├─→ loader.loadPlugins(config)           [加载插件]
    │   │
    │   ├─→ loadCorePlugins()               [加载核心插件]
    │   │   └─→ 对每个核心插件:
    │   │       ├─→ loadPlugin(plugin)
    │   │       │   ├─→ 调用 plugin.initialize(config)
    │   │       │   ├─→ 更新状态为 INITIALIZED
    │   │       │   └─→ 调用 plugin.onApplicationBootstrap()
    │   │       └─→ 记录加载成功
    │   │
    │   └─→ loadOptionalPlugins()           [加载可选插件]
    │       └─→ 对每个启用的可选插件:
    │           ├─→ loadPlugin(plugin, config)
    │           └─→ 记录加载成功
    │
    └─→ app.listen(3000)                    [启动 HTTP 服务器]
        └─→ 监听端口并等待请求
```

### 3. 各阶段详细说明

#### 阶段 1: OpenTelemetry 追踪启动

```typescript
// libs/bootstrap/src/lib/tracer.ts
export default {
	start: () => {
		if (process.env.OTEL_ENABLED === 'true') {
			// 初始化追踪器
			// 配置导出器（Jaeger/Zipkin/Honeycomb 等）
			// 注册自动插桩
			if (honeycombSDK) {
				honeycombSDK.start();
			}
		}
	},
	shutdown: async () => {
		if (process.env.OTEL_ENABLED === 'true') {
			// 关闭追踪器
			await provider?.shutdown();
			await honeycombSDK?.shutdown();
		}
	}
};
```

**支持的后端**：

-   Jaeger (默认)
-   Zipkin
-   Honeycomb
-   Signoz
-   Aspecto
-   OTLP (OpenTelemetry Protocol)

#### 阶段 2: NestJS 应用创建

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
	logger: ['log', 'error', 'warn', 'debug', 'verbose'],
	bufferLogs: true
});
```

**关键配置**：

-   日志级别：log, error, warn, debug, verbose
-   日志缓冲：启用日志缓冲，提高性能
-   应用类型：NestExpressApplication

#### 阶段 3: 模块初始化

**AppModule** 导入以下模块：

1. **ConfigModule**：环境变量配置管理
2. **MikroOrmModule**：数据库 ORM
3. **CoreModule**：核心功能（基础实体、工具等）
4. **PluginModule**：插件系统核心
5. **BootstrapModule**：启动辅助功能
6. **业务模块**：AuthModule, TenantModule, UserModule 等

#### 阶段 4: Redis 会话配置

```typescript
// libs/bootstrap/src/lib/redis-store.ts
export async function configureRedisSession(app: INestApplication): Promise<void> {
	if (!isRedisEnabled()) {
		app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
		return;
	}

	const redisClient = createClient({
		url: getRedisUrl(),
		socket: {
			tls: isRedisTLS()
		}
	});

	await redisClient.connect();

	const redisStore = new RedisStore({
		client: redisClient,
		prefix: 'sess:'
	});

	app.use(
		session({
			store: redisStore,
			secret: process.env.SESSION_SECRET || 'default-secret',
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: isProduction(),
				httpOnly: true,
				maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000')
			}
		})
	);
}
```

**会话配置**：

-   存储方式：Redis 或内存
-   Cookie 安全：生产环境启用 HTTPS
-   会话超时：24 小时（可配置）
-   会话前缀：`sess:`

#### 阶段 5: Swagger 文档生成

```typescript
// libs/bootstrap/src/lib/swagger.ts
export async function setupSwagger(app: INestApplication, options: SwaggerOptions): Promise<string> {
	const config = new DocumentBuilder()
		.setTitle(options.title)
		.setVersion(options.version)
		.setDescription(options.description)
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(options.swaggerPath, app, document);

	return options.swaggerPath;
}
```

**Swagger 功能**：

-   API 文档自动生成
-   Bearer Token 认证支持
-   交互式 API 测试界面
-   访问路径：`/api-docs`

#### 阶段 6-7: 插件注册

```typescript
// 获取服务
const registry = app.get(PluginRegistryService);
const loader = app.get(PluginLoaderService);

// 创建插件实例
const plugins = [
	new AuthPlugin(),
	new TenantPlugin(),
	new UserPlugin(),
	new AuditPlugin(),
	new OrganizationPlugin(),
	new RolePlugin()
];

// 注册插件
for (const plugin of plugins) {
	registry.register(plugin);
}
```

**注册过程**：

1. 验证插件名称唯一性
2. 将插件添加到注册表
3. 设置初始状态为 `UNLOADED`
4. 记录插件元数据

#### 阶段 8: 插件加载

```typescript
await loader.loadPlugins({
	corePlugins: [
		CorePlugin.AUTH,
		CorePlugin.TENANT,
		CorePlugin.USER,
		CorePlugin.AUDIT,
		CorePlugin.ORGANIZATION,
		CorePlugin.ROLE
	],
	optionalPlugins: {},
	plugins: {},
	autoLoad: true
});
```

**加载过程**：

1. **核心插件**：自动加载，不能禁用
2. **可选插件**：根据配置启用或禁用
3. **插件配置**：为每个插件提供独立配置
4. **自动加载**：`autoLoad: true` 自动加载所有已注册插件

**插件生命周期**：

```
UNLOADED → LOADED → INITIALIZED
    ↓          ↓           ↓
  注册      initialize()  onApplicationBootstrap()
```

#### 阶段 9: 启动服务器

```typescript
await app.listen(3000);
console.log('🚀 应用已启动: http://localhost:3000/api');
```

**服务启动**：

-   监听端口：3000（可通过环境变量配置）
-   全局前缀：`/api`
-   Swagger 文档：`http://localhost:3000/api/api-docs`

---

## 插件系统详解

### 1. 插件系统架构

插件系统由三个核心服务组成：

#### 1.1 PluginRegistryService（插件注册服务）

**职责**：

-   插件的注册和注销
-   插件状态管理
-   插件信息查询

**核心方法**：

```typescript
@Injectable()
export class PluginRegistryService implements OnModuleInit {
	private readonly plugins = new Map<string, IPlugin>();
	private readonly pluginStatuses = new Map<string, PluginStatus>();

	// 注册插件
	register(plugin: IPlugin): void;

	// 注销插件
	unregister(name: string): void;

	// 获取插件
	get(name: string): IPlugin | undefined;

	// 获取所有插件
	getAll(): IPlugin[];

	// 获取已启用的插件
	getEnabled(): IPlugin[];

	// 获取核心插件
	getCorePlugins(): IPlugin[];

	// 更新插件状态
	updateStatus(name: string, status: PluginStatus): void;
}
```

#### 1.2 PluginLoaderService（插件加载服务）

**职责**：

-   插件的加载和初始化
-   插件的卸载和销毁
-   插件生命周期管理
-   依赖关系解析

**核心方法**：

```typescript
@Injectable()
export class PluginLoaderService implements OnModuleDestroy {
	// 根据配置加载插件
	async loadPlugins(config: IPluginConfig): Promise<void>;

	// 加载单个插件
	async loadPlugin(plugin: IPlugin, config?: Record<string, any>, options?: IPluginLoadOptions): Promise<void>;

	// 卸载插件
	async unloadPlugin(name: string, options?: IPluginUnloadOptions): Promise<void>;

	// 重新加载插件
	async reloadPlugin(name: string): Promise<void>;
}
```

### 2. 插件接口定义

#### 2.1 IPlugin 接口

```typescript
export interface IPlugin extends ILifecycleHooks, IPluginMetadata {
	// 插件实例
	instance?: any;

	// 插件配置
	config?: Record<string, any>;

	// 插件状态信息
	status?: IPluginStatusInfo;

	// 初始化插件
	initialize?(config: Record<string, any>): Promise<void> | void;

	// 销毁插件
	destroy?(): Promise<void> | void;
}
```

#### 2.2 插件元数据

```typescript
export interface IPluginMetadata {
	// 插件名称（唯一标识）
	name: string;

	// 插件版本
	version: string;

	// 插件描述
	description?: string;

	// 插件作者
	author?: string;

	// 插件依赖列表
	dependencies?: string[];

	// 是否为核心插件
	isCore?: boolean;
}
```

#### 2.3 插件生命周期钩子

```typescript
export interface ILifecycleHooks {
	// 应用启动时调用
	onApplicationBootstrap?(module: ModuleRef): Promise<void> | void;

	// 应用关闭时调用
	onApplicationShutdown?(module: ModuleRef): Promise<void> | void;
}
```

#### 2.4 插件状态

```typescript
export enum PluginStatus {
	UNLOADED = 'UNLOADED', // 未加载
	LOADED = 'LOADED', // 已加载但未初始化
	INITIALIZED = 'INITIALIZED', // 已加载并初始化
	FAILED = 'FAILED', // 加载失败
	DISABLED = 'DISABLED' // 已禁用
}
```

### 3. 核心插件列表

```typescript
export enum CorePlugin {
	AUTH = 'auth', // 认证插件
	TENANT = 'tenant', // 租户插件
	USER = 'user', // 用户插件
	ORGANIZATION = 'organization', // 组织插件
	ROLE = 'role', // 角色插件
	AUDIT = 'audit' // 审计插件
}
```

**核心插件特性**：

-   必须加载，不能禁用
-   自动初始化
-   系统运行必需

### 4. 可选插件列表

```typescript
export enum OptionalPlugin {
	GITHUB_OAUTH = 'github-oauth', // GitHub OAuth
	GOOGLE_OAUTH = 'google-oauth', // Google OAuth
	MICROSOFT_OAUTH = 'microsoft-oauth', // Microsoft OAuth
	ANALYTICS = 'analytics', // 分析插件
	LOGGING = 'logging', // 日志插件
	CACHING = 'caching', // 缓存插件
	EMAIL = 'email', // 邮件插件
	NOTIFICATION = 'notification', // 通知插件
	REPORTING = 'reporting', // 报表插件
	FILE_STORAGE = 'file-storage', // 文件存储
	TASK_SCHEDULER = 'task-scheduler', // 任务调度
	API_DOCUMENTATION = 'api-documentation' // API 文档
}
```

**可选插件特性**：

-   可以按需启用或禁用
-   可以为每个插件单独配置
-   可以在运行时动态加载和卸载

### 5. 插件配置接口

```typescript
export interface IPluginConfig {
	// 核心插件列表
	corePlugins: string[];

	// 可选插件配置
	optionalPlugins: Record<
		string,
		{
			enabled: boolean;
			config?: Record<string, any>;
		}
	>;

	// 插件全局配置
	plugins: Record<string, Record<string, any>>;

	// 是否自动加载所有插件
	autoLoad?: boolean;

	// 插件加载超时时间（毫秒）
	loadTimeout?: number;
}
```

### 6. 插件生命周期详解

```
┌──────────────┐
│   创建实例    │  new PluginClass()
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   注册插件    │  registry.register(plugin)
│   UNLOADED   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   加载插件    │  loader.loadPlugin(plugin)
│    LOADED    │
└──────┬───────┘
       │
       ├─→ initialize?(config)  [可选初始化]
       │
       ▼
┌──────────────┐
│   初始化插件   │
│ INITIALIZED  │
└──────┬───────┘
       │
       ├─→ onApplicationBootstrap(module)  [启动钩子]
       │
       ▼
┌──────────────┐
│   运行中      │
│  ACTIVE     │
└──────┬───────┘
       │
       ├─→ [应用运行]
       │
       ▼
┌──────────────┐
│   应用关闭    │
└──────┬───────┘
       │
       ├─→ onApplicationShutdown(module)  [关闭钩子]
       │
       ▼
┌──────────────┐
│   销毁插件    │  plugin.destroy?()
└──────────────┘
```

---

## 创建自定义插件

### 1. 插件结构

```
libs/
└── my-custom-plugin/
    ├── src/
    │   ├── lib/
    │   │   ├── my-custom-plugin.plugin.ts  # 插件主类
    │   │   ├── my-custom-plugin.module.ts  # 插件模块
    │   │   ├── services/                   # 插件服务
    │   │   │   └── my-custom-plugin.service.ts
    │   │   ├── controllers/               # 插件控制器
    │   │   │   └── my-custom-plugin.controller.ts
    │   │   ├── entities/                  # 插件实体
    │   │   │   └── my-custom.entity.ts
    │   │   └── interfaces/                # 插件接口
    │   │       └── my-custom-plugin.interface.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

### 2. 插件实现示例

#### 2.1 插件主类

```typescript
// libs/my-custom-plugin/src/lib/my-custom-plugin.plugin.ts
import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginStatus } from '@oksai/plugin';
import { MyCustomPluginModule } from './my-custom-plugin.module';
import { MyCustomPluginService } from './services/my-custom-plugin.service';

/**
 * 自定义插件
 *
 * 这是一个自定义插件示例，展示如何创建和实现插件
 */
export class MyCustomPlugin implements IPlugin {
	/** 插件名称 */
	readonly name = 'my-custom-plugin';

	/** 插件版本 */
	readonly version = '1.0.0';

	/** 插件描述 */
	readonly description = '自定义插件示例';

	/** 插件作者 */
	readonly author = 'OKSAI Team';

	/** 是否为核心插件 */
	readonly isCore = false;

	/** 插件依赖 */
	readonly dependencies: string[] = ['auth', 'tenant'];

	/** 插件配置 */
	private config?: Record<string, any>;

	/** 插件服务实例 */
	private service?: MyCustomPluginService;

	/**
	 * 初始化插件
	 *
	 * @param config - 插件配置
	 */
	async initialize(config: Record<string, any>): Promise<void> {
		this.config = config;
		console.log(`[MyCustomPlugin] 初始化配置: ${JSON.stringify(config)}`);
	}

	/**
	 * 应用启动钩子
	 *
	 * @param module - 模块引用
	 */
	async onApplicationBootstrap(module: ModuleRef): Promise<void> {
		// 获取插件服务实例
		this.service = module.get(MyCustomPluginService, { strict: false });

		if (this.service) {
			// 执行插件启动逻辑
			await this.service.start();
			console.log('[MyCustomPlugin] 插件已启动');
		}
	}

	/**
	 * 应用关闭钩子
	 *
	 * @param module - 模块引用
	 */
	async onApplicationShutdown(module: ModuleRef): Promise<void> {
		if (this.service) {
			// 执行插件清理逻辑
			await this.service.stop();
			console.log('[MyCustomPlugin] 插件已停止');
		}
	}

	/**
	 * 销毁插件
	 */
	async destroy(): Promise<void> {
		console.log('[MyCustomPlugin] 插件已销毁');
	}
}
```

#### 2.2 插件模块

```typescript
// libs/my-custom-plugin/src/lib/my-custom-plugin.module.ts
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MyCustomPluginService } from './services/my-custom-plugin.service';
import { MyCustomPluginController } from './controllers/my-custom-plugin.controller';
import { MyEntity } from './entities/my-custom.entity';

/**
 * 自定义插件模块
 *
 * 定义插件的功能模块和服务
 */
@Module({
	imports: [
		// 导入实体
		MikroOrmModule.forFeature([MyEntity])
	],
	providers: [
		// 提供服务
		MyCustomPluginService
	],
	controllers: [
		// 提供控制器
		MyCustomPluginController
	],
	exports: [
		// 导出服务供其他模块使用
		MyCustomPluginService
	]
})
export class MyCustomPluginModule {}
```

#### 2.3 插件服务

```typescript
// libs/my-custom-plugin/src/lib/services/my-custom-plugin.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { MyEntity } from '../entities/my-custom.entity';

/**
 * 自定义插件服务
 *
 * 提供插件的核心功能逻辑
 */
@Injectable()
export class MyCustomPluginService {
	private readonly logger = new Logger(MyCustomPluginService.name);

	constructor(
		@InjectRepository(MyEntity)
		private readonly repository: EntityRepository<MyEntity>
	) {}

	/**
	 * 启动插件
	 */
	async start(): Promise<void> {
		this.logger.log('插件服务已启动');
		// 初始化插件资源
	}

	/**
	 * 停止插件
	 */
	async stop(): Promise<void> {
		this.logger.log('插件服务已停止');
		// 清理插件资源
	}

	/**
	 * 执行插件功能
	 *
	 * @param data - 输入数据
	 * @returns 执行结果
	 */
	async execute(data: any): Promise<any> {
		// 实现插件功能
		const entity = this.repository.create(data);
		await this.repository.persistAndFlush(entity);
		return entity;
	}
}
```

#### 2.4 插件控制器

```typescript
// libs/my-custom-plugin/src/lib/controllers/my-custom-plugin.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { MyCustomPluginService } from '../services/my-custom-plugin.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * 自定义插件控制器
 *
 * 提供 HTTP API 接口
 */
@Controller('my-custom-plugin')
@ApiTags('自定义插件')
export class MyCustomPluginController {
	constructor(private readonly service: MyCustomPluginService) {}

	/**
	 * 获取插件状态
	 *
	 * @returns 插件状态信息
	 */
	@Get('status')
	@ApiOperation({ summary: '获取插件状态' })
	@ApiResponse({ status: 200, description: '成功获取状态' })
	getStatus(): { status: string; version: string } {
		return {
			status: 'active',
			version: '1.0.0'
		};
	}

	/**
	 * 执行插件功能
	 *
	 * @param data - 输入数据
	 * @returns 执行结果
	 */
	@Post('execute')
	@ApiOperation({ summary: '执行插件功能' })
	@ApiResponse({ status: 200, description: '成功执行' })
	async execute(@Body() data: any): Promise<any> {
		return await this.service.execute(data);
	}
}
```

#### 2.5 插件实体

```typescript
// libs/my-custom-plugin/src/lib/entities/my-custom.entity.ts
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

/**
 * 自定义实体
 *
 * 定义插件的数据模型
 */
@Entity()
export class MyEntity {
	@PrimaryKey()
	id!: string;

	@Property()
	name!: string;

	@Property({ nullable: true })
	description?: string;

	@Property({ nullable: true })
	metadata?: Record<string, any>;

	@Property({ default: 'active' })
	status: string = 'active';

	@Property()
	createdAt: Date = new Date();

	@Property({ onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
```

#### 2.6 插件入口

```typescript
// libs/my-custom-plugin/src/index.ts
export * from './lib/my-custom-plugin.module';
export * from './lib/my-custom-plugin.plugin';
export * from './lib/services/my-custom-plugin.service';
export * from './lib/controllers/my-custom-plugin.controller';
export * from './lib/entities/my-custom.entity';
```

### 3. 集成自定义插件

#### 3.1 更新 package.json

```json
{
	"name": "@oksai/my-custom-plugin",
	"version": "1.0.0",
	"description": "自定义插件",
	"main": "./dist/index.js",
	"types": "./dist/index.d.ts"
}
```

#### 3.2 在应用中集成

```typescript
// apps/base-api/src/main.ts
import { MyCustomPlugin } from '@oksai/my-custom-plugin';

async function bootstrap() {
	// ... 其他代码

	// 创建插件实例
	const plugins = [
		new AuthPlugin(),
		new TenantPlugin(),
		new UserPlugin(),
		new AuditPlugin(),
		new OrganizationPlugin(),
		new RolePlugin(),
		new MyCustomPlugin() // 添加自定义插件
	];

	// 注册插件
	for (const plugin of plugins) {
		registry.register(plugin);
	}

	// 加载插件
	await loader.loadPlugins({
		corePlugins: [
			CorePlugin.AUTH,
			CorePlugin.TENANT,
			CorePlugin.USER,
			CorePlugin.AUDIT,
			CorePlugin.ORGANIZATION,
			CorePlugin.ROLE
		],
		optionalPlugins: {
			'my-custom-plugin': {
				// 配置可选插件
				enabled: true,
				config: {
					// 插件特定配置
					option1: 'value1',
					option2: 'value2'
				}
			}
		},
		plugins: {
			'my-custom-plugin': {
				// 全局配置
				globalOption: 'globalValue'
			}
		},
		autoLoad: true
	});
}
```

#### 3.3 在 AppModule 中导入

```typescript
// apps/base-api/src/app.module.ts
import { Module } from '@nestjs/common';
import { MyCustomPluginModule } from '@oksai/my-custom-plugin';

@Module({
	imports: [
		// ... 其他模块
		MyCustomPluginModule // 导入插件模块
	]
})
export class AppModule {}
```

---

## 配置和使用

### 1. 环境变量配置

在项目根目录创建 `.env` 文件：

```bash
# 应用配置
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# 数据库配置
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=oksai
DB_SYNCHRONIZE=true
DB_RUN_MIGRATIONS=true

# Redis 配置
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
REDIS_TLS=false
SESSION_SECRET=your-session-secret
SESSION_MAX_AGE=86400000

# OpenTelemetry 配置
OTEL_ENABLED=true
OTEL_SERVICE_NAME=oksai-platform
OTEL_PROVIDER=jaeger
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:14268/api/traces

# Swagger 配置
SWAGGER_ENABLED=true
SWAGGER_PATH=api-docs
```

### 2. 插件配置示例

#### 2.1 仅加载核心插件

```typescript
await loader.loadPlugins({
	corePlugins: [
		CorePlugin.AUTH,
		CorePlugin.TENANT,
		CorePlugin.USER,
		CorePlugin.AUDIT,
		CorePlugin.ORGANIZATION,
		CorePlugin.ROLE
	],
	optionalPlugins: {},
	plugins: {},
	autoLoad: true
});
```

#### 2.2 启用可选插件

```typescript
await loader.loadPlugins({
	corePlugins: [
		CorePlugin.AUTH,
		CorePlugin.TENANT,
		CorePlugin.USER,
		CorePlugin.AUDIT,
		CorePlugin.ORGANIZATION,
		CorePlugin.ROLE
	],
	optionalPlugins: {
		'github-oauth': {
			enabled: true,
			config: {
				clientId: 'your-client-id',
				clientSecret: 'your-client-secret'
			}
		},
		'google-oauth': {
			enabled: true,
			config: {
				clientId: 'your-client-id',
				clientSecret: 'your-client-secret'
			}
		},
		analytics: {
			enabled: true,
			config: {
				provider: 'google-analytics',
				trackingId: 'UA-XXXXXXXXX-1'
			}
		}
	},
	plugins: {},
	autoLoad: true
});
```

#### 2.3 为插件提供全局配置

```typescript
await loader.loadPlugins({
	corePlugins: [CorePlugin.AUTH, CorePlugin.TENANT, CorePlugin.USER],
	optionalPlugins: {
		email: {
			enabled: true
		}
	},
	plugins: {
		email: {
			provider: 'smtp',
			host: 'smtp.example.com',
			port: 587,
			secure: false,
			auth: {
				user: 'user@example.com',
				pass: 'password'
			}
		},
		auth: {
			jwtSecret: 'your-jwt-secret',
			jwtExpiresIn: '1d'
		}
	},
	autoLoad: true
});
```

### 3. 插件状态查询

```typescript
// 获取所有插件
const allPlugins = registry.getAll();
console.log('所有插件:', allPlugins);

// 获取已启用的插件
const enabledPlugins = registry.getEnabled();
console.log('已启用的插件:', enabledPlugins);

// 获取核心插件
const corePlugins = registry.getCorePlugins();
console.log('核心插件:', corePlugins);

// 获取插件状态
const authStatus = registry.getStatus('auth');
console.log('Auth 插件状态:', authStatus);

// 获取所有插件状态
const allStatus = registry.getAllStatus();
console.log('所有插件状态:', allStatus);
```

### 4. 动态加载和卸载插件

```typescript
// 动态加载插件
const plugin = new MyCustomPlugin();
registry.register(plugin);
await loader.loadPlugin(plugin, { option1: 'value1' });

// 动态卸载插件
await loader.unloadPlugin('my-custom-plugin');

// 强制卸载插件（忽略依赖）
await loader.unloadPlugin('my-custom-plugin', { force: true });

// 重新加载插件
await loader.reloadPlugin('auth');
```

---

## 最佳实践

### 1. 插件开发最佳实践

#### 1.1 保持插件独立性

```typescript
// ✅ 好的做法：插件功能独立
export class MyPlugin implements IPlugin {
	async onApplicationBootstrap(module: ModuleRef): Promise<void> {
		// 不依赖外部服务，或通过依赖注入获取
	}

	async onApplicationShutdown(module: ModuleRef): Promise<void> {
		// 独立清理自己的资源
	}
}

// ❌ 不好的做法：直接依赖全局变量
export class MyPlugin implements IPlugin {
	async onApplicationBootstrap(): Promise<void> {
		// 直接访问全局变量
		global.someService.doSomething();
	}
}
```

#### 1.2 正确处理依赖关系

```typescript
export class MyPlugin implements IPlugin {
	readonly name = 'my-plugin';
	readonly dependencies = ['auth', 'tenant']; // 声明依赖

	async onApplicationBootstrap(module: ModuleRef): Promise<void> {
		// 验证依赖是否已加载
		const authPlugin = registry.get('auth');
		const tenantPlugin = registry.get('tenant');

		if (!authPlugin || !tenantPlugin) {
			throw new Error('依赖插件未加载');
		}
	}
}
```

#### 1.3 实现完整的生命周期钩子

```typescript
export class MyPlugin implements IPlugin {
	readonly name = 'my-plugin';
	readonly version = '1.0.0';

	async initialize(config: Record<string, any>): Promise<void> {
		// 初始化配置和资源
	}

	async onApplicationBootstrap(module: ModuleRef): Promise<void> {
		// 应用启动时的初始化
	}

	async onApplicationShutdown(module: ModuleRef): Promise<void> {
		// 应用关闭时的清理
	}

	async destroy(): Promise<void> {
		// 销毁插件资源
	}
}
```

#### 1.4 提供详细的日志

```typescript
export class MyPlugin implements IPlugin {
	private readonly logger = new Logger(MyPlugin.name);

	async initialize(config: Record<string, any>): Promise<void> {
		this.logger.log('插件初始化开始');
		this.logger.debug(`配置: ${JSON.stringify(config)}`);

		try {
			// 初始化逻辑
			this.logger.log('插件初始化完成');
		} catch (error) {
			this.logger.error('插件初始化失败', error);
			throw error;
		}
	}
}
```

#### 1.5 实现错误处理

```typescript
export class MyPlugin implements IPlugin {
	async onApplicationBootstrap(module: ModuleRef): Promise<void> {
		try {
			await this.startService();
		} catch (error) {
			// 记录错误但不影响其他插件
			this.logger.error('插件启动失败，插件将在降级模式下运行', error);
			// 设置降级状态
			this.isHealthy = false;
		}
	}
}
```

### 2. 性能优化

#### 2.1 延迟初始化

```typescript
export class MyPlugin implements IPlugin {
	private cache?: Map<string, any>;

	async onApplicationBootstrap(module: ModuleRef): Promise<void> {
		// 不在这里初始化耗时资源
	}

	async getCache(): Promise<Map<string, any>> {
		if (!this.cache) {
			// 按需初始化
			this.cache = await this.loadCache();
		}
		return this.cache;
	}
}
```

#### 2.2 异步操作优化

```typescript
export class MyPlugin implements IPlugin {
	async onApplicationBootstrap(module: ModuleRef): Promise<void> {
		// 使用 Promise.all 并行执行独立操作
		await Promise.all([this.initializeDatabase(), this.initializeCache(), this.connectExternalService()]);
	}
}
```

### 3. 安全最佳实践

#### 3.1 验证配置

```typescript
export class MyPlugin implements IPlugin {
	async initialize(config: Record<string, any>): Promise<void> {
		// 验证必需的配置项
		if (!config.apiKey) {
			throw new Error('缺少必需的配置: apiKey');
		}

		// 验证配置值的格式
		if (!this.isValidApiKey(config.apiKey)) {
			throw new Error('无效的 apiKey 格式');
		}
	}

	private isValidApiKey(key: string): boolean {
		return /^[a-zA-Z0-9]{32}$/.test(key);
	}
}
```

#### 3.2 敏感信息保护

```typescript
export class MyPlugin implements IPlugin {
	async initialize(config: Record<string, any>): Promise<void> {
		// 不要在日志中输出敏感信息
		this.logger.log(`插件初始化，配置: ${this.sanitizeConfig(config)}`);
	}

	private sanitizeConfig(config: Record<string, any>): string {
		const sanitized = { ...config };
		// 移除敏感字段
		delete sanitized.apiKey;
		delete sanitized.secret;
		delete sanitized.password;
		return JSON.stringify(sanitized);
	}
}
```

### 4. 测试最佳实践

#### 4.1 单元测试

```typescript
// my-plugin.service.spec.ts
describe('MyPluginService', () => {
	let service: MyPluginService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [MyPluginService]
		}).compile();

		service = module.get<MyPluginService>(MyPluginService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should execute plugin function', async () => {
		const result = await service.execute({ name: 'test' });
		expect(result).toBeDefined();
		expect(result.name).toBe('test');
	});
});
```

#### 4.2 集成测试

```typescript
// my-plugin.e2e-spec.ts
describe('MyPlugin (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/my-custom-plugin/status (GET)', () => {
		return request(app.getHttpServer())
			.get('/my-custom-plugin/status')
			.expect(200)
			.expect((res) => {
				expect(res.body.status).toBe('active');
			});
	});
});
```

---

## 故障排查

### 1. 常见问题

#### 1.1 插件加载失败

**症状**：

```
[Nest] 12345  ERROR [PluginLoaderService] 核心插件 auth 加载失败
Error: Cannot find module '@oksai/auth'
```

**解决方案**：

1. 检查插件是否已安装：

```bash
pnpm list @oksai/auth
```

2. 如果未安装，安装插件：

```bash
pnpm add @oksai/auth
```

3. 如果已安装但仍有问题，重新构建：

```bash
cd libs/auth
pnpm run build
```

#### 1.2 插件依赖未满足

**症状**：

```
[Nest] 12345  ERROR [PluginLoaderService] 插件 my-plugin 加载失败
Error: 依赖插件 auth 未加载
```

**解决方案**：

1. 检查插件依赖声明：

```typescript
export class MyPlugin implements IPlugin {
	readonly dependencies = ['auth', 'tenant'];
}
```

2. 确保依赖插件在核心插件列表中：

```typescript
await loader.loadPlugins({
	corePlugins: [
		CorePlugin.AUTH,
		CorePlugin.TENANT
		// ...
	]
	// ...
});
```

3. 确保依赖插件已成功加载：

```typescript
const authStatus = registry.getStatus('auth');
console.log('Auth 状态:', authStatus);
```

#### 1.3 插件初始化失败

**症状**：

```
[Nest] 12345  ERROR [MyPlugin] 插件初始化失败
Error: 缺少必需的配置: apiKey
```

**解决方案**：

1. 检查插件配置：

```typescript
await loader.loadPlugins({
	optionalPlugins: {
		'my-plugin': {
			enabled: true,
			config: {
				apiKey: 'your-api-key' // 确保配置正确
			}
		}
	}
});
```

2. 检查环境变量：

```bash
echo $MY_PLUGIN_API_KEY
```

3. 检查 .env 文件：

```bash
cat .env | grep MY_PLUGIN
```

#### 1.4 Redis 连接失败

**症状**：

```
[Nest] 12345  ERROR [RedisStore] Redis 连接失败
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**解决方案**：

1. 检查 Redis 是否运行：

```bash
redis-cli ping
# 应返回: PONG
```

2. 检查 Redis 配置：

```bash
echo $REDIS_URL
```

3. 检查 Redis 端口：

```bash
netstat -an | grep 6379
```

4. 如果 Redis 未运行，启动 Redis：

```bash
# Linux/Mac
redis-server

# Docker
docker run -d -p 6379:6379 redis:latest
```

#### 1.5 数据库连接失败

**症状**：

```
[Nest] 12345  ERROR [MikroORM] 数据库连接失败
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案**：

1. 检查 PostgreSQL 是否运行：

```bash
pg_isready
```

2. 检查数据库配置：

```bash
echo $DB_HOST
echo $DB_PORT
echo $DB_DATABASE
```

3. 检查数据库用户权限：

```bash
psql -U postgres -d oksai -c "\du"
```

4. 如果数据库未运行，启动 PostgreSQL：

```bash
# Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=oksai \
  -p 5432:5432 \
  postgres:latest
```

### 2. 调试技巧

#### 2.1 启用调试日志

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
	logger: ['log', 'error', 'warn', 'debug', 'verbose'] // 启用所有日志级别
});
```

#### 2.2 使用 NestJS 调试器

```bash
# 启动应用并附加调试器
node --inspect-brk dist/main.js
```

然后在 Chrome 浏览器中打开 `chrome://inspect` 进行调试。

#### 2.3 查看插件状态

```typescript
// 在 main.ts 中添加
const allPlugins = registry.getAll();
console.log('所有插件:');
allPlugins.forEach((plugin) => {
	console.log(`- ${plugin.name} (${plugin.version}): ${registry.getStatus(plugin.name)}`);
});
```

#### 2.4 使用日志追踪

```typescript
export class MyPlugin implements IPlugin {
	private readonly logger = new Logger(MyPlugin.name);

	async initialize(config: Record<string, any>): Promise<void> {
		this.logger.debug('[MyPlugin] 开始初始化');
		this.logger.debug(`[MyPlugin] 配置: ${JSON.stringify(config)}`);

		try {
			// 初始化逻辑
			this.logger.log('[MyPlugin] 初始化成功');
		} catch (error) {
			this.logger.error('[MyPlugin] 初始化失败', error.stack);
			throw error;
		}
	}
}
```

### 3. 性能问题排查

#### 3.1 检查启动时间

```typescript
async function bootstrap() {
	const startTime = Date.now();

	// 应用启动逻辑

	const endTime = Date.now();
	console.log(`应用启动耗时: ${endTime - startTime}ms`);
}
```

#### 3.2 使用性能分析

```bash
# 生成性能分析报告
node --prof dist/main.js

# 处理分析报告
node --prof-process isolate-*.log > profile.txt
```

#### 3.3 检查插件加载顺序

```typescript
// 在 PluginLoaderService 中添加日志
async loadPlugin(plugin: IPlugin, config?: Record<string, any>, options?: IPluginLoadOptions): Promise<void> {
	this.logger.log(`[PluginLoader] 开始加载插件: ${plugin.name}`);

	try {
		// 加载逻辑
		this.logger.log(`[PluginLoader] 插件加载成功: ${plugin.name}`);
	} catch (error) {
		this.logger.error(`[PluginLoader] 插件加载失败: ${plugin.name}`, error);
	}
}
```

### 4. 获取帮助

如果遇到无法解决的问题：

1. 查看官方文档：[https://docs.oksai.io](https://docs.oksai.io)
2. 搜索 Issues：[https://github.com/oksai/oksai/issues](https://github.com/oksai/oksai/issues)
3. 加入社区讨论：[https://community.oksai.io](https://community.oksai.io)
4. 提交 Issue：在 GitHub 上提交详细的问题描述

---

## 总结

本教程详细介绍了 OKSAI 平台的启动过程和插件系统，包括：

1. **启动流程**：从应用入口到服务器启动的完整流程
2. **插件系统**：插件注册、加载、生命周期管理
3. **自定义插件**：如何创建和集成自定义插件
4. **配置和使用**：环境变量、插件配置、动态管理
5. **最佳实践**：开发、性能、安全、测试等方面的建议
6. **故障排查**：常见问题和调试技巧

通过本教程，您应该能够：

-   理解 OKSAI 平台的架构和启动流程
-   掌握插件系统的工作原理
-   创建和集成自定义插件
-   配置和优化系统性能
-   排查和解决常见问题

祝您使用 OKSAI 平台开发愉快！

---

## 附录

### A. 相关资源

-   [NestJS 文档](https://docs.nestjs.com/)
-   [MikroORM 文档](https://mikro-orm.io/docs/)
-   [TypeScript 文档](https://www.typescriptlang.org/docs/)
-   [pnpm 文档](https://pnpm.io/)
-   [OpenTelemetry 文档](https://opentelemetry.io/docs/)

### B. 术语表

| 术语                           | 说明                                         |
| ------------------------------ | -------------------------------------------- |
| 插件 (Plugin)                  | 可动态加载的功能模块                         |
| 核心插件 (Core Plugin)         | 系统必需的插件，必须加载                     |
| 可选插件 (Optional Plugin)     | 可按需启用的插件                             |
| 插件注册表 (Plugin Registry)   | 管理已注册插件的服务                         |
| 插件加载器 (Plugin Loader)     | 负责插件加载和初始化的服务                   |
| 生命周期钩子 (Lifecycle Hooks) | 插件在不同阶段可执行的回调                   |
| 插件状态 (Plugin Status)       | 插件的当前状态（未加载、已加载、已初始化等） |
| 启动模块 (Bootstrap Module)    | 提供应用启动辅助功能的模块                   |
| OpenTelemetry                  | 开源可观测性框架                             |
| Swagger                        | API 文档生成工具                             |

### C. 版本历史

| 版本  | 日期       | 说明     |
| ----- | ---------- | -------- |
| 1.0.0 | 2025-02-06 | 初始版本 |

---

**文档版本**: 1.0.0
**最后更新**: 2025-02-06
**维护者**: OKSAI Team
