import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/core';

/**
 * 创建 Mock Repository
 *
 * @param partial - 部分覆盖的 Mock 函数
 * @returns Mock Repository
 */
export function createMockRepository<T extends object>(
	partial: Partial<EntityRepository<T>> = {}
): EntityRepository<T> {
	return {
		findOne: jest.fn(),
		find: jest.fn(),
		findAndCount: jest.fn(),
		create: jest.fn(),
		persist: jest.fn(),
		flush: jest.fn(),
		persistAndFlush: jest.fn(),
		native: jest.fn(),
		getReference: jest.fn(),
		assign: jest.fn(),
		getEntityManager: jest.fn(),
		remove: jest.fn(),
		removeAndFlush: jest.fn(),
		...partial
	} as any;
}

/**
 * 创建 Mock EntityManager
 *
 * @returns Mock EntityManager
 */
export function createMockEntityManager(): EntityManager {
	return {
		find: jest.fn(),
		findOne: jest.fn(),
		findAndCount: jest.fn(),
		create: jest.fn(),
		persist: jest.fn(),
		flush: jest.fn(),
		persistAndFlush: jest.fn(),
		native: jest.fn(),
		getRepository: jest.fn(),
		transactional: jest.fn(),
		transaction: jest.fn()
	} as any;
}

/**
 * 创建 Mock 服务
 *
 * @param methods - 需要 Mock 的方法列表
 * @returns Mock 服务对象
 */
export function createMockService(methods: string[] = []): any {
	const mockService: any = {};

	methods.forEach((method) => {
		mockService[method] = jest.fn();
	});

	return mockService;
}
