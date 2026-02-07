# OKSAI vs Gauzy (qauzy-backup) 架构对比

## 概述

本文档对比分析了 `qauzy-backup/apps/api`（Gauzy 旧版本）与当前 `apps/base-api`（OKSAI 新版本）之间的架构差异。

---

## 1. 项目结构对比

### 1.1 Gauzy (qauzy-backup) 结构

```
qauzy-backup/
├── apps/
│   └── api/
│       └── src/
│           ├── main.ts              # 简化的入口，调用 @gauzy/core/bootstrap
│           ├── plugin-config.ts     # 插件配置
│           ├── plugins.ts           # 插件列表
│           ├── load-env.ts         # 环境变量加载
│           ├── migration.ts         # 数据库迁移
│           ├── seed-*.ts          # 数据库种子数据
│           └── assets/            # 静态资源
└── packages/
    ├── core/                    # 核心启动模块（包含 bootstrap 函数）
    │   └── src/
    │       └── lib/
    │           ├── bootstrap/
    │           │   ├── index.ts      # 主 bootstrap 函数
    │           │   ├── redis-store.ts
    │           │   ├── swagger.ts
    │           │   └── tracer.ts
    │           ├── app/
    │           │   ├── app.module.ts  # 根模块
    │           │   └── app.service.ts
    │           ├── core/             # 核心业务逻辑
    │           │   ├── entities/
    │           │   ├── services/
    │           │   └── modules/
    │           └── database/
    │               └── database.ts
    ├── plugin/                  # 插件系统核心
    │   └── src/
    │       └── lib/
    │           ├── plugin.interface.ts
    │           ├── plugin.module.ts
    │           ├── plugin-metadata.ts
    │           └── plugin.helper.ts
    └── plugins/                 # 大量插件包
        ├── plugin-changelog/
        ├── plugin-integration-ai/
        ├── plugin-integration-github/
        ├── plugin-integration-jira/
        ├── plugin-integration-hubstaff/
        ├── plugin-integration-make-com/
        ├── plugin-integration-zapier/
        ├── plugin-integration-activepieces/
        ├── plugin-integration-upwork/
        ├── plugin-job-proposal/
        ├── plugin-job-search/
        ├── plugin-knowledge-base/
        ├── plugin-product-reviews/
        ├── plugin-videos/
        ├── plugin-registry/
        ├── plugin-camshot/
        ├── plugin-soundshot/
        └── ... (更多插件)
```

### 1.2 OKSAI (新版本) 结构

```
oksai-api-server/
├── apps/
│   └── base-api/            # 主应用
│       └── src/
│           ├── main.ts          # 完整的启动流程
│           ├── app.module.ts     # 根模块
│           ├── config/          # 配置文件
│           │   └── mikro-orm.config.ts
│           ├── shared/         # 共享模块
│           │   └── health/
│           └── e2e/            # E2E 测试
└── libs/
    ├── bootstrap/             # 启动模块（独立包）
    │   └── src/
    │       ├── lib/
    │       │   ├── bootstrap.module.ts
    │       │   ├── bootstrap.service.ts
    │       │   ├── redis-store.ts
    │       │   ├── swagger.ts
    │       │   └── tracer.ts
    │       └── index.ts
    ├── plugin/                # 插件系统核心（独立包）
    │   └── src/
    │       ├── services/
    │       │   ├── plugin-registry.service.ts
    │       │   └── plugin-loader.service.ts
    │       ├── interfaces/
    │       │   ├── plugin.interface.ts
    │       │   └── plugin-config.interface.ts
    │       ├── decorators/
    │       │   └── plugin.decorator.ts
    │       └── enums/
    │           └── core-plugin.enum.ts
    ├── core/                  # 核心模块（独立包）
    ├── auth/                  # 认证插件（独立包）
    ├── tenant/                # 租户插件（独立包）
    ├── user/                  # 用户插件（独立包）
    ├── audit/                 # 审计插件（独立包）
    ├── organization/          # 组织插件（独立包）
    └── role/                  # 角色插件（独立包）
```

---

## 2. 启动流程对比

### 2.1 Gauzy 启动流程

```typescript
// qauzy-backup/apps/api/src/main.ts
import { bootstrap } from '@gauzy/core';
import { pluginConfig } from './plugin-config';

// 简化的启动流程
bootstrap(pluginConfig)
	.then(() => {
		console.log('API Running');
	})
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
```

**特点**：

-   ✅ 入口非常简洁，将启动逻辑委托给 `@gauzy/core`
-   ✅ 所有启动逻辑集中在 `packages/core/src/lib/bootstrap/index.ts`
-   ✅ 通过 `pluginConfig` 配置所有插件

**启动流程图**：

```
apps/api/src/main.ts
    │
    └─→ bootstrap(pluginConfig)  [@gauzy/core]
        │
        ├─→ preBootstrapApplicationConfig()
        │   │
        │   ├─→ preBootstrapRegisterEntities()
        │   │   ├─→ coreEntities
        │   │   └─→ pluginEntities
        │   │
        │   ├─→ preBootstrapRegisterSubscribers()
        │   │   ├─→ coreSubscribers
        │   │   └─→ pluginSubscribers
        │   │
        │   ├─→ preBootstrapPluginConfigurations()
        │   │   └─→ 为每个插件调用配置函数
        │   │
        │   └─→ registerTypeOrmCustomFields()
        │
        ├─→ NestFactory.create(BootstrapModule)
        │   ├─→ AppModule
        │   ├─→ 所有业务模块
        │   └─→ 所有插件模块
        │
        ├─→ 配置 Express 中间件
        │   ├─→ helmet()
        │   ├─→ cors()
        │   ├─→ json()
        │   ├─→ urlencoded()
        │   └─→ AuthGuard（全局守卫）
        │
        ├─→ configureRedisSession()
        │   ├─→ Redis 客户端创建
        │   └─→ Session 中间件配置
        │
        ├─→ setupSwagger()
        │   ├─→ Swagger 文档生成
        │   └─→ API 文档配置
        │
        ├─→ seedDatabaseIfEmpty()
        │   └─→ 种子数据初始化
        │
        └─→ app.listen(port)
            └─→ 启动 HTTP 服务器
```

### 2.2 OKSAI 启动流程

```typescript
// apps/base-api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { PluginRegistryService, PluginLoaderService, CorePlugin } from '@oksai/plugin';
import { configureRedisSession, setupSwagger, tracer } from '@oksai/bootstrap';
import { AuthPlugin } from '@oksai/auth';
import { TenantPlugin } from '@oksai/tenant';
// ... 其他插件

async function bootstrap() {
	// 1. 启动 OpenTelemetry 追踪
	tracer.start();

	// 2. 创建 NestJS 应用
	const app = await NestFactory.create(AppModule);

	// 3. 配置应用
	app.setGlobalPrefix('api');

	// 4. 配置 Redis 会话
	await configureRedisSession(app);

	// 5. 配置 Swagger
	await setupSwagger(app, { ... });

	// 6. 获取插件服务
	const registry = app.get(PluginRegistryService);
	const loader = app.get(PluginLoaderService);

	// 7. 创建插件实例
	const plugins = [new AuthPlugin(), new TenantPlugin(), ...];

	// 8. 注册插件
	for (const plugin of plugins) {
		registry.register(plugin);
	}

	// 9. 加载插件
	await loader.loadPlugins({
		corePlugins: [CorePlugin.AUTH, CorePlugin.TENANT, ...],
		optionalPlugins: {},
		plugins: {},
		autoLoad: true
	});

	// 10. 启动服务器
	await app.listen(3000);
}
```

**特点**：

-   ✅ 启动流程清晰、可读性强
-   ✅ 每个步骤都有明确的注释
-   ✅ 插件系统使用 NestJS 的依赖注入
-   ✅ 插件状态管理更加精细

**启动流程图**：

```
apps/base-api/src/main.ts
    │
    ├─→ tracer.start()                    [Bootstrap]
    │   └─→ OpenTelemetry 追踪启动
    │
    ├─→ NestFactory.create(AppModule)      [NestJS]
    │   └─→ 创建 NestJS 应用实例
    │
    ├─→ app.setGlobalPrefix('api')        [NestJS]
    │   └─→ 设置全局路由前缀
    │
    ├─→ configureRedisSession(app)          [Bootstrap]
    │   ├─→ 创建 Redis 客户端
    │   └─→ 配置 Session 中间件
    │
    ├─→ setupSwagger(app, options)         [Bootstrap]
    │   ├─→ 生成 Swagger 文档
    │   └─→ 配置 API 文档信息
    │
    ├─→ app.get(PluginRegistryService)    [Plugin]
    │
    ├─→ app.get(PluginLoaderService)      [Plugin]
    │
    ├─→ 创建插件实例                         [Application]
    │   ├─→ new AuthPlugin()
    │   ├─→ new TenantPlugin()
    │   └─→ ...其他插件
    │
    ├─→ registry.register(plugin)           [PluginRegistry]
    │   ├─→ 验证插件名称
    │   ├─→ 添加到注册表
    │   └─→ 设置状态为 UNLOADED
    │
    └─→ loader.loadPlugins(config)          [PluginLoader]
        │
        ├─→ loadCorePlugins()
        │   └─→ 对每个核心插件:
        │       ├─→ loadPlugin(plugin)
        │       │   ├─→ plugin.initialize(config)
        │       │   ├─→ 更新状态为 INITIALIZED
        │       │   └─→ plugin.onApplicationBootstrap()
        │       └─→ 记录加载成功
        │
        └─→ loadOptionalPlugins()
            └─→ 对每个启用的可选插件:
                ├─→ loadPlugin(plugin, config)
                └─→ 记录加载成功
```

---

## 3. 插件系统对比

### 3.1 Gauzy 插件系统

**插件配置方式**：

```typescript
// qauzy-backup/apps/api/src/plugin-config.ts
import { ChangelogPlugin } from '@gauzy/plugin-changelog';
import { IntegrationAIPlugin } from '@gauzy/plugin-integration-ai';
// ... 其他插件导入

export const pluginConfig: ApplicationPluginConfig = {
	apiConfigOptions: { ... },
	dbConnectionOptions: { ... },
	dbMikroOrmConnectionOptions: { ... },
	dbKnexConnectionOptions: { ... },
	assetOptions: { ... },
	logger: ...,
	plugins: [
		ChangelogPlugin,
		IntegrationAIPlugin,
		IntegrationGithubPlugin,
		IntegrationJiraPlugin,
		IntegrationHubstaffPlugin,
		IntegrationMakeComPlugin,
		IntegrationZapierPlugin,
		IntegrationActivepiecesPlugin,
		IntegrationUpworkPlugin,
		// ... 更多插件
	]
};
```

**插件特点**：

-   ✅ 插件通过数组直接配置
-   ✅ 使用 `@gauzy/plugin` 包管理插件
-   ✅ 支持配置函数动态修改配置
-   ✅ 插件实体自动注册到数据库
-   ✅ 支持插件订阅者（Subscribers）

**插件数量**：

-   核心插件：约 6 个
-   可选插件：约 20+ 个（包括多个集成插件）

**插件列表**：

-   `plugin-changelog` - 变更日志
-   `plugin-integration-ai` - AI 集成
-   `plugin-integration-github` - GitHub 集成
-   `plugin-integration-jira` - Jira 集成
-   `plugin-integration-hubstaff` - Hubstaff 集成
-   `plugin-integration-make-com` - Make.com 集成
-   `plugin-integration-zapier` - Zapier 集成
-   `plugin-integration-activepieces` - Activepieces 集成
-   `plugin-integration-upwork` - Upwork 集成
-   `plugin-job-proposal` - 工作提案
-   `plugin-job-search` - 工作搜索
-   `plugin-knowledge-base` - 知识库
-   `plugin-product-reviews` - 产品评价
-   `plugin-videos` - 视频
-   `plugin-registry` - 插件注册表
-   `plugin-camshot` - 截图
-   `plugin-soundshot` - 录音
-   ... 更多

### 3.2 OKSAI 插件系统

**插件配置方式**：

```typescript
// apps/base-api/src/main.ts
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
		'github-oauth': {
			enabled: true,
			config: { clientId: '...', clientSecret: '...' }
		}
	},
	plugins: {},
	autoLoad: true
});
```

**插件特点**：

-   ✅ 插件通过服务管理（PluginRegistryService、PluginLoaderService）
-   ✅ 支持插件状态管理（UNLOADED、LOADED、INITIALIZED、FAILED、DISABLED）
-   ✅ 支持插件依赖关系
-   ✅ 支持插件生命周期钩子
-   ✅ 插件实例化更灵活
-   ✅ 支持核心插件和可选插件分类

**插件数量**：

-   核心插件：6 个
-   可选插件：已定义 12 个（可根据需要扩展）

**插件列表**：

-   `auth` - 认证插件（核心）
-   `tenant` - 租户插件（核心）
-   `user` - 用户插件（核心）
-   `audit` - 审计插件（核心）
-   `organization` - 组织插件（核心）
-   `role` - 角色插件（核心）
-   `github-oauth` - GitHub OAuth（可选）
-   `google-oauth` - Google OAuth（可选）
-   `microsoft-oauth` - Microsoft OAuth（可选）
-   `analytics` - 分析（可选）
-   `logging` - 日志（可选）
-   `caching` - 缓存（可选）
-   `email` - 邮件（可选）
-   `notification` - 通知（可选）
-   `reporting` - 报表（可选）
-   `file-storage` - 文件存储（可选）
-   `task-scheduler` - 任务调度（可选）
-   `api-documentation` - API 文档（可选）

### 3.3 插件系统架构对比

| 特性                  | Gauzy                         | OKSAI            |
| --------------------- | ----------------------------- | ---------------- |
| **插件注册方式**      | 数组配置                      | 服务管理         |
| **插件状态管理**      | ❌ 无                         | ✅ 支持 5 种状态 |
| **插件依赖管理**      | ✅ 支持                       | ✅ 支持          |
| **插件生命周期钩子**  | ✅ 支持                       | ✅ 支持          |
| **核心/可选插件分类** | ❌ 无                         | ✅ 支持          |
| **动态加载/卸载**     | ✅ 支持                       | ✅ 支持          |
| **插件配置灵活性**    | ✅ 配置函数                   | ✅ 配置对象      |
| **插件实例化**        | 自动                          | 手动（更灵活）   |
| **插件数量**          | 20+                           | 18（可扩展）     |
| **第三方集成**        | 多（GitHub、Jira、Upwork 等） | 待实现           |

---

## 4. Bootstrap 模块对比

### 4.1 Gauzy Bootstrap 模块

**位置**：`packages/core/src/lib/bootstrap/index.ts`

**特点**：

-   ✅ 集中式启动逻辑
-   ✅ 自动注册实体和订阅者
-   ✅ 支持多 ORM（TypeORM、MikroORM、Knex）
-   ✅ 自动运行数据库迁移
-   ✅ 自动种子数据
-   ✅ 支持 GraphQL

**核心功能**：

```typescript
export async function bootstrap(pluginConfig?: Partial<ApplicationPluginConfig>): Promise<INestApplication> {
	// 1. 预启动配置
	const config = await preBootstrapApplicationConfig(pluginConfig);

	// 2. 动态导入 BootstrapModule
	const { BootstrapModule } = await import('./bootstrap.module');

	// 3. 创建 NestJS 应用
	const app = await NestFactory.create<NestExpressApplication>(BootstrapModule);

	// 4. 注册自定义实体字段
	await registerMikroOrmCustomFields(config);

	// 5. 配置 Express
	app.set('query parser', 'extended');
	app.set('trust proxy', true);
	app.enableShutdownHooks();

	// 6. 全局守卫
	app.useGlobalGuards(new AuthGuard(reflector));

	// 7. 配置日志
	if (sentry?.dsn && config.logger) {
		app.useLogger(config.logger);
	}

	// 8. 配置 CORS
	app.enableCors({
		origin: '*',
		credentials: true,
		methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Authorization', 'Language', 'Tenant-Id', ...]
	});

	// 9. 配置 Session
	await configureRedisSession(app);

	// 10. 配置 Helmet（生产环境）
	if (environment.envName === 'prod') {
		app.use(helmet());
	}

	// 11. 设置全局前缀
	app.setGlobalPrefix('api');

	// 12. 种子数据
	await seedDatabaseIfEmpty(app, appService);

	// 13. 配置 Swagger
	const swaggerPath = await setupSwagger(app);

	// 14. 启动服务器
	await app.listen(port, host);

	return app;
}
```

### 4.2 OKSAI Bootstrap 模块

**位置**：`libs/bootstrap/src/lib/`

**特点**：

-   ✅ 模块化设计（独立包）
-   ✅ 提供可重用的服务
-   ✅ 简化的启动流程
-   ✅ 支持 OpenTelemetry 多种后端
-   ✅ 支持 Redis 会话
-   ✅ 支持 Swagger 文档

**核心功能**：

```typescript
// libs/bootstrap/src/lib/services/bootstrap.service.ts
@Injectable()
export class BootstrapService implements OnApplicationShutdown {
	async bootstrap(
		AppModule: any,
		config: BootstrapConfig
	): Promise<{ app: NestExpressApplication; context: BootstrapContext }> {
		// 1. 启动 OpenTelemetry
		tracer.start();

		// 2. 创建 NestJS 应用
		this.app = await this.createApplication(AppModule, config);

		// 3. 配置 Express 中间件
		if (config.express) {
			this.configureExpress(this.app, config);
		}

		// 4. 配置监控和日志
		if (config.monitoring) {
			this.configureMonitoring(this.app, config.monitoring);
		}

		// 5. 初始化数据库
		const orm = this.app.get(MikroORM);
		await this.initializeDatabase(orm, config.database);

		// 6. 创建启动上下文
		this.context = { app, orm, ... };

		// 7. 执行自定义启动钩子
		if (config.beforeStart) {
			await config.beforeStart(this.app, this.context);
		}

		return { app: this.app, context: this.context };
	}

	async listen(port: number, host: string = '0.0.0.0'): Promise<void> {
		await this.app.listen(port, host);
	}
}
```

**导出函数**：

```typescript
// libs/bootstrap/src/lib/index.ts
export * from './lib/bootstrap.module';
export * from './lib/services/bootstrap.service';
export * from './lib/interfaces';
export * from './lib/templates';
export * from './lib/decorators';
export * from './lib/redis-store';
export * from './lib/swagger';
export { default as tracer } from './lib/tracer';
```

### 4.3 Bootstrap 模块对比

| 特性                | Gauzy                          | OKSAI                      |
| ------------------- | ------------------------------ | -------------------------- |
| **模块结构**        | 集中在 `@gauzy/core`           | 独立 `@oksai/bootstrap` 包 |
| **启动方式**        | `bootstrap(pluginConfig)` 函数 | 手动调用多个函数           |
| **配置方式**        | `ApplicationPluginConfig` 对象 | `BootstrapConfig` 对象     |
| **ORM 支持**        | TypeORM、MikroORM、Knex        | 仅 MikroORM                |
| **GraphQL**         | ✅ 支持                        | ❌ 不支持                  |
| **自动迁移**        | ✅ 支持                        | ❌ 不支持                  |
| **自动种子数据**    | ✅ 支持                        | ❌ 不支持                  |
| **实体自动注册**    | ✅ 支持                        | ❌ 不支持                  |
| **订阅者自动注册**  | ✅ 支持                        | ❌ 不支持                  |
| **全局守卫**        | ✅ AuthGuard                   | ❌ 不支持                  |
| **OpenTelemetry**   | ✅ 支持                        | ✅ 支持                    |
| **Redis Session**   | ✅ 支持                        | ✅ 支持                    |
| **Swagger**         | ✅ 支持                        | ✅ 支持                    |
| **Sentry 集成**     | ✅ 支持                        | ❌ 不支持                  |
| **PostHog 集成**    | ✅ 支持                        | ❌ 不支持                  |
| **Jitsu Analytics** | ✅ 支持                        | ❌ 不支持                  |

---

## 5. 核心功能对比

### 5.1 认证系统

#### Gauzy 认证

-   ✅ 支持多种 OAuth 提供商：
    -   Google
    -   Microsoft
    -   GitHub
    -   Facebook
    -   Twitter
    -   LinkedIn
    -   Keycloak
    -   Fiverr
    -   Auth0
-   ✅ Passport.js 集成
-   ✅ JWT Token
-   ✅ 权限管理
-   ✅ 角色管理

#### OKSAI 认证

-   ✅ 简化的 OAuth 提供商：
    -   Google
    -   Microsoft
    -   GitHub
    -   Auth0
-   ❌ 移除的 OAuth 提供商：
    -   Facebook
    -   Twitter
    -   LinkedIn
    -   Keycloak
    -   Fiverr
-   ✅ Passport.js 集成（规划中）
-   ✅ JWT Token（规划中）
-   ✅ 权限管理（规划中）
-   ✅ 角色管理（规划中）

**差异说明**：

-   ❌ OKSAI 移除了部分 OAuth 提供商以简化系统
-   ✅ 保留了常用的 OAuth 提供商（Google、Microsoft、GitHub、Auth0）
-   ⚠️ 认证系统尚未完全实现

### 5.2 数据库管理

#### Gauzy 数据库

-   ✅ 多 ORM 支持：
    -   TypeORM
    -   MikroORM
    -   Knex
-   ✅ 自动迁移
-   ✅ 自动同步（`DB_SYNCHRONIZE`）
-   ✅ 实体字段自定义
-   ✅ 多租户支持
-   ✅ 数据库种子数据

#### OKSAI 数据库

-   ✅ 单 ORM 支持：
    -   MikroORM（默认）
-   ⚠️ 计划支持：
    -   MongoDB
    -   Better-SQLite
-   ✅ 手动迁移（规划中）
-   ✅ 手动同步（规划中）
-   ❌ 不支持实体字段自定义
-   ✅ 多租户支持（规划中）
-   ❌ 不支持数据库种子数据

**差异说明**：

-   ❌ OKSAI 移除了 TypeORM 和 Knex，仅使用 MikroORM
-   ✅ 简化了数据库抽象层
-   ⚠️ 部分功能尚未实现

### 5.3 API 文档

#### Gauzy Swagger

-   ✅ 自动生成 API 文档
-   ✅ Bearer Token 认证
-   ✅ 多语言支持
-   ✅ 自定义标签
-   ✅ API 分组

#### OKSAI Swagger

-   ✅ 自动生成 API 文档
-   ✅ Bearer Token 认证
-   ❌ 不支持多语言
-   ❌ 不支持自定义标签
-   ❌ 不支持 API 分组

**差异说明**：

-   ⚠️ OKSAI Swagger 功能相对简化

### 5.4 监控和日志

#### Gauzy 监控

-   ✅ Sentry 错误追踪
-   ✅ PostHog 分析
-   ✅ Jitsu Analytics
-   ✅ OpenTelemetry 追踪
-   ✅ 自定义日志系统

#### OKSAI 监控

-   ✅ OpenTelemetry 追踪
-   ❌ 不支持 Sentry
-   ❌ 不支持 PostHog
-   ❌ 不支持 Jitsu Analytics
-   ✅ NestJS Logger

**差异说明**：

-   ❌ OKSAI 移除了 Sentry、PostHog 和 Jitsu Analytics
-   ✅ 保留了 OpenTelemetry 追踪
-   ✅ 使用 NestJS 内置 Logger

### 5.5 文件存储

#### Gauzy 文件存储

-   ✅ 支持多种存储后端：
    -   本地文件系统
    -   AWS S3
    -   MinIO
    -   Azure Blob Storage
    -   Google Cloud Storage
-   ✅ 文件上传拦截器
-   ✅ 文件验证

#### OKSAI 文件存储

-   ❌ 未实现
-   ⚠️ 规划支持：
    -   本地文件系统
    -   AWS S3
    -   MinIO

**差异说明**：

-   ❌ OKSAI 文件存储功能尚未实现

### 5.6 任务调度

#### Gauzy 任务调度

-   ✅ 支持定时任务
-   ✅ 支持 Cron 表达式
-   ✅ 任务持久化
-   ✅ 任务管理 API

#### OKSAI 任务调度

-   ❌ 未实现
-   ⚠️ 规划支持：
    -   BullMQ
    -   定时任务

**差异说明**：

-   ❌ OKSAI 任务调度功能尚未实现

---

## 6. 架构设计差异总结

### 6.1 设计理念

| 方面           | Gauzy                | OKSAI                   |
| -------------- | -------------------- | ----------------------- |
| **设计哲学**   | 功能丰富、企业级     | 简洁、核心功能优先      |
| **架构复杂度** | 高（多 ORM、多集成） | 低（单 ORM、少集成）    |
| **可扩展性**   | 高（大量插件）       | 中（基础插件 + 可扩展） |
| **学习曲线**   | 陡峭                 | 平缓                    |
| **维护成本**   | 高                   | 低                      |
| **部署复杂度** | 高                   | 低                      |

### 6.2 代码组织

| 方面         | Gauzy                | OKSAI                       |
| ------------ | -------------------- | --------------------------- |
| **包结构**   | 单体 packages + apps | Monorepo libs + apps        |
| **启动逻辑** | 集中在 `@gauzy/core` | 分散在 main.ts 和 Bootstrap |
| **插件管理** | 配置数组             | 服务管理                    |
| **依赖注入** | 自动                 | 手动注册                    |
| **模块导入** | 自动                 | 手动                        |

### 6.3 功能完整性

| 功能模块               | Gauzy | OKSAI | 状态     |
| ---------------------- | ----- | ----- | -------- |
| 认证系统               | ✅    | ⚠️    | 部分实现 |
| 租户系统               | ✅    | ⚠️    | 部分实现 |
| 用户管理               | ✅    | ⚠️    | 部分实现 |
| 组织管理               | ✅    | ⚠️    | 部分实现 |
| 角色管理               | ✅    | ⚠️    | 部分实现 |
| 审计日志               | ✅    | ⚠️    | 部分实现 |
| 时间跟踪               | ✅    | ❌    | 未实现   |
| 计时器                 | ✅    | ❌    | 未实现   |
| 截图                   | ✅    | ❌    | 未实现   |
| 集成（GitHub/Jira 等） | ✅    | ❌    | 未实现   |
| 任务调度               | ✅    | ❌    | 未实现   |
| 文件存储               | ✅    | ❌    | 未实现   |
| 报表                   | ✅    | ❌    | 未实现   |
| 知识库                 | ✅    | ❌    | 未实现   |
| 视频管理               | ✅    | ❌    | 未实现   |
| 邮件                   | ✅    | ❌    | 未实现   |
| 通知                   | ✅    | ❌    | 未实现   |
| API 文档               | ✅    | ✅    | 已实现   |
| 数据库迁移             | ✅    | ⚠️    | 部分实现 |
| 数据库种子             | ✅    | ❌    | 未实现   |
| OpenTelemetry          | ✅    | ✅    | 已实现   |
| Redis Session          | ✅    | ✅    | 已实现   |

---

## 7. 迁移建议

### 7.1 从 Gauzy 迁移到 OKSAI

#### 已完成的功能

-   ✅ 基础架构搭建
-   ✅ 插件系统核心
-   ✅ Bootstrap 模块
-   ✅ OpenTelemetry 集成
-   ✅ Redis Session 集成
-   ✅ Swagger 文档生成
-   ✅ 核心插件框架

#### 待完成的功能

-   ⚠️ 认证系统完善（Passport.js、JWT）
-   ⚠️ 租户系统完善
-   ⚠️ 用户管理完善
-   ⚠️ 组织管理完善
-   ⚠️ 角色管理完善
-   ⚠️ 审计系统完善
-   ❌ 数据库迁移系统
-   ❌ 数据库种子系统
-   ❌ 时间跟踪功能
-   ❌ 计时器功能
-   ❌ 第三方集成（GitHub、Jira 等）
-   ❌ 任务调度系统
-   ❌ 文件存储系统
-   ❌ 报表系统
-   ❌ 邮件系统
-   ❌ 通知系统
-   ❌ Sentry 集成
-   ❌ PostHog 集成

### 7.2 迁移优先级建议

#### 高优先级（核心功能）

1. **认证系统**

    - Passport.js 集成
    - JWT Token 管理
    - OAuth 2.0 支持（Google、Microsoft、GitHub）
    - 权限守卫
    - 角色权限管理

2. **租户系统**

    - 多租户架构
    - 租户隔离
    - 租户配置

3. **用户管理**

    - 用户 CRUD
    - 用户资料管理
    - 用户设置

4. **数据库迁移**
    - 迁移系统
    - 迁移 CLI
    - 自动迁移

#### 中优先级（增强功能）

5. **组织管理**

    - 组织 CRUD
    - 组织成员管理
    - 组织配置

6. **角色管理**

    - 角色 CRUD
    - 权限分配
    - 角色继承

7. **审计系统**

    - 操作日志
    - 审计查询
    - 审计报表

8. **任务调度**
    - BullMQ 集成
    - 定时任务
    - 任务管理

#### 低优先级（可选功能）

9. **文件存储**

    - 本地存储
    - S3 存储
    - 文件管理 API

10. **邮件系统**

    - SMTP 配置
    - 邮件模板
    - 邮件队列

11. **通知系统**

    - 通知类型
    - 通知渠道
    - 通知历史

12. **第三方集成**

    - GitHub 集成
    - Jira 集成
    - Upwork 集成

13. **监控集成**

    - Sentry 集成
    - PostHog 集成

14. **报表系统**

    - 报表生成
    - 数据可视化
    - 导出功能

15. **知识库**
    - 文章管理
    - 分类标签
    - 搜索功能

---

## 8. 总结

### 8.1 主要差异

| 维度             | Gauzy | OKSAI             |
| ---------------- | ----- | ----------------- |
| **架构复杂度**   | 高    | 低                |
| **功能完整性**   | 高    | 低                |
| **插件数量**     | 20+   | 18（基础 + 可选） |
| **ORM 支持**     | 3 个  | 1 个（计划 3 个） |
| **OAuth 提供商** | 9 个  | 4 个              |
| **第三方集成**   | 8+ 个 | 0 个              |
| **监控工具**     | 4 个  | 1 个              |
| **学习曲线**     | 陡峭  | 平缓              |
| **维护成本**     | 高    | 低                |
| **部署复杂度**   | 高    | 低                |

### 8.2 OKSAI 的优势

1. ✅ **架构简洁**：移除了不必要的复杂性
2. ✅ **易于理解**：代码清晰，注释详细
3. ✅ **易于维护**：模块化设计，职责明确
4. ✅ **易于扩展**：插件系统灵活，易于添加新功能
5. ✅ **现代化**：使用最新的技术栈和最佳实践
6. ✅ **文档完善**：提供详细的培训教程和 API 文档
7. ✅ **代码规范**：统一的代码风格和注释规范

### 8.3 OKSAI 的不足

1. ⚠️ **功能不完整**：许多功能尚未实现
2. ⚠️ **第三方集成缺失**：没有与 GitHub、Jira 等平台的集成
3. ⚠️ **监控工具单一**：仅支持 OpenTelemetry
4. ⚠️ **测试覆盖不足**：单元测试和集成测试尚未完善
5. ⚠️ **生产环境未验证**：尚未在生产环境中验证

### 8.4 建议

1. **短期目标（1-3 个月）**：

    - 完善核心插件（Auth、Tenant、User、Organization、Role、Audit）
    - 实现数据库迁移系统
    - 实现数据库种子系统
    - 完善认证系统（Passport.js、JWT、OAuth）
    - 完善租户系统

2. **中期目标（3-6 个月）**：

    - 实现任务调度系统
    - 实现文件存储系统
    - 实现邮件系统
    - 实现通知系统
    - 完善测试覆盖

3. **长期目标（6-12 个月）**：
    - 实现第三方集成（GitHub、Jira、Upwork）
    - 实现监控系统（Sentry、PostHog）
    - 实现报表系统
    - 实现知识库
    - 生产环境部署和验证

---

## 附录

### A. 相关文档

-   [OKSAI 启动流程与插件系统培训教程](./startup-and-plugin-system-guide.md)
-   [NestJS 文档](https://docs.nestjs.com/)
-   [MikroORM 文档](https://mikro-orm.io/docs/)
-   [OpenTelemetry 文档](https://opentelemetry.io/docs/)

### B. 术语表

| 术语  | 说明             |
| ----- | ---------------- |
| ORM   | 对象关系映射     |
| OAuth | 开放授权协议     |
| JWT   | JSON Web Token   |
| CLI   | 命令行接口       |
| E2E   | 端到端测试       |
| OTEL  | OpenTelemetry    |
| API   | 应用程序编程接口 |

### C. 版本历史

| 版本  | 日期       | 说明     |
| ----- | ---------- | -------- |
| 1.0.0 | 2025-02-06 | 初始版本 |

---

**文档版本**: 1.0.0
**最后更新**: 2025-02-06
**维护者**: OKSAI Team
