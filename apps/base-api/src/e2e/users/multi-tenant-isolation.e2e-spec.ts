import { TestHelper } from '../helpers/test-helper';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getJwtUtils, type JwtPayload } from '@oksai/core';
import { Tenant } from '@oksai/tenant';
import { User, UserRole } from '@oksai/user';

describe('多租户隔离闭环 E2E（HTTP）', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await TestHelper.setup();
	});

	afterAll(async () => {
		await TestHelper.teardown();
	});

	beforeEach(async () => {
		await TestHelper.cleanDatabase();
	});

	it('tenantA 的 token 不应读取到 tenantB 的用户数据（404/403 且不泄露）', async () => {
		const tenantA = await TestHelper.insertTestData<Tenant>(Tenant, { name: '租户A', slug: 'tenant-a' });
		const tenantB = await TestHelper.insertTestData<Tenant>(Tenant, { name: '租户B', slug: 'tenant-b' });

		const userA = await TestHelper.insertTestData<User>(User, {
			email: 'a@example.com',
			password: 'hashed',
			firstName: 'A',
			lastName: 'User',
			role: UserRole.USER,
			tenantId: tenantA.id
		});

		const userB = await TestHelper.insertTestData<User>(User, {
			email: 'b@example.com',
			password: 'hashed',
			firstName: 'B',
			lastName: 'User',
			role: UserRole.USER,
			tenantId: tenantB.id
		});

		const jwtUtils = getJwtUtils();
		const tokenA = jwtUtils.generateAccessToken({
			sub: userA.id,
			email: userA.email,
			tenantId: tenantA.id,
			role: userA.role
		} as JwtPayload);
		const tokenB = jwtUtils.generateAccessToken({
			sub: userB.id,
			email: userB.email,
			tenantId: tenantB.id,
			role: userB.role
		} as JwtPayload);

		// tenantA 读取 tenantB 用户：不应成功
		const crossRead = await request(app.getHttpServer())
			.get(`/api/users/${userB.id}`)
			.set('Authorization', `Bearer ${tokenA}`);

		expect([HttpStatus.NOT_FOUND, HttpStatus.FORBIDDEN]).toContain(crossRead.status);

		// tenantB 读取 tenantA 用户：不应成功
		const crossRead2 = await request(app.getHttpServer())
			.get(`/api/users/${userA.id}`)
			.set('Authorization', `Bearer ${tokenB}`);

		expect([HttpStatus.NOT_FOUND, HttpStatus.FORBIDDEN]).toContain(crossRead2.status);
	});

	it('客户端传入 tenantId 不应覆盖服务端租户上下文（以 token tenantId 为准）', async () => {
		const tenantA = await TestHelper.insertTestData<Tenant>(Tenant, { name: '租户A', slug: 'tenant-a2' });
		const tenantB = await TestHelper.insertTestData<Tenant>(Tenant, { name: '租户B', slug: 'tenant-b2' });

		const userA = await TestHelper.insertTestData<User>(User, {
			email: 'a2@example.com',
			password: 'hashed',
			firstName: 'A',
			lastName: 'User',
			role: UserRole.USER,
			tenantId: tenantA.id
		});

		const jwtUtils = getJwtUtils();
		const tokenA = jwtUtils.generateAccessToken({
			sub: userA.id,
			email: userA.email,
			tenantId: tenantA.id,
			role: userA.role
		} as JwtPayload);

		const createResponse = await request(app.getHttpServer())
			.post('/api/users')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({
				email: 'created@example.com',
				password: 'Password123!',
				firstName: 'Created',
				lastName: 'User',
				// 恶意/错误输入：尝试覆盖租户
				tenantId: tenantB.id
			});

		expect([HttpStatus.CREATED, HttpStatus.OK]).toContain(createResponse.status);
		expect(createResponse.body).toHaveProperty('tenantId', tenantA.id);
	});
});
