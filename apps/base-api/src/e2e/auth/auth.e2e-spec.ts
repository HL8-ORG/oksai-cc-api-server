import { TestHelper } from '../helpers/test-helper';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('认证 E2E 测试', () => {
	let app: INestApplication;
	let authToken: string;
	let refreshToken: string;

	beforeAll(async () => {
		app = await TestHelper.setup();
	});

	afterAll(async () => {
		await TestHelper.teardown();
	});

	beforeEach(async () => {
		await TestHelper.cleanDatabase();
	});

	describe('用户注册', () => {
		it('应该成功注册新用户', async () => {
			const response = await request(app.getHttpServer()).post('/api/auth/register').send({
				email: 'test@example.com',
				password: 'Password123!',
				firstName: '测试',
				lastName: '用户'
			});

			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body).toHaveProperty('accessToken');
			expect(response.body).toHaveProperty('refreshToken');
			expect(response.body).toHaveProperty('user');
			expect(response.body.user.email).toBe('test@example.com');

			authToken = response.body.accessToken;
			refreshToken = response.body.refreshToken;
		});

		it('应该拒绝已存在的邮箱', async () => {
			await request(app.getHttpServer()).post('/api/auth/register').send({
				email: 'test@example.com',
				password: 'Password123!',
				firstName: '测试',
				lastName: '用户'
			});

			const response = await request(app.getHttpServer()).post('/api/auth/register').send({
				email: 'test@example.com',
				password: 'Password123!',
				firstName: '测试',
				lastName: '用户'
			});

			// 服务端使用 ConflictException (409) 表示邮箱已被注册
			expect(response.status).toBe(HttpStatus.CONFLICT);
			expect(response.body.message).toContain('已被注册');
		});

		it('应该拒绝无效的邮箱格式', async () => {
			const response = await request(app.getHttpServer()).post('/api/auth/register').send({
				email: 'invalid-email',
				password: 'Password123!',
				firstName: '测试',
				lastName: '用户'
			});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it('应该拒绝弱密码', async () => {
			const response = await request(app.getHttpServer()).post('/api/auth/register').send({
				email: 'test@example.com',
				password: '123',
				firstName: '测试',
				lastName: '用户'
			});

			expect(response.status).toBe(HttpStatus.BAD_REQUEST);
		});
	});

	describe('用户登录', () => {
		beforeEach(async () => {
			const registerResponse = await request(app.getHttpServer()).post('/api/auth/register').send({
				email: 'test@example.com',
				password: 'Password123!',
				firstName: '测试',
				lastName: '用户'
			});
			authToken = registerResponse.body.accessToken;
			refreshToken = registerResponse.body.refreshToken;
		});

		it('应该成功登录有效凭证', async () => {
			const response = await request(app.getHttpServer()).post('/api/auth/login').send({
				email: 'test@example.com',
				password: 'Password123!'
			});

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('accessToken');
			expect(response.body).toHaveProperty('refreshToken');
			expect(response.body).toHaveProperty('user');
		});

		it('应该拒绝错误的密码', async () => {
			const response = await request(app.getHttpServer()).post('/api/auth/login').send({
				email: 'test@example.com',
				password: 'WrongPassword123!'
			});

			// 服务端统一使用 UnauthorizedException (401) 避免泄露用户是否存在
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
			expect(response.body.message).toContain('用户名或密码错误');
		});

		it('应该拒绝不存在的用户', async () => {
			const response = await request(app.getHttpServer()).post('/api/auth/login').send({
				email: 'nonexistent@example.com',
				password: 'Password123!'
			});

			// 服务端统一使用 UnauthorizedException (401) 避免泄露用户是否存在
			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
			expect(response.body.message).toContain('用户名或密码错误');
		});
	});

	describe('令牌刷新', () => {
		beforeEach(async () => {
			const registerResponse = await request(app.getHttpServer()).post('/api/auth/register').send({
				email: 'test@example.com',
				password: 'Password123!',
				firstName: '测试',
				lastName: '用户'
			});
			authToken = registerResponse.body.accessToken;
			refreshToken = registerResponse.body.refreshToken;
		});

		it('应该成功刷新访问令牌', async () => {
			// 等待 1 秒确保 JWT iat 时间戳不同（避免同一秒内生成相同令牌）
			await new Promise((resolve) => setTimeout(resolve, 1100));

			const response = await request(app.getHttpServer()).post('/api/auth/refresh').send({
				refreshToken
			});

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('accessToken');
			expect(response.body).toHaveProperty('refreshToken');
			expect(response.body.accessToken).not.toBe(authToken);
		});

		it('应该拒绝无效的刷新令牌', async () => {
			const response = await request(app.getHttpServer()).post('/api/auth/refresh').send({
				refreshToken: 'invalid-refresh-token'
			});

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});
	});

	describe('受保护的路由', () => {
		beforeEach(async () => {
			const registerResponse = await request(app.getHttpServer()).post('/api/auth/register').send({
				email: 'test@example.com',
				password: 'Password123!',
				firstName: '测试',
				lastName: '用户'
			});
			authToken = registerResponse.body.accessToken;
			refreshToken = registerResponse.body.refreshToken;
		});

		it('应该允许有效的访问令牌访问受保护的路由', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/auth/me')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('email');
			expect(response.body.email).toBe('test@example.com');
		});

		it('应该拒绝没有令牌的请求', async () => {
			const response = await request(app.getHttpServer()).get('/api/auth/me');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
			// AuthGuard 返回 '未提供令牌'
			expect(response.body.message).toBeDefined();
		});

		it('应该拒绝无效的访问令牌', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/auth/me')
				.set('Authorization', 'Bearer invalid-token');

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
			expect(response.body.message).toBeDefined();
		});

		it('应该拒绝格式错误的授权头', async () => {
			const response = await request(app.getHttpServer()).get('/api/auth/me').set('Authorization', authToken);

			expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
		});
	});

	describe('登出', () => {
		beforeEach(async () => {
			const registerResponse = await request(app.getHttpServer()).post('/api/auth/register').send({
				email: 'test@example.com',
				password: 'Password123!',
				firstName: '测试',
				lastName: '用户'
			});
			authToken = registerResponse.body.accessToken;
			refreshToken = registerResponse.body.refreshToken;
		});

		it('应该成功登出用户', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/logout')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.message).toBeDefined();
		});
	});
});
