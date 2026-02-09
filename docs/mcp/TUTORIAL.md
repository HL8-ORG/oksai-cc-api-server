# MCP 协议培训教程

**版本**: v1.0
**创建日期**: 2025-02-09
**目标读者**: 开发者、技术负责人

---

## 文档目录

-   [1. MCP 概述](#1-mcp-概述)
-   [2. MCP 核心概念](#2-mcp-核心概念)
-   [3. MCP 工作原理](#3-mcp-工作原理)
-   [4. @oksai/mcp-server 架构](#4-oksaimcp-server-架构)
-   [5. 快速开始](#5-快速开始)
-   [6. 开发自定义工具](#6-开发自定义工具)
-   [7. 传输层使用](#7-传输层使用)
-   [8. 会话管理](#8-会话管理)
-   [9. 认证与授权](#9-认证与授权)
-   [10. 最佳实践](#10-最佳实践)
-   [11. 常见问题](#11-常见问题)

---

## 1. MCP 概述

### 1.1 什么是 MCP？

MCP（Model Context Protocol，模型上下文协议）是一种标准化的 AI 助手与外部系统交互的协议。它定义了 AI 模型（如 Claude、ChatGPT）如何安全、高效地访问和操作外部资源（API、数据库、文件系统等）。

### 1.2 MCP 的价值

| 价值点       | 说明                                     |
| ------------ | ---------------------------------------- |
| **标准化**   | 统一的协议，兼容多个 AI 助手             |
| **类型安全** | 完整的 TypeScript 类型定义               |
| **可扩展性** | 支持动态工具注册和自定义传输层           |
| **安全性**   | 内置认证、授权和会话管理                 |
| **高效性**   | 支持 Stdio、HTTP、WebSocket 多种传输方式 |

### 1.3 应用场景

-   **企业应用集成**: AI 助手访问企业内部 API 和数据库
-   **数据处理**: AI 辅助进行数据查询、分析和报表生成
-   **自动化工作流**: AI 触发和管理工作流程
-   **知识库集成**: AI 检索和操作知识库系统

### 1.4 谁在使用 MCP？

这是一个重要的问题！让我们澄清 MCP 的实际使用方式。

#### MCP 使用链路

```
┌─────────────────────────────────────────────┐
│ MCP 使用链路                                 │
├─────────────────────────────────────────────┤
│  ┌─────────┐     ┌─────────┐             │
│  │  用户    │────►│ AI 助手  │             │
│  │(最终用户）│     │(Claude/ │             │
│  └─────────┘     │ ChatGPT) │             │
│                  └────┬────┘             │
│                       │                   │
│                  MCP 协议                │
│                       │                   │
│                  ┌────▼────┐             │
│                  │ MCP     │             │
│                  │ 服务器   │◄──开发人员实现│
│                  └────┬────┘             │
│                       │                   │
│              业务系统/API/数据库             │
└─────────────────────────────────────────────┘
```

#### 开发人员的角色

| 角色       | 说明                                  |
| ---------- | ------------------------------------- |
| **实现者** | 开发 MCP 服务器、定义工具、配置传输层 |
| **测试者** | 单元测试、集成测试、验证工具功能      |
| **维护者** | 修复 Bug、优化性能、更新功能          |

#### 最终用户

| 角色              | 说明                                               |
| ----------------- | -------------------------------------------------- |
| **AI 助手使用者** | 通过 Claude Desktop 或 ChatGPT 使用 MCP 提供的能力 |
| **间接调用者**    | 通过对话指令让 AI 调用 MCP 工具                    |

#### 实际调用示例

**用户（使用 Claude）的视角**：

```
用户: 帮我查询用户 123 的信息

Claude: 好的，我来调用工具查询...
       （内部：调用 MCP 服务器的 get_user 工具）
       返回结果：{ id: "123", name: "张三", email: "..." }

       用户 123 的信息如下：
       - 姓名：张三
       - 邮箱：zhangsan@example.com
```

**开发人员的视角**：

```typescript
// 开发人员实现的 MCP 服务器
const server = new McpServer({
	name: '企业 API MCP 服务器',
	version: '1.0.0'
});

// 定义工具
server.registerTool(new GetUserInfoTool());

// 启动服务器
await server.start(TransportType.STDIO);
```

开发人员只需要实现和启动服务器，**不需要**直接调用这些工具。

#### 开发人员什么时候会直接调用 MCP？

虽然开发人员不是 MCP 的主要使用者，但在以下场景下会直接调用：

**1. 开发测试**

```typescript
// 开发人员测试工具功能
const result = await server.invokeTool('get_user', {
	userId: '123'
});

console.log(result); // 验证输出是否符合预期
```

**2. 集成测试**

```typescript
// 测试整个 MCP 服务器的功能
describe('MCP Server', () => {
	it('应该正确处理工具调用', async () => {
		const result = await server.invokeTool('get_user', {
			userId: 'test-user'
		});

		expect(result.isError).toBe(false);
		expect(result.content).toBeDefined();
	});
});
```

**3. 手动调试**

```typescript
// 开发过程中临时测试某个工具
const tool = server.getToolRegistry().findTool('get_user');
const result = await tool.executeSafe({ userId: '123' });
```

#### 总结

| 问题                                  | 答案                                              |
| ------------------------------------- | ------------------------------------------------- |
| **开发人员在开发过程中调用 MCP 吗？** | **不是**日常调用，只在测试和调试时偶尔调用        |
| **谁是 MCP 的主要使用者？**           | **AI 助手**（Claude、ChatGPT）和**最终用户**      |
| **开发人员的角色是什么？**            | **实现者**和**维护者**，负责构建和测试 MCP 服务器 |
| **什么时候会直接调用？**              | 单元测试、集成测试、手动调试时                    |

**简单来说：开发人员构建 MCP 服务器给 AI 助手用，而不是自己用。**

---

## 2. MCP 核心概念

### 2.1 核心组件

```
┌─────────────────────────────────────────────────────────┐
│                   MCP 架构                            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ AI 助手     │  │ 传输层      │  │ MCP 服务器    │  │
│  │ (Claude/GPT)│◄─►│(Stdio/HTTP)│◄─►│ (@oksai)      │  │
│  └─────────────┘  └─────────────┘  └───────┬───────┘  │
│                                        │           │
│                              ┌─────────▼─────────┐ │
│                              │   工具层         │ │
│                              │ (Tool Registry)   │ │
│                              └─────────┬─────────┘ │
│                                        │           │
│                              ┌─────────▼─────────┐ │
│                              │   会话管理        │ │
│                              │ (Session Manager) │ │
│                              └─────────┬─────────┘ │
│                                        │           │
│                              ┌─────────▼─────────┐ │
│                              │   认证管理        │ │
│                              │ (Auth Manager)    │ │
│                              └───────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心术语

| 术语           | 说明                                               |
| -------------- | -------------------------------------------------- |
| **MCP 服务器** | 实现 MCP 协议的服务端，提供工具和资源访问能力      |
| **MCP 工具**   | 可被 AI 助手调用的功能单元，定义输入输出和执行逻辑 |
| **传输层**     | MCP 服务器与 AI 助手之间的通信通道                 |
| **会话**       | 维护 AI 助手与服务器之间的上下文和状态             |
| **认证**       | 验证 AI 助手或用户的身份                           |
| **授权**       | 控制工具和资源的访问权限                           |

---

## 3. MCP 工作原理

### 3.1 通信流程

```
AI 助手                    MCP 服务器                    业务系统
   │                            │                            │
   ├─ 1. 初始化连接 ──────────►│                            │
   │                            ├─ 2. 初始化会话 ───────────►│
   │                            │                            │
   ├─ 3. 请求工具列表 ─────────►│                            │
   │◄──────── 4. 返回工具列表 ───┤                            │
   │                            │                            │
   ├─ 5. 调用工具 (tool_name) ─►│                            │
   │                            ├─ 6. 验证会话和权限 ───────►│
   │                            │◄───── 7. 返回验证结果 ─────┤
   │                            │                            │
   │                            ├─ 8. 执行工具逻辑 ──────────►│
   │                            │◄───── 9. 返回业务数据 ─────┤
   │◄────── 10. 返回工具结果 ────┤                            │
   │                            │                            │
```

### 3.2 JSON-RPC 协议

MCP 使用 JSON-RPC 2.0 协议进行通信。

**请求示例**：

```json
{
	"jsonrpc": "2.0",
	"method": "tools/call",
	"id": 1,
	"params": {
		"name": "get_user",
		"arguments": {
			"userId": "123"
		}
	}
}
```

**响应示例**：

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"content": {
			"id": "123",
			"name": "张三",
			"email": "zhangsan@example.com"
		}
	}
}
```

---

## 4. @oksai/mcp-server 架构

### 4.1 目录结构

```
libs/mcp-server/
├── src/
│   ├── lib/
│   │   ├── transports/           # 传输层实现
│   │   │   ├── types.ts
│   │   │   ├── transport-factory.ts
│   │   │   ├── stdio-transport.ts
│   │   │   ├── http-transport.ts
│   │   │   └── websocket-transport.ts
│   │   ├── tools/               # 工具层
│   │   │   ├── base-tool.ts
│   │   │   ├── tool-registry.ts
│   │   │   └── index.ts
│   │   ├── session/             # 会话管理
│   │   │   ├── session-storage.ts
│   │   │   ├── memory-storage.ts
│   │   │   ├── redis-storage.ts
│   │   │   ├── session-manager.ts
│   │   │   └── index.ts
│   │   ├── common/              # 公共模块
│   │   │   ├── api-client.ts
│   │   │   ├── auth-manager.ts
│   │   │   └── error-utils.ts
│   │   ├── mcp-server.ts       # 核心 MCP 服务器
│   │   └── mcp-server-manager.ts # 服务器管理器
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 4.2 核心类

| 类名               | 职责                           | 所在文件                     |
| ------------------ | ------------------------------ | ---------------------------- |
| `McpServer`        | 核心 MCP 服务器，实现 MCP 协议 | `mcp-server.ts`              |
| `McpServerManager` | 管理服务器生命周期             | `mcp-server-manager.ts`      |
| `SessionManager`   | 管理会话生命周期               | `session/session-manager.ts` |
| `AuthManager`      | 管理用户认证和令牌             | `common/auth-manager.ts`     |
| `ToolRegistry`     | 管理工具注册和调用             | `tools/tool-registry.ts`     |
| `BaseMcpTool`      | 工具基类                       | `tools/base-tool.ts`         |

---

## 5. 快速开始

### 5.1 安装依赖

```bash
cd libs/mcp-server
pnpm install
```

### 5.2 创建第一个 MCP 服务器

```typescript
import { McpServer, McpServerConfig } from '@oksai/mcp-server';
import { TransportType } from '@oksai/mcp-server';
import { GetUserInfoTool } from './tools/get-user-info.tool';

// 配置 MCP 服务器
const config: McpServerConfig = {
	name: '我的 MCP 服务器',
	version: '1.0.0',
	session: {
		ttl: 30 * 60 * 1000, // 30 分钟会话过期
		enableRedis: false // 使用内存存储
	},
	authEnabled: true // 启用认证
};

// 创建服务器实例
const server = new McpServer(config);

// 注册工具
server.registerTool(new GetUserInfoTool());

// 启动服务器（使用 Stdio 传输）
await server.start(TransportType.STDIO);
```

### 5.3 运行服务器

```bash
# Stdio 模式（默认）
MCP_TRANSPORT=stdio pnpm start

# HTTP 模式
MCP_TRANSPORT=http MCP_HTTP_PORT=3001 pnpm start

# WebSocket 模式
MCP_TRANSPORT=websocket MCP_WS_PORT=3002 pnpm start
```

---

## 6. 开发自定义工具

### 6.1 工具基类

所有 MCP 工具必须继承 `BaseMcpTool` 类：

```typescript
import { BaseMcpTool, McpToolDefinition, McpToolResult } from '@oksai/mcp-server';

export class MyCustomTool extends BaseMcpTool {
	constructor() {
		super('my_custom_tool', '这是我的自定义工具');
	}

	/**
	 * 获取工具定义
	 */
	getToolDefinition(): McpToolDefinition {
		return {
			name: this.name,
			description: this.description,
			inputSchema: {
				type: 'object',
				properties: {
					userId: {
						type: 'string',
						description: '用户 ID'
					}
				},
				required: ['userId']
			}
		};
	}

	/**
	 * 执行工具
	 */
	async execute(args: Record<string, unknown>): Promise<McpToolResult> {
		try {
			const { userId } = args;

			// 业务逻辑
			const user = await this.fetchUser(userId as string);

			return this.createSuccessResult(user);
		} catch (error) {
			return this.createErrorResult(error);
		}
	}

	/**
	 * 获取用户信息（示例）
	 */
	private async fetchUser(userId: string) {
		// 实现实际的 API 调用或数据库查询
		return {
			id: userId,
			name: '用户名',
			email: 'user@example.com'
		};
	}
}
```

### 6.2 注册工具

```typescript
import { McpServer } from '@oksai/mcp-server';
import { MyCustomTool } from './tools/my-custom-tool';

const server = new McpServer(config);

// 注册单个工具
server.registerTool(new MyCustomTool());

// 批量注册工具
server.registerTools([new MyCustomTool(), new AnotherTool()]);
```

### 6.3 工具最佳实践

| 最佳实践     | 说明                                    |
| ------------ | --------------------------------------- |
| **命名规范** | 使用下划线命名：`get_user_info`         |
| **参数验证** | 使用 inputSchema 定义参数类型和验证规则 |
| **错误处理** | 使用 `try-catch` 捕获异常并返回错误结果 |
| **日志记录** | 使用 `this.logger` 记录重要操作         |
| **中文注释** | 所有注释使用中文说明业务语义            |

---

## 7. 传输层使用

### 7.1 传输层类型

| 传输类型      | 适用场景           | 配置项                           |
| ------------- | ------------------ | -------------------------------- |
| **Stdio**     | CLI 工具、本地开发 | 无需配置                         |
| **HTTP**      | Web 应用、远程访问 | `MCP_HTTP_HOST`, `MCP_HTTP_PORT` |
| **WebSocket** | 实时通信、双向交互 | `MCP_WS_HOST`, `MCP_WS_PORT`     |

### 7.2 Stdio 传输

Stdio 是默认传输方式，适用于本地开发：

```typescript
import { McpServer, TransportType } from '@oksai/mcp-server';

const server = new McpServer(config);

// 启动 Stdio 传输
await server.start(TransportType.STDIO);
```

### 7.3 HTTP 传输

HTTP 传输适用于 Web 应用：

```bash
# 环境变量配置
export MCP_TRANSPORT=http
export MCP_HTTP_HOST=localhost
export MCP_HTTP_PORT=3001
export MCP_CORS_ORIGIN=*
```

```typescript
import { McpServer, TransportType } from '@oksai/mcp-server';

const server = new McpServer(config);

// 启动 HTTP 传输
await server.start(TransportType.HTTP);
```

访问端点：

-   `POST /sse` - JSON-RPC 请求端点
-   `GET /health` - 健康检查端点

### 7.4 WebSocket 传输

WebSocket 传输适用于实时通信：

```bash
# 环境变量配置
export MCP_TRANSPORT=websocket
export MCP_WS_HOST=localhost
export MCP_WS_PORT=3002
export MCP_WS_PATH=/sse
```

```typescript
import { McpServer, TransportType } from '@oksai/mcp-server';

const server = new McpServer(config);

// 启动 WebSocket 传输
await server.start(TransportType.WEBSOCKET);
```

连接地址：`ws://localhost:3002/sse`

---

## 8. 会话管理

### 8.1 会话配置

```typescript
import { SessionManager, SessionManagerConfig } from '@oksai/mcp-server';

const config: SessionManagerConfig = {
	ttl: 30 * 60 * 1000, // 会话过期时间（毫秒）
	enableRedis: false, // 是否启用 Redis
	redisConfig: {
		redisUrl: 'redis://localhost:6379',
		keyPrefix: 'mcp:session:',
		ttl: 1800
	}
};

const sessionManager = new SessionManager(config);
```

### 8.2 创建会话

```typescript
// 创建新会话
const sessionId = await sessionManager.createSession(
	'user-123', // 用户 ID
	'org-456', // 组织 ID（可选）
	'tenant-789', // 租户 ID（可选）
	{ role: 'admin' } // 会话数据（可选）
);

console.log(`会话已创建: ${sessionId}`);
```

### 8.3 查找和更新会话

```typescript
// 查找会话
const session = await sessionManager.findSession(sessionId);

if (session) {
	console.log('会话有效');
} else {
	console.log('会话已过期或不存在');
}

// 更新会话
const updated = await sessionManager.updateSession(sessionId, {
	lastAction: new Date(),
	actionCount: 5
});
```

### 8.4 清理会话

```typescript
// 删除单个会话
await sessionManager.deleteSession(sessionId);

// 删除用户的所有会话
const count = await sessionManager.deleteUserSessions('user-123');

// 清空所有会话
const totalCount = await sessionManager.clearAllSessions();

// 清理过期会话
const expiredCount = await sessionManager.cleanupExpiredSessions();
```

---

## 9. 认证与授权

### 9.1 启用认证

```typescript
import { McpServer } from '@oksai/mcp-server';

const config: McpServerConfig = {
	name: '我的 MCP 服务器',
	version: '1.0.0',
	authEnabled: true // 启用认证
};

const server = new McpServer(config);
```

### 9.2 认证管理器

```typescript
import { AuthManager } from '@oksai/mcp-server';

const authManager = AuthManager.getInstance();

// 用户登录
const success = await authManager.login('user@example.com', 'password123');

if (success) {
	console.log('登录成功');
	console.log('访问令牌:', authManager.getAccessToken());
} else {
	console.log('登录失败');
}

// 刷新令牌
const refreshed = await authManager.refreshToken();

// 用户登出
await authManager.logout();

// 获取用户信息
const userId = authManager.getUserId();
const organizationId = authManager.getOrganizationId();
const tenantId = authManager.getTenantId();
```

### 9.3 认证状态查询

```typescript
// 获取认证状态
const authStatus = authManager.getAuthStatus();

console.log('是否已认证:', authStatus.isAuthenticated);
console.log('用户 ID:', authStatus.userId);
console.log('组织 ID:', authStatus.organizationId);
console.log('租户 ID:', authStatus.tenantId);
```

---

## 10. 最佳实践

### 10.1 开发规范

| 规范         | 说明                                                             |
| ------------ | ---------------------------------------------------------------- |
| **命名规范** | 类使用 PascalCase，方法使用 camelCase，常量使用 UPPER_SNAKE_CASE |
| **注释规范** | 所有注释、错误消息、日志输出使用中文                             |
| **类型安全** | 始终使用 TypeScript 类型，避免 `any`                             |
| **错误处理** | 使用 try-catch 捕获异常，返回友好的错误消息                      |
| **日志记录** | 使用 NestJS Logger，记录关键操作                                 |

### 10.2 性能优化

| 优化项       | 说明                          |
| ------------ | ----------------------------- |
| **缓存**     | 使用 Redis 缓存频繁访问的数据 |
| **连接池**   | 复用数据库和 HTTP 连接        |
| **异步处理** | 使用 async/await 处理异步操作 |
| **批量操作** | 批量处理数据，减少网络请求    |

### 10.3 安全建议

| 安全建议     | 说明                               |
| ------------ | ---------------------------------- |
| **认证授权** | 始终启用认证和授权机制             |
| **数据脱敏** | 日志中不记录敏感信息（密码、令牌） |
| **HTTPS**    | 生产环境使用 HTTPS 传输            |
| **限流**     | 实现请求限流，防止滥用             |
| **输入验证** | 验证所有输入参数，防止注入攻击     |

---

## 11. 常见问题

### 11.1 启动问题

**Q: MCP 服务器启动失败怎么办？**

A: 检查以下几点：

1. 端口是否被占用：`lsof -i :3001`
2. 环境变量是否正确配置
3. 依赖是否安装完整：`pnpm install`
4. 查看日志输出，定位具体错误

### 11.2 工具调用问题

**Q: 工具调用返回错误怎么办？**

A: 检查以下几点：

1. 工具是否正确注册
2. 参数是否符合 inputSchema 定义
3. 业务逻辑是否有异常
4. 查看工具执行日志

### 11.3 会话管理问题

**Q: 会话过期时间太短怎么办？**

A: 调整会话配置：

```typescript
const config = {
	session: {
		ttl: 60 * 60 * 1000 // 设置为 1 小时
	}
};
```

### 11.4 传输层选择

**Q: 如何选择合适的传输层？**

A: 根据应用场景选择：

-   **Stdio**: 本地开发、CLI 工具
-   **HTTP**: Web 应用、远程访问
-   **WebSocket**: 实时通信、双向交互

---

## 附录

### A. 参考资料

-   [MCP 协议规范](https://spec.modelcontextprotocol.io/)
-   [@oksai/mcp-server 技术方案](./TECHNICAL_PROPOSAL.md)
-   [开发计划](./DEVELOPMENT_PLAN.md)
-   [开发进度](./PROGRESS.md)

### B. 术语表

| 术语         | 说明                                          |
| ------------ | --------------------------------------------- |
| **MCP**      | Model Context Protocol，模型上下文协议        |
| **Stdio**    | Standard Input/Output，标准输入输出           |
| **JSON-RPC** | JSON Remote Procedure Call，JSON 远程过程调用 |
| **Redis**    | 高性能键值存储数据库                          |
| **JWT**      | JSON Web Token，JSON 网络令牌                 |

### C. 版本历史

| 版本 | 日期       | 变更说明 |
| ---- | ---------- | -------- |
| v1.0 | 2025-02-09 | 初始版本 |

---

**文档维护**: 本文档随项目进展持续更新
**问题反馈**: 请提交 Issue 或 Pull Request
