/**
 * 核心 MCP 服务器测试
 */

import { McpServer, McpServerConfig } from './mcp-server';
import { BaseMcpTool, McpToolResult } from './tools/base-tool';

jest.mock('./transports/transport-factory');

class TestTool extends BaseMcpTool {
	constructor() {
		super('test_tool', '测试工具');
	}

	getToolDefinition() {
		return {
			name: this.name,
			description: this.description,
			inputSchema: {
				type: 'object',
				properties: {
					input: { type: 'string' }
				},
				required: []
			}
		};
	}

	async execute(args: Record<string, unknown>): Promise<McpToolResult> {
		return this.createSuccessResult({ result: 'success', input: args });
	}
}

describe('McpServer', () => {
	let server: McpServer;
	let config: McpServerConfig;

	beforeEach(() => {
		config = {
			name: 'Test MCP Server',
			version: '1.0.0',
			authEnabled: false,
			session: {
				ttl: 30 * 60 * 1000,
				enableRedis: false
			}
		};

		server = new McpServer(config);
	});

	afterEach(async () => {
		if (server) {
			await server.cleanup();
		}
	});

	describe('constructor', () => {
		it('应该创建服务器实例', () => {
			expect(server).toBeDefined();
			expect(server['config']).toEqual(config);
		});

		it('应该使用默认配置', () => {
			const serverWithDefaults = new McpServer({
				name: 'Test Server',
				version: '1.0.0'
			});

			expect(serverWithDefaults).toBeDefined();
		});
	});

	describe('registerTool', () => {
		it('应该成功注册工具', () => {
			const tool = new TestTool();
			server.registerTool(tool);

			const toolCount = server.getToolRegistry().getToolCount();
			expect(toolCount).toBe(1);
		});
	});

	describe('registerTools', () => {
		it('应该批量注册工具', () => {
			const tool1 = new TestTool();
			const tool2 = new TestTool();

			server.registerTools([tool1, tool2]);

			// 由于工具名称相同，第二个工具会覆盖第一个
			const toolCount = server.getToolRegistry().getToolCount();
			expect(toolCount).toBe(1);
		});

		it('应该批量注册不同名称的工具', () => {
			const tool1 = new TestTool();
			(tool1 as any).name = 'tool1';
			const tool2 = new TestTool();
			(tool2 as any).name = 'tool2';

			server.registerTools([tool1, tool2]);

			const toolCount = server.getToolRegistry().getToolCount();
			expect(toolCount).toBe(2);
		});
	});

	describe('listTools', () => {
		it('应该返回已注册的工具列表', () => {
			const tool = new TestTool();
			server.registerTool(tool);

			const tools = server.listTools();

			expect(tools).toHaveLength(1);
			expect(tools[0].name).toBe('test_tool');
		});

		it('应该返回空数组当没有工具', () => {
			const tools = server.listTools();

			expect(tools).toEqual([]);
		});
	});

	describe('invokeTool', () => {
		it('应该成功调用工具', async () => {
			const tool = new TestTool();
			server.registerTool(tool);

			const result = await server.invokeTool('test_tool', {
				input: 'test'
			});

			expect(result.isError).toBe(false);
			expect(result.content).toEqual({
				result: 'success',
				input: { input: 'test' }
			});
		});

		it('应该返回错误当工具不存在', async () => {
			await expect(server.invokeTool('non_existent_tool', {})).rejects.toThrow('工具 non_existent_tool 未注册');
		});
	});

	describe('getStatus', () => {
		it('应该返回服务器状态', async () => {
			const status = await server.getStatus();

			expect(status.isRunning).toBe(false);
			expect(status.transportType).toBeNull();
			expect(status.toolCount).toBe(0);
			expect(status.sessionStats).toEqual({
				total: 0,
				active: 0,
				expired: 0
			});
			expect(status.authStatus).toEqual({
				isAuthenticated: false,
				userId: null,
				tenantId: null,
				organizationId: null
			});
		});
	});

	describe('getSessionId', () => {
		it('应该返回会话 ID', () => {
			const sessionId = server.getSessionId();
			expect(sessionId).toBeNull();
		});
	});

	describe('setSessionId', () => {
		it('应该设置会话 ID', () => {
			server.setSessionId('test-session-id');
			const sessionId = server.getSessionId();
			expect(sessionId).toBe('test-session-id');
		});
	});

	describe('getToolRegistry', () => {
		it('应该返回工具注册表实例', () => {
			const registry = server.getToolRegistry();
			expect(registry).toBeDefined();
		});
	});

	describe('getSessionManager', () => {
		it('应该返回会话管理器实例', () => {
			const manager = server.getSessionManager();
			expect(manager).toBeDefined();
		});
	});

	describe('getAuthManager', () => {
		it('应该返回认证管理器实例', () => {
			const manager = server.getAuthManager();
			expect(manager).toBeDefined();
		});
	});

	describe('cleanup', () => {
		it('应该清理资源', async () => {
			await server.cleanup();

			const status = await server.getStatus();
			expect(status.isRunning).toBe(false);
		});
	});
});
