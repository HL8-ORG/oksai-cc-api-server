/**
 * 核心 MCP 服务器
 *
 * 实现 MCP 协议规范，支持工具注册、调用和会话管理
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TransportType, TransportConfig, TransportResult } from './transports/types';
import { TransportFactory } from './transports/transport-factory';
import { BaseMcpTool, McpToolDefinition, McpToolResult } from './tools/base-tool';
import { ToolRegistry } from './tools/tool-registry';
import { SessionManager, SessionManagerConfig } from './session/session-manager';
import { AuthManager } from './common/auth-manager';
import { Logger } from '@nestjs/common';

/**
 * MCP 服务器配置接口
 */
export interface McpServerConfig {
	/** 服务器名称 */
	name: string;
	/** 服务器版本 */
	version: string;
	/** 会话配置 */
	session?: SessionManagerConfig;
	/** 是否启用认证 */
	authEnabled?: boolean;
	/** 传输配置 */
	transport?: TransportConfig;
}

/**
 * MCP 服务器状态接口
 */
export interface McpServerStatus {
	/** 是否运行中 */
	isRunning: boolean;
	/** 传输类型 */
	transportType: TransportType | null;
	/** 已注册的工具数量 */
	toolCount: number;
	/** 会话统计 */
	sessionStats: {
		total: number;
		active: number;
		expired: number;
	};
	/** 认证状态 */
	authStatus: {
		isAuthenticated: boolean;
		userId: string | null;
		tenantId: string | null;
		organizationId: string | null;
	};
}

/**
 * 核心 MCP 服务器类
 *
 * 实现 MCP 协议规范，支持工具注册、调用和会话管理
 */
export class McpServer {
	private server: Server | null = null;
	private transport: TransportResult | null = null;
	private toolRegistry: ToolRegistry;
	private sessionManager: SessionManager;
	private authManager: AuthManager;
	private config: McpServerConfig;
	private logger: Logger;
	private sessionId: string | null = null;
	private isStarted: boolean = false;

	/**
	 * 构造函数
	 *
	 * @param config - MCP 服务器配置
	 * @param sessionId - 会话 ID（可选），用于恢复现有会话
	 * @throws {Error} 当配置无效时
	 *
	 * @example
	 * ```typescript
	 * const config = {
	 *   name: 'My MCP Server',
	 *   version: '1.0.0',
	 *   authEnabled: true,
	 *   session: {
	 *     ttl: 30 * 60 * 1000,
	 *     enableRedis: false
	 *   }
	 * };
	 * const server = new McpServer(config, 'session-123');
	 * ```
	 */
	constructor(config: McpServerConfig, sessionId?: string) {
		this.config = config;
		this.sessionId = sessionId || null;
		this.logger = new Logger('McpServer');

		this.toolRegistry = new ToolRegistry();
		this.sessionManager = new SessionManager(config.session);
		this.authManager = AuthManager.getInstance();

		this.logger.log(`MCP 服务器初始化: ${config.name} v${config.version}`);
	}

	/**
	 * 启动 MCP 服务器
	 *
	 * 创建 MCP 服务器实例并启动指定的传输层
	 *
	 * @param transportType - 传输类型（可选），默认从环境变量读取
	 * @returns 启动是否成功
	 *
	 * @throws {Error} 当传输类型不支持时
	 * @throws {Error} 当启动失败时
	 *
	 * @example
	 * ```typescript
	 * // 使用 Stdio 传输层
	 * const started = await server.start(TransportType.STDIO);
	 *
	 * // 使用默认传输层
	 * const started = await server.start();
	 * ```
	 */
	async start(transportType?: TransportType): Promise<boolean> {
		try {
			if (this.isStarted) {
				this.logger.warn('服务器已经在运行中');
				return true;
			}

			this.logger.log(`启动 MCP 服务器...`);

			const type = transportType || this.getTransportTypeFromEnv();

			this.server = new Server(
				{
					name: this.config.name,
					version: this.config.version
				},
				{
					capabilities: {
						tools: {}
					}
				}
			);

			this.toolRegistry.setMcpServer(this.server as any);

			if (type === TransportType.STDIO) {
				const transport = new StdioServerTransport();
				await this.server.connect(transport);
				this.transport = {
					type: TransportType.STDIO,
					transport
				};
			} else if (type === TransportType.HTTP || type === TransportType.WEBSOCKET) {
				this.transport = await TransportFactory.createTransportFromEnv(this.server as any);
			} else {
				throw new Error(`不支持的传输类型: ${type}`);
			}

			this.isStarted = true;
			this.logger.log(`MCP 服务器已启动 (${type})`);

			if (this.config.authEnabled) {
				await this.initializeAuth();
			}

			if (this.sessionId) {
				await this.initializeSession(this.sessionId);
			}

			return true;
		} catch (error) {
			this.logger.error('启动 MCP 服务器失败', error);
			return false;
		}
	}

	/**
	 * 停止 MCP 服务器
	 *
	 * 关闭传输层和 MCP 服务器实例，释放所有资源
	 *
	 * @throws {Error} 当停止失败时
	 *
	 * @example
	 * ```typescript
	 * await server.stop();
	 * ```
	 */
	async stop(): Promise<void> {
		try {
			if (!this.isStarted) {
				this.logger.warn('服务器未运行');
				return;
			}

			this.logger.log('停止 MCP 服务器...');

			if (this.transport) {
				await TransportFactory.shutdownTransport(this.transport);
				this.transport = null;
			}

			if (this.server) {
				await this.server.close();
				this.server = null;
			}

			this.isStarted = false;
			this.logger.log('MCP 服务器已停止');
		} catch (error) {
			this.logger.error('停止 MCP 服务器失败', error);
		}
	}

	/**
	 * 注册单个工具
	 *
	 * 将工具注册到工具注册表，使其可以被 AI 助手调用
	 *
	 * @param tool - 要注册的工具实例
	 * @throws {Error} 当工具名称已存在时
	 *
	 * @example
	 * ```typescript
	 * const tool = new MyTool();
	 * server.registerTool(tool);
	 * ```
	 */
	registerTool(tool: BaseMcpTool): void {
		this.toolRegistry.registerTool(tool);
		this.logger.debug(`工具 ${tool.name} 已注册`);
	}

	/**
	 * 批量注册工具
	 *
	 * 将多个工具注册到工具注册表
	 *
	 * @param tools - 要注册的工具数组
	 * @throws {Error} 当工具名称冲突时
	 *
	 * @example
	 * ```typescript
	 * const tools = [new EchoTool(), new CalculatorTool()];
	 * server.registerTools(tools);
	 * ```
	 */
	registerTools(tools: BaseMcpTool[]): void {
		this.toolRegistry.registerTools(tools);
		this.logger.debug(`批量注册 ${tools.length} 个工具`);
	}

	/**
	 * 调用工具
	 *
	 * 通过名称和参数调用已注册的工具
	 *
	 * @param name - 工具名称
	 * @param args - 工具参数
	 * @returns 工具执行结果
	 * @throws {Error} 当工具不存在时
	 * @throws {Error} 当工具执行失败时
	 *
	 * @example
	 * ```typescript
	 * const result = await server.invokeTool('calculator', {
	 *   a: 5,
	 *   b: 3
	 * });
	 * if (!result.isError) {
	 *   console.log(result.content);
	 * }
	 * ```
	 */
	async invokeTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
		const result = await this.toolRegistry.invokeTool(name, args);
		return result as McpToolResult;
	}

	/**
	 * 获取服务器状态
	 *
	 * 返回当前服务器的运行状态、工具统计、会话统计和认证状态
	 *
	 * @returns 服务器状态对象
	 *
	 * @example
	 * ```typescript
	 * const status = await server.getStatus();
	 * console.log(`服务器运行中: ${status.isRunning}`);
	 * console.log(`工具数量: ${status.toolCount}`);
	 * console.log(`活动会话: ${status.sessionStats.active}`);
	 * ```
	 */
	async getStatus(): Promise<McpServerStatus> {
		const sessionStats = await this.sessionManager.getSessionStats();
		const authStatus = this.authManager.getAuthStatus() as any;

		return {
			isRunning: this.isStarted,
			transportType: this.transport?.type || null,
			toolCount: this.toolRegistry.getToolCount(),
			sessionStats: {
				total: sessionStats.total,
				active: sessionStats.active,
				expired: sessionStats.expired
			},
			authStatus: {
				isAuthenticated: authStatus.isAuthenticated,
				userId: authStatus.userId,
				tenantId: authStatus.tenantId,
				organizationId: authStatus.organizationId
			}
		};
	}

	/**
	 * 列出所有已注册的工具
	 *
	 * 返回所有已注册工具的定义信息
	 *
	 * @returns 工具定义数组
	 *
	 * @example
	 * ```typescript
	 * const tools = server.listTools();
	 * tools.forEach(tool => {
	 *   console.log(`${tool.name}: ${tool.description}`);
	 * });
	 * ```
	 */
	listTools(): McpToolDefinition[] {
		return this.toolRegistry.getToolDefinitions();
	}

	private async initializeAuth(): Promise<boolean> {
		try {
			const success = await this.authManager.login();
			if (success) {
				this.logger.log('认证初始化成功');
			} else {
				this.logger.warn('认证初始化失败');
			}
			return success;
		} catch (error) {
			this.logger.error('认证初始化失败', error);
			return false;
		}
	}

	private async initializeSession(sessionId: string): Promise<void> {
		try {
			const session = await this.sessionManager.findSession(sessionId);

			if (session) {
				this.logger.log(`会话已存在: ${sessionId}`);
			} else {
				const userId = this.authManager.getUserId();
				const organizationId = this.authManager.getOrganizationId();
				const tenantId = this.authManager.getTenantId();

				this.sessionId = await this.sessionManager.createSession(
					userId || undefined,
					organizationId || undefined,
					tenantId || undefined,
					{}
				);

				this.logger.log(`新会话已创建: ${this.sessionId}`);
			}
		} catch (error) {
			this.logger.error('初始化会话失败', error);
		}
	}

	private getTransportTypeFromEnv(): TransportType {
		const transportEnv = process.env.MCP_TRANSPORT?.toLowerCase();

		switch (transportEnv) {
			case 'stdio':
				return TransportType.STDIO;
			case 'http':
				return TransportType.HTTP;
			case 'websocket':
			case 'ws':
				return TransportType.WEBSOCKET;
			default:
				return TransportType.STDIO;
		}
	}

	/**
	 * 获取工具注册表实例
	 *
	 * 返回工具注册表实例，用于高级工具管理
	 *
	 * @returns 工具注册表实例
	 */
	getToolRegistry(): ToolRegistry {
		return this.toolRegistry;
	}

	/**
	 * 获取会话管理器实例
	 *
	 * 返回会话管理器实例，用于会话管理操作
	 *
	 * @returns 会话管理器实例
	 */
	getSessionManager(): SessionManager {
		return this.sessionManager;
	}

	/**
	 * 获取认证管理器实例
	 *
	 * 返回认证管理器实例，用于认证相关操作
	 *
	 * @returns 认证管理器实例
	 */
	getAuthManager(): AuthManager {
		return this.authManager;
	}

	/**
	 * 获取当前会话 ID
	 *
	 * @returns 当前会话 ID，如果不存在则返回 null
	 */
	getSessionId(): string | null {
		return this.sessionId;
	}

	/**
	 * 设置会话 ID
	 *
	 * @param sessionId - 要设置的会话 ID
	 */
	setSessionId(sessionId: string): void {
		this.sessionId = sessionId;
	}

	/**
	 * 清理服务器资源
	 *
	 * 停止服务器并清理所有资源
	 *
	 * @throws {Error} 当清理失败时
	 *
	 * @example
	 * ```typescript
	 * await server.cleanup();
	 * ```
	 */
	async cleanup(): Promise<void> {
		try {
			await this.stop();
			this.logger.log('资源已清理');
		} catch (error) {
			this.logger.error('清理资源失败', error);
		}
	}
}

/**
 * 创建并启动 MCP 服务器
 *
 * 便捷函数，用于创建并启动 MCP 服务器
 *
 * @param config - 服务器配置（可选）
 * @param transportType - 传输类型（可选），默认为 STDIO
 * @returns MCP 服务器实例和传输结果
 * @throws {Error} 当启动失败时
 *
 * @example
 * ```typescript
 * const { server, transport } = await createAndStartMcpServer({
 *   name: 'My Server',
 *   version: '1.0.0'
 * }, TransportType.STDIO);
 *
 * console.log(`传输类型: ${transport.type}`);
 * ```
 */
export async function createAndStartMcpServer(
	config?: Partial<McpServerConfig>,
	transportType?: TransportType
): Promise<{ server: McpServer; transport: TransportResult }> {
	const defaultConfig: McpServerConfig = {
		name: '@oksai/mcp-server',
		version: '0.1.0',
		authEnabled: false,
		session: {
			ttl: 30 * 60 * 1000,
			enableRedis: false
		}
	};

	const mergedConfig = { ...defaultConfig, ...config };
	const server = new McpServer(mergedConfig);

	const started = await server.start(transportType);

	if (!started) {
		throw new Error('启动 MCP 服务器失败');
	}

	return {
		server,
		transport: server['transport'] as TransportResult
	};
}
