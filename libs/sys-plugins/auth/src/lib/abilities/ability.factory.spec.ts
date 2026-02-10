import { Test, TestingModule } from '@nestjs/testing';
import { AbilityFactory, Action } from '../abilities/ability.factory';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

describe('AbilityFactory', () => {
	let factory: AbilityFactory;
	let userRepo: jest.Mocked<EntityRepository<User>>;
	let roleRepo: jest.Mocked<EntityRepository<Role>>;

	beforeEach(async () => {
		jest.clearAllMocks();

		userRepo = {
			findOne: jest.fn(),
			getRepository: jest.fn()
		} as any;

		roleRepo = {
			findOne: jest.fn(),
			getRepository: jest.fn()
		} as any;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AbilityFactory,
				{
					provide: getRepositoryToken(User),
					useValue: userRepo
				},
				{
					provide: getRepositoryToken(Role),
					useValue: roleRepo
				}
			]
		}).compile();

		factory = module.get<AbilityFactory>(AbilityFactory);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createForUser', () => {
		it('应该为 ADMIN 用户创建所有权限', async () => {
			const user = {
				id: 'admin123',
				email: 'admin@example.com',
				role: 'ADMIN'
			} as any;

			userRepo.findOne.mockResolvedValue(user as any);

			const ability = await factory.createForUser(user as any);

			expect(ability.can(Action.MANAGE, 'all')).toBe(true);
		});

		it('应该为普通用户创建基本权限', async () => {
			const user = {
				id: 'user123',
				email: 'user@example.com',
				role: 'USER',
				roles: []
			} as any;

			userRepo.findOne.mockResolvedValue({
				...user,
				roles: []
			} as any);

			const ability = await factory.createForUser(user as any);

			expect(ability.can(Action.READ, 'User')).toBe(true);
			expect(ability.can(Action.READ, 'Tenant')).toBe(true);
			expect(ability.can(Action.READ, 'Plugin')).toBe(true);
			expect(ability.can(Action.DELETE, 'User')).toBe(false);
		});

		it('应该从角色的权限创建能力', async () => {
			const user = {
				id: 'user123',
				email: 'user@example.com',
				role: 'USER',
				roles: []
			} as any;

			const mockRole = {
				id: 'role1',
				code: 'EDITOR',
				name: '编辑员',
				permissions: [
					{
						id: 'perm1',
						code: 'users:write',
						name: '写入用户',
						resource: 'User',
						action: 'create',
						effect: 'allow'
					} as any,
					{
						id: 'perm2',
						code: 'users:delete',
						name: '删除用户',
						resource: 'User',
						action: 'delete',
						effect: 'deny'
					} as any
				],
				createdAt: new Date(),
				updatedAt: new Date()
			};

			userRepo.findOne.mockResolvedValue({
				...user,
				roles: [mockRole as any]
			} as any);

			const ability = await factory.createForUser(user as any);

			expect(ability.can(Action.CREATE, 'User')).toBe(true);
			expect(ability.can(Action.DELETE, 'User')).toBe(false);
		});

		it('应该抛出异常当用户不存在时', async () => {
			const user = {
				id: 'nonexistent',
				email: 'nonexistent@example.com',
				role: 'USER',
				roles: []
			} as any;

			userRepo.findOne.mockResolvedValue(null);

			await expect(factory.createForUser(user as any)).rejects.toThrow(UnauthorizedException);
		});
	});
});
