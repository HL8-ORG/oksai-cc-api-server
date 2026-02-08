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
