import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';

export class TestHelper {
	private static app: INestApplication;
	private static orm: MikroORM;

	static async setup() {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		this.app = moduleFixture.createNestApplication();
		// 与生产一致：统一 API 前缀
		this.app.setGlobalPrefix('api');
		// 测试环境启用输入校验：去除未知字段（避免客户端注入 tenantId 等敏感字段）
		this.app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
		this.orm = moduleFixture.get<MikroORM>(MikroORM);

		await this.orm.getSchemaGenerator().refreshDatabase();

		await this.app.init();

		return this.app;
	}

	static async teardown() {
		if (this.orm) {
			await this.orm.getSchemaGenerator().clearDatabase();
			await this.orm.close();
		}

		if (this.app) {
			await this.app.close();
		}

		this.app = null;
		this.orm = null;
	}

	static getApp(): INestApplication {
		if (!this.app) {
			throw new Error('测试应用未初始化，请先调用 setup()');
		}
		return this.app;
	}

	static getOrm(): MikroORM {
		if (!this.orm) {
			throw new Error('ORM 未初始化，请先调用 setup()');
		}
		return this.orm;
	}

	static async cleanDatabase() {
		const orm = this.getOrm();
		await orm.getSchemaGenerator().clearDatabase();
	}

	static async insertTestData<T>(entity: any, data: Partial<T>): Promise<T> {
		const orm = this.getOrm();
		const em = orm.em;
		const instance = em.create(entity, data);
		await em.persistAndFlush(instance);
		return instance as T;
	}
}

describe('TestHelper', () => {
	describe('setup', () => {
		it('应该成功初始化应用', async () => {
			const app = await TestHelper.setup();
			expect(app).toBeDefined();
			expect(TestHelper.getApp()).toBeDefined();
			expect(TestHelper.getOrm()).toBeDefined();
			await TestHelper.teardown();
		});
	});

	describe('teardown', () => {
		it('应该成功清理应用资源', async () => {
			await TestHelper.setup();
			const app = TestHelper.getApp();
			const orm = TestHelper.getOrm();
			await TestHelper.teardown();

			// 验证资源已清理
			expect(() => TestHelper.getApp()).toThrow('测试应用未初始化，请先调用 setup()');
			expect(() => TestHelper.getOrm()).toThrow('ORM 未初始化，请先调用 setup()');
		});
	});

	describe('insertTestData', () => {
		it('应该成功插入测试数据', async () => {
			await TestHelper.setup();
			const orm = TestHelper.getOrm();
			const em = orm.em;

			const testData = {
				email: 'test@example.com',
				password: 'password123',
				firstName: 'Test',
				lastName: 'User',
				tenantId: 'test-tenant-id'
			};
			const user = await TestHelper.insertTestData('User', testData);

			expect(user).toBeDefined();
			expect(user.email).toBe('test@example.com');
			expect(user.password).toBe('password123');

			await TestHelper.teardown();
		});
	});

	describe('cleanDatabase', () => {
		it('应该成功清理数据库', async () => {
			await TestHelper.setup();
			const orm = TestHelper.getOrm();
			const em = orm.em;

			// 插入测试数据
			await TestHelper.insertTestData('User', {
				email: 'test2@example.com',
				password: 'password456',
				firstName: 'Test2',
				lastName: 'User2',
				tenantId: 'test-tenant-id'
			});

			// 清理数据库
			await TestHelper.cleanDatabase();

			// 验证数据库已清空
			const count = await em.count('User');
			expect(count).toBe(0);

			await TestHelper.teardown();
		});
	});
});
