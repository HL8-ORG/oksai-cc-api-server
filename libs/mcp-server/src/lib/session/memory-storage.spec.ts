/**
 * 内存会话存储测试
 */

import { MemoryStorage } from './memory-storage';
import { Session } from './session-storage';

describe('MemoryStorage', () => {
	let storage: MemoryStorage;
	let session1: Session;
	let session2: Session;

	beforeEach(() => {
		storage = new MemoryStorage();
		const now = new Date();

		session1 = {
			id: 'session-1',
			userId: 'user-1',
			organizationId: 'org-1',
			tenantId: 'tenant-1',
			createdAt: now,
			lastAccessedAt: now,
			data: { name: 'Session 1' }
		};

		session2 = {
			id: 'session-2',
			userId: 'user-2',
			organizationId: null,
			tenantId: null,
			createdAt: new Date(now.getTime() + 1000),
			lastAccessedAt: new Date(now.getTime() + 1000),
			data: { name: 'Session 2' }
		};
	});

	describe('create', () => {
		it('应该成功创建会话', async () => {
			const result = await storage.create(session1);
			expect(result).toBe(true);
		});

		it('应该能够查找已创建的会话', async () => {
			await storage.create(session1);
			const found = await storage.findById(session1.id);
			expect(found).not.toBeNull();
			expect(found?.id).toBe(session1.id);
		});
	});

	describe('findById', () => {
		it('应该返回存在的会话', async () => {
			await storage.create(session1);
			const found = await storage.findById(session1.id);
			expect(found).toEqual(session1);
		});

		it('应该返回 null 当会话不存在', async () => {
			const found = await storage.findById('non-existent');
			expect(found).toBeNull();
		});
	});

	describe('findByUserId', () => {
		it('应该返回用户的所有会话', async () => {
			await storage.create(session1);
			await storage.create(session2);

			const sessions = await storage.findByUserId('user-1');
			expect(sessions).toHaveLength(1);
			expect(sessions[0].id).toBe(session1.id);
		});

		it('应该返回空数组当用户没有会话', async () => {
			const sessions = await storage.findByUserId('non-existent-user');
			expect(sessions).toHaveLength(0);
		});
	});

	describe('update', () => {
		it('应该成功更新会话', async () => {
			await storage.create(session1);

			const updated: Session = {
				...session1,
				data: { name: 'Updated Session 1' }
			};

			const result = await storage.update(updated);
			expect(result).toBe(true);

			const found = await storage.findById(session1.id);
			expect(found?.data).toEqual({ name: 'Updated Session 1' });
		});

		it('应该返回 false 当更新不存在的会话', async () => {
			const result = await storage.update(session1);
			expect(result).toBe(false);
		});
	});

	describe('delete', () => {
		it('应该成功删除会话', async () => {
			await storage.create(session1);
			const result = await storage.delete(session1.id);
			expect(result).toBe(true);

			const found = await storage.findById(session1.id);
			expect(found).toBeNull();
		});

		it('应该返回 false 当删除不存在的会话', async () => {
			const result = await storage.delete('non-existent');
			expect(result).toBe(false);
		});
	});

	describe('deleteByUserId', () => {
		it('应该删除用户的所有会话', async () => {
			const now = new Date();

			const sessionA = {
				id: 'session-a',
				userId: 'user-1',
				organizationId: 'org-1',
				tenantId: 'tenant-1',
				createdAt: now,
				lastAccessedAt: now,
				data: { name: 'Session A' }
			};

			const sessionB = {
				id: 'session-b',
				userId: 'user-1',
				organizationId: null,
				tenantId: null,
				createdAt: new Date(now.getTime() + 1000),
				lastAccessedAt: new Date(now.getTime() + 1000),
				data: { name: 'Session B' }
			};

			const createA = await storage.create(sessionA);
			const createB = await storage.create(sessionB);

			console.log('Created sessions:', { createA, createB });

			console.log('Before delete, session-a:', await storage.findById('session-a'));
			console.log('Before delete, session-b:', await storage.findById('session-b'));

			const count = await storage.deleteByUserId('user-1');
			expect(count).toBe(2);

			const foundA = await storage.findById('session-a');
			const foundB = await storage.findById('session-b');
			expect(foundA).toBeNull();
			expect(foundB).toBeNull();
		});

		it('应该返回 0 当用户没有会话', async () => {
			const count = await storage.deleteByUserId('non-existent-user');
			expect(count).toBe(0);
		});
	});

	describe('clear', () => {
		it('应该清空所有会话', async () => {
			await storage.create(session1);
			await storage.create(session2);

			const count = await storage.clear();
			expect(count).toBe(2);

			const found1 = await storage.findById(session1.id);
			const found2 = await storage.findById(session2.id);
			expect(found1).toBeNull();
			expect(found2).toBeNull();
		});

		it('应该返回 0 当没有会话时清空', async () => {
			const count = await storage.clear();
			expect(count).toBe(0);
		});
	});

	describe('cleanupExpired', () => {
		it('应该清理过期会话', async () => {
			const oldSession = {
				...session1,
				id: 'old-session',
				lastAccessedAt: new Date(Date.now() - 60 * 60 * 1000) // 1 小时前
			};

			const newSession = {
				...session2,
				id: 'new-session',
				lastAccessedAt: new Date() // 现在
			};

			await storage.create(oldSession);
			await storage.create(newSession);

			const maxAge = 30 * 60 * 1000; // 30 分钟
			const count = await storage.cleanupExpired(maxAge);
			expect(count).toBe(1);

			const foundOld = await storage.findById(oldSession.id);
			const foundNew = await storage.findById(newSession.id);
			expect(foundOld).toBeNull();
			expect(foundNew).not.toBeNull();
		});

		it('应该返回 0 当没有过期会话', async () => {
			const newSession = {
				...session2,
				id: 'new-session',
				lastAccessedAt: new Date() // 现在
			};

			await storage.create(newSession);

			const maxAge = 30 * 60 * 1000;
			const count = await storage.cleanupExpired(maxAge);
			expect(count).toBe(0);
		});
	});

	describe('getStats', () => {
		it('应该返回正确的统计信息', async () => {
			const oldSession = {
				...session1,
				id: 'old-session',
				lastAccessedAt: new Date(Date.now() - 60 * 60 * 1000) // 1 小时前
			};

			const newSession = {
				...session2,
				id: 'new-session',
				lastAccessedAt: new Date() // 现在
			};

			const nullUserSession = {
				...session1,
				id: 'null-user-session',
				userId: null,
				lastAccessedAt: new Date()
			};

			await storage.create(oldSession);
			await storage.create(newSession);
			await storage.create(nullUserSession);

			const stats = await storage.getStats();
			expect(stats.total).toBe(3);
			expect(stats.active).toBe(1);
			expect(stats.expired).toBe(1);
		});
	});
});
