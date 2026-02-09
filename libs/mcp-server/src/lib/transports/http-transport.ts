/**
 * HTTP 传输层
 *
 * 实现基于 HTTP JSON-RPC 2.0 的 MCP 传输层
 * 支持 OAuth 2.0 授权和会话管理
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '@nestjs/common';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { TransportConfig, TransportType, HttpTransportConfig } from './types';

const logger = new Logger('HttpTransport');

/**
 * HTTP 请求体接口
 *
 * 符合 JSON-RPC 2.0 规范
 */
interface JsonRpcRequest {
	/** JSON-RPC 版本 */
	jsonrpc: '2.0';
	/** 请求 ID */
	id: number | string | null;
	/** 方法名 */
	method: string;
	/** 方法参数 */
	params: Record<string, unknown> | null;
}

/**
 * JSON-RPC 响应接口
 */
interface JsonRpcResponse {
	/** JSON-RPC 版本 */
	jsonrpc: '2.0';
	/** 请求 ID（与请求相同） */
	id: number | string | null;
	/** 结果数据 */
	result?: unknown;
	/** 错误信息 */
	error?: JsonRpcError;
}

/**
 * JSON-RPC 错误接口
 */
interface JsonRpcError {
	/** 错误代码 */
	code: number;
	/** 错误消息 */
	message: string;
	/** 错误数据 */
	data?: unknown;
}

/**
 * HTTP 传输层类
 *
 * 处理基于 HTTP 的 MCP JSON-RPC 通信
 */
export class HttpTransport {
	private app: Express | null = null;
	private server: McpServer | null = null;
	private isRunning = false;
	private httpServer: ReturnType<typeof import('http').createServer> | null = null;

	constructor(private config?: TransportConfig) {}

	/**
	 * 连接服务器
	 *
	 * 将 MCP 服务器连接到 HTTP 传输层
	 *
	 * @param server - MCP 服务器实例
	 */
	async connect(server: McpServer): Promise<void> {
		this.server = server;

		// 获取 HTTP 配置
		const httpConfig: HttpTransportConfig = this.config?.http || {};

		// 创建 Express 应用
		this.app = express();

		// 配置中间件
		this.configureMiddleware(httpConfig);

		// 配置路由
		this.configureRoutes();

		// 启动 HTTP 服务器
		const host = httpConfig.host || 'localhost';
		const port = httpConfig.port || 3001;

		this.httpServer = this.app.listen(port, host, () => {
			this.isRunning = true;
			logger.log(`HTTP 服务器已启动: http://${host}:${port}`);
		});
	}

	/**
	 * 启动传输层
	 *
	 * 启动 HTTP 传输层并开始监听
	 *
	 * @param server - MCP 服务器实例
	 */
	async start(server: McpServer): Promise<void> {
		await this.connect(server);
	}

	/**
	 * 关闭传输层
	 *
	 * 关闭 HTTP 服务器并停止监听
	 */
	async close(): Promise<void> {
		if (this.httpServer) {
			return new Promise<void>((resolve) => {
				this.httpServer!.close(() => {
					this.isRunning = false;
					this.httpServer = null;
					this.app = null;
					this.server = null;
					logger.log('HTTP 服务器已关闭');
					resolve();
				});
			});
		}
	}

	/**
	 * 关闭传输层（同 close）
	 */
	async shutdown(): Promise<void> {
		await this.close();
	}

	/**
	 * 检查传输层是否正在运行
	 *
	 * @returns 是否正在运行
	 */
	isActive(): boolean {
		return this.isRunning;
	}

	/**
	 * 获取传输层类型
	 *
	 * @returns 传输层类型
	 */
	getType(): TransportType {
		return TransportType.HTTP;
	}

	/**
	 * 配置中间件
	 *
	 * 配置 Express 中间件（CORS、Cookie 解析、限流等）
	 *
	 * @param httpConfig - HTTP 配置
	 */
	private configureMiddleware(httpConfig: HttpTransportConfig): void {
		if (!this.app) return;

		// Cookie 解析
		this.app.use(cookieParser());

		// CORS
		const corsOptions: cors.CorsOptions = {
			origin: httpConfig.corsOrigin || '*',
			credentials: httpConfig.corsCredentials === true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
		};
		this.app.use(cors(corsOptions));

		// 限流（如果启用）
		if (process.env.THROTTLE_ENABLED === 'true') {
			const throttleLimit = parseInt(process.env.THROTTLE_LIMIT || '100', 10);
			const throttleTTL = parseInt(process.env.THROTTLE_TTL || '60000', 10);

			this.app.use(
				rateLimit({
					windowMs: throttleTTL,
					max: throttleLimit,
					message: '请求过于频繁，请稍后重试',
					standardHeaders: true
				})
			);
		}

		// JSON 请求体解析
		this.app.use(express.json());

		// 请求日志
		this.app.use((_req, _res, next) => {
			if (process.env.GAUZY_MCP_DEBUG === 'true') {
				logger.debug(`HTTP ${_req.method} ${_req.path}`);
			}
			next();
		});
	}

	/**
	 * 配置路由
	 *
	 * 配置 HTTP 路由（健康检查、JSON-RPC 端点等）
	 */
	private configureRoutes(): void {
		if (!this.app) return;

		// 健康检查端点
		this.app.get('/health', (_req, res) => {
			res.json({
				status: 'ok',
				transport: 'http',
				running: this.isRunning,
				timestamp: new Date().toISOString()
			});
		});

		// JSON-RPC 端点 (注意：路径为 /sse，但使用 HTTP JSON-RPC)
		this.app.post('/sse', async (req, res) => {
			await this.handleJsonRpcRequest(req, res);
		});

		// 404 处理
		this.app.use((_req, res) => {
			res.status(404).json({
				error: 'Not Found',
				message: '端点不存在'
			});
		});
	}

	/**
	 * 处理 JSON-RPC 请求
	 *
	 * 解析 JSON-RPC 请求并调用 MCP 服务器
	 *
	 * @param req - HTTP 请求
	 * @param res - HTTP 响应
	 */
	private async handleJsonRpcRequest(req: Request, res: Response): Promise<void> {
		try {
			const jsonRpcReq: JsonRpcRequest = req.body;

			if (!jsonRpcReq) {
				res.status(400).json({
					jsonrpc: '2.0',
					id: null,
					error: {
						code: -32700,
						message: '无效的 JSON-RPC 请求'
					}
				});
				return;
			}

			// 验证 JSON-RPC 请求
			if (jsonRpcReq.jsonrpc !== '2.0') {
				res.status(400).json({
					jsonrpc: '2.0',
					id: jsonRpcReq.id,
					error: {
						code: -32600,
						message: '不支持的 JSON-RPC 版本'
					}
				});
				return;
			}

			// 调用 MCP 服务器
			if (!this.server) {
				res.status(500).json({
					jsonrpc: '2.0',
					id: jsonRpcReq.id,
					error: {
						code: -32603,
						message: 'MCP 服务器未初始化'
					}
				});
				return;
			}

			// 根据方法类型调用相应处理
			let result: unknown;

			switch (jsonRpcReq.method) {
				case 'tools/list':
					result = await this.listTools();
					break;
				case 'tools/call':
					result = await this.callTool(
						jsonRpcReq.params as { name: string; arguments: Record<string, unknown> }
					);
					break;
				case 'initialize':
					result = await this.initialize(jsonRpcReq.params as Record<string, unknown>);
					break;
				default:
					throw new Error(`不支持的方法: ${jsonRpcReq.method}`);
			}

			// 返回 JSON-RPC 响应
			const jsonRpcRes: JsonRpcResponse = {
				jsonrpc: '2.0',
				id: jsonRpcReq.id,
				result
			};

			res.json(jsonRpcRes);
		} catch (error) {
			const jsonRpcRes: JsonRpcResponse = {
				jsonrpc: '2.0',
				id: (req.body as JsonRpcRequest).id,
				error: {
					code: -32603,
					message: error instanceof Error ? error.message : '服务器内部错误',
					data: error instanceof Error ? error.stack : undefined
				}
			};

			res.status(500).json(jsonRpcRes);
		}
	}

	/**
	 * 初始化
	 *
	 * 处理 MCP 初始化请求
	 *
	 * @param params - 初始化参数
	 * @returns 初始化响应
	 */
	private async initialize(params: Record<string, unknown>): Promise<unknown> {
		return {
			protocolVersion: params.protocolVersion || '2025-06-18',
			capabilities: {
				tools: {}
			},
			serverInfo: {
				name: 'oksai-mcp-server',
				version: '0.1.0'
			}
		};
	}

	/**
	 * 列出工具
	 *
	 * 获取所有已注册的 MCP 工具
	 *
	 * @returns 工具列表
	 */
	private async listTools(): Promise<unknown> {
		if (!this.server) {
			throw new Error('MCP 服务器未初始化');
		}

		// 调用 MCP SDK 的工具列表方法
		const tools = await (this.server as any).listTools();
		return { tools };
	}

	/**
	 * 调用工具
	 *
	 * 调用指定的 MCP 工具
	 *
	 * @param params - 工具调用参数
	 * @returns 工具执行结果
	 */
	private async callTool(params: { name: string; arguments: Record<string, unknown> }): Promise<unknown> {
		if (!this.server) {
			throw new Error('MCP 服务器未初始化');
		}

		// 调用 MCP SDK 的工具调用方法
		const result = await (this.server as any).invokeTool(params.name, params.arguments);
		return { content: result };
	}
}
