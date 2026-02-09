import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

/**
 * E2E 测试环境设置
 *
 * 配置测试数据库和 Redis 连接
 */

describe('E2E 测试环境设置', () => {
	let app: INestApplication;

	beforeAll(async () => {
		// 配置测试环境变量
		process.env.DB_HOST = 'localhost';
		process.env.DB_PORT = '5433';
		process.env.DB_NAME = 'test_oksai';
		process.env.DB_USER = 'postgres';
		process.env.DB_PASS = 'test_password';
		process.env.REDIS_HOST = 'localhost';
		process.env.REDIS_PORT = '6380';
		process.env.REDIS_ENABLED = 'false';
		process.env.MICROSOFT_CLIENT_ID = 'disabled';
	});

	afterAll(async () => {
		// 清理测试环境变量（可选）
		delete process.env.DB_HOST;
		delete process.env.DB_PORT;
		delete process.env.DB_NAME;
		delete process.env.DB_USER;
		delete process.env.DB_PASS;
		delete process.env.REDIS_HOST;
		delete process.env.REDIS_PORT;
		delete process.env.REDIS_ENABLED;
		delete process.env.MICROSOFT_CLIENT_ID;
	});

	it('应该正确设置测试环境变量', () => {
		expect(process.env.DB_NAME).toBe('test_oksai');
		expect(process.env.REDIS_PORT).toBe('6380');
	});
});
