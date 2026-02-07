# @oksai/bootstrap

共享启动器模块，支持插件启动、数据库初始化、Express 配置和监控日志。

## 功能特性

-   **插件启动管理**：集成 `@oksai/plugin`，自动注册和加载核心插件
-   **数据库初始化**：支持 MikroORM 数据库迁移、同步和种子数据填充
-   **Express 配置**：自动配置 CORS、helmet、请求体解析等中间件
-   **监控和日志**：内置健康检查、性能监控和请求日志
-   **预设模板**：提供 API、MCP、Worker 等服务类型的预设配置
-   **混合配置方式**：支持预设模板和自定义配置函数

## 安装

```bash
pnpm add @oksai/bootstrap
```

## 使用方式

### 1. 使用预设模板启动 API 服务

```typescript
import { Module } from '@nestjs/common';
import { BootstrapService, ApiTemplate, ServiceType } from '@oksai/bootstrap';
import { AppModule } from './app.module';

@Module({
	imports: [AppModule],
	providers: [BootstrapService]
})
export class BootstrapModule {
	constructor(private readonly bootstrap: BootstrapService) {}

	async onModuleInit() {
		// 使用 API 预设模板
		const apiTemplate = new ApiTemplate();
		const config = apiTemplate.getConfig({
			serviceName: 'my-api-service',
			database: {
				connection: {
					// 数据库连接配置
				}
			}
		});

		// 启动应用
		const { app } = await this.bootstrap.bootstrap(AppModule, config);

		// 监听端口
		await this.bootstrap.listen(3000, '0.0.0.0');
	}
}
```

### 2. 自定义配置启动

```typescript
import { BootstrapConfig, ServiceType } from '@oksai/bootstrap';

const config: BootstrapConfig = {
	serviceType: ServiceType.API,
	serviceName: 'custom-service',

	database: {
		connection: {
			// 数据库配置
		},
		runMigrations: true,
		synchronize: false,
		seedIfEmpty: true
	},

	express: {
		globalPrefix: 'api',
		cors: {
			origin: 'https://example.com',
			credentials: true
		},
		enableHelmet: true,
		bodyLimit: '100mb',
		enableSwagger: true,
		swaggerPath: 'docs'
	},

	monitoring: {
		enableHealthCheck: true,
		healthCheckPath: '/health',
		enablePerformanceMonitoring: true,
		enableRequestLogging: true
	},

	plugins: {
		corePlugins: ['auth', 'tenant', 'user'],
		optionalPlugins: {
			audit: true
		},
		autoLoad: true
	},

	beforeStart: async (app, context) => {
		// 自定义启动钩子
		console.log('Service:', context.serviceName);
	}
};

const { app } = await bootstrap.bootstrap(AppModule, config);
```

### 3. 使用 Worker 模板

```typescript
import { WorkerTemplate } from '@oksai/bootstrap';

const workerTemplate = new WorkerTemplate();
const config = workerTemplate.getConfig({
	serviceName: 'email-worker',
	database: {
		connection: {
			// 数据库配置
		}
	}
});

const { app } = await bootstrap.bootstrap(AppModule, config);
```

### 4. 使用 MCP 模板

```typescript
import { McpTemplate } from '@oksai/bootstrap';

const mcpTemplate = new McpTemplate();
const config = mcpTemplate.getConfig({
	serviceName: 'ai-mcp-service',
	database: {
		connection: {
			// 数据库配置
		}
	}
});

const { app } = await bootstrap.bootstrap(AppModule, config);
```

## 配置选项

### BootstrapConfig

| 属性        | 类型                            | 必需 | 说明                                 |
| ----------- | ------------------------------- | ---- | ------------------------------------ |
| serviceType | ServiceType                     | 是   | 服务类型（API/MCP/Worker/CRON/GRPC） |
| serviceName | string                          | 是   | 服务名称                             |
| database    | DatabaseConfig                  | 是   | 数据库配置                           |
| express     | ExpressConfig                   | 否   | Express 配置（仅 API 服务需要）      |
| monitoring  | MonitoringConfig                | 否   | 监控配置                             |
| plugins     | PluginConfig                    | 是   | 插件配置                             |
| beforeStart | (app, context) => Promise<void> | 否   | 启动前钩子                           |
| onShutdown  | (app, context) => Promise<void> | 否   | 关闭钩子                             |

### DatabaseConfig

| 属性          | 类型            | 默认值 | 说明               |
| ------------- | --------------- | ------ | ------------------ |
| connection    | MikroORMOptions | -      | MikroORM 连接配置  |
| runMigrations | boolean         | false  | 是否运行迁移       |
| synchronize   | boolean         | false  | 是否同步数据库结构 |
| seedIfEmpty   | boolean         | false  | 是否自动填充数据   |

### ExpressConfig

| 属性          | 类型        | 默认值     | 说明             |
| ------------- | ----------- | ---------- | ---------------- |
| globalPrefix  | string      | 'api'      | 全局路由前缀     |
| cors          | CorsOptions | -          | CORS 配置        |
| enableHelmet  | boolean     | true       | 是否启用 helmet  |
| bodyLimit     | string      | '50mb'     | 请求体大小限制   |
| enableSwagger | boolean     | true       | 是否启用 Swagger |
| swaggerPath   | string      | 'api-docs' | Swagger 文档路径 |

### MonitoringConfig

| 属性                        | 类型    | 默认值    | 说明             |
| --------------------------- | ------- | --------- | ---------------- |
| enableHealthCheck           | boolean | true      | 是否启用健康检查 |
| healthCheckPath             | string  | '/health' | 健康检查端点     |
| enablePerformanceMonitoring | boolean | true      | 是否启用性能监控 |
| enableRequestLogging        | boolean | true      | 是否启用请求日志 |

### PluginConfig

| 属性            | 类型                    | 默认值 | 说明             |
| --------------- | ----------------------- | ------ | ---------------- |
| corePlugins     | string[]                | -      | 核心插件列表     |
| optionalPlugins | Record<string, boolean> | -      | 可选插件列表     |
| autoLoad        | boolean                 | false  | 是否自动加载插件 |

## 服务类型

| 类型               | 说明                        |
| ------------------ | --------------------------- |
| ServiceType.API    | HTTP API 服务               |
| ServiceType.MCP    | Model Context Protocol 服务 |
| ServiceType.WORKER | 后台任务处理服务            |
| ServiceType.CRON   | 定时任务服务                |
| ServiceType.GRPC   | gRPC 服务                   |

## 依赖项

-   `@nestjs/common`
-   `@nestjs/config`
-   `@nestjs/core`
-   `@nestjs/platform-express`
-   `@mikro-orm/core`
-   `@mikro-orm/nestjs`
-   `@oksai/plugin`
-   `express`
-   `helmet`

## 许可证

MIT
