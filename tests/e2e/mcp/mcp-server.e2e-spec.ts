/**
 * MCP 服务器集成测试
 *
 * 测试 MCP 服务器的启动、工具注册和调用功能
 */

import { McpServer, McpServerConfig, TransportType } from '@oksai/mcp-server';
import { BaseMcpTool, McpToolResult } from '@oksai/mcp-server';

/**
 * 测试工具类
 */
class TestEchoTool extends BaseMcpTool {
	constructor() {
		super('echo', '回显工具，返回输入的文本');
	}

	getToolDefinition() {
		return {
			name: this.name,
			description: this.description,
			inputSchema: {
				type: 'object',
				properties: {
					message: { type: 'string', description: '要回显的消息' }
				},
				required: ['message']
			}
		};
	}

	async execute(args: Record<string, unknown>): Promise<McpToolResult> {
		return this.createSuccessResult({ echo: args.message });
	}
}

/**
 * 计算工具类
 */
class TestAddTool extends BaseMcpTool {
	constructor() {
		super('add', '加法计算工具');
	}

	getToolDefinition() {
		return {
			name: this.name,
			description: this.description,
			inputSchema: {
				type: 'object',
				properties: {
					a: { type: 'number', description: '第一个数字' },
					b: { type: 'number', description: '第二个数字' }
				},
				required: ['a', 'b']
			}
		};
	}

	async execute(args: Record<string, unknown>): Promise<McpToolResult> {
		const a = args.a as number;
		const b = args.b as number;
		return this.createSuccessResult({ result: a + b });
	}
}

describe('MCP 服务器集成测试', () => {
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

	describe('服务器启动和生命周期', () => {
		it('应该成功启动 Stdio 传输层', async () => {
			const started = await server.start(TransportType.STDIO);
			expect(started).toBe(true);

			const status = await server.getStatus();
			expect(status.isRunning).toBe(true);
			expect(status.transportType).toBe(TransportType.STDIO);
		});

		it('应该支持启动和停止服务器', async () => {
			// 启动
			const started = await server.start(TransportType.STDIO);
			expect(started).toBe(true);

			let status = await server.getStatus();
			expect(status.isRunning).toBe(true);

			// 停止
			await server.stop();
			status = await server.getStatus();
			expect(status.isRunning).toBe(false);
		});

		it('应该支持重启服务器', async () => {
			// 启动
			await server.start(TransportType.STDIO);

			// 重启
			const restarted = await server.restart();
			expect(restarted).toBe(true);

			const status = await server.getStatus();
			expect(status.isRunning).toBe(true);
		});
	});

	describe('工具注册和调用', () => {
		beforeEach(async () => {
			await server.start(TransportType.STDIO);
		});

		it('应该成功注册工具', () => {
			const echoTool = new TestEchoTool();
			server.registerTool(echoTool);

			const toolCount = server.getToolRegistry().getToolCount();
			expect(toolCount).toBe(1);
		});

		it('应该批量注册工具', () => {
			const echoTool = new TestEchoTool();
			const addTool = new TestAddTool();

			server.registerTools([echoTool, addTool]);

			const toolCount = server.getToolRegistry().getToolCount();
			expect(toolCount).toBe(2);
		});

		it('应该返回工具列表', () => {
			const echoTool = new TestEchoTool();
			const addTool = new TestAddTool();

			server.registerTools([echoTool, addTool]);

			const tools = server.listTools();
			expect(tools).toHaveLength(2);
			expect(tools.map((t) => t.name)).toContain('echo');
			expect(tools.map((t) => t.name)).toContain('add');
		});

		it('应该成功调用 echo 工具', async () => {
			const echoTool = new TestEchoTool();
			server.registerTool(echoTool);

			const result = await server.invokeTool('echo', { message: 'Hello, MCP!' });

			expect(result.isError).toBe(false);
			expect(result.content).toEqual({ echo: 'Hello, MCP!' });
		});

		it('应该成功调用 add 工具', async () => {
			const addTool = new TestAddTool();
			server.registerTool(addTool);

			const result = await server.invokeTool('add', { a: 5, b: 3 });

			expect(result.isError).toBe(false);
			expect(result.content).toEqual({ result: 8 });
		});

		it('应该返回错误当工具不存在', async () => {
			await expect(server.invokeTool('non_existent_tool', {})).rejects.toThrow('未注册');
		});
	});

	describe('会话管理', () => {
		it('应该创建和管理会话', async () => {
			await server.start(TransportType.STDIO);

			const sessionManager = server.getSessionManager();
			const session = await sessionManager.createSession({
				userId: 'user-1',
				organizationId: 'org-1',
				tenantId: 'tenant-1'
			});

			expect(session).toBeDefined();
			expect(session.userId).toBe('user-1');

			// 获取会话
			const retrieved = await sessionManager.getSession(session.id);
			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(session.id);

			// 更新会话
			await sessionManager.updateSession(session.id, { data: { custom: 'value' } });
			const updated = await sessionManager.getSession(session.id);
			expect(updated?.data).toEqual({ custom: 'value' });

			// 删除会话
			await sessionManager.deleteSession(session.id);
			const deleted = await sessionManager.getSession(session.id);
			expect(deleted).toBeNull();
		});

		it('应该处理会话过期', async () => {
			const configWithShortTTL: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0',
				session: {
					ttl: 100,
					enableRedis: false
				}
			};

			const serverWithShortTTL = new McpServer(configWithShortTTL);
			await serverWithShortTTL.start(TransportType.STDIO);

			const sessionManager = serverWithShortTTL.getSessionManager();
			const session = await sessionManager.createSession({
				userId: 'user-1'
			});

			// 等待会话过期
			await new Promise((resolve) => setTimeout(resolve, 150));

			const expired = await sessionManager.getSession(session.id);
			expect(expired).toBeNull();

			await serverWithShortTTL.cleanup();
		});
	});

	describe('认证管理', () => {
		it('应该管理认证状态', async () => {
			await server.start(TransportType.STDIO);

			const authManager = server.getAuthManager();

			// 设置认证状态
			authManager.setAuthState({
				userId: 'user-1',
				tenantId: 'tenant-1',
				organizationId: 'org-1'
			});

			// 获取认证状态
			const authState = authManager.getAuthState();
			expect(authState.isAuthenticated).toBe(true);
			expect(authState.userId).toBe('user-1');
			expect(authState.tenantId).toBe('tenant-1');
			expect(authState.organizationId).toBe('org-1');

			// 清除认证状态
			authManager.clearAuthState();
			const cleared = authManager.getAuthState();
			expect(cleared.isAuthenticated).toBe(false);
		});
	});
});
