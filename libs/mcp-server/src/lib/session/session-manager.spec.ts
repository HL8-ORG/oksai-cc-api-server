/**
 * 会话管理器测试
 */

import { SessionManager } from './session-manager';
import { MemoryStorage } from './memory-storage';

jest.mock('./memory-storage');

describe('SessionManager', () => {
	let sessionManager: SessionManager;
	let mockStorage: jest.Mocked<MemoryStorage>;

	beforeEach(() => {
		mockStorage = {
			create: jest.fn(),
			findById: jest.fn(),
			findByUserId: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			deleteByUserId: jest.fn(),
			clear: jest.fn(),
			cleanupExpired: jest.fn(),
			getStats: jest.fn()
		} as any;

		jest.clearAllMocks();

		sessionManager = new SessionManager({
			ttl: 30 * 60 * 1000,
			enableRedis: false
		});

		(sessionManager as any).storage = mockStorage;
	});

	describe('createSession', () => {
		it('应该成功创建会话', async () => {
			mockStorage.create.mockResolvedValue(true);

			const sessionId = await sessionManager.createSession('user-1', 'org-1', 'tenant-1', {
				name: 'Test Session'
			});

			expect(sessionId).toBeDefined();
			expect(sessionId).toMatch(/^sess_\d+_\w+$/);
			expect(mockStorage.create).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'user-1',
					organizationId: 'org-1',
					tenantId: 'tenant-1',
					data: { name: 'Test Session' }
				})
			);
		});

		it('应该抛出错误当创建失败', async () => {
			mockStorage.create.mockResolvedValue(false);

			await expect(sessionManager.createSession('user-1')).rejects.toThrow('创建会话失败');
		});
	});

	describe('findSession', () => {
		it('应该返回有效的会话', async () => {
			const mockSession = {
				id: 'session-1',
				userId: 'user-1',
				organizationId: 'org-1',
				tenantId: 'tenant-1',
				createdAt: new Date(),
				lastAccessedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 分钟前
				data: {}
			};

			mockStorage.findById.mockResolvedValue(mockSession);

			const session = await sessionManager.findSession('session-1');

			expect(session).toEqual(mockSession);
			expect(mockStorage.findById).toHaveBeenCalledWith('session-1');
		});

		it('应该返回 null 当会话不存在', async () => {
			mockStorage.findById.mockResolvedValue(null);

			const session = await sessionManager.findSession('non-existent');

			expect(session).toBeNull();
		});

		it('应该删除并返回 null 当会话过期', async () => {
			const mockSession = {
				id: 'session-1',
				userId: 'user-1',
				organizationId: 'org-1',
				tenantId: 'tenant-1',
				createdAt: new Date(),
				lastAccessedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 小时前
				data: {}
			};

			mockStorage.findById.mockResolvedValue(mockSession);
			mockStorage.delete.mockResolvedValue(true);

			const session = await sessionManager.findSession('session-1');

			expect(session).toBeNull();
			expect(mockStorage.delete).toHaveBeenCalledWith('session-1');
		});
	});

	describe('updateSession', () => {
		it('应该成功更新会话', async () => {
			const mockSession = {
				id: 'session-1',
				userId: 'user-1',
				organizationId: 'org-1',
				tenantId: 'tenant-1',
				createdAt: new Date(),
				lastAccessedAt: new Date(Date.now() - 10 * 60 * 1000),
				data: { old: 'data' }
			};

			mockStorage.findById.mockResolvedValue(mockSession);
			mockStorage.update.mockResolvedValue(true);

			const result = await sessionManager.updateSession('session-1', {
				new: 'data'
			});

			expect(result).toBe(true);
			expect(mockStorage.update).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'session-1',
					data: { old: 'data', new: 'data' }
				})
			);
		});

		it('应该返回 false 当会话不存在', async () => {
			mockStorage.findById.mockResolvedValue(null);

			const result = await sessionManager.updateSession('session-1', {
				new: 'data'
			});

			expect(result).toBe(false);
			expect(mockStorage.update).not.toHaveBeenCalled();
		});
	});

	describe('deleteSession', () => {
		it('应该成功删除会话', async () => {
			mockStorage.delete.mockResolvedValue(true);

			const result = await sessionManager.deleteSession('session-1');

			expect(result).toBe(true);
			expect(mockStorage.delete).toHaveBeenCalledWith('session-1');
		});
	});

	describe('deleteUserSessions', () => {
		it('应该删除用户的所有会话', async () => {
			mockStorage.deleteByUserId.mockResolvedValue(2);

			const count = await sessionManager.deleteUserSessions('user-1');

			expect(count).toBe(2);
			expect(mockStorage.deleteByUserId).toHaveBeenCalledWith('user-1');
		});
	});

	describe('getSessionData', () => {
		it('应该返回会话数据', async () => {
			const mockSession = {
				id: 'session-1',
				userId: 'user-1',
				organizationId: null,
				tenantId: null,
				createdAt: new Date(),
				lastAccessedAt: new Date(),
				data: { key: 'value' }
			};

			mockStorage.findById.mockResolvedValue(mockSession);

			const data = await sessionManager.getSessionData('session-1');

			expect(data).toEqual({ key: 'value' });
		});

		it('应该返回 null 当会话不存在', async () => {
			mockStorage.findById.mockResolvedValue(null);

			const data = await sessionManager.getSessionData('session-1');

			expect(data).toBeNull();
		});
	});

	describe('setSessionData', () => {
		it('应该设置会话数据', async () => {
			const mockSession = {
				id: 'session-1',
				userId: 'user-1',
				organizationId: null,
				tenantId: null,
				createdAt: new Date(),
				lastAccessedAt: new Date(),
				data: {}
			};

			mockStorage.findById.mockResolvedValue(mockSession);
			mockStorage.update.mockResolvedValue(true);

			const result = await sessionManager.setSessionData('session-1', {
				key: 'value'
			});

			expect(result).toBe(true);
			expect(mockStorage.update).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'session-1',
					data: { key: 'value' }
				})
			);
		});
	});

	describe('getUserId', () => {
		it('应该返回用户 ID', async () => {
			const mockSession = {
				id: 'session-1',
				userId: 'user-1',
				organizationId: null,
				tenantId: null,
				createdAt: new Date(),
				lastAccessedAt: new Date(),
				data: {}
			};

			mockStorage.findById.mockResolvedValue(mockSession);

			const userId = await sessionManager.getUserId('session-1');

			expect(userId).toBe('user-1');
		});

		it('应该返回 null 当会话不存在', async () => {
			mockStorage.findById.mockResolvedValue(null);

			const userId = await sessionManager.getUserId('session-1');

			expect(userId).toBeNull();
		});
	});

	describe('getOrganizationId', () => {
		it('应该返回组织 ID', async () => {
			const mockSession = {
				id: 'session-1',
				userId: 'user-1',
				organizationId: 'org-1',
				tenantId: null,
				createdAt: new Date(),
				lastAccessedAt: new Date(),
				data: {}
			};

			mockStorage.findById.mockResolvedValue(mockSession);

			const orgId = await sessionManager.getOrganizationId('session-1');

			expect(orgId).toBe('org-1');
		});
	});

	describe('getTenantId', () => {
		it('应该返回租户 ID', async () => {
			const mockSession = {
				id: 'session-1',
				userId: 'user-1',
				organizationId: null,
				tenantId: 'tenant-1',
				createdAt: new Date(),
				lastAccessedAt: new Date(),
				data: {}
			};

			mockStorage.findById.mockResolvedValue(mockSession);

			const tenantId = await sessionManager.getTenantId('session-1');

			expect(tenantId).toBe('tenant-1');
		});
	});

	describe('clearAllSessions', () => {
		it('应该清空所有会话', async () => {
			mockStorage.clear.mockResolvedValue(5);

			const count = await sessionManager.clearAllSessions();

			expect(count).toBe(5);
			expect(mockStorage.clear).toHaveBeenCalled();
		});
	});

	describe('cleanupExpiredSessions', () => {
		it('应该清理过期会话', async () => {
			mockStorage.cleanupExpired.mockResolvedValue(3);

			const count = await sessionManager.cleanupExpiredSessions();

			expect(count).toBe(3);
			expect(mockStorage.cleanupExpired).toHaveBeenCalledWith(30 * 60 * 1000);
		});
	});

	describe('getSessionStats', () => {
		it('应该返回会话统计信息', async () => {
			const stats = {
				total: 10,
				active: 5,
				expired: 2
			};

			mockStorage.getStats.mockResolvedValue(stats);

			const result = await sessionManager.getSessionStats();

			expect(result).toEqual(stats);
			expect(mockStorage.getStats).toHaveBeenCalled();
		});
	});
});
