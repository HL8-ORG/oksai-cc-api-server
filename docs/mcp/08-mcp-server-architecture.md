# MCP 服务器架构

**版本**: v1.0
**最后更新**: 2026-02-10
**作者**: MCP 团队

## 系统概览

```plantuml
@startuml
!define RECTANGLE class

class McpServer <<服务器>> {
    - mcpServerManager
    - server: Server
    - authManager: AuthManager
    - sessionManager: SessionManager
}

class AuthManager <<单例模式>> {
    + manageAuthState(userId, tenantId, organizationId)
}

class SessionManager <<管理>> {
    + createSession(userId, organizationId, tenantId, data)
    + findSession(id)
    + updateSession(id, data)
    + deleteSession(id)
    + getSessionStats()
    + cleanup()
}

class ToolRegistry <<注册>> {
    + registerTool(tool: BaseMcpTool): void
    + getTool(name: string): BaseMcpTool
    + getAllTools(): BaseMcpTool[]
    + getToolCount(): number
    + invokeTool(name, args): Promise<McpToolResult>
}

class TransportFactory <<工厂模式>> {
    + createTransportFromEnv(server, transportType): Promise<TransportResult>
    + shutdownTransport(transport): Promise<void>
    + getTransportTypeFromEnv(): TransportType
}

McpServer --> AuthManager : 依赖
McpServer --> SessionManager : 依赖
McpServer --> ToolRegistry : 依赖
McpServer --> TransportFactory : 依赖
@enduml
```

## 类图

### McpServer 类

```plantuml
@startuml
class McpServer {
    - server: Server
    - transport: TransportResult
    - toolRegistry: ToolRegistry
    - sessionManager: SessionManager
    - authManager: AuthManager
    - config: McpServerConfig
    - logger: Logger
    - sessionId: String
    - isStarted: boolean
    - primaryServerId: String
    __
    + McpServer(config: McpServerConfig, sessionId?: String)
    + start(transportType?: TransportType): Promise<boolean>
    + stop(): Promise<void>
    + registerTool(tool: BaseMcpTool): void
    + registerTools(tools: BaseMcpTool[]): void
    + invokeTool(name, args): Promise<McpServer>
    + getStatus(): Promise<McpServerStatus>
    + listTools(): McpToolDefinition[]
    + cleanup(): Promise<void>
}
@enduml
```

### McpServerManager 类

```plantuml
@startuml
class McpServerManager {
    - servers: Map<String, ServerInstance>
    - primaryServerId: String
    - logger: Logger
    __
    + McpServerManager()
    + start(config, serverId?, transportType?): Promise<boolean>
    + stop(serverId?): Promise<boolean>
    + restart(serverId?): Promise<boolean>
    + getStatus(serverId?): Promise<McpServerStatus>
    + getServer(serverId?): McpServer
    + getServerIds(): String[]
    + getAllStatus(): Promise<Map<String, McpServerStatus>>
    + removeServer(serverId): Promise<boolean>
    + stopAll(): Promise<number>
    + setPrimaryServer(serverId): boolean
    + getPrimaryServerId(): String
    + getPrimaryServer(): McpServer
    + getStats(): McpServerStats
    + cleanup(): Promise<void>
}
@enduml
```

## 组件关系

### 1. 传输层组件

```plantuml
@startuml
class TransportFactory {
    + createTransportFromEnv(server, transportType): Promise<TransportResult>
    + shutdownTransport(transport): Promise<void>
}

class TransportResult {
    + type: TransportType
    + url: String
    + config: TransportConfig
}

class StdioServerTransport <<Stdio 传输>> {
    + connect(): Promise<void>
    + disconnect(): Promise<void>
    + send(message: String): Promise<void>
}

class HttpServerTransport <<HTTP 传输>> {
    + connect(): Promise<void>
    + disconnect(): Promise<void>
    + send(message: String): Promise<void>
}

class WebSocketServerTransport <<WebSocket 传输>> {
    + connect(): Promise<void>
    + disconnect(): Promise<void>
    + send(message: String): Promise<void>
}

TransportFactory --> TransportResult : 创建
TransportResult --> StdioServerTransport : 可能包含
TransportResult --> HttpServerTransport : 可能包含
TransportResult --> WebSocketServerTransport : 可能包含
@enduml
```

### 2. 工具层组件

```plantuml
@startuml
abstract class BaseMcpTool <<工具基类>> {
    # name: String
    # description: String
    __
    + {abstract} getToolDefinition(): McpToolDefinition
    + {abstract} execute(args): Promise<McpToolResult>
    + createSuccessResult(content): McpToolResult
    + createErrorResult(message: String): McpServerResult
}

class ToolRegistry {
    - tools: Map<String, BaseMcpTool>
    - mcpServer: Server
    __
    + registerTool(tool: BaseMcpTool): void
    + getTool(name: String): BaseMcpTool
    + getAllTools(): BaseMcpTool[]
    + getToolCount(): number
    + invokeTool(name, args): Promise<McpToolResult>
    - setMcpServer(server: Server): void
    + getMcpServer(): Server
}

BaseMcpTool <|-- ToolRegistry : 注册到
@enduml
```

### 3. 会话管理组件

```plantuml
@startuml
class SessionManager <<会话管理器>> {
    - storage: SessionStorage
    - ttl: number
    - enableRedis: boolean
    __
    + createSession(userId?, organizationId?, tenantId?, data?): Promise<Session>
    + findSession(id: String): Promise<Session>
    + updateSession(id: String, data): Promise<void>
    + deleteSession(id: String): Promise<void>
    + getSessionStats(): Promise<SessionStats>
    + cleanup(): Promise<void>
}

interface SessionStorage <<接口>> {
    + createSession(session): Promise<Session>
    + findSession(id: String): Promise<Session>
    + updateSession(id: String, data): Promise<void>
    + deleteSession(id: String): Promise<void>
    + getAllSessions(): Promise<Session[]>
    + cleanup(): Promise<void>
}

class MemoryStorage <<内存存储>> {
    - sessions: Map<String, Session>
    __
    + createSession(session): Promise<Session>
    + findSession(id: String): Promise<Session>
    + updateSession(id: String, data): Promise<void>
    + deleteSession(id: String): Promise<void>
    + getAllSessions(): Promise<Session[]>
    + cleanup(): Promise<void>
}

class RedisStorage <<Redis 存储>> {
    - client: Redis
    - prefix: String
    __
    + createSession(session): Promise<Session>
    + findSession(id: String): Promise<Session>
    + updateSession(id: String, data): Promise<void>
    + deleteSession(id: String): Promise<void>
    + getAllSessions(): Promise<Session[]>
    + cleanup(): Promise<void>
    - serialize(session: Session): String
    - deserialize(json: String): Session
    - loadAllSessions(): Promise<Map<String, Session>>
}

class Session {
    + id: String
    + userId: String
    + organizationId: String
    + tenantId: String
    + createdAt: Date
    + lastAccessedAt: Date
    + data: Record<String, unknown>
}

SessionManager --> SessionStorage : 使用
SessionStorage <|.. MemoryStorage : 实现
SessionStorage <|.. RedisStorage : 实现
@enduml
```

### 4. 认证管理组件

```plantuml
@startuml
class AuthManager <<单例模式>> {
    - {static} instance: AuthManager
    __
    + {static} getInstance(): AuthManager
    + login(): Promise<boolean>
    + logout(): Promise<void>
    + getAuthStatus(): AuthStatus
    .. 认证状态管理 ..
    + setAuthState(userId, tenantId?, organizationId?): void
    + clearAuthState(): void
    .. 用户信息 ..
    + getUserId(): String
    + getTenantId(): String
    + getOrganizationId(): String
}

interface AuthStatus <<接口>> {
    + isAuthenticated: boolean
    + userId: String
    + tenantId: String
    + organizationId: String
}

AuthManager --> AuthStatus : 返回
@enduml
```

### 5. 服务器管理器组件

```plantuml
@startuml
class ServerInstance {
    + id: String
    + server: McpServer
    + config: McpServerConfig
    + createdAt: Date
    + lastStartedAt: Date
}

class McpServerManager {
    - servers: Map<String, ServerInstance>
    - primaryServerId: String
    - logger: Logger
    .. 服务器生命周期管理 ..
    + start(config, serverId?, transportType?): Promise<boolean>
    + stop(serverId?): Promise<boolean>
    + restart(serverId?): Promise<boolean>
    + removeServer(serverId): Promise<boolean>
    .. 查询方法 ..
    + getStatus(serverId?): Promise<McpServerStatus>
    + getServer(serverId?): McpServer
    + getServerIds(): String[]
    + getAllStatus(): Promise<Map<String, McpServerStatus>>
    .. 统计方法 ..
    + getStats(): McpServerStats
    .. 主服务器管理 ..
    + setPrimaryServer(serverId): boolean
    + getPrimaryServerId(): String
    + getPrimaryServer(): McpServer
    .. 清理方法 ..
    + stopAll(): Promise<number>
    + cleanup(): Promise<void>
}

McpServerManager --> ServerInstance : 管理
@enduml
```

## 请求响应序列图

### MCP 服务器启动流程

```plantuml
@startuml
actor 用户 as User
participant McpServer
participant "传输层" as Transport
participant "工具注册表" as ToolRegistry
participant "会话管理器" as SessionManager

User -> McpServer : start(TransportType.STDIO)
activate McpServer
McpServer -> Transport : connect()
Transport --> McpServer : connected
McpServer -> ToolRegistry : setMcpServer(server)
McpServer -> SessionManager : setMcpServer(manager)
McpServer -> McpServer : isStarted = true
McpServer --> User : started
deactivate McpServer
@enduml
```

### 工具调用流程

```plantuml
@startuml
actor 用户 as User
participant McpServer
participant "工具注册表" as ToolRegistry
participant "认证管理器" as AuthManager
participant "工具" as BaseMcpTool

User -> McpServer : invokeTool(toolName, args)
activate McpServer
McpServer -> ToolRegistry : getTool(toolName)
ToolRegistry -> BaseMcpTool : getToolDefinition()
McpServer -> AuthManager : getAuthStatus()
AuthManager --> McpServer : authStatus.isAuthenticated
McpServer -> AuthManager : getUserId()
AuthManager --> McpServer : authStatus.userId
McpServer -> BaseMcpTool : execute(args)
activate BaseMcpTool
BaseMcpTool --> McpServer : createSuccessResult(content)
deactivate BaseMcpTool
McpServer --> User : result
deactivate McpServer
@enduml
```

### 会话管理流程

```plantuml
@startuml
actor 用户 as User
participant McpServer
participant "会话管理器" as SessionManager
participant "内存存储" as MemoryStorage

User -> McpServer : invokeTool(toolName, args)
activate McpServer
McpServer -> SessionManager : findSession(sessionId)
SessionManager -> MemoryStorage : findSession(id)
MemoryStorage --> SessionManager : session object
SessionManager -> MemoryStorage : updateSession(id, lastAccessedAt)
SessionManager --> McpServer : session object
McpServer -> BaseMcpTool : execute(args)
activate BaseMcpTool
BaseMcpTool --> McpServer : result
deactivate BaseMcpTool
McpServer -> SessionManager : updateSession(id, lastAccessedAt)
SessionManager -> MemoryStorage : updateSession(id, data)
MemoryStorage --> SessionManager : updated session
McpServer --> User : result
deactivate McpServer
@enduml
```

## 部署架构

```plantuml
@startuml
!define RECTANGLE class

package "客户端层" {
    [用户客户端] as UserClient
    [MCP 客户端] as McpClient
    [Web 客户端] as WebClient
    [WebSocket 客户端] as WebSocketClient
}

package "MCP 服务端" {
    [Stdio MCP 服务器] as StdioMcpServer
    [HTTP MCP 服务器] as HttpMcpServer
    [WebSocket MCP 服务器] as WebSocketMcpServer
    [MCP 服务器管理器] as McpServerManager
}

package "基础设施" {
    [OAuth 授权服务器] as OAuthAuthServer
    [Redis 会话存储] as SessionStorageRedis
}

UserClient --> StdioMcpServer : 使用 Stdio 协议
WebClient --> HttpMcpServer : 使用 HTTP 协议
WebSocketClient --> WebSocketMcpServer : 使用 WebSocket 协议

McpServerManager --> StdioMcpServer : 管理
McpServerManager --> HttpMcpServer : 管理
McpServerManager --> WebSocketMcpServer : 管理

StdioMcpServer --> SessionStorageRedis : 存储会话
HttpMcpServer --> SessionStorageRedis : 存储会话
WebSocketMcpServer --> SessionStorageRedis : 存储会话

StdioMcpServer --> OAuthAuthServer : 验证令牌
HttpMcpServer --> OAuthAuthServer : 验证令牌
WebSocketMcpServer --> OAuthAuthServer : 验证令牌

OAuthAuthServer --> StdioMcpServer : 返回 JWKS
OAuthAuthServer --> HttpMcpServer : 返回 JWKS
OAuthAuthServer --> WebSocketMcpServer : 返回 JWKS
@enduml
```

## 测试架构

### 单元测试结构

```plantuml
@startuml
package "McpServer 单元测试" {
    [McpServerSpec]
    [McpServerManagerSpec]
    [BaseMcpToolSpec]
    [ToolRegistrySpec]
    [SessionManagerSpec]
    [AuthManagerSpec]
    [SessionStorageSpec]
    [RedisStorageSpec]
    [TransportFactorySpec]
}

package "认证测试" {
    [AuthManagerSpec2] as AuthMgrSpec2
    [JwtServiceSpec]
    [JwksServiceSpec]
    [OAuthControllerSpec]
    [AuthControllerSpec]
    [OAuthE2eSpec]
}

package "集成测试" {
    [McpServerIntegrationSpec]
    [OAuthIntegrationSpec]
    [SessionIntegrationSpec]
    [TransportIntegrationSpec]
}

[McpServerSpec] ..> [ToolRegistrySpec] : 依赖
[McpServerSpec] ..> [SessionManagerSpec] : 依赖
[McpServerSpec] ..> [AuthManagerSpec] : 依赖
[McpServerSpec] ..> [TransportFactorySpec] : 依赖
[McpServerManagerSpec] ..> [McpServerSpec] : 依赖

[OAuthControllerSpec] ..> [JwksServiceSpec] : 依赖
[OAuthControllerSpec] ..> [JwtServiceSpec] : 依赖
[OAuthControllerSpec] ..> [AuthControllerSpec] : 依赖

[McpServerIntegrationSpec] ..> [SessionIntegrationSpec] : 依赖
[OAuthIntegrationSpec] ..> [AuthControllerSpec] : 依赖
[McpServerIntegrationSpec] ..> [TransportIntegrationSpec] : 依赖
@enduml
```

## 状态转换图

### McpServer 状态机

```plantuml
@startuml
[*] --> Stopped : 启动失败
[*] --> Initializing : 调用 start()

Initializing --> Running : 传输层连接成功
Initializing --> Stopped : 启动失败

Running --> Stopping : 调用 stop()
Running --> Stopped : 发生错误
Running --> Restarting : 调用 restart()

Restarting --> Stopped : 重启失败

Stopping --> [*] : 停止完成

Restarting --> Running : 重启成功
Running --> Running : 重启后回到运行状态
@enduml
```

### 工具注册状态机

```plantuml
@startuml
[*] --> Unregistered : 工具未注册
Unregistered --> Registered : 调用 registerTool()
Unregistered --> DuplicateError : 重复注册同名工具

Registered --> Active : 调用 invokeTool()

Active --> Executing : 工具执行中
Active --> Failed : 工具执行失败

Executing --> Completed : 工具执行成功
Completed --> Active : 可以再次调用

Failed --> Active : 重试执行
@enduml
```

### 会话生命周期状态机

```plantuml
@startuml
[*] --> Active : 创建会话

Active --> Inactive : 会话过期
Active --> Deleted : 会话被删除

Inactive --> [*] : 清理

Deleted --> [*] : 清理
@enduml
```

### 认证状态机

```plantuml
@startuml
[*] --> Unauthenticated : 未认证

Unauthenticated --> Authenticated : 调用 setAuthState()

Authenticated --> Unauthenticated : 调用 clearAuthState()

Authenticated --> Failed : 认证失败

Failed --> Unauthenticated : 清理失败后重试
@enduml
```

### 传输层状态机

```plantuml
@startuml
[*] --> Disconnected : 初始状态
Disconnected --> Connecting : 连接中

Connecting --> Connected : 连接成功
Connecting --> Disconnected : 连接失败

Connected --> Disconnected : 连接断开
Connected --> Disconnecting : 断开中

Disconnecting --> Disconnected : 断开完成
@enduml
```

## 接口定义

### 配置接口

```typescript
interface McpServerConfig {
	name: string;
	version: string;
	session?: SessionManagerConfig;
	authEnabled?: boolean;
	transport?: TransportConfig;
}

interface SessionManagerConfig {
	ttl: number;
	enableRedis: boolean;
	redisConfig?: RedisConfig;
}

interface RedisConfig {
	redisUrl?: string;
}
```

### 工具接口

```typescript
interface McpToolDefinition {
	name: string;
	description: string;
	inputSchema: ZodType;
}

interface McpToolResult {
	isError: boolean;
	content: unknown;
	error?: string;
}
```

### 会话接口

```typescript
interface Session {
	id: string;
	userId: string | null;
	organizationId: string | null;
	tenantId: string | null;
	createdAt: Date;
	lastAccessedAt: Date;
	data: Record<string, unknown>;
}

interface SessionStats {
	total: number;
	active: number;
	expired: number;
}

interface SessionStorage {
	createSession(session: Omit<Session, 'id'>): Promise<Session>;
	findSession(id: string): Promise<Session | null>;
	updateSession(id: string, data: Partial<Record<string, unknown>>): Promise<void>;
	deleteSession(id: string): Promise<void>;
}
```

### 认证接口

```typescript
interface AuthStatus {
	isAuthenticated: boolean;
	userId: string | null;
	tenantId: string | null;
	organizationId: string | null;
}
```

### 传输接口

```typescript
enum TransportType {
	STDIO = 'stdio',
	HTTP = 'http',
	WEBSOCKET = 'websocket'
}

interface TransportConfig {
	type: TransportType;
	http?: {
		host: string;
		port: number;
		path: string;
	};
	websocket?: {
		host: string;
		port: number;
		path: string;
	};
}

interface TransportResult {
	type: TransportType;
	transport: StdioServerTransport | HttpServerTransport | WebSocketServerTransport;
	url?: string;
	config: TransportConfig;
}
```

## 架构决策记录

### 1. 为什么使用工厂模式创建传输层？

**问题**: 不同的 AI 助手可能需要不同的传输方式（Stdio、HTTP、WebSocket）

**决策**: 使用工厂模式

-   工厂方法：`TransportFactory.createTransportFromEnv(server, transportType)`
-   优点：
    -   统一传输层创建逻辑
    -   支持通过环境变量配置
    -   易于扩展新的传输类型

### 2. 为什么使用单例模式实现 AuthManager？

**问题**: 多个服务器实例需要共享认证状态

**决策**: 单例模式

-   方法：`AuthManager.getInstance()`
-   优点：
    -   确保全局唯一的认证状态
    -   避免多个实例导致的认证状态不同步
    -   简化 JWT 令牌管理

### 3. 为什么使用 Map 管理会话？

**问题**: 需要支持内存和 Redis 两种存储方式

**决策**: 接口驱动

-   接口：`SessionStorage`
-   实现类：`MemoryStorage`、`RedisStorage`
-   优点：
    -   统一的会话管理接口
    -   易于切换存储实现
    -   避免业务代码直接依赖具体存储实现

### 4. 为什么使用 ToolRegistry 管理工具？

**问题**: 需要动态注册和调用工具

**决策**: 注册表模式

-   方法：`ToolRegistry`
-   优点：
    -   集中式工具管理
    -   提供工具查找和调用接口
    -   支持工具版本控制

### 5. 为什么使用 McpServerManager？

**问题**: 需要管理多个 MCP 服务器实例

**决策**: 管理器模式

-   类：`McpServerManager`
-   方法：`start()`, `stop()`, `restart()`, `removeServer()`, `stopAll()`
-   优点：
    -   统一服务器管理
    -   支持多服务器实例
    -   提供服务器统计信息

## 扩展指南

### 创建自定义工具

```typescript
import { BaseMcpTool, McpToolResult } from '@oksai/mcp-server';

export class MyCustomTool extends BaseMcpTool {
	constructor() {
		super('my_tool', '我的自定义工具');
	}

	async execute(args: Record<string, unknown>): Promise<McpToolResult> {
		const input = args.input as string;

		// 业务逻辑
		const result = processInput(input);

		return this.createSuccessResult({ output: result });
	}
}
```

### 创建自定义传输层

```typescript
import { TransportType } from '@oksai/mcp-server';
import { BaseTransport } from '@oksai/mcp-server';

export class CustomTransport extends BaseTransport {
	async connect(): Promise<void> {
		// 连接逻辑
	}

	async disconnect(): Promise<void> {
		// 断开连接逻辑
	}

	async send(message: string): Promise<void> {
		// 发送消息逻辑
	}
}
```

### 创建自定义会话存储

```typescript
import { SessionStorage, Session } from '@oksai/mcp-server';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PostgresSessionStorage implements SessionStorage {
	constructor(
		@InjectRepository(SessionEntity)
		private readonly sessionRepo: EntityRepository<SessionEntity>
	) {}

	async createSession(session: Omit<Session, 'id'>): Promise<Session> {
		// 数据库逻辑
		const entity = this.sessionRepo.create(session);
		await this.sessionRepo.getEntityManager().persistAndFlush(entity);
		return entity;
	}

	async findSession(id: string): Promise<Session | null> {
		// 数据库逻辑
		return await this.sessionRepo.findOne({ id });
	}

	// 其他方法实现...
}
```

## 安全考虑

### 1. 认证集成

```typescript
interface AuthManager {
	/**
	 * 设置认证状态
	 *
	 * @param userId - 用户 ID
	 * @param tenantId - 租户 ID
	 * @param organizationId - 组织 ID
	 */
	setAuthState(userId: string, tenantId?: string, organizationId?: string): void;

	/**
	 * 获取认证状态
	 */
	getAuthStatus(): AuthStatus;
}
```

### 2. 会话安全

```typescript
interface Session {
	id: string;
	userId: string | null;
	tenantId: string | null;
	organizationId: string | null;
	createdAt: Date;
	lastAccessedAt: Date;
	data: Record<string, unknown>;
}
```

### 3. 输入验证

```typescript
interface McpToolInputSchema {
	type: 'object';
	properties: Record<string, unknown>;
	required: string[];
}

interface McpToolOutputSchema {
	type: 'object';
	properties: Record<string, unknown>;
	required: string[];
}
```

## 性能考虑

### 1. 连接池

-   HTTP 传输层使用连接池
-   WebSocket 传输层使用连接池
-   Redis 使用连接池

### 2. 缓存策略

-   Redis 连接池缓存
-   会话缓存
-   工具结果缓存（可选）

### 3. 优化建议

-   使用 Map 查找：`O(1)` 的复杂度
-   使用 Set 去重：`O(n)` 的复杂度
-   使用 Set 成员检查：`O(1)` 的复杂度

## 维护指南

### 代码风格

-   使用中文注释和错误消息
-   遵循项目 AGENTS.md 规范
-   使用 Prettier 格式化代码
-   遵循 ESLint 规则

### 测试指南

-   单元测试覆盖率要求：80%+
-   集成测试覆盖关键流程
-   使用 Mock 隔离外部依赖
-   端口和类型使用中文描述

### 文档更新

-   更新代码时同步更新文档
-   添加示例代码时添加中文注释
-   添加配置说明时添加环境变量说明

## 参考资料

-   [MCP 协议规范](https://spec.modelcontextprotocol.io/)
-   [NestJS 最佳实践](https://docs.nestjs.com/)
-   [TypeScript 最佳实践](https://www.typescriptlang.org/docs/handbook/declaration-files/modules/classes.html)

---

**文档维护**: 本文档随项目进展持续更新，每次重大架构变更后必须更新
**最后更新**: 2026-02-10
