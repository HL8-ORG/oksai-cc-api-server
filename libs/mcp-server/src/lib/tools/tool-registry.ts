/**
 * MCP 工具注册表
 *
 * 管理所有 MCP 工具的注册和查找
 */

import { Logger } from '@nestjs/common';
import { McpServer as McpServerSdk } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BaseMcpTool, McpToolDefinition, McpToolParameters } from './base-tool';

const logger = new Logger('ToolRegistry');

/**
 * MCP 工具注册表类
 *
 * 管理工具注册、查找和调用
 */
export class ToolRegistry {
	/** 已注册的工具映射 */
	private readonly tools: Map<string, BaseMcpTool> = new Map();
	/** MCP 服务器实例 */
	private mcpServer: McpServerSdk | null = null;

	/**
	 * 构造函数
	 */
	constructor() {
		logger.log('MCP 工具注册表初始化');
	}

	/**
	 * 设置 MCP 服务器实例
	 *
	 * @param server - MCP 服务器实例
	 */
	setMcpServer(server: McpServerSdk): void {
		this.mcpServer = server;
		logger.log('MCP 服务器实例已设置');
	}

	/**
	 * 注册工具
	 *
	 * 注册一个新的 MCP 工具
	 *
	 * @param tool - MCP 工具实例
	 */
	registerTool(tool: BaseMcpTool): void {
		if (!tool.name || tool.name.trim() === '') {
			throw new Error('工具名称不能为空');
		}

		if (this.tools.has(tool.name)) {
			logger.warn(`工具 ${tool.name} 已存在，将被覆盖`);
		}

		this.tools.set(tool.name, tool);

		// 在 MCP 服务器上注册工具
		if (this.mcpServer) {
			const toolDef = tool.getToolDefinition();

			// 构建 MCP SDK 期望的 config 对象
			const config = {
				title: toolDef.name,
				description: toolDef.description,
				inputSchema: toolDef.inputSchema,
				outputSchema: undefined
			};

			(this.mcpServer as any).registerTool(tool.name, config, async (request: any) => {
				const params: McpToolParameters = {
					name: tool.name,
					arguments: request.params || {}
				};
				return await tool.executeSafe(params.arguments as Record<string, unknown>);
			});
		}

		logger.log(`工具 ${tool.name} 已注册`);
	}

	/**
	 * 批量注册工具
	 *
	 * 注册多个 MCP 工具
	 *
	 * @param tools - MCP 工具实例数组
	 */
	registerTools(tools: BaseMcpTool[]): void {
		for (const tool of tools) {
			this.registerTool(tool);
		}
		logger.log(`批量注册 ${tools.length} 个工具`);
	}

	/**
	 * 注销工具
	 *
	 * 注销一个已注册的 MCP 工具
	 *
	 * @param toolName - 工具名称
	 */
	unregisterTool(toolName: string): void {
		if (this.tools.delete(toolName)) {
			logger.log(`工具 ${toolName} 已注销`);
		} else {
			logger.warn(`工具 ${toolName} 不存在，无法注销`);
		}
	}

	/**
	 * 获取工具定义
	 *
	 * 获取所有已注册工具的定义
	 *
	 * @returns 工具定义数组
	 */
	getToolDefinitions(): McpToolDefinition[] {
		const definitions: McpToolDefinition[] = [];

		for (const [, tool] of this.tools.entries()) {
			definitions.push(tool.getToolDefinition());
		}

		return definitions;
	}

	/**
	 * 查找工具
	 *
	 * 根据名称查找工具
	 *
	 * @param name - 工具名称
	 * @returns 工具实例或 null
	 */
	findTool(name: string): BaseMcpTool | null {
		return this.tools.get(name) || null;
	}

	/**
	 * 获取所有工具名称
	 *
	 * @returns 工具名称数组
	 */
	getToolNames(): string[] {
		return Array.from(this.tools.keys());
	}

	/**
	 * 获取已注册工具数量
	 *
	 * @returns 工具数量
	 */
	getToolCount(): number {
		return this.tools.size;
	}

	/**
	 * 调用工具
	 *
	 * 直接调用指定的工具
	 *
	 * @param name - 工具名称
	 * @param args - 工具参数
	 * @returns 工具执行结果
	 */
	async invokeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
		const tool = this.findTool(name);

		if (!tool) {
			const error = `工具 ${name} 未注册`;
			logger.error(error);
			throw new Error(error);
		}

		logger.debug(`调用工具 ${name}，参数:`, args);

		const result = await tool.executeSafe(args);

		return result;
	}

	/**
	 * 清空所有工具
	 *
	 * 清除所有已注册的工具
	 */
	clearTools(): void {
		this.tools.clear();
		logger.log('所有工具已清除');
	}

	/**
	 * 获取所有工具
	 *
	 * @returns 所有已注册的工具
	 */
	getAllTools(): BaseMcpTool[] {
		return Array.from(this.tools.values());
	}
}
