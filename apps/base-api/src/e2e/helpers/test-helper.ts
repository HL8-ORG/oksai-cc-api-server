import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PluginRegistryService } from '@oksai/plugin';
import { AuthPlugin } from '@oksai/auth';
import { TenantPlugin } from '@oksai/tenant';
import { UserPlugin } from '@oksai/user';
import { AuditPlugin } from '@oksai/audit';
import { OrganizationPlugin } from '@oksai/organization';
import { RolePlugin } from '@oksai/role';
import { AnalyticsPlugin } from '@oksai/analytics';
import { ReportingPlugin } from '@oksai/reporting';
import { Tenant, TenantStatus } from '@oksai/tenant';

export class TestHelper {
	private static app: INestApplication;
	private static orm: MikroORM;
	private static defaultTenantId: string | null = null;

	static async setup() {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		this.app = moduleFixture.createNestApplication();
		this.app.setGlobalPrefix('api');
		this.app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
		this.orm = moduleFixture.get<MikroORM>(MikroORM);

		const registry = moduleFixture.get(PluginRegistryService);
		const plugins = [
			new AuthPlugin(),
			new TenantPlugin(),
			new UserPlugin(),
			new AuditPlugin(),
			new OrganizationPlugin(),
			new RolePlugin(),
			new AnalyticsPlugin(),
			new ReportingPlugin()
		];
		for (const plugin of plugins) {
			registry.register(plugin);
		}

		await this.orm.getSchemaGenerator().refreshDatabase();

		const em = this.orm.em;
		const existingDefaultTenant = await em.findOne(Tenant, { slug: 'default' });
		if (!existingDefaultTenant) {
			const defaultTenant = em.create(Tenant, {
				name: '默认租户',
				slug: 'default',
				status: TenantStatus.ACTIVE,
				allowSelfRegistration: true,
				maxUsers: 0
			});
			em.persist(defaultTenant);
			await em.flush();
			this.defaultTenantId = defaultTenant.id;
		} else {
			this.defaultTenantId = existingDefaultTenant.id;
		}

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
