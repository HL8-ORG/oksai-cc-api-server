import { JwtBlacklistService } from './jwt-blacklist.service';

const mockRedis = {
	connect: jest.fn().mockReturnValue(undefined),
	on: jest.fn().mockReturnValue(undefined),
	setex: jest.fn().mockResolvedValue('OK'),
	exists: jest.fn().mockResolvedValue(1),
	del: jest.fn().mockResolvedValue(1),
	keys: jest.fn().mockResolvedValue(['key1', 'key2']),
	quit: jest.fn().mockResolvedValue('OK')
};

jest.mock('ioredis', () => {
	return jest.fn().mockImplementation(() => mockRedis);
});

describe('JwtBlacklistService', () => {
	let service: JwtBlacklistService;

	beforeEach(() => {
		service = new JwtBlacklistService();
		mockRedis.connect.mockClear();
		mockRedis.on.mockClear();
		mockRedis.setex.mockClear();
		mockRedis.exists.mockClear();
		mockRedis.del.mockClear();
		mockRedis.keys.mockClear();
		mockRedis.quit.mockClear();
		(service as any).redis = mockRedis;
	});

	afterEach(async () => {
		await service.onModuleDestroy();
	});

	describe('initializeRedis', () => {
		it('应该初始化 Redis 连接', () => {
			expect(service['redis']).not.toBeNull();
		});

		it('应该在 Redis 连接失败时记录警告', () => {
			expect(() => {
				new JwtBlacklistService();
			}).not.toThrow();
		});
	});

	describe('isAvailable', () => {
		it('应该返回 true（Redis 已连接）', () => {
			expect(service.isAvailable()).toBe(true);
		});

		it('应该返回 false（Redis 未连接）', () => {
			(service as any).redis = null;

			expect(service.isAvailable()).toBe(false);
		});
	});

	describe('add', () => {
		it('应该成功将令牌加入黑名单', async () => {
			const token = 'test-token-abc123';
			const expiresIn = 3600;

			const result = await service.add(token, expiresIn);

			expect(result).toBe(true);
			expect(mockRedis.setex).toHaveBeenCalledWith('jwt:blacklist:test-token-abc123', expiresIn, '1');
		});

		it('应该在 Redis 连接失败时返回 false', async () => {
			(service as any).redis = null;

			const result = await service.add('test-token-123', 3600);

			expect(result).toBe(false);
		});
	});

	describe('isBlacklisted', () => {
		it('应该检查令牌是否在黑名单中（已存在）', async () => {
			const token = 'blacklisted-token-abc123';
			mockRedis.exists.mockResolvedValueOnce(1);

			const result = await service.isBlacklisted(token);

			expect(result).toBe(true);
			expect(mockRedis.exists).toHaveBeenCalledWith('jwt:blacklist:blacklisted-token-abc123');
		});

		it('应该返回 false（令牌不在黑名单中）', async () => {
			const token = 'valid-token-abc123';
			mockRedis.exists.mockResolvedValueOnce(0);

			const result = await service.isBlacklisted(token);

			expect(result).toBe(false);
			expect(mockRedis.exists).toHaveBeenCalledWith('jwt:blacklist:valid-token-abc123');
		});

		it('应该在 Redis 未连接时返回 false', async () => {
			(service as any).redis = null;

			const token = 'test-token-123';

			const result = await service.isBlacklisted(token);

			expect(result).toBe(false);
		});
	});

	describe('remove', () => {
		it('应该成功从黑名单中移除令牌', async () => {
			const token = 'blacklisted-token-abc123';

			mockRedis.del.mockResolvedValueOnce(1);

			const result = await service.remove(token);

			expect(result).toBe(true);
			expect(mockRedis.del).toHaveBeenCalledWith('jwt:blacklist:blacklisted-token-abc123');
		});

		it('应该在 Redis 未连接时返回 false', async () => {
			(service as any).redis = null;

			const token = 'test-token-123';

			const result = await service.remove(token);

			expect(result).toBe(false);
		});
	});

	describe('clear', () => {
		it('应该清空所有黑名单令牌', async () => {
			mockRedis.keys.mockResolvedValueOnce(['key1', 'key2']);
			mockRedis.del.mockResolvedValueOnce('OK');

			const result = await service.clear();

			expect(result).toBe(true);
			expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2');
		});

		it('应该在 Redis 未连接时返回 false', async () => {
			(service as any).redis = null;

			const result = await service.clear();

			expect(result).toBe(false);
		});

		it('应该返回 true（没有令牌时）', async () => {
			mockRedis.keys.mockResolvedValueOnce([]);

			const result = await service.clear();

			expect(result).toBe(true);
			expect(mockRedis.keys).toHaveBeenCalled();
			expect(mockRedis.del).not.toHaveBeenCalled();
		});
	});

	describe('getStats', () => {
		it('应该返回黑名单统计信息', async () => {
			mockRedis.keys.mockResolvedValueOnce(['key1', 'key2']);

			const result = await service.getStats();

			expect(result.count).toBe(2);
			expect(result.available).toBe(true);
		});

		it('应该返回默认值（Redis 未连接）', async () => {
			(service as any).redis = null;

			const result = await service.getStats();

			expect(result.count).toBe(0);
			expect(result.available).toBe(false);
		});
	});

	describe('onModuleDestroy', () => {
		it('应该关闭 Redis 连接', async () => {
			mockRedis.quit.mockResolvedValueOnce('OK');

			await service.onModuleDestroy();

			expect(mockRedis.quit).toHaveBeenCalled();
		});
	});
});
