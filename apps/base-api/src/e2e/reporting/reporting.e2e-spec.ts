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
		it('应该生成 PDF 报告', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/reports/generate')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'PDF',
					title: '测试报告',
					data: {
						content: '报告内容'
					}
				});

			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body).toHaveProperty('id');
			expect(response.body).toHaveProperty('downloadUrl');
			expect(response.body.reportType).toBe('PDF');
		});

		it('应该生成 Excel 报告', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/reports/generate')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'EXCEL',
					title: 'Excel 报告',
					data: [
						{ name: '项目1', value: 100 },
						{ name: '项目2', value: 200 }
					]
				});

			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body).toHaveProperty('id');
			expect(response.body.reportType).toBe('EXCEL');
		});
	});

	describe('报告管理', () => {
		it('应该获取报告列表', async () => {
			await request(app.getHttpServer())
				.post('/api/reports/generate')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'PDF',
					title: '报告1'
				});

			await request(app.getHttpServer())
				.post('/api/reports/generate')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'EXCEL',
					title: '报告2'
				});

			const response = await request(app.getHttpServer())
				.get('/api/reports')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(2);
		});

		it('应该根据 ID 获取报告', async () => {
			const createResponse = await request(app.getHttpServer())
				.post('/api/reports/generate')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'PDF',
					title: '测试报告'
				});

			const response = await request(app.getHttpServer())
				.get(`/api/reports/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(response.body.id).toBe(createResponse.body.id);
			expect(response.body.title).toBe('测试报告');
		});

		it('应该删除报告', async () => {
			const createResponse = await request(app.getHttpServer())
				.post('/api/reports/generate')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'PDF',
					title: '待删除报告'
				});

			const deleteResponse = await request(app.getHttpServer())
				.delete(`/api/reports/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(deleteResponse.status).toBe(HttpStatus.OK);

			const getResponse = await request(app.getHttpServer())
				.get(`/api/reports/${createResponse.body.id}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(getResponse.status).toBe(HttpStatus.NOT_FOUND);
		});
	});

	describe('报告模板', () => {
		it('应该创建报告模板', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/reports/templates')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '标准模板',
					reportType: 'PDF',
					config: {
						layout: 'standard',
						includeHeader: true
					}
				});

			expect(response.status).toBe(HttpStatus.CREATED);
			expect(response.body).toHaveProperty('id');
			expect(response.body.name).toBe('标准模板');
		});

		it('应该获取模板列表', async () => {
			await request(app.getHttpServer())
				.post('/api/reports/templates')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '模板1',
					reportType: 'PDF'
				});

			await request(app.getHttpServer())
				.post('/api/reports/templates')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '模板2',
					reportType: 'EXCEL'
				});

			const response = await request(app.getHttpServer())
				.get('/api/reports/templates')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(HttpStatus.OK);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(2);
		});

		it('应该使用模板生成报告', async () => {
			const templateResponse = await request(app.getHttpServer())
				.post('/api/reports/templates')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					name: '测试模板',
					reportType: 'PDF',
					config: {}
				});

			const reportResponse = await request(app.getHttpServer())
				.post('/api/reports/generate')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					reportType: 'PDF',
					templateId: templateResponse.body.id,
					title: '使用模板的报告',
					data: { content: '报告内容' }
				});

			expect(reportResponse.status).toBe(HttpStatus.CREATED);
			expect(reportResponse.body).toHaveProperty('templateId');
		});
	});
});
