# MCP 服务器架构图

## 整体架构

```mermaid
classDiagram
    package "客户端层" {
        class UserClient {
            <<客户端>>
            connectToServer()
            sendRequest()
            receiveResponse()
        }
    }

    package "MCP 服务端层" {
        class McpServer {
            <<服务器>>
            - server: Server
            - transport: TransportResult
            - toolRegistry: ToolRegistry
            - sessionManager: SessionManager
            - authManager: AuthManager
            - config: McpServerConfig
            - logger: Logger
            - sessionId: string | null
            - isStarted: boolean
            - primaryServerId: string | null

            + start(transportType?: TransportType): Promise~boolean~
            + stop(): Promise~void~
            + registerTool(tool: BaseMcpTool): void
            + invokeTool(name: string, args: Record~string, unknown~): Promise~McpServer~
            + getStatus(): Promise~McpServerStatus~
            + listTools(): McpToolDefinition[]
            + cleanup(): Promise~void~
        }

        class McpServerManager {
            <<服务器管理器>>
            - servers: Map~string, ServerInstance~
            - primaryServerId: string | null
            - logger: Logger

            + start(config: McpServerConfig, serverId?: string): Promise~boolean~
            + stop(serverId?: string): Promise~boolean~
            + restart(serverId?: string): Promise~boolean~
            + getStatus(serverId?: string): Promise~McpServerStatus | null~
            + getServer(serverId?: string): McpServer | null
            + removeServer(serverId: string): Promise~boolean~
            + stopAll(): Promise~number~
            + setPrimaryServer(serverId: string): boolean
            + getStats(): { total: number, running: number, stopped: number }
        }

        class ToolRegistry {
            <<工具注册表>>
            - tools: Map~string, BaseMcpTool~
            - mcpServer: Server

            + registerTool(tool: BaseMcpTool): void
            + getTool(name: string): BaseMcpTool | null
            + getAllTools(): BaseMcpTool[]
            + getToolCount(): number
            + invokeTool(name: string, args: Record~string, unknown~): Promise~McpToolResult~
        }

        class BaseMcpTool {
            <<工具基类>>
            # name: string
            # description: string

            +~abstract~ getToolDefinition(): McpToolDefinition
            +~abstract~ execute(args: Record~string, unknown~): Promise~McpToolResult~
            + createSuccessResult(content: unknown): McpToolResult
            + createErrorResult(message: string): McpServerResult
        }
    }

    package "传输层" {
        class TransportFactory {
            <<工厂>>
            + createTransportFromEnv(server: Server, transportType: TransportType): Promise~TransportResult~
            + shutdownTransport(transport: TransportResult): Promise~void~
            + getTransportTypeFromEnv(): TransportType
        }

        class TransportResult {
            <<传输结果>>
            type: TransportType
            transport: StdioServerTransport | HttpServerTransport | WebSocketServerTransport
            url?: string
            config: TransportConfig
        }

        class StdioServerTransport {
            <<Stdio 传输>>
            + connect(): Promise~void~
            + disconnect(): Promise~void~
            + send(message: string): Promise~void~
        }

        class HttpServerTransport {
            <<HTTP 传输>>
            + connect(): Promise~void~
            + disconnect(): Promise~void~
            + send(message: string): Promise~void~
        }

        class WebSocketServerTransport {
            <<WebSocket 传输>>
            + connect(): Promise~void~
            + disconnect(): Promise~void~
            + send(message: string): Promise~void~
        }
    }

    package "会话管理层" {
        class SessionManager {
            <<会话管理器>>
            - storage: SessionStorage
            - ttl: number
            - enableRedis: boolean
            - redisConfig?: RedisConfig

            + createSession(userId?: string, organizationId?: string, tenantId?: string, data?: Record~string, unknown~): Promise~Session~
            + findSession(id: string): Promise~Session | null~
            + updateSession(id: string, data: Partial~Record~string, unknown~~): Promise~void~
            + deleteSession(id: string): Promise~void~
            + getSessionStats(): Promise~SessionStats~
            + cleanup(): Promise~void~
        }

        class SessionStorage {
            <<会话存储接口>>
            + createSession(session: Omit~Session~)
            + findSession(id: string): Promise~Session | null~
            + updateSession(id: string, data: Partial~Session~): Promise~void~
            + deleteSession(id: string): Promise~void~
            + getAllSessions(): Promise~Session[]~
            + cleanup(): Promise~void~
        }

        class MemoryStorage {
            <<内存存储>>
            + implements SessionStorage
            - sessions: Map~string, Session~

            + createSession(session: Omit~Session~): Promise~Session~
            + findSession(id: string): Promise~Session | null~
            + updateSession(id: string, data: Partial~Session~): Promise~void~
            + deleteSession(id: string): Promise~void~
            + getAllSessions(): Promise~Session[]~
            + cleanup(): Promise~void~
        }

        class RedisStorage {
            <<Redis 存储>>
            + implements SessionStorage
            - client: Redis
            - prefix: string

            + createSession(session: Omit~Session~): Promise~Session~
            + findSession(id: string): Promise~Session | null~
            + updateSession(id: string, data: Partial~Session~): Promise~void~
            + deleteSession(id: string): Promise~void~
            + getAllSessions(): Promise~Session[]~
            + cleanup(): Promise~void~
        }
    }

    package "认证授权层" {
        class AuthManager {
            <<认证管理器>>
            - instance: AuthManager

            + getInstance(): AuthManager
            + login(): Promise~boolean~
            + logout(): Promise~void~
            + getAuthStatus(): AuthStatus
            + setAuthState(userId: string, tenantId?: string, organizationId?: string): void
            + clearAuthState(): void
            + getUserId(): string | null
            + getTenantId(): string | null
            + getOrganizationId(): string | null
        }

        class AuthStatus {
            <<认证状态>>
            isAuthenticated: boolean
            userId: string | null
            tenantId: string | null
            organizationId: string | null
        }
    }

    package "基础设施层" {
        class Redis {
            <<缓存数据库>>
            store(key: string, value: any)
            retrieve(key: string): any
            expire(key: string, ttl: number)
        }

        class OAuthAuthServer {
            <<OAuth 授权服务器>>
            - jwtService: JwtService
            - jwksService: JwksService

            + generateAccessToken(payload: any): string
            + generateRefreshToken(payload: any): string
            + verifyToken(token: string): any
            + getJwks(): JwksResponse
            + introspectToken(token: string): IntrospectResponse
        }
    }

    UserClient --> McpServer: 连接
    UserClient --> OAuthAuthServer: 获取令牌

    McpServer --> McpServerManager: 被...管理
    McpServer --> ToolRegistry: 使用
    McpServer --> BaseMcpTool: 注册
    McpServer --> SessionManager: 使用
    McpServer --> AuthManager: 使用
    McpServer --> TransportFactory: 使用

    TransportFactory --> TransportResult: 创建
    TransportResult --> StdioServerTransport: 可能包含
    TransportResult --> HttpServerTransport: 可能包含
    TransportResult --> WebSocketServerTransport: 可能包含

    SessionManager --> SessionStorage: 使用
    SessionStorage <|-- MemoryStorage: 实现
    SessionStorage <|-- RedisStorage: 实现

    RedisStorage --> Redis: 存储会话

    AuthManager --> OAuthAuthServer: 验证令牌
    McpServer --> OAuthAuthServer: 验证令牌
```

## 部署架构

```mermaid
graph TB
    subgraph "客户端层"
        UserClient[用户客户端]
        McpClient[MCP 客户端]
        WebClient[Web 客户端]
        WebSocketClient[WebSocket 客户端]
    end

    subgraph "MCP 服务端"
        StdioMcpServer[Stdio MCP 服务器]
        HttpMcpServer[HTTP MCP 服务器]
        WebSocketMcpServer[WebSocket MCP 服务器]
        McpServerManager[MCP 服务器管理器]
    end

    subgraph "基础设施"
        OAuthAuthServer[OAuth 授权服务器]
        SessionStorageRedis[Redis 会话存储]
    end

    UserClient --> StdioMcpServer: 使用 Stdio 协议
    WebClient --> HttpMcpServer: 使用 HTTP 协议
    WebSocketClient --> WebSocketMcpServer: 使用 WebSocket 协议

    McpServerManager --> StdioMcpServer: 管理 Stdio 服务器
    McpServerManager --> HttpMcpServer: 管理 HTTP 服务器
    McpServerManager --> WebSocketMcpServer: 管理 WebSocket 服务器

    StdioMcpServer --> SessionStorageRedis: 存储会话
    HttpMcpServer --> SessionStorageRedis: 存储会话
    WebSocketMcpServer --> SessionStorageRedis: 存储会话

    StdioMcpServer --> OAuthAuthServer: 验证令牌
    HttpMcpServer --> OAuthAuthServer: 验证令牌
    WebSocketMcpServer --> OAuthAuthServer: 验证令牌

    OAuthAuthServer --> StdioMcpServer: 返回 JWKS
    OAuthAuthServer --> HttpMcpServer: 返回 JWKS
    OAuthAuthServer --> WebSocketMcpServer: 返回 JWKS
```

## 架构说明

### 客户端层

-   **UserClient**: 用户客户端，通过 Stdio 协议连接 MCP 服务器
-   **McpClient**: MCP 客户端，通用 MCP 客户端
-   **WebClient**: Web 客户端，通过 HTTP 协议连接 MCP 服务器
-   **WebSocketClient**: WebSocket 客户端，通过 WebSocket 协议连接 MCP 服务器

### MCP 服务端层

-   **McpServer**: 核心 MCP 服务器，负责工具注册、会话管理、认证管理
-   **McpServerManager**: MCP 服务器管理器，负责多服务器实例管理
-   **ToolRegistry**: 工具注册表，负责工具的注册和调用
-   **BaseMcpTool**: 工具基类，所有 MCP 工具都继承自此类

### 传输层

-   **TransportFactory**: 传输层工厂，负责根据配置创建不同的传输层
-   **TransportResult**: 传输结果，包含传输类型、传输实例和配置
-   **StdioServerTransport**: Stdio 传输层，用于与 AI 助手集成
-   **HttpServerTransport**: HTTP 传输层，用于 Web 客户端连接
-   **WebSocketServerTransport**: WebSocket 传输层，用于实时双向通信

### 会话管理层

-   **SessionManager**: 会话管理器，负责会话的创建、查询、更新和删除
-   **SessionStorage**: 会话存储接口，定义了会话存储的标准接口
-   **MemoryStorage**: 内存存储实现，用于开发环境
-   **RedisStorage**: Redis 存储实现，用于生产环境

### 认证授权层

-   **AuthManager**: 认证管理器，负责用户登录、登出和认证状态管理
-   **AuthStatus**: 认证状态，包含用户是否认证、用户 ID、租户 ID、组织 ID

### 基础设施层

-   **Redis**: 缓存数据库，用于存储会话数据
-   **OAuthAuthServer**: OAuth 授权服务器，负责生成和验证 JWT 令牌

## 技术栈

| 层级     | 技术                      |
| -------- | ------------------------- |
| 传输协议 | Stdio, HTTP, WebSocket    |
| 服务器   | @modelcontextprotocol/sdk |
| 会话存储 | Redis, 内存               |
| 认证授权 | JWT, JWKS, OAuth 2.0      |
| 工具验证 | Zod                       |
| 日志     | NestJS Logger             |
| 语言     | TypeScript                |

## 传输层对比

| 传输类型  | 用途         | 优点                        | 缺点           |
| --------- | ------------ | --------------------------- | -------------- |
| Stdio     | AI 助手集成  | 简单、低延迟、适合 CLI 工具 | 不适合远程调用 |
| HTTP      | Web 客户端   | 兼容性好、支持 SSE          | 需要轮询或 SSE |
| WebSocket | 实时双向通信 | 实时性强、双向通信          | 连接管理复杂   |

## 会话存储对比

| 存储类型 | 用途     | 优点               | 缺点                         |
| -------- | -------- | ------------------ | ---------------------------- |
| Memory   | 开发环境 | 简单、无需外部依赖 | 重启丢失数据、不适合生产环境 |
| Redis    | 生产环境 | 持久化、支持集群   | 需要外部 Redis 实例          |

## 架构特点

1. **多传输协议支持**: 支持 Stdio、HTTP、WebSocket 三种传输协议，适配不同的客户端场景
2. **工厂模式**: 使用工厂模式创建传输层，易于扩展新的传输类型
3. **插件式工具注册**: 通过 ToolRegistry 动态注册和调用工具，支持工具版本控制
4. **灵活的会话管理**: 支持内存和 Redis 两种会话存储，可根据环境选择
5. **统一的认证管理**: 通过 AuthManager 单例模式实现全局认证状态管理
6. **多服务器实例**: McpServerManager 支持管理多个 MCP 服务器实例
7. **OAuth 2.0 授权**: 支持标准的 OAuth 2.0 授权流程，生成和验证 JWT 令牌
8. **完整的状态机**: 服务器、工具、会话、认证、传输层都有完整的状态机
9. **高可观测性**: 完整的日志、监控和审计机制
10. **类型安全**: 使用 TypeScript 和 Zod 实现类型安全的工具定义和参数验证

## 核心流程

### 1. 服务器启动流程

1. 客户端调用 `McpServer.start(transportType)`
2. `TransportFactory.createTransportFromEnv()` 创建传输层
3. 传输层连接成功后，设置 `McpServer.isStarted = true`
4. 将 MCP Server 注册到 `ToolRegistry` 和 `SessionManager`
5. 返回启动成功状态

### 2. 工具调用流程

1. 客户端发送工具调用请求
2. `McpServer` 从 `ToolRegistry` 获取工具
3. `McpServer` 从 `AuthManager` 获取认证状态
4. `McpServer` 调用工具的 `execute()` 方法
5. 返回工具执行结果

### 3. 会话管理流程

1. 客户端发送请求时，携带 Session ID
2. `McpServer` 从 `SessionManager` 查询会话
3. `SessionManager` 从存储层（Memory/Redis）获取会话数据
4. 更新会话的最后访问时间
5. 执行业务逻辑
6. 更新会话数据并返回结果

### 4. 认证授权流程

1. 客户端向 `OAuthAuthServer` 请求令牌
2. `OAuthAuthServer` 生成访问令牌和刷新令牌
3. 客户端携带令牌访问 MCP 服务器
4. `McpServer` 从 `AuthManager` 验证令牌
5. 返回认证状态

## 扩展点

### 1. 自定义传输层

```typescript
export class CustomTransport extends BaseTransport {
    async connect(): Promise~void~ {
        // 连接逻辑
    }

    async disconnect(): Promise~void~ {
        // 断开连接逻辑
    }

    async send(message: string): Promise~void~ {
        // 发送消息逻辑
    }
}
```

### 2. 自定义工具

```typescript
export class MyCustomTool extends BaseMcpTool {
    constructor() {
        super('my_tool', '我的自定义工具');
    }

    async execute(args: Record~string, unknown~): Promise~McpToolResult~ {
        const input = args.input as string;

        // 业务逻辑
        const result = processInput(input);

        return this.createSuccessResult({ output: result });
    }
}
```

### 3. 自定义会话存储

```typescript
export class PostgresSessionStorage implements SessionStorage {
    async createSession(session: Omit~Session~): Promise~Session~ {
        // 数据库逻辑
    }

    async findSession(id: string): Promise~Session | null~ {
        // 数据库逻辑
    }

    // 其他方法实现...
}
```
