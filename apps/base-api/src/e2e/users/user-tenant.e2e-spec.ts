import { TestHelper } from '../helpers/test-helper';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('用户和租户 CRUD E2E 测试', () => {
	let app: INestApplication;
	let authToken: string;
	let testUserId: string;
	let testTenantId: string;

	beforeAll(async () => {
		app = await TestHelper.setup();
	});

	afterAll(async () => {
		await TestHelper.teardown();
	});

	beforeEach(async () => {
		await TestHelper.cleanDatabase();
		const registerResponse = await request(app.getHttpServer()).post('/api/auth/register').send({
			email: 'admin@example.com',
			password: 'Password123!',
			firstName: '管理员',
			lastName: '用户'
		});
		authToken = registerResponse.body.accessToken;
		testUserId = registerResponse.body.user.id;
		testTenantId = registerResponse.body.user.tenantId;
	});

	describe('租户管理', () => {
		it('应该创建新租户', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/tenant')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '测试租户',
					slug: 'test-tenant'
				});

			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body).toHaveProperty('id');
			expect(response.body.name).toBe('测试租户');
			expect(response.body.slug).toBe('test-tenant');
		});

		it('应该获取租户列表', async () => {
			await request(app.getHttpServer()).post('/api/tenant').set('Authorization', `Bearer ${authToken}`).send({
				name: '租户1',
				slug: 'tenant-1'
			});

			await request(app.getHttpServer()).post('/api/tenant').set('Authorization', `Bearer ${authToken}`).send({
				name: '租户2',
				slug: 'tenant-2'
			});

			const response = await request(app.getHttpServer())
				.get('/api/tenant')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);
		});

		it('应该根据 ID 获取租户', async () => {
			const createResponse = await request(app.getHttpServer())
				.post('/api/tenant')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '测试租户',
					slug: 'test-tenant'
				});

			const response = await request(app.getHttpServer())
				.get(`/api/tenant/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.id).toBe(createResponse.body.id);
			expect(response.body.name).toBe('测试租户');
		});

		it('应该更新租户信息', async () => {
			const createResponse = await request(app.getHttpServer())
				.post('/api/tenant')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '原名称',
					slug: 'original-slug'
				});

			const response = await request(app.getHttpServer())
				.patch(`/api/tenant/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '更新后的名称'
				});

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.name).toBe('更新后的名称');
		});

		it('应该删除租户', async () => {
			const createResponse = await request(app.getHttpServer())
				.post('/api/tenant')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '待删除租户',
					slug: 'to-delete'
				});

			const deleteResponse = await request(app.getHttpServer())
				.delete(`/api/tenant/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(deleteResponse.status).toBe(HttpStatus.OK);

			const getResponse = await request(app.getHttpServer())
				.get(`/api/tenant/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
		});
	});

	describe('用户管理', () => {
		it('应该创建新用户', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/user')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					email: 'newuser@example.com',
					password: 'Password123!',
					firstName: '新',
					lastName: '用户'
				});

			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body).toHaveProperty('id');
			expect(response.body.email).toBe('newuser@example.com');
		});

		it('应该获取用户列表', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/user')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);
		});

		it('应该根据 ID 获取用户', async () => {
			const response = await request(app.getHttpServer())
				.get(`/api/user/${testUserId}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.id).toBe(testUserId);
			expect(response.body.email).toBe('admin@example.com');
		});

		it('应该更新用户信息', async () => {
			const response = await request(app.getHttpServer())
				.patch(`/api/user/${testUserId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					firstName: '已更新的名',
					lastName: '已更新的姓'
				});

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.firstName).toBe('已更新的名');
			expect(response.body.lastName).toBe('已更新的姓');
		});

		it('应该删除用户', async () => {
			const createResponse = await request(app.getHttpServer())
				.post('/api/user')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					email: 'todelete@example.com',
					password: 'Password123!',
					firstName: '待',
					lastName: '删除'
				});

			const deleteResponse = await request(app.getHttpServer())
				.delete(`/api/user/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(deleteResponse.status).toBe(HttpStatus.OK);

			const getResponse = await request(app.getHttpServer())
				.get(`/api/user/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
		});

		it('应该拒绝未授权的访问', async () => {
			const response = await request(app.getHttpServer()).get('/api/user');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});
	});

	describe('租户和用户关联', () => {
		it('应该为指定租户创建用户', async () => {
			const tenantResponse = await request(app.getHttpServer())
				.post('/api/tenant')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '指定租户',
					slug: 'specific-tenant'
				});

			const userResponse = await request(app.getHttpServer())
				.post('/api/user')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					email: 'tenantuser@example.com',
					password: 'Password123!',
					firstName: '租户',
					lastName: '用户',
					tenantId: tenantResponse.body.id
				});

			expect(userResponse.status).toBe(HttpStatus.CREATED);
			expect(userResponse.body.tenantId).toBe(tenantResponse.body.id);
		});

		it('应该获取指定租户下的用户列表', async () => {
			const tenantResponse = await request(app.getHttpServer())
				.post('/api/tenant')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '筛选租户',
					slug: 'filter-tenant'
				});

			await request(app.getHttpServer()).post('/api/user').set('Authorization', `Bearer ${authToken}`).send({
				email: 'tenant1@example.com',
				password: 'Password123!',
				firstName: '租户',
				lastName: '用户1',
				tenantId: tenantResponse.body.id
			});

			await request(app.getHttpServer()).post('/api/user').set('Authorization', `Bearer ${authToken}`).send({
				email: 'tenant2@example.com',
				password: 'Password123!',
				firstName: '租户',
				lastName: '用户2',
				tenantId: tenantResponse.body.id
			});

			const response = await request(app.getHttpServer())
				.get(`/api/user?tenantId=${tenantResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.length).toBe(2);
		});
	});
});
