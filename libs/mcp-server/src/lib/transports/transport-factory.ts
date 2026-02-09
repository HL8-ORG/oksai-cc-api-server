/**
 * 传输层工厂
 *
 * 根据配置创建和管理不同类型的传输层
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '@nestjs/common';
import { TransportType, TransportResult, TransportConfig } from './types';
import { StdioTransport } from './stdio-transport';
import { HttpTransport } from './http-transport';
import { WebSocketTransport } from './websocket-transport';

const logger = new Logger('TransportFactory');

/**
 * 传输层工厂类
 *
 * 根据配置创建和管理传输层实例
 */
export class TransportFactory {
	/** 活动的传输层实例 */
	private static activeTransport: unknown = null;
	/** 活动的传输类型 */
	private static activeType: TransportType | null = null;

	/**
	 * 创建传输层
	 *
	 * 根据传输类型创建对应的传输层实例
	 *
	 * @param type - 传输类型
	 * @param config - 传输配置
	 * @returns 传输层实例
	 */
	static createTransport(type: TransportType, config?: TransportConfig): unknown {
		logger.log(`创建 ${type} 传输层...`);

		switch (type) {
			case TransportType.STDIO:
				return new StdioTransport(config);

			case TransportType.HTTP:
				return new HttpTransport(config);

			case TransportType.WEBSOCKET:
				return new WebSocketTransport(config);

			default:
				throw new Error(`不支持的传输类型: ${type}`);
		}
	}

	/**
	 * 从环境变量创建传输层
	 *
	 * 根据 MCP_TRANSPORT 环境变量创建传输层
	 *
	 * @param server - MCP 服务器实例
	 * @returns 传输层结果
	 */
	static async createTransportFromEnv(server: McpServer): Promise<TransportResult> {
		const transportType = this.getTransportTypeFromEnv();
		const config = this.getConfigFromEnv();

		logger.log(`从环境变量创建传输层: ${transportType}`);

		// 创建传输层实例
		const transport = this.createTransport(transportType, config);

		// 连接服务器
		await this.connectServer(server, transport);

		// 返回传输层结果
		const result: TransportResult = {
			type: transportType,
			transport
		};

		// 添加 URL 信息
		if (transportType === TransportType.HTTP && config.http) {
			const host = config.http.host || 'localhost';
			const port = config.http.port || 3001;
			result.url = `http://${host}:${port}`;
			result.port = port;
		} else if (transportType === TransportType.WEBSOCKET && config.websocket) {
			const host = config.websocket.host || 'localhost';
			const port = config.websocket.port || '3002';
			const protocol = config.websocket.tls ? 'wss' : 'ws';
			result.url = `${protocol}://${host}:${port}`;
			result.port = parseInt(port, 10);
		}

		this.activeTransport = transport;
		this.activeType = transportType;

		return result;
	}

	/**
	 * 连接服务器到传输层
	 *
	 * @param server - MCP 服务器实例
	 * @param transport - 传输层实例
	 */
	static async connectServer(server: McpServer, transport: unknown): Promise<void> {
		try {
			// 调用传输层的 connect 方法（如果存在）
			if (transport && typeof (transport as any).connect === 'function') {
				await (transport as any).connect(server);
			} else if (transport && typeof (transport as any).start === 'function') {
				await (transport as any).start(server);
			} else {
				// 如果没有 connect/start 方法，假设传输层已经在创建时连接
				logger.debug('传输层无需显式连接');
			}

			logger.log(`传输层已连接`);
		} catch (error) {
			logger.error('连接传输层失败', error);
			throw error;
		}
	}

	/**
	 * 关闭传输层
	 */
	static async closeTransport(): Promise<void> {
		if (!this.activeTransport) {
			logger.warn('没有活动的传输层需要关闭');
			return;
		}

		try {
			// 调用传输层的 close/shutdown/stop 方法
			const transport = this.activeTransport as any;
			if (typeof transport.close === 'function') {
				await transport.close();
			} else if (typeof transport.shutdown === 'function') {
				await transport.shutdown();
			} else if (typeof transport.stop === 'function') {
				await transport.stop();
			} else {
				logger.debug('传输层无需显式关闭');
			}

			this.activeTransport = null;
			this.activeType = null;
			logger.log(`传输层已关闭 (${this.activeType})`);
		} catch (error) {
			logger.error('关闭传输层失败', error);
			throw error;
		}
	}

	/**
	 * 关闭传输层（静态方法）
	 */
	static async shutdownTransport(transport: TransportResult): Promise<void> {
		try {
			const transportInstance = transport.transport as any;
			if (typeof transportInstance.close === 'function') {
				await transportInstance.close();
			} else if (typeof transportInstance.shutdown === 'function') {
				await transportInstance.shutdown();
			} else if (typeof transportInstance.stop === 'function') {
				await transportInstance.stop();
			} else {
				logger.debug('传输层无需显式关闭');
			}

			logger.log(`传输层已关闭 (${transport.type})`);
		} catch (error) {
			logger.error('关闭传输层失败', error);
		}
	}

	/**
	 * 从环境变量获取传输类型
	 *
	 * @returns 传输类型
	 */
	private static getTransportTypeFromEnv(): TransportType {
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
				logger.log(`使用默认传输类型: ${TransportType.STDIO}`);
				return TransportType.STDIO;
		}
	}

	/**
	 * 从环境变量获取传输配置
	 *
	 * @returns 传输配置
	 */
	private static getConfigFromEnv(): TransportConfig {
		const config: TransportConfig = {
			type: this.getTransportTypeFromEnv()
		};

		// HTTP 配置
		if (process.env.MCP_TRANSPORT?.toLowerCase() === 'http' || process.env.MCP_SERVER_MODE === 'http') {
			config.http = {
				host: process.env.MCP_HTTP_HOST || 'localhost',
				port: parseInt(process.env.MCP_HTTP_PORT || '3001', 10),
				corsOrigin: process.env.MCP_CORS_ORIGIN || '*',
				corsCredentials: process.env.MCP_CORS_CREDENTIALS === 'true',
				trustedProxies: process.env.MCP_TRUSTED_PROXIES?.split(',').map((p) => p.trim())
			};
		}

		// WebSocket 配置
		if (process.env.MCP_TRANSPORT?.toLowerCase() === 'websocket' || process.env.MCP_SERVER_MODE === 'websocket') {
			config.websocket = {
				host: process.env.MCP_WS_HOST || 'localhost',
				port: process.env.MCP_WS_PORT || '3002',
				path: process.env.MCP_WS_PATH || '/sse',
				tls: process.env.MCP_WS_TLS === 'true',
				certPath: process.env.MCP_WS_CERT_PATH,
				keyPath: process.env.MCP_WS_KEY_PATH,
				allowedOrigins: process.env.MCP_WS_ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || ['*'],
				compression: process.env.MCP_WS_COMPRESSION !== 'false',
				maxPayload: parseInt(process.env.MCP_WS_MAX_PAYLOAD || '16777216', 10)
			};
		}

		return config;
	}

	/**
	 * 获取活动的传输类型
	 *
	 * @returns 活动的传输类型
	 */
	static getActiveType(): TransportType | null {
		return this.activeType;
	}

	/**
	 * 获取活动的传输层实例
	 *
	 * @returns 活动的传输层实例
	 */
	static getActiveTransport(): unknown | null {
		return this.activeTransport;
	}
}
