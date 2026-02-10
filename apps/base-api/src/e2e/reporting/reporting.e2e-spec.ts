import { TestHelper } from '../helpers/test-helper';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Reporting API E2E 测试', () => {
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

	describe('报告生成', () => {
		it('应该生成报告', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/reporting/reports')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'PDF',
					title: '测试报告',
					data: {
						content: '报告内容'
					}
				});

			// POST 默认返回 201
			expect([HttpStatus.CREATED, HttpStatus.OK]).toContain(response.status);
			expect(response.body).toHaveProperty('id');
		});
	});

	describe('报告管理', () => {
		it('应该获取报告列表', async () => {
			await request(app.getHttpServer())
				.post('/api/reporting/reports')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'PDF',
					title: '报告1'
				});

			await request(app.getHttpServer())
				.post('/api/reporting/reports')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'EXCEL',
					title: '报告2'
				});

			const response = await request(app.getHttpServer())
				.get('/api/reporting/reports')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
		});

		it('应该根据 ID 获取报告', async () => {
			const createResponse = await request(app.getHttpServer())
				.post('/api/reporting/reports')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'PDF',
					title: '测试报告'
				});

			const response = await request(app.getHttpServer())
				.get(`/api/reporting/reports/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.id).toBe(createResponse.body.id);
		});

		it('应该删除报告', async () => {
			const createResponse = await request(app.getHttpServer())
				.post('/api/reporting/reports')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'PDF',
					title: '待删除报告'
				});

			const deleteResponse = await request(app.getHttpServer())
				.delete(`/api/reporting/reports/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(deleteResponse.status).toBe(HttpStatus.OK);

			const getResponse = await request(app.getHttpServer())
				.get(`/api/reporting/reports/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
		});
	});
});
