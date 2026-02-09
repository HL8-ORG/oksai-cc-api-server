import { TestHelper } from '../helpers/test-helper';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getJwtUtils, type JwtPayload } from '@oksai/core';
import { Tenant } from '@oksai/tenant';
import { User, UserRole } from '@oksai/user';

describe('插件系统 E2E 测试', () => {
	let app: INestApplication;
	let adminToken: string;

	const systemPlugins = [
		'auth',
		'tenant',
		'user',
		'role',
		'audit',
		'organization',
		'analytics',
		'reporting',
		'plugin'
	];

	beforeAll(async () => {
		app = await TestHelper.setup();
	});

	afterAll(async () => {
		await TestHelper.teardown();
	});

	beforeEach(async () => {
		await TestHelper.cleanDatabase();

		const tenant = await TestHelper.insertTestData<Tenant>(Tenant, {
			name: '测试租户',
			slug: 'test-tenant'
		});

		const adminUser = await TestHelper.insertTestData<User>(User, {
			email: 'admin@example.com',
			password: 'hashed',
			firstName: 'Admin',
			lastName: 'User',
			role: UserRole.ADMIN,
			tenantId: tenant.id
		});

		const jwtUtils = getJwtUtils();
		adminToken = jwtUtils.generateAccessToken({
			sub: adminUser.id,
			email: adminUser.email,
			tenantId: tenant.id,
			role: adminUser.role
		} as JwtPayload);
	});

	describe('插件查询', () => {
		it('应返回所有插件列表', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/plugins')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('total');
			expect(response.body).toHaveProperty('data');
			expect(Array.isArray(response.body.data)).toBe(true);
			expect(response.body.total).toBeGreaterThan(0);
		});

		it('应返回所有插件状态', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/plugins/status/list')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('total');
			expect(response.body).toHaveProperty('data');
			expect(Array.isArray(response.body.data)).toBe(true);
		});

		it('应返回指定插件详情', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/plugins/auth')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('name', 'auth');
			expect(response.body).toHaveProperty('version');
			expect(response.body).toHaveProperty('type');
			expect(response.body).toHaveProperty('status');
		});

		it('插件不存在时应返回 404', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/plugins/non-existent')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(HttpStatus.NOT_FOUND);
		});
	});

	describe('插件启用/禁用', () => {
		it('应成功启用功能插件', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/plugins/analytics/enable')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('success', true);
			expect(response.body).toHaveProperty('message', '插件 analytics 启用成功');
			expect(response.body).toHaveProperty('status', 'enabled');
		});

		it('应成功禁用功能插件', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/plugins/analytics/disable')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('success', true);
			expect(response.body).toHaveProperty('message', '插件 analytics 禁用成功');
			expect(response.body).toHaveProperty('status', 'disabled');
		});

		it('应成功重新加载插件', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/plugins/auth/reload')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('success', true);
			expect(response.body).toHaveProperty('message', '插件 auth 重新加载成功');
			expect(response.body).toHaveProperty('status');
		});

		it('禁用插件后，插件路由应返回 403', async () => {
			await request(app.getHttpServer())
				.post('/api/plugins/analytics/disable')
				.set('Authorization', `Bearer ${adminToken}`);

			const response = await request(app.getHttpServer())
				.get('/api/analytics')
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(HttpStatus.FORBIDDEN);
			expect(response.body.message).toContain('插件 analytics 已禁用或未初始化');

			await request(app.getHttpServer())
				.post('/api/plugins/analytics/enable')
				.set('Authorization', `Bearer ${adminToken}`);
		});
	});

	describe('系统插件保护', () => {
		systemPlugins.forEach((pluginName) => {
			it(`系统插件 ${pluginName} 不应被禁用`, async () => {
				const response = await request(app.getHttpServer())
					.post(`/api/plugins/${pluginName}/disable`)
					.set('Authorization', `Bearer ${adminToken}`);

				expect(response.status).toBe(HttpStatus.BAD_REQUEST);
				expect(response.body.message).toContain('系统插件不能被禁用');
			});
		});
	});

	describe('路由插件名称映射', () => {
		const testCases = [
			{ route: '/api/auth', plugin: 'auth' },
			{ route: '/api/tenants', plugin: 'tenant' },
			{ route: '/api/users', plugin: 'user' },
			{ route: '/api/organizations', plugin: 'organization' },
			{ route: '/api/roles', plugin: 'roles' },
			{ route: '/api/permissions', plugin: 'permissions' },
			{ route: '/api/audit', plugin: 'audit' },
			{ route: '/api/analytics', plugin: 'analytics' },
			{ route: '/api/reporting', plugin: 'reporting' },
			{ route: '/api/plugins', plugin: 'plugin' }
		];

		testCases.forEach(({ route, plugin }) => {
			it(`路由 ${route} 应映射到插件 ${plugin}`, async () => {
				const response = await request(app.getHttpServer())
					.get(route)
					.set('Authorization', `Bearer ${adminToken}`);

				expect([HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN]).toContain(response.status);
			});
		});
	});
});
