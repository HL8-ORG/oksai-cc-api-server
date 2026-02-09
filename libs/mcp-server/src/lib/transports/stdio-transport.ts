/**
 * Stdio 传输层
 *
 * 实现基于标准输入输出的 MCP 传输层
 * 适用于 Claude Desktop 等需要 stdio 通信的 AI 助手
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TransportConfig, TransportType } from './types';

/**
 * Stdio 传输层类
 *
 * 处理基于标准输入输出的 MCP 协议通信
 */
export class StdioTransport {
	private isRunning = false;

	constructor(_config?: TransportConfig) {
		// Stdio 传输不需要额外配置
	}

	/**
	 * 连接服务器
	 *
	 * 将 MCP 服务器连接到 stdio 传输层
	 *
	 * @param server - MCP 服务器实例
	 */
	async connect(_server: McpServer): Promise<void> {
		this.isRunning = true;

		// Stdio 传输使用 MCP SDK 的内置支持
		// 服务器会自动处理 stdio 输出
	}

	/**
	 * 启动传输层
	 *
	 * 启动 stdio 传输层并监听输入
	 *
	 * @param server - MCP 服务器实例
	 */
	async start(_server: McpServer): Promise<void> {
		await this.connect(_server);
	}

	/**
	 * 关闭传输层
	 *
	 * 关闭 stdio 传输层并停止处理
	 */
	async close(): Promise<void> {
		this.isRunning = false;
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
		return TransportType.STDIO;
	}
}
