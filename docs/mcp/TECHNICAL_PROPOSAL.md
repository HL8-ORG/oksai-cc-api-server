# @oksai/platform MCP 服务端技术方案

**版本**: v1.1
**创建日期**: 2025-02-09
**最后更新**: 2026-02-10
**状态**: 进行中

---

## 文档目录

-   [1. 项目概述](#1-项目概述)
-   [2. 目标与范围](#2-目标与范围)
-   [3. 技术架构设计](#3-技术架构设计)
-   [4. 组件设计详情](#4-组件设计详情)
-   [5. 技术选型](#5-技术选型)
-   [6. 开发计划](#6-开发计划)
-   [7. 风险评估](#7-风险评估)
-   [8. 成功标准](#8-成功标准)

---

## 1. 项目概述

### 1.1 背景

MCP（Model Context Protocol，模型上下文协议）是一种标准化的 AI 助手与外部系统交互的协议。`@oksai/platform` 需要构建一个完整的 MCP 服务端框架，以支持 Claude Desktop、ChatGPT 等 AI 助手安全、高效地访问平台资源。

### 1.2 参考项目

本项目参考 `qauzy-backup` 以下模块的设计和实现：

| 模块             | 路径                  | 说明                        |
| ---------------- | --------------------- | --------------------------- |
| MCP 服务器应用   | `apps/mcp`            | 入口应用，支持三种传输层    |
| OAuth 授权服务器 | `apps/mcp-auth`       | OAuth 2.0 授权服务          |
| MCP 核心包       | `packages/mcp-server` | 核心 MCP 实现和工具注册框架 |

### 1.3 设计原则

| 原则           | 说明                                 |
| -------------- | ------------------------------------ |
| **模块化设计** | 各组件职责单一，低耦合高内聚         |
| **类型安全**   | 使用严格 TypeScript 类型，避免 `any` |
| **标准合规**   | 遵循 MCP 规范和 OAuth 2.0 RFC 标准   |
| **可扩展性**   | 支持动态工具注册，易于扩展新功能     |
| **中文优先**   | 代码注释和文档使用中文               |
| **测试驱动**   | 核心逻辑测试覆盖率达到 80% 以上      |

---

## 2. 目标与范围

### 2.1 阶段目标

**本阶段目标**：构建 MCP 服务端框架，为后续业务功能开发奠定基础。

**不包含**：

-   完整的业务工具实现（323 个 Gauzy 工具不迁移）
-   复杂的 OAuth 授权流程（简化版即可）
-   生产环境优化（性能调优、安全加固等）

### 2.2 核心功能

| 功能               | 描述                           | 优先级 |
| ------------------ | ------------------------------ | ------ |
| **三种传输层**     | Stdio、HTTP、WebSocket         | P0     |
| **工具注册机制**   | 支持动态注册和调用 MCP 工具    | P0     |
| **OAuth 2.0 授权** | 简化版授权服务器（JWT + JWKS） | P1     |
| **会话管理**       | 支持内存和 Redis 会话存储      | P1     |
| **类型安全**       | 完整的 TypeScript 类型定义     | P0     |
| **测试覆盖**       | 核心逻辑 ≥80% 覆盖率           | P0     |

---

## 3. 技术架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI 助手客户端                           │
│  (Claude Desktop / ChatGPT / 自定义应用)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MCP 传输层                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │  Stdio    │  │   HTTP    │  │    WebSocket       │  │
│  │ Transport  │  │ Transport  │  │    Transport      │  │
│  └─────┬─────┘  └─────┬─────┘  └──────────┬──────────┘  │
└────────┼───────────────┼───────────────────┼─────────────────┘
         │               │                   │
         └───────────────┴───────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   @oksai/mcp-server                         │
│                  (核心 MCP 实现包)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │    工具     │  │   会话管理   │  │  OAuth 中间件   │  │
│  │   注册器     │  │  Session     │  │   Middleware   │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼──────────────────┼───────────────────┼────────────┘
          │                  │                   │
          └──────────────────┴───────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 @oksai/core 基础设施                          │
│        (MikroORM / 配置 / 日志 / 工具库)                      │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  @oksai/base-api                            │
│              (业务 API 服务器 - 数据源)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                @oksai/mcp-auth                              │
│              (OAuth 2.0 授权服务器)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  JWT 签名   │  │   JWKS 端点  │  │  用户认证服务    │  │
│  │   /验证     │  │             │  │  (MikroORM)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      Redis      │
                    │   (可选会话存储)  │
                    └─────────────────┘
```

### 3.2 分层架构

| 层级           | 组件                    | 职责                             |
| -------------- | ----------------------- | -------------------------------- |
| **传输层**     | `transports/`           | 处理 Stdio、HTTP、WebSocket 通信 |
| **MCP 协议层** | `mcp-server.ts`         | 实现 MCP 协议规范                |
| **工具层**     | `tools/`                | MCP 工具注册和执行               |
| **授权层**     | `common/authorization*` | OAuth 2.0 授权验证               |
| **会话层**     | `session/`              | 会话存储和管理                   |
| **基础设施层** | `common/`               | API 客户端、认证管理、工具库     |
| **数据层**     | `@oksai/core`           | MikroORM 数据访问                |

---

## 4. 组件设计详情

### 4.1 @oksai/mcp-server（核心包）

#### 4.1.1 目录结构

```
libs/mcp-server/
├── src/
│   ├── lib/
│   │   ├── mcp-server.ts              # 核心 MCP 服务器实现
│   │   ├── mcp-server-manager.ts      # 服务器生命周期管理
│   │   ├── transports/               # 传输层实现
│   │   │   ├── transport-factory.ts  # 传输层工厂
│   │   │   ├── stdio-transport.ts   # Stdio 传输
│   │   │   ├── http-transport.ts    # HTTP 传输（JSON-RPC）
│   │   │   └── websocket-transport.ts # WebSocket 传输
│   │   ├── tools/                   # 工具层
│   │   │   ├── index.ts             # 工具注册器
│   │   │   ├── base-tool.ts        # 工具基类
│   │   │   ├── tool-registry.ts    # 工具注册表
│   │   │   └── schema.ts          # 工具输入输出 schema
│   │   ├── common/                 # 公共模块
│   │   │   ├── api-client.ts       # 类型化 API 客户端
│   │   │   ├── auth-manager.ts     # 认证管理器
│   │   │   ├── error-utils.ts     # 错误处理工具
│   │   │   ├── security-logger.ts # 安全日志记录
│   │   │   ├── auth-types.ts      # OAuth 类型定义
│   │   │   ├── authorization-middleware.ts # 授权中间件
│   │   │   └── authorization-utils.ts    # 授权工具
│   │   ├── session/                # 会话管理
│   │   │   ├── session-manager.ts # 会话管理器
│   │   │   ├── session-storage.ts  # 会话存储接口
│   │   │   ├── memory-storage.ts  # 内存存储实现
│   │   │   └── redis-storage.ts   # Redis 存储实现（可选）
│   │   ├── config/                 # 配置模块
│   │   │   ├── server-info.ts     # 服务器信息
│   │   │   └── protocol.ts       # MCP 协议配置
│   │   └── environments/           # 环境配置
│   │       ├── index.ts
│   │       ├── environment.ts
│   │       └── environment.prod.ts
│   └── index.ts                   # 包导出
├── package.json
├── tsconfig.lib.json
├── tsconfig.json
└── README.md
```

#### 4.1.2 核心类设计

##### McpServer 类

```typescript
/**
 * MCP 服务器核心类
 *
 * 实现完整的 MCP 协议，支持工具注册、调用和会话管理
 */
export class McpServer {
	/**
	 * 构造函数
	 * @param config - 服务器配置
	 * @param sessionId - 会话 ID（可选）
	 */
	constructor(config: McpServerConfig, sessionId?: string);

	/**
	 * 注册 MCP 工具
	 * @param tool - 工具定义
	 */
	registerTool(tool: McpToolDefinition): void;

	/**
	 * 调用 MCP 工具
	 * @param name - 工具名称
	 * @param args - 工具参数
	 * @returns 工具执行结果
	 */
	async invokeTool(name: string, args: Record<string, unknown>): Promise<McpToolResult>;

	/**
	 * 启动服务器
	 * @param transport - 传输层类型
	 */
	async start(transport: TransportType): Promise<void>;

	/**
	 * 停止服务器
	 */
	async stop(): Promise<void>;

	/**
	 * 获取服务器状态
	 * @returns 服务器状态信息
	 */
	getStatus(): McpServerStatus;

	/**
	 * 获取已注册的工具列表
	 * @returns 工具列表
	 */
	listTools(): McpToolDefinition[];
}
```

##### McpServerManager 类

```typescript
/**
 * MCP 服务器管理器
 *
 * 管理服务器生命周期，支持启动、停止、重启操作
 */
export class McpServerManager {
	/**
	 * 启动 MCP 服务器
	 * @param config - 服务器配置
	 * @returns 是否启动成功
	 */
	async start(config: McpServerConfig): Promise<boolean>;

	/**
	 * 停止 MCP 服务器
	 * @returns 是否停止成功
	 */
	async stop(): Promise<boolean>;

	/**
	 * 重启 MCP 服务器
	 * @returns 是否重启成功
	 */
	async restart(): Promise<boolean>;

	/**
	 * 获取服务器状态
	 * @returns 服务器状态
	 */
	getStatus(): McpServerStatus;
}
```

##### ApiClient 类

```typescript
/**
 * 类型化 API 客户端
 *
 * 封装 HTTP 请求，支持自动认证和错误处理
 */
export class ApiClient {
	/**
	 * 构造函数
	 * @param config - 客户端配置
	 */
	constructor(config: ApiClientConfig);

	/**
	 * 发送 GET 请求
	 * @param path - 请求路径
	 * @param config - 请求配置
	 * @returns 响应数据
	 */
	get<T>(path: string, config?: RequestConfig): Promise<T>;

	/**
	 * 发送 POST 请求
	 * @param path - 请求路径
	 * @param data - 请求数据
	 * @param config - 请求配置
	 * @returns 响应数据
	 */
	post<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T>;

	/**
	 * 发送 PUT 请求
	 * @param path - 请求路径
	 * @param data - 请求数据
	 * @param config - 请求配置
	 * @returns 响应数据
	 */
	put<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T>;

	/**
	 * 发送 DELETE 请求
	 * @param path - 请求路径
	 * @param config - 请求配置
	 * @returns 响应数据
	 */
	delete<T>(path: string, config?: RequestConfig): Promise<T>;

	/**
	 * 配置客户端
	 * @param config - 配置选项
	 */
	configure(config: Partial<ApiClientConfig>): void;
}
```

##### AuthManager 类

```typescript
/**
 * 认证管理器
 *
 * 管理用户登录、登出和令牌刷新
 */
export class AuthManager {
	/**
	 * 用户登录
	 * @param email - 用户邮箱
	 * @param password - 用户密码
	 * @returns 是否登录成功
	 */
	async login(email?: string, password?: string): Promise<boolean>;

	/**
	 * 用户登出
	 */
	async logout(): Promise<void>;

	/**
	 * 刷新访问令牌
	 * @returns 是否刷新成功
	 */
	async refreshToken(): Promise<boolean>;

	/**
	 * 获取访问令牌
	 * @returns 访问令牌或 null
	 */
	getAccessToken(): string | null;

	/**
	 * 获取当前用户 ID
	 * @returns 用户 ID 或 null
	 */
	getUserId(): string | null;

	/**
	 * 获取当前组织 ID
	 * @returns 组织 ID 或 null
	 */
	getOrganizationId(): string | null;

	/**
	 * 获取当前租户 ID
	 * @returns 租户 ID 或 null
	 */
	getTenantId(): string | null;

	/**
	 * 检查是否已认证
	 * @returns 是否已认证
	 */
	isAuthenticated(): boolean;

	/**
	 * 确保令牌有效，必要时刷新
	 * @returns 是否有有效令牌
	 */
	async ensureValidToken(): Promise<boolean>;

	/**
	 * 获取认证状态
	 * @returns 认证状态信息
	 */
	getAuthStatus(): AuthStatus;
}
```

### 4.2 @oksai/mcp（入口应用）

#### 4.2.1 目录结构

```
apps/mcp/
├── src/
│   ├── index.ts                      # 主入口文件
│   └── environments/                # 环境配置
│       ├── index.ts
│       ├── environment.ts
│       └── environment.prod.ts
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── README.md
```

#### 4.2.2 主入口设计

```typescript
/**
 * MCP 应用主入口
 *
 * 创建并启动 MCP 服务器，支持三种传输层
 */
import { createAndStartMcpServer } from '@oksai/mcp-server';
import { Logger } from '@nestjs/common';

const logger = new Logger('McpApp');

async function main() {
	try {
		logger.log('🚀 启动 @oksai MCP 服务器...');

		// 创建并启动 MCP 服务器
		const { server, transport } = await createAndStartMcpServer();

		logger.log(`✅ MCP 服务器已启动`);
		logger.log(`📡 传输类型: ${transport.type}`);

		if (transport.type === 'http' && transport.url) {
			logger.log(`🌐 HTTP 端点: ${transport.url}`);
			logger.log(`   - POST ${transport.url}/sse (JSON-RPC)`);
			logger.log(`   - GET  ${transport.url}/health`);
		} else if (transport.type === 'websocket' && transport.url) {
			logger.log(`🔌 WebSocket 端点: ${transport.url}`);
			logger.log(`   - ws://${transport.url}/sse`);
		} else {
			logger.log('📟 Stdio 传输模式，等待 AI 助手连接...');
		}
	} catch (error) {
		logger.error('❌ 启动失败', error);
		process.exit(1);
	}
}

// 优雅关闭处理
process.on('SIGINT', () => {
	logger.log('🛑 收到 SIGINT，优雅关闭...');
	process.exit(0);
});

process.on('SIGTERM', () => {
	logger.log('🛑 收到 SIGTERM，优雅关闭...');
	process.exit(0);
});

main();
```

### 4.3 @oksai/mcp-auth（OAuth 授权服务器）

#### 4.3.1 目录结构

```
apps/mcp-auth/
├── src/
│   ├── main.ts                      # 主入口文件
│   ├── app.module.ts                # 根模块
│   ├── mcp-oauth/                  # OAuth 模块
│   │   ├── mcp-oauth.module.ts
│   │   ├── mcp-oauth.service.ts
│   │   ├── mcp-oauth.controller.ts
│   │   └── dto/                   # 数据传输对象
│   │       ├── authorize.dto.ts
│   │       ├── token.dto.ts
│   │       └── introspect.dto.ts
│   ├── user/                       # 用户模块
│   │   ├── user.module.ts
│   │   └── user.service.ts
│   └── entities/                   # 实体定义
│       └── user.entity.ts
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── README.md
```

#### 4.3.2 OAuth 端点设计

| 端点                     | 方法 | 说明                              |
| ------------------------ | ---- | --------------------------------- |
| `/oauth/introspect`      | GET  | 令牌内省端点                      |
| `/.well-known/jwks.json` | GET  | JWKS 公钥端点（HS256 模式返回空） |
| `/health`                | GET  | 健康检查端点                      |

> **注**: 当前实现为简化版 OAuth 2.0，仅提供 JWKS 端点和令牌内省端点。完整授权流程（authorize、token 端点）待后续迭代实现。

---

## 5. 技术选型

### 5.1 核心技术栈

| 技术           | 版本 | 用途     | 选择理由               |
| -------------- | ---- | -------- | ---------------------- |
| **Node.js**    | 22+  | 运行时   | 长期支持版本，性能优秀 |
| **TypeScript** | 5.9+ | 编程语言 | 类型安全，开发体验好   |
| **NestJS**     | 11.x | Web 框架 | 企业级框架，模块化设计 |
| **MikroORM**   | 6.x  | ORM      | 符合项目规范，类型安全 |
| **PostgreSQL** | 16+  | 数据库   | 关系型数据库，性能优秀 |

### 5.2 MCP 相关依赖

| 技术                          | 版本  | 用途        | 选择理由             |
| ----------------------------- | ----- | ----------- | -------------------- |
| **@modelcontextprotocol/sdk** | 1.13+ | MCP SDK     | 官方 SDK，功能完整   |
| **axios**                     | 1.9+  | HTTP 客户端 | 成熟稳定，拦截器支持 |
| **express**                   | 5.x   | Web 服务器  | 轻量级，生态丰富     |
| **ws**                        | 8.x   | WebSocket   | 高性能，广泛使用     |
| **express-rate-limit**        | 8.x   | 限流        | 保护 API，防止滥用   |
| **cookie-parser**             | 1.x   | Cookie 解析 | Express 中间件       |
| **cors**                      | 2.x   | CORS 支持   | 跨域资源共享         |

### 5.3 OAuth 相关依赖

| 技术              | 版本 | 用途         | 选择理由               |
| ----------------- | ---- | ------------ | ---------------------- |
| **jsonwebtoken**  | 9.x  | JWT 处理     | 成熟稳定，社区广泛使用 |
| **bcryptjs**      | 3.x  | 密码哈希     | 安全，广泛使用         |
| **uuid**          | 13.x | ID 生成      | 标准 UUID 实现         |
| **ioredis**       | 5.x  | Redis 客户端 | 高性能，Promise 支持   |
| **connect-redis** | 7.x  | Redis 会话   | Express 会话存储       |

> **注**: 简化版 OAuth 2.0 使用 HS256 对称加密算法，不需要公钥分发（JWKS 为空）。未来可扩展为 RS256 非对称加密。

### 5.4 其他依赖

| 技术                   | 版本 | 用途        | 选择理由             |
| ---------------------- | ---- | ----------- | -------------------- |
| **zod**                | 4.x  | 数据验证    | 类型安全，运行时验证 |
| **zod-to-json-schema** | 3.x  | Schema 转换 | Zod 到 JSON Schema   |
| **helmet**             | 4.x  | 安全头      | HTTP 安全增强        |
| **escape-html**        | 1.x  | HTML 转义   | XSS 防护             |

---

## 6. 开发计划

### 6.1 里程碑概览

| 里程碑 | 目标                                 | 预计完成  |
| ------ | ------------------------------------ | --------- |
| **M1** | @oksai/mcp-server 核心框架           | 第 2 周末 |
| **M2** | @oksai/mcp 入口应用                  | 第 3 周初 |
| **M3** | @oksai/mcp-auth 授权服务器（简化版） | 第 3 周末 |
| **M4** | 测试套件和文档                       | 第 4 周末 |

### 6.2 详细开发任务

#### 阶段 1: 基础设施准备（第 1 周）

| 任务                          | 工作量 | 依赖         | 负责人 | 状态     |
| ----------------------------- | ------ | ------------ | ------ | -------- |
| 创建 libs/mcp-server 目录结构 | 0.5 天 | 无           | -      | ⏸ 待开始 |
| 创建 apps/mcp 目录结构        | 0.5 天 | 无           | -      | ⏸ 待开始 |
| 创建 apps/mcp-auth 目录结构   | 0.5 天 | 无           | -      | ⏸ 待开始 |
| 配置 package.json 和依赖      | 0.5 天 | 目录结构     | -      | ⏸ 待开始 |
| 配置 TypeScript 编译          | 0.5 天 | package.json | -      | ⏸ 待开始 |
| 配置 Jest 测试环境            | 0.5 天 | TypeScript   | -      | ⏸ 待开始 |

**小计**: 3 天

#### 阶段 2: @oksai/mcp-server 核心框架（第 2 周）

##### 2.1 传输层（2 天）

| 任务                                          | 工作量 | 依赖 | 状态     |
| --------------------------------------------- | ------ | ---- | -------- |
| 实现 transport-factory.ts（传输层工厂）       | 0.5 天 | 无   | ⏸ 待开始 |
| 实现 stdio-transport.ts（Stdio 传输）         | 0.5 天 | 工厂 | ⏸ 待开始 |
| 实现 http-transport.ts（HTTP 传输）           | 0.5 天 | 工厂 | ⏸ 待开始 |
| 实现 websocket-transport.ts（WebSocket 传输） | 0.5 天 | 工厂 | ⏸ 待开始 |

**小计**: 2 天

##### 2.2 工具层（1.5 天）

| 任务                                | 工作量 | 依赖   | 状态     |
| ----------------------------------- | ------ | ------ | -------- |
| 实现 base-tool.ts（工具基类）       | 0.5 天 | 无     | ⏸ 待开始 |
| 实现 tool-registry.ts（工具注册表） | 0.5 天 | 基类   | ⏸ 待开始 |
| 实现 index.ts（工具注册器）         | 0.5 天 | 注册表 | ⏸ 待开始 |

**小计**: 1.5 天

##### 2.3 公共模块（2 天）

| 任务                                    | 工作量 | 依赖       | 状态     |
| --------------------------------------- | ------ | ---------- | -------- |
| 实现 api-client.ts（类型化 API 客户端） | 1 天   | 无         | ⏸ 待开始 |
| 实现 auth-manager.ts（认证管理器）      | 1 天   | API 客户端 | ⏸ 待开始 |
| 实现 error-utils.ts（错误处理工具）     | 0.5 天 | 无         | ⏸ 待开始 |
| 实现 security-logger.ts（安全日志）     | 0.5 天 | 无         | ⏸ 待开始 |

**小计**: 2 天

##### 2.4 会话管理（1 天）

| 任务                                  | 工作量 | 依赖 | 状态     |
| ------------------------------------- | ------ | ---- | -------- |
| 实现 session-storage.ts（存储接口）   | 0.5 天 | 无   | ⏸ 待开始 |
| 实现 memory-storage.ts（内存存储）    | 0.5 天 | 接口 | ⏸ 待开始 |
| 实现 session-manager.ts（会话管理器） | 0.5 天 | 存储 | ⏸ 待开始 |

**小计**: 1 天

##### 2.5 核心 MCP 服务器（1.5 天）

| 任务                                       | 工作量 | 依赖       | 状态     |
| ------------------------------------------ | ------ | ---------- | -------- |
| 实现 mcp-server.ts（核心 MCP 服务器）      | 1 天   | 所有模块   | ⏸ 待开始 |
| 实现 mcp-server-manager.ts（服务器管理器） | 0.5 天 | MCP 服务器 | ⏸ 待开始 |

**小计**: 1.5 天

**阶段 2 小计**: 8 天

#### 阶段 3: @oksai/mcp 入口应用（第 3 周初）

| 任务                        | 工作量 | 依赖              | 状态     |
| --------------------------- | ------ | ----------------- | -------- |
| 实现主入口 index.ts         | 0.5 天 | @oksai/mcp-server | ⏸ 待开始 |
| 实现环境配置 environment.ts | 0.5 天 | 无                | ⏸ 待开始 |
| 编写 README.md              | 0.5 天 | 主入口            | ⏸ 待开始 |

**小计**: 1.5 天

#### 阶段 4: @oksai/mcp-auth 授权服务器（第 3 周末）

##### 4.1 OAuth 核心（2.5 天）

| 任务                                     | 工作量 | 依赖 | 状态    |
| ---------------------------------------- | ------ | ---- | ------- |
| 实现 JWT 签名和验证（使用 jsonwebtoken） | 1 天   | 无   | ✅ 完成 |
| 实现 JWKS 公钥端点                       | 0.5 天 | JWT  | ✅ 完成 |
| 实现令牌内省端点                         | 0.5 天 | JWT  | ✅ 完成 |

**小计**: 2.5 天

##### 4.2 用户认证（1.5 天）

| 任务                                      | 工作量 | 依赖 | 状态     |
| ----------------------------------------- | ------ | ---- | -------- |
| 实现 user.entity.ts（用户实体，MikroORM） | 0.5 天 | 无   | ⏸ 待开始 |
| 实现 user.service.ts（用户服务）          | 1 天   | 实体 | ⏸ 待开始 |

**小计**: 1.5 天

**阶段 4 小计**: 4 天

#### 阶段 5: 测试和文档（第 4 周）

##### 5.1 单元测试（2 天）

| 任务                               | 工作量 | 依赖       | 状态     |
| ---------------------------------- | ------ | ---------- | -------- |
| 测试传输层（transports/）          | 0.5 天 | 传输层实现 | ⏸ 待开始 |
| 测试 API 客户端（api-client.ts）   | 0.5 天 | API 客户端 | ⏸ 待开始 |
| 测试认证管理器（auth-manager.ts）  | 0.5 天 | 认证管理器 | ⏸ 待开始 |
| 测试工具注册器（tool-registry.ts） | 0.5 天 | 工具注册器 | ⏸ 待开始 |

**小计**: 2 天

##### 5.2 集成测试（1 天）

| 任务                          | 工作量 | 依赖       | 状态     |
| ----------------------------- | ------ | ---------- | -------- |
| 测试 MCP 服务器启动和工具调用 | 0.5 天 | MCP 服务器 | ⏸ 待开始 |
| 测试 OAuth 授权流程           | 0.5 天 | OAuth 服务 | ⏸ 待开始 |

**小计**: 1 天

##### 5.3 文档（1.5 天）

| 任务                          | 工作量  | 依赖       | 状态     |
| ----------------------------- | ------- | ---------- | -------- |
| 为公共 API 添加 TSDoc 注释    | 1 天    | 所有代码   | ⏸ 待开始 |
| 编写 @oksai/mcp-server README | 0.25 天 | 包实现     | ⏸ 待开始 |
| 编写 @oksai/mcp README        | 0.25 天 | 应用实现   | ⏸ 待开始 |
| 编写 @oksai/mcp-auth README   | 0.25 天 | OAuth 实现 | ⏸ 待开始 |

**小计**: 1.5 天

**阶段 5 小计**: 4.5 天

### 6.3 时间线汇总

| 阶段                               | 工作量 | 累计    | 完成时间  |
| ---------------------------------- | ------ | ------- | --------- |
| 阶段 1: 基础设施准备               | 3 天   | 3 天    | 第 1 周末 |
| 阶段 2: @oksai/mcp-server 核心框架 | 8 天   | 11 天   | 第 2 周末 |
| 阶段 3: @oksai/mcp 入口应用        | 1.5 天 | 12.5 天 | 第 3 周初 |
| 阶段 4: @oksai/mcp-auth 授权服务器 | 4 天   | 16.5 天 | 第 3 周末 |
| 阶段 5: 测试和文档                 | 4.5 天 | 21 天   | 第 4 周末 |

**总工作量**: 21 天（约 4.2 周）

---

## 7. 风险评估

### 7.1 风险识别

| 风险                        | 严重性 | 可能性 | 影响                               | 缓解措施 |
| --------------------------- | ------ | ------ | ---------------------------------- | -------- |
| **OAuth 2.0 实现复杂性**    | 🔴 高  | 🟡 中  | 实现简化版，后续迭代优化           |
| **TypeORM → MikroORM 迁移** | 🔴 高  | 🟡 中  | 参考现有 MikroORM 实现，渐进式迁移 |
| **时间估算偏差**            | 🟡 中  | 🟡 中  | 预留缓冲时间，优先实现核心功能     |
| **Redis 依赖引入**          | 🟡 中  | 🟡 中  | 可选功能，初期使用内存存储         |
| **测试覆盖率不达标**        | 🟡 中  | 🟡 中  | 测试驱动开发，核心功能优先测试     |
| **依赖包兼容性问题**        | 🟢 低  | 🟢 低  | 使用稳定版本，充分测试             |
| **团队成员知识储备不足**    | 🟡 中  | 🟡 中  | 提前技术分享，参考项目文档         |

### 7.2 风险应对策略

#### 高优先级风险应对

**风险 1: OAuth 2.0 实现复杂性**

-   **描述**: OAuth 2.0 规范复杂，完整实现工作量大
-   **应对策略**:
    -   使用 `jsonwebtoken` 库简化 JWT 处理
    -   首期实现简化版（HS256 对称加密，无需 JWKS 公钥分发）
    -   后续迭代可扩展为 RS256 非对称加密
    -   参考成熟的 OAuth 实现（如 `node-oidc-provider`）

**风险 2: TypeORM → MikroORM 迁移**

-   **描述**: 参考项目使用 TypeORM，需迁移到 MikroORM
-   **应对策略**:
    -   参考 `@oksai/core` 中已有的 MikroORM 实现
    -   只迁移必要部分（用户认证）
    -   复用现有的实体定义和仓储模式
    -   充分测试数据库操作

#### 中优先级风险应对

**风险 3: 时间估算偏差**

-   **描述**: 工作量估算可能不准确，导致延期
-   **应对策略**:
    -   预留 20% 缓冲时间
    -   优先实现 P0 功能，P1 功能可延后
    -   每周评审进度，及时调整计划
    -   必要时削减非核心功能

**风险 4: Redis 依赖引入**

-   **描述**: 引入 Redis 增加部署复杂度
-   **应对策略**:
    -   Redis 作为可选功能，可禁用
    -   初期使用内存存储（单实例）
    -   提供清晰的配置说明
    -   文档标注为"高级功能"

---

## 8. 成功标准

### 8.1 功能标准

| 标准             | 验收标准                            | 验证方式 |
| ---------------- | ----------------------------------- | -------- |
| **三种传输层**   | Stdio、HTTP、WebSocket 均可正常运行 | 手动测试 |
| **工具注册机制** | 可以动态注册和调用工具              | 单元测试 |
| **OAuth 授权**   | 可以生成和验证 JWT 令牌             | 集成测试 |
| **会话管理**     | 支持内存和可选 Redis 存储           | 单元测试 |
| **API 客户端**   | 支持自动认证和错误重试              | 单元测试 |

### 8.2 质量标准

| 标准         | 指标                         | 验证方式        |
| ------------ | ---------------------------- | --------------- |
| **类型安全** | 无 `any` 类型                | TypeScript 编译 |
| **测试覆盖** | 核心逻辑 ≥80%                | Jest 覆盖率报告 |
| **代码规范** | 通过 ESLint 和 Prettier 检查 | CI 检查         |
| **文档完整** | 公共 API 有完整 TSDoc 注释   | 人工审查        |
| **构建成功** | 所有包可成功构建             | npm run build   |

### 8.3 文档标准

| 文档         | 内容要求                 | 验证方式       |
| ------------ | ------------------------ | -------------- |
| **README**   | 包含安装、配置、使用示例 | 人工审查       |
| **API 文档** | 公共 API 有完整 TSDoc    | 类型检查工具   |
| **部署文档** | 包含环境变量和部署步骤   | 按文档操作验证 |

### 8.4 性能标准

| 指标             | 目标               | 验证方式 |
| ---------------- | ------------------ | -------- |
| **启动时间**     | <5 秒              | 性能测试 |
| **API 响应时间** | <500ms（P95）      | 性能测试 |
| **内存占用**     | <200MB（空闲状态） | 内存监控 |
| **工具调用延迟** | <100ms             | 性能测试 |

---

## 附录

### A. 参考资料

-   [MCP 协议规范](https://spec.modelcontextprotocol.io/)
-   [OAuth 2.0 授权框架 (RFC 6749)](https://tools.ietf.org/html/rfc6749)
-   [OAuth 2.0 Bearer Token (RFC 6750)](https://tools.ietf.org/html/rfc6750)
-   [OAuth 2.0 Protected Resource Metadata (RFC 9728)](https://tools.ietf.org/html/rfc9728)
-   [Gauzy MCP Server](https://github.com/ever-co/ever-gauzy)

### B. 术语表

| 术语          | 说明                                          |
| ------------- | --------------------------------------------- |
| **MCP**       | Model Context Protocol，模型上下文协议        |
| **Stdio**     | Standard Input/Output，标准输入输出           |
| **JSON-RPC**  | JSON Remote Procedure Call，JSON 远程过程调用 |
| **JWT**       | JSON Web Token，JSON 网络令牌                 |
| **JWKS**      | JSON Web Key Set，JSON 网络密钥集             |
| **OAuth 2.0** | 开放授权 2.0 协议                             |
| **MikroORM**  | TypeScript ORM 框架                           |

### C. 版本历史

| 版本 | 日期       | 变更说明                            |
| ---- | ---------- | ----------------------------------- |
| v1.1 | 2026-02-10 | 更新 OAuth 技术选型（jsonwebtoken） |
| v1.0 | 2025-02-09 | 初始版本                            |

---

**文档维护**: 本文档随项目进展持续更新
**最后更新**: 2026-02-10
**问题反馈**: 请提交 Issue 或 Pull Request
