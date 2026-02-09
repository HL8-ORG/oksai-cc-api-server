# @oksai/mcp 应用

**版本**: 0.1.0
**创建日期**: 2025-02-09

---

## 项目概述

@oksai/mcp 是 MCP 协议的服务器入口应用，支持 Stdio、HTTP、WebSocket 三种传输层，为 AI 助手（如 Claude Desktop、ChatGPT）提供工具和资源访问能力。

## 快速开始

### 安装依赖

```bash
cd apps/mcp
pnpm install
```

### 配置环境变量

创建 `.env` 文件：

```bash
# 传输类型: stdio, http, websocket (默认: stdio)
MCP_TRANSPORT=stdio

# HTTP 传输配置
MCP_HTTP_HOST=localhost
MCP_HTTP_PORT=3001
MCP_CORS_ORIGIN=*

# WebSocket 传输配置
MCP_WS_HOST=localhost
MCP_WS_PORT=3002
MCP_WS_PATH=/sse

# 会话配置
MCP_SESSION_TTL=1800000  # 30 分钟（毫秒）
MCP_REDIS_ENABLED=false
MCP_REDIS_URL=

# 认证配置
MCP_AUTH_ENABLED=true
GAUZY_AUTH_EMAIL=
GAUZY_AUTH_PASSWORD=
GAUZY_AUTO_LOGIN=true

# API 配置
GAUZY_API_URL=http://localhost:3000

# 调试模式
MCP_DEBUG=false
```

### 运行服务器

```bash
# 开发模式（热重载）
pnpm start:dev

# 生产模式
pnpm build
pnpm start:prod

# 直接运行 TypeScript
tsx src/index.ts
```

---

## 传输层

### Stdio 传输（默认）

适用于本地开发和 CLI 工具。MCP 协议通过标准输入输出进行通信。

```bash
# 使用 Stdio 传输启动
MCP_TRANSPORT=stdio pnpm start
```

**特点**:

-   无需配置端口
-   适用于 Claude Desktop
-   支持管道和重定向

### HTTP 传输

适用于 Web 应用和远程访问。通过 HTTP 端点提供 JSON-RPC 2.0 协议。

```bash
# 使用 HTTP 传输启动
MCP_TRANSPORT=http MCP_HTTP_PORT=3001 pnpm start
```

**端点**:

-   `POST /sse` - JSON-RPC 请求端点
-   `GET /health` - 健康检查端点

**特点**:

-   支持跨域请求
-   自动限流保护
-   适用于 Web 应用和远程调用

### WebSocket 传输

适用于实时通信和双向交互。

```bash
# 使用 WebSocket 传输启动
MCP_TRANSPORT=websocket MCP_WS_PORT=3002 pnpm start
```

**端点**:

-   `ws://localhost:3002/sse` - WebSocket 端点

**特点**:

-   实时双向通信
-   低延迟
-   适用于需要实时更新的场景

---

## 配置说明

### 环境配置

开发环境: `src/environments/environment.ts`
生产环境: `src/environments/environment.prod.ts`

### 服务器配置

```typescript
const config: McpServerConfig = {
	name: '@oksai/mcp-server',
	version: '0.1.0',
	authEnabled: true,
	session: {
		ttl: 30 * 60 * 1000, // 30 分钟
		enableRedis: false,
		redisUrl: ''
	}
};
```

### 会话配置

-   **TTL**: 会话过期时间（默认：30 分钟）
-   **Redis**: 可选的会话存储（默认：内存存储）

---

## 认证与授权

### 启用认证

```typescript
const config: McpServerConfig = {
	authEnabled: true
};
```

### 认证流程

1. **登录**: 使用邮箱和密码登录
2. **令牌管理**: 自动刷新访问令牌
3. **登出**: 安全清除用户凭证

### 认证状态

-   未认证: 无权访问
-   已认证: 可访问所有已注册的工具

---

## 工具系统

### 工具注册

```typescript
import { McpServer, BaseMcpTool, McpToolDefinition } from '@oksai/mcp-server';

class GetUserInfoTool extends BaseMcpTool {
	constructor() {
		super('get_user_info', '获取用户信息');
	}

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

	async execute(args: Record<string, unknown>): Promise<McpToolResult> {
		try {
			const { userId } = args;

			const user = await this.fetchUser(userId);

			return this.createSuccessResult(user);
		} catch (error) {
			return this.createErrorResult(error);
		}
	}
}
```

### 注册工具

```typescript
import { createAndStartMcpServer } from '@oksai/mcp-server';

const { server } = await createAndStartMcpServer();

server.registerTool(new GetUserInfoTool());
```

---

## 开发指南

### 项目结构

```
apps/mcp/
├── src/
│   ├── index.ts              # 主入口文件
│   └── environments/          # 环境配置
│       ├── environment.ts       # 开发环境
│       └── environment.prod.ts  # 生产环境
```

### 热重加载

```bash
pnpm start:dev
```

### 调试模式

```bash
MCP_DEBUG=true pnpm start
```

### 日志级别

-   `LOG`: 普通日志
-   `DEBUG`: 调试日志
-   `WARN`: 警告日志
-   `ERROR`: 错误日志

---

## 部署

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start:prod
```

### Docker 部署（可选）

```dockerfile
FROM node:22
WORKDIR /app
COPY package*.json ./
RUN pnpm install
RUN pnpm build
CMD ["node", "dist/apps/mcp/src/index.js"]
```

```bash
docker build -t mcp-server
docker run -p 3001:3002 mcp-server
```

---

## 环境变量参考

### 传输层配置

| 变量              | 默认值      | 说明                             |
| ----------------- | ----------- | -------------------------------- |
| `MCP_TRANSPORT`   | `stdio`     | 传输类型：stdio, http, websocket |
| `MCP_HTTP_HOST`   | `localhost` | HTTP 服务器地址                  |
| `MCP_HTTP_PORT`   | `3001`      | HTTP 服务器端口                  |
| `MCP_CORS_ORIGIN` | `*`         | CORS 允许源                      |
| `MCP_WS_HOST`     | `localhost` | WebSocket 服务器地址             |
| `MCP_WS_PORT`     | `3002`      | WebSocket 服务器端口             |
| `MCP_WS_PATH`     | `/sse`      | WebSocket 路径                   |

### 会话配置

| 变量                | 默认值    | 说明                 |
| ------------------- | --------- | -------------------- |
| `MCP_SESSION_TTL`   | `1800000` | 会话过期时间（毫秒） |
| `MCP_REDIS_ENABLED` | `false`   | 是否启用 Redis       |
| `MCP_REDIS_URL`     | ``        | Redis 连接 URL       |

### 认证配置

| 变量                  | 默认值 | 说明            |
| --------------------- | ------ | --------------- |
| `MCP_AUTH_ENABLED`    | `true` | 是否启用认证    |
| `GAUZY_AUTH_EMAIL`    | ``     | GAUZY Auth 邮箱 |
| `GAUZY_AUTH_PASSWORD` | ``     | GAUZY Auth 密码 |
| `GAUZY_AUTO_LOGIN`    | `true` | 是否自动登录    |

### API 配置

| 变量            | 默认值                  | 说明           |
| --------------- | ----------------------- | -------------- |
| `GAUZY_API_URL` | `http://localhost:3000` | GAUZY API 地址 |

### 调试配置

| 变量        | 默认值  | 说明             |
| ----------- | ------- | ---------------- |
| `MCP_DEBUG` | `false` | 是否启用调试模式 |

---

## 常见问题

### 启动问题

**Q: MCP 应用启动失败怎么办？**

A: 检查以下几点：

1. 端口是否被占用：`lsof -i :3001`
2. 环境变量是否正确配置
3. 依赖是否安装完整：`pnpm install`

### 配置问题

**Q: 如何修改端口？**

A: 设置环境变量：

```bash
export MCP_HTTP_PORT=3002
pnpm start
```

**Q: 如何切换传输层？**

A: 设置环境变量：

```bash
# HTTP
export MCP_TRANSPORT=http
pnpm start

# WebSocket
export MCP_TRANSPORT=websocket
pnpm start

# Stdio (默认）
export MCP_TRANSPORT=stdio
pnpm start
```

### 测试问题

**Q: 如何测试 MCP 服务器？**

A: 使用 Claude Desktop 或其他 MCP 客户端：

1. 创建 MCP 客户端配置文件
2. 配置服务器地址
3. 启动 MCP 客户端
4. 测试工具调用

**Q: 如何启用调试模式？**

A:

```bash
export MCP_DEBUG=true
pnpm start
```

### 部署问题

**Q: 如何使用 Docker 部署？**

A:

```bash
# 构建镜像
docker build -t mcp-server .

# 运行容器
docker run -p 3001:3002 mcp-server
```

**Q: 如何配置生产环境？**

A:

```bash
# 生产环境配置
export MCP_TRANSPORT=http
export MCP_HTTP_PORT=3001
export GAUZY_API_URL=https://api.example.com

# 启动生产服务器
pnpm build
pnpm start:prod
```

---

## 技术栈

-   **运行时**: Node.js 22+
-   **语言**: TypeScript 5.9+
-   **框架**: NestJS 11.x
-   **协议**: MCP (Model Context Protocol) v1.0)
-   **SDK**: @modelcontextprotocol/sdk ^1.13.1

## 许可证

AGPL-3.0

---

## 文档更新

-   **版本历史**:

    -   v1.0 (2025-02-09): 初始版本，支持三种传输层和基础配置

-   **相关文档**:
    -   [@oksai/mcp-server 技术方案](./TECHNICAL_PROPOSAL.md)
    -   [MCP 培训教程](./TUTORIAL.md)
    -   [开发计划](./DEVELOPMENT_PLAN.md)
    -   [开发进度](./PROGRESS.md)

---

**联系方式**:

-   项目主页: https://github.com/oksai/oksai-platform
-   问题反馈: https://github.com/oksai/oksai-platform/issues
