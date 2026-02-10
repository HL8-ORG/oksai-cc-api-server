import { TestHelper } from '../helpers/test-helper';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Analytics API E2E 测试', () => {
	let app: INestApplication;
	let authToken: string;

	beforeAll(async () => {
		app = await TestHelper.setup();
	});

	afterAll(async () => {
		await TestHelper.teardown();
	});

	beforeEach(async () => {
		await TestHelper.cleanDatabase();
		const registerResponse = await request(app.getHttpServer()).post('/api/auth/register').send({
			email: 'test@example.com',
			password: 'Password123!',
			firstName: '测试',
			lastName: '用户'
		});
		authToken = registerResponse.body.accessToken;
	});

	describe('事件追踪', () => {
		it('应该成功跟踪事件', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/analytics/events')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					eventName: 'user_action',
					eventType: 'click',
					properties: {
						button: 'submit',
						page: '/form'
					}
				});

			// trackEvent 返回 void，POST 默认返回 201
			expect([HttpStatus.CREATED, HttpStatus.OK]).toContain(response.status);
		});
	});

	describe('指标查询', () => {
		it('应该查询事件指标', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/analytics/metrics')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
		});
	});

	describe('报告生成', () => {
		it('应该生成报告', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/analytics/reports')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					title: '测试报告',
					reportType: 'EVENT_SUMMARY'
				});

			// POST 默认返回 201
			expect([HttpStatus.CREATED, HttpStatus.OK]).toContain(response.status);
		});

		it('应该获取报告列表', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/analytics/reports')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
		});
	});

	describe('仪表板数据', () => {
		it('应该获取仪表板概览数据', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/analytics/dashboard')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
		});
	});
});
