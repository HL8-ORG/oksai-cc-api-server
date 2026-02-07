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

			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body).toHaveProperty('id');
			expect(response.body.eventName).toBe('user_action');
		});

		it('应该获取事件列表', async () => {
			await request(app.getHttpServer())
				.post('/api/analytics/events')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					eventName: 'event1',
					eventType: 'click'
				});

			await request(app.getHttpServer())
				.post('/api/analytics/events')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					eventName: 'event2',
					eventType: 'view'
				});

			const response = await request(app.getHttpServer())
				.get('/api/analytics/events')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(2);
		});
	});

	describe('指标查询', () => {
		it('应该查询事件指标', async () => {
			for (let i = 0; i < 5; i++) {
				await request(app.getHttpServer())
					.post('/api/analytics/events')
					.set('Authorization', `Bearer ${authToken}`)
					.send({
						eventName: 'test_event',
						eventType: 'click'
					});
			}

			const response = await request(app.getHttpServer())
				.get('/api/analytics/metrics?eventName=test_event')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('count');
			expect(response.body.count).toBe(5);
		});
	});

	describe('报告生成', () => {
		it('应该生成报告', async () => {
			await request(app.getHttpServer())
				.post('/api/analytics/events')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					eventName: 'report_event',
					eventType: 'view'
				});

			const response = await request(app.getHttpServer())
				.post('/api/analytics/reports')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					title: '测试报告',
					reportType: 'EVENT_SUMMARY',
					filters: {
						eventName: 'report_event'
					}
				});

			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body).toHaveProperty('id');
			expect(response.body.title).toBe('测试报告');
		});

		it('应该获取报告列表', async () => {
			await request(app.getHttpServer())
				.post('/api/analytics/reports')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					title: '报告1',
					reportType: 'EVENT_SUMMARY'
				});

			await request(app.getHttpServer())
				.post('/api/analytics/reports')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					title: '报告2',
					reportType: 'EVENT_SUMMARY'
				});

			const response = await request(app.getHttpServer())
				.get('/api/analytics/reports')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(2);
		});
	});

	describe('仪表板数据', () => {
		it('应该获取仪表板概览数据', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/analytics/dashboard')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body).toHaveProperty('totalEvents');
			expect(response.body).toHaveProperty('uniqueUsers');
			expect(response.body).toHaveProperty('topEvents');
		});
	});
});
