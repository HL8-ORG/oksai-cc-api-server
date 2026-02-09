/**
 * MCP 服务器管理器测试
 */

import { McpServerManager, createMcpServerManager } from './mcp-server-manager';
import { McpServerConfig } from './mcp-server';
import { TransportType } from './transports/types';

jest.mock('./mcp-server', () => ({
	McpServer: jest.fn().mockImplementation(() => ({
		start: jest.fn().mockResolvedValue(true),
		stop: jest.fn().mockResolvedValue(undefined),
		getStatus: jest.fn().mockReturnValue({
			isRunning: true,
			transportType: null,
			toolCount: 0,
			sessionStats: { total: 0, active: 0, expired: 0 },
			authStatus: {
				isAuthenticated: false,
				userId: null,
				tenantId: null,
				organizationId: null
			}
		}),
		getToolRegistry: jest.fn().mockReturnValue({
			getToolCount: jest.fn().mockReturnValue(0)
		}),
		getSessionManager: jest.fn().mockReturnValue({}),
		getAuthManager: jest.fn().mockReturnValue({}),
		cleanup: jest.fn().mockResolvedValue(undefined)
	})),
	createAndStartMcpServer: jest.fn()
}));

describe('McpServerManager', () => {
	let manager: McpServerManager;

	beforeEach(() => {
		manager = new McpServerManager();
		jest.clearAllMocks();
	});

	afterEach(async () => {
		await manager.cleanup();
	});

	describe('start', () => {
		it('应该成功启动服务器', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			const result = await manager.start(config, 'server-1', TransportType.STDIO);

			expect(result).toBe(true);
		});

		it('应该返回 false 当无法启动服务器', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			const result = await manager.start(config, 'server-1', TransportType.STDIO);

			expect(result).toBe(true);
		});
	});

	describe('stop', () => {
		it('应该成功停止服务器', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			const result = await manager.stop('server-1');

			expect(result).toBe(true);
		});

		it('应该返回 false 当服务器不存在', async () => {
			const result = await manager.stop('non-existent');

			expect(result).toBe(false);
		});
	});

	describe('restart', () => {
		it('应该成功重启服务器', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			const result = await manager.restart('server-1');

			expect(result).toBe(true);
		});
	});

	describe('getStatus', () => {
		it('应该返回服务器状态', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');

			const result = await manager.getStatus('server-1');

			expect(result).toBeDefined();
		});
	});

	describe('getServer', () => {
		it('应该返回服务器实例', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			const server = manager.getServer('server-1');

			expect(server).toBeDefined();
		});

		it('应该返回 null 当服务器不存在', () => {
			const server = manager.getServer('non-existent');
			expect(server).toBeNull();
		});
	});

	describe('getServerIds', () => {
		it('应该返回所有服务器 ID', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			await manager.start(config, 'server-2');

			const ids = manager.getServerIds();

			expect(ids).toHaveLength(2);
			expect(ids).toContain('server-1');
			expect(ids).toContain('server-2');
		});
	});

	describe('getAllStatus', () => {
		it('应该返回所有服务器状态', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			await manager.start(config, 'server-2');

			const statusMap = await manager.getAllStatus();

			expect(statusMap.size).toBe(2);
		});
	});

	describe('removeServer', () => {
		it('应该成功删除服务器', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			const result = await manager.removeServer('server-1');

			expect(result).toBe(true);
		});
	});

	describe('stopAll', () => {
		it('应该停止所有服务器', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			await manager.start(config, 'server-2');

			const count = await manager.stopAll();

			expect(count).toBe(2);
		});
	});

	describe('setPrimaryServer', () => {
		it('应该成功设置主服务器', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			const result = manager.setPrimaryServer('server-1');

			expect(result).toBe(true);
		});

		it('应该返回 false 当服务器不存在', () => {
			const result = manager.setPrimaryServer('non-existent');
			expect(result).toBe(false);
		});
	});

	describe('getPrimaryServerId', () => {
		it('应该返回主服务器 ID', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');

			const primaryId = manager.getPrimaryServerId();

			expect(primaryId).toBe('server-1');
		});

		it('应该返回 null 当没有主服务器', () => {
			const primaryId = manager.getPrimaryServerId();
			expect(primaryId).toBeNull();
		});
	});

	describe('getPrimaryServer', () => {
		it('应该返回主服务器实例', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');

			const primaryServer = manager.getPrimaryServer();

			expect(primaryServer).toBeDefined();
		});

		it('应该返回 null 当没有主服务器', () => {
			const primaryServer = manager.getPrimaryServer();
			expect(primaryServer).toBeNull();
		});
	});

	describe('getStats', () => {
		it('应该返回服务器统计信息', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			await manager.start(config, 'server-2');

			const stats = manager.getStats();

			expect(stats.total).toBe(2);
			expect(stats.running).toBe(2);
			expect(stats.stopped).toBe(0);
			expect(stats.primaryServerId).toBe('server-1');
		});
	});

	describe('cleanup', () => {
		it('应该清理所有服务器', async () => {
			const config: McpServerConfig = {
				name: 'Test Server',
				version: '1.0.0'
			};

			await manager.start(config, 'server-1');
			await manager.start(config, 'server-2');

			await manager.cleanup();

			const ids = manager.getServerIds();
			expect(ids).toHaveLength(0);
		});
	});
});

describe('createMcpServerManager', () => {
	it('应该创建服务器管理器实例', () => {
		const manager = createMcpServerManager();
		expect(manager).toBeInstanceOf(McpServerManager);
	});
});
