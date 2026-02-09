/**
 * MCP 工具基类
 *
 * 定义 MCP 工具的基类接口和通用方法
 */

import { Logger } from '@nestjs/common';

/**
 * MCP 工具定义接口
 *
 * 定义工具的元数据和输入输出 Schema
 */
export interface McpToolDefinition {
	/** 工具名称 */
	name: string;
	/** 工具描述 */
	description: string;
	/** 输入 Schema */
	inputSchema: {
		type: string;
		properties: Record<string, unknown>;
		required?: string[];
		additionalProperties?: boolean;
	};
}

/**
 * MCP 工具参数接口
 *
 * 定义工具调用时的参数
 */
export interface McpToolParameters {
	/** 工具名称 */
	name: string;
	/** 工具参数 */
	arguments: Record<string, unknown>;
}

/**
 * MCP 工具结果接口
 *
 * 定义工具执行后的返回结果
 */
export interface McpToolResult {
	/** 结果内容 */
	content: unknown;
	/** 是否成功 */
	isError?: boolean;
	/** 错误消息 */
	error?: string;
}

/**
 * MCP 工具基类
 *
 * 所有 MCP 工具的基类，定义通用方法和属性
 */
export abstract class BaseMcpTool {
	/** 工具名称 */
	public readonly name: string;
	/** 工具描述 */
	public readonly description: string;
	/** 日志记录器 */
	protected readonly logger: Logger;

	/**
	 * 构造函数
	 *
	 * @param toolName - 工具名称
	 * @param toolDescription - 工具描述
	 */
	constructor(toolName: string, toolDescription: string) {
		this.name = toolName;
		this.description = toolDescription;
		this.logger = new Logger(toolName);
	}

	/**
	 * 获取工具定义
	 *
	 * @returns MCP 工具定义
	 */
	abstract getToolDefinition(): McpToolDefinition;

	/**
	 * 执行工具
	 *
	 * @param args - 工具参数
	 * @returns 工具执行结果
	 */
	abstract execute(args: Record<string, unknown>): Promise<McpToolResult>;

	/**
	 * 验证参数
	 *
	 * 验证工具参数是否符合 Schema
	 *
	 * @param args - 工具参数
	 * @returns 是否验证通过
	 */
	protected validateArgs(args: Record<string, unknown>): boolean {
		try {
			const toolDef = this.getToolDefinition();

			// 检查必需参数
			if (toolDef.inputSchema.required) {
				const missing = toolDef.inputSchema.required.filter((param) => !(param in args));
				if (missing.length > 0) {
					this.logger.warn(`缺少必需参数: ${missing.join(', ')}`);
					return false;
				}
			}

			// 检查参数类型（简单验证）
			for (const [key, value] of Object.entries(args)) {
				const propertyDef = toolDef.inputSchema.properties[key];
				if (propertyDef) {
					const expectedType = (propertyDef as any).type;
					if (expectedType && typeof value !== expectedType) {
						this.logger.warn(`参数 ${key} 类型错误: 期望 ${expectedType}, 实际 ${typeof value}`);
						return false;
					}
				}
			}

			return true;
		} catch (error) {
			this.logger.error('参数验证失败', error);
			return false;
		}
	}

	/**
	 * 创建成功结果
	 *
	 * @param content - 结果内容
	 * @returns MCP 工具结果
	 */
	protected createSuccessResult(content: unknown): McpToolResult {
		return {
			content,
			isError: false
		};
	}

	/**
	 * 创建错误结果
	 *
	 * @param error - 错误消息
	 * @returns MCP 工具结果
	 */
	protected createErrorResult(error: unknown): McpToolResult {
		const errorMessage = error instanceof Error ? error.message : String(error);
		this.logger.error(`工具执行失败: ${errorMessage}`);

		return {
			content: null,
			isError: true,
			error: errorMessage
		};
	}

	/**
	 * 包装执行逻辑
	 *
	 * 包装工具执行逻辑，包括参数验证和错误处理
	 *
	 * @param args - 工具参数
	 * @returns 工具执行结果
	 */
	async executeSafe(args: Record<string, unknown>): Promise<McpToolResult> {
		try {
			this.logger.debug(`开始执行工具 ${this.name}, 参数:`, args);

			// 验证参数
			if (!this.validateArgs(args)) {
				return this.createErrorResult('参数验证失败');
			}

			// 执行工具
			const result = await this.execute(args);

			this.logger.debug(`工具 ${this.name} 执行完成`);
			return result;
		} catch (error: unknown) {
			return this.createErrorResult(error);
		}
	}
}
