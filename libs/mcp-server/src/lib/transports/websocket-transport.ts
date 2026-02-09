/**
 * WebSocket 传输层
 *
 * 实现基于 WebSocket 的 MCP 传输层
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '@nestjs/common';
import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { TransportConfig, TransportType } from './types';

const logger = new Logger('WebSocketTransport');

interface JsonRpcRequest {
	jsonrpc: '2.0';
	id: number | string | null;
	method: string;
	params: Record<string, unknown> | null;
}

interface JsonRpcResponse {
	jsonrpc: '2.0';
	id: number | string | null;
	result?: unknown;
	error?: { code: number; message: string; data?: unknown };
}

export class WebSocketTransport {
	private wss: WebSocketServer | null = null;
	private server: McpServer | null = null;
	private httpServer: HttpServer | null = null;
	private isRunning = false;

	constructor(private config?: TransportConfig) {}

	async connect(server: McpServer): Promise<void> {
		this.server = server;
		const wsConfig = this.config?.websocket || {};

		this.httpServer = new HttpServer();
		const host = wsConfig.host || 'localhost';
		const port = parseInt(wsConfig.port || '3002', 10);
		const path = wsConfig.path || '/sse';

		this.wss = new WebSocketServer({ server: this.httpServer, path, handleProtocols: () => 'mcp' });

		await new Promise<void>((resolve, reject) => {
			this.httpServer!.listen(port, host, () => {
				this.isRunning = true;
				logger.log(`WebSocket 服务器已启动: ws://${host}:${port}${path}`);
				resolve();
			});

			this.httpServer!.on('error', (err: Error) => {
				logger.error('WebSocket 服务器启动失败', err);
				reject(err);
			});
		});

		this.configureWebSocketServer();
	}

	async start(server: McpServer): Promise<void> {
		await this.connect(server);
	}

	async close(): Promise<void> {
		return new Promise<void>((resolve) => {
			if (this.wss) {
				this.wss.close(() => {
					this.isRunning = false;
					this.wss = null;
					this.server = null;
					logger.log('WebSocket 服务器已关闭');
					resolve();
				});
			} else {
				this.isRunning = false;
				this.server = null;
				resolve();
			}

			if (this.httpServer) {
				this.httpServer.close(() => {
					this.httpServer = null;
				});
			}
		});
	}

	async shutdown(): Promise<void> {
		await this.close();
	}

	isActive(): boolean {
		return this.isRunning;
	}

	getType(): TransportType {
		return TransportType.WEBSOCKET;
	}

	private configureWebSocketServer(): void {
		if (!this.wss) return;

		this.wss.on('connection', (ws: WebSocket) => {
			logger.debug('WebSocket 客户端已连接');

			ws.on('message', async (data: Buffer) => {
				let request: JsonRpcRequest | null = null;

				try {
					const message = data.toString('utf-8');
					request = JSON.parse(message) as JsonRpcRequest;

					if (process.env.GAUZY_MCP_DEBUG === 'true') {
						logger.debug(`收到 WebSocket 消息: ${message}`);
					}

					const response = await this.handleRequest(request);
					ws.send(JSON.stringify(response));
				} catch (error) {
					logger.error('处理 WebSocket 消息失败', error);
					const errorResponse: JsonRpcResponse = {
						jsonrpc: '2.0',
						id: request?.id ?? null,
						error: {
							code: -32603,
							message: error instanceof Error ? error.message : '服务器内部错误'
						}
					};
					ws.send(JSON.stringify(errorResponse));
				}
			});

			ws.on('error', (error: Error) => {
				logger.error('WebSocket 错误', error);
			});

			ws.on('close', () => {
				logger.debug('WebSocket 客户端已断开');
			});
		});
	}

	private async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
		try {
			if (request.jsonrpc !== '2.0') {
				return {
					jsonrpc: '2.0',
					id: request.id,
					error: { code: -32600, message: '不支持的 JSON-RPC 版本' }
				};
			}

			if (!this.server) {
				return {
					jsonrpc: '2.0',
					id: request.id,
					error: { code: -32603, message: 'MCP 服务器未初始化' }
				};
			}

			let result: unknown;

			switch (request.method) {
				case 'tools/list':
					result = await this.listTools();
					break;
				case 'tools/call':
					result = await this.callTool(
						request.params as { name: string; arguments: Record<string, unknown> }
					);
					break;
				case 'initialize':
					result = await this.initialize(request.params as Record<string, unknown>);
					break;
				default:
					throw new Error(`不支持的方法: ${request.method}`);
			}

			return {
				jsonrpc: '2.0',
				id: request.id,
				result
			};
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			return {
				jsonrpc: '2.0',
				id: request.id,
				error: {
					code: -32603,
					message: error.message,
					data: error.stack
				}
			};
		}
	}

	private async initialize(params: Record<string, unknown>): Promise<unknown> {
		return {
			protocolVersion: params.protocolVersion || '2025-06-18',
			capabilities: { tools: {} },
			serverInfo: { name: 'oksai-mcp-server', version: '0.1.0' }
		};
	}

	private async listTools(): Promise<unknown> {
		if (!this.server) {
			throw new Error('MCP 服务器未初始化');
		}
		const tools = await (this.server as any).listTools();
		return { tools };
	}

	private async callTool(params: { name: string; arguments: Record<string, unknown> }): Promise<unknown> {
		if (!this.server) {
			throw new Error('MCP 服务器未初始化');
		}
		const result = await (this.server as any).invokeTool(params.name, params.arguments);
		return { content: result };
	}
}
