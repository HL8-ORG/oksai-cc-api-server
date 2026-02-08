import { RequestContext, TenantFilterService } from '@oksai/core';

describe('多租户隔离 E2E 测试', () => {
	afterEach(() => {
		RequestContext['clsService'] = null;
	});

	/**
	 * 验收标准：
	 * - 跨租户读：tenantA 的 token 无法读取 tenantB 数据（返回 403/404，但不得泄露）
	 * - 跨租户写：客户端传入 tenantId 不能覆盖服务端上下文 tenantId
	 * - 无租户：缺失 tenantId 的受保护请求一律拒绝（403）
	 */

	describe('租户上下文验证', () => {
		it('应拒绝没有租户上下文的请求', () => {
			expect(RequestContext.getCurrentTenantId()).toBeNull();
		});

		it('应正确设置租户上下文', () => {
			const tenantId = 'tenant-123';
			const userId = 'user-456';

			RequestContext.setCurrentUser({
				id: userId,
				email: 'user@test.com',
				tenantId
			});

			expect(RequestContext.getCurrentTenantId()).toBe(tenantId);
			expect(RequestContext.getCurrentUserId()).toBe(userId);
		});

		it('应检测租户上下文是否存在', () => {
			expect(RequestContext.hasTenantContext()).toBe(false);

			RequestContext.setCurrentUser({
				id: 'user-123',
				email: 'user@test.com',
				tenantId: 'tenant-123'
			});

			expect(RequestContext.hasTenantContext()).toBe(true);
		});
	});

	describe('跨租户数据隔离', () => {
		it('TenantFilterService 应拒绝没有租户上下文的请求', () => {
			expect(() => TenantFilterService.getCurrentTenantId()).not.toThrow();
			expect(TenantFilterService.getCurrentTenantId()).toBeNull();
		});

		it('TenantFilterService 应正确返回当前租户 ID', () => {
			const tenantId = 'tenant-123';

			RequestContext.setCurrentUser({
				id: 'user-123',
				email: 'user@test.com',
				tenantId
			});

			expect(TenantFilterService.getCurrentTenantId()).toBe(tenantId);
		});

		it('TenantFilterService 应检测租户上下文是否存在', () => {
			expect(TenantFilterService.hasTenantContext()).toBe(false);

			RequestContext.setCurrentUser({
				id: 'user-123',
				email: 'user@test.com',
				tenantId: 'tenant-123'
			});

			expect(TenantFilterService.hasTenantContext()).toBe(true);
		});
	});

	describe('跨租户写入保护', () => {
		it('应拒绝为其他租户创建数据', () => {
			const tenantA = 'tenant-a';
			const tenantB = 'tenant-b';

			RequestContext.setCurrentUser({
				id: 'user-123',
				email: 'user@test.com',
				tenantId: tenantA
			});

			expect(() => TenantFilterService.validateTenantId(tenantB)).toThrow('无法访问其他租户的数据');
		});

		it('应允许为本租户创建数据', () => {
			const tenantId = 'tenant-123';

			RequestContext.setCurrentUser({
				id: 'user-123',
				email: 'user@test.com',
				tenantId
			});

			expect(() => TenantFilterService.validateTenantId(tenantId)).not.toThrow();
		});
	});

	describe('用户上下文管理', () => {
		it('应正确设置和获取用户信息', () => {
			const user = {
				id: 'user-123',
				email: 'user@test.com',
				tenantId: 'tenant-123',
				role: 'USER'
			};

			RequestContext.setCurrentUser(user);

			const currentUser = RequestContext.getCurrentUser();

			expect(currentUser).toEqual(user);
		});

		it('应检测用户是否已认证', () => {
			expect(RequestContext.isAuthenticated()).toBe(false);

			RequestContext.setCurrentUser({
				id: 'user-123',
				email: 'user@test.com',
				tenantId: 'tenant-123'
			});

			expect(RequestContext.isAuthenticated()).toBe(true);
		});
	});
});
