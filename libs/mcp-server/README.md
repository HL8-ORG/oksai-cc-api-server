# @oksai/mcp-server

MCP (Model Context Protocol) 服务端框架，用于构建支持 AI 助手的工具服务器。

## 功能特性

-   ✅ **三种传输层**：Stdio、HTTP、WebSocket
-   ✅ **工具注册机制**：动态注册和调用 MCP 工具
-   ✅ **会话管理**：支持内存和 Redis 会话存储
-   ✅ **认证管理**：JWT 令牌验证和用户认证
-   ✅ **服务器管理器**：支持多服务器实例管理
-   ✅ **完整测试覆盖**：73 个单元测试，100% 通过

## 安装

```bash
pnpm add @oksai/mcp-server
```

## 快速开始

### 基本使用

```typescript
import { createAndStartMcpServer, McpServerConfig, TransportType } from '@oksai/mcp-server';
import { BaseMcpTool, McpToolResult } from '@oksai/mcp-server';

// 定义工具类
class EchoTool extends BaseMcpTool {
	constructor() {
		super('echo', '回显工具，返回输入的文本');
	}

	getToolDefinition() {
		return {
			name: this.name,
			description: this.description,
			inputSchema: {
				type: 'object',
				properties: {
					message: { type: 'string', description: '要回显的消息' }
				},
				required: ['message']
			}
		};
	}

	async execute(args: Record<string, unknown>): Promise<McpToolResult> {
		return this.createSuccessResult({ echo: args.message });
	}
}

// 创建并启动 MCP 服务器
const config: McpServerConfig = {
	name: 'My MCP Server',
	version: '1.0.0',
	authEnabled: false,
	session: {
		ttl: 30 * 60 * 1000,
		enableRedis: false
	}
};

const { server, transport } = await createAndStartMcpServer(config, TransportType.STDIO);

// 注册工具
server.registerTool(new EchoTool());

// 调用工具
const result = await server.invokeTool('echo', { message: 'Hello, MCP!' });
console.log(result.content); // { echo: 'Hello, MCP!' }

// 获取服务器状态
const status = await server.getStatus();
console.log(`服务器运行中: ${status.isRunning}`);
```

### 使用服务器管理器

```typescript
import { McpServerManager, McpServerConfig, TransportType } from '@oksai/mcp-server';

// 创建服务器管理器
const manager = new McpServerManager();

// 启动多个服务器
const config1: McpServerConfig = { name: 'Server 1', version: '1.0.0' };
const config2: McpServerConfig = { name: 'Server 2', version: '1.0.0' };

await manager.start(config1, 'server-1', TransportType.STDIO);
await manager.start(config2, 'server-2', TransportType.HTTP);

// 获取所有服务器状态
const statusMap = await manager.getAllStatus();
statusMap.forEach((status, id) => {
	console.log(`${id}: ${status.isRunning ? '运行中' : '已停止'}`);
});

// 停止所有服务器
await manager.stopAll();

// 清理所有服务器
await manager.cleanup();
```

### 自定义传输层配置

```typescript
// 环境变量配置
export const environment = {
	transport: {
		type: 'http', // 'stdio' | 'http' | 'websocket'
		http: {
			host: '0.0.0.0',
			port: 3000,
			path: '/mcp'
		},
		websocket: {
			host: '0.0.0.0',
			port: 3001,
			path: '/mcp'
		}
	},
	auth: {
		enabled: true
	},
	session: {
		ttl: 30 * 60 * 1000,
		enableRedis: false,
		redisConfig: {
			redisUrl: 'redis://localhost:6379'
		}
	}
};
```

## API 文档

### McpServer

MCP 服务器核心类，提供工具注册、调用和会话管理功能。

#### 构造函数

```typescript
constructor(config: McpServerConfig, sessionId?: string)
```

**参数**:

-   `config` - MCP 服务器配置
-   `sessionId` - 会话 ID（可选），用于恢复现有会话

#### 主要方法

-   `async start(transportType?: TransportType): Promise<boolean>` - 启动服务器
-   `async stop(): Promise<void>` - 停止服务器
-   `registerTool(tool: BaseMcpTool): void` - 注册单个工具
-   `registerTools(tools: BaseMcpTool[]): void` - 批量注册工具
-   `async invokeTool(name: string, args: Record<string, unknown>): Promise<McpToolResult>` - 调用工具
-   `async getStatus(): Promise<McpServerStatus>` - 获取服务器状态
-   `listTools(): McpToolDefinition[]` - 列出所有工具
-   `getToolRegistry(): ToolRegistry` - 获取工具注册表
-   `getSessionManager(): SessionManager` - 获取会话管理器
-   `getAuthManager(): AuthManager` - 获取认证管理器
-   `getSessionId(): string | null` - 获取会话 ID
-   `setSessionId(sessionId: string): void` - 设置会话 ID
-   `async cleanup(): Promise<void>` - 清理资源

### McpServerManager

MCP 服务器管理器类，支持多服务器实例管理。

#### 主要方法

-   `async start(config: McpServerConfig, serverId?: string, transportType?: TransportType): Promise<boolean>` - 启动服务器
-   `async stop(serverId?: string): Promise<boolean>` - 停止服务器
-   `async restart(serverId?: string): Promise<boolean>` - 重启服务器
-   `async getStatus(serverId?: string): Promise<McpServerStatus | null>` - 获取服务器状态
-   `getServer(serverId?: string): McpServer | null` - 获取服务器实例
-   `getServerIds(): string[]` - 获取所有服务器 ID
-   `async getAllStatus(): Promise<Map<string, McpServerStatus>>` - 获取所有服务器状态
-   `async removeServer(serverId: string): Promise<boolean>` - 删除服务器
-   `async stopAll(): Promise<number>` - 停止所有服务器
-   `setPrimaryServer(serverId: string): boolean` - 设置主服务器
-   `getPrimaryServerId(): string | null` - 获取主服务器 ID
-   `getPrimaryServer(): McpServer | null` - 获取主服务器实例
-   `getStats(): {...}` - 获取服务器统计信息
-   `async cleanup(): Promise<void>` - 清理所有服务器

### BaseMcpTool

工具基类，所有 MCP 工具都应该继承此类。

#### 构造函数

```typescript
constructor(name: string, description: string)
```

**参数**:

-   `name` - 工具名称
-   `description` - 工具描述

#### 主要方法

-   `getToolDefinition(): McpToolDefinition` - 获取工具定义
-   `async execute(args: Record<string, unknown>): Promise<McpToolResult>` - 执行工具
-   `createSuccessResult(content: unknown): McpToolResult` - 创建成功结果
-   `createErrorResult(message: string): McpToolResult` - 创建错误结果

## 配置

### 环境变量

| 变量名                     | 说明                 | 默认值  |
| -------------------------- | -------------------- | ------- |
| `MCP_TRANSPORT`            | 传输类型             | `stdio` |
| `JWT_ACCESS_TOKEN_EXPIRY`  | 访问令牌有效期（秒） | `3600`  |
| `JWT_REFRESH_TOKEN_EXPIRY` | 刷新令牌有效期（秒） | `86400` |

### McpServerConfig

```typescript
interface McpServerConfig {
	name: string; // 服务器名称
	version: string; // 服务器版本
	session?: SessionManagerConfig; // 会话配置
	authEnabled?: boolean; // 是否启用认证
	transport?: TransportConfig; // 传输配置
}
```

### SessionManagerConfig

```typescript
interface SessionManagerConfig {
	ttl: number; // 会话过期时间（毫秒）
	enableRedis: boolean; // 是否启用 Redis
	redisConfig?: {
		// Redis 配置
		redisUrl?: string;
	};
}
```

## 测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test mcp-server.spec.ts

# 运行测试并生成覆盖率报告
pnpm test:cov
```

测试覆盖率：

-   **语句覆盖率**: 80%+
-   **分支覆盖率**: 80%+
-   **函数覆盖率**: 80%+
-   **行覆盖率**: 80%+

## 开发

### 构建

```bash
# 构建 mcp-server 包
pnpm build

# 或者使用 turbo
turbo build --filter=@oksai/mcp-server
```

### 类型检查

```bash
# 检查类型
pnpm typecheck

# 或者使用 turbo
turbo typecheck --filter=@oksai/mcp-server
```

### Lint

```bash
# 运行 lint
pnpm lint

# 修复 lint 错误
pnpm lint --fix
```

## 依赖

-   `@nestjs/common` - NestJS 框架
-   `@modelcontextprotocol/sdk` - MCP SDK
-   `zod` - 数据验证
-   `jose` - JWT 令牌处理

## 许可证

MIT

## 贡献

欢迎贡献！请先阅读 [AGENTS.md](../../AGENTS.md) 了解项目规范。

## 支持

如有问题或建议，请在 GitHub 上提交 Issue。
