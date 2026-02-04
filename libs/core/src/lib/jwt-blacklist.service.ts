import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * JWT 黑名单服务
 *
 * 使用 Redis 存储 JWT 令牌黑名单，防止已登出的令牌被再次使用
 */
@Injectable()
export class JwtBlacklistService implements OnModuleDestroy {
	private readonly logger = new Logger(JwtBlacklistService.name);
	private redis: Redis | null = null;
	private readonly keyPrefix = 'jwt:blacklist:';

	constructor() {
		this.initializeRedis();
	}

	/**
	 * 初始化 Redis 连接
	 */
	private initializeRedis(): void {
		try {
			const host = process.env.REDIS_HOST || 'localhost';
			const port = parseInt(process.env.REDIS_PORT || '6379', 10);
			const password = process.env.REDIS_PASSWORD || undefined;
			const db = parseInt(process.env.REDIS_DB || '0', 10);

			this.redis = new Redis({
				host,
				port,
				password,
				db,
				maxRetriesPerRequest: 3,
				retryStrategy(times) {
					const delay = Math.min(times * 50, 2000);
					return delay;
				}
			});

			this.redis.on('connect', () => {
				this.logger.log('Redis 连接成功');
			});

			this.redis.on('error', (err) => {
				this.logger.error('Redis 连接错误', err.message);
			});
		} catch (error) {
			this.logger.error('Redis 初始化失败，JWT 黑名单功能将不可用', error);
		}
	}

	/**
	 * 检查服务是否可用
	 *
	 * @returns 是否可用
	 */
	isAvailable(): boolean {
		return this.redis !== null;
	}

	/**
	 * 将令牌加入黑名单
	 *
	 * @param token - JWT 令牌
	 * @param expiresIn - 过期时间（秒）
	 * @returns Promise<boolean> 是否成功
	 *
	 * @example
	 * ```typescript
	 * await jwtBlacklistService.add('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', 3600);
	 * ```
	 */
	async add(token: string, expiresIn: number): Promise<boolean> {
		if (!this.redis) {
			this.logger.warn('Redis 未连接，无法将令牌加入黑名单');
			return false;
		}

		try {
			const key = this.keyPrefix + token;
			await this.redis.setex(key, expiresIn, '1');
			this.logger.log(`令牌已加入黑名单，有效期：${expiresIn} 秒`);
			return true;
		} catch (error) {
			this.logger.error('将令牌加入黑名单失败', error);
			return false;
		}
	}

	/**
	 * 检查令牌是否在黑名单中
	 *
	 * @param token - JWT 令牌
	 * @returns Promise<boolean> 是否在黑名单中
	 *
	 * @example
	 * ```typescript
	 * const isBlacklisted = await jwtBlacklistService.isBlacklisted('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
	 * ```
	 */
	async isBlacklisted(token: string): Promise<boolean> {
		if (!this.redis) {
			return false;
		}

		try {
			const key = this.keyPrefix + token;
			const exists = await this.redis.exists(key);
			return exists === 1;
		} catch (error) {
			this.logger.error('检查令牌黑名单失败', error);
			return false;
		}
	}

	/**
	 * 从黑名单中移除令牌
	 *
	 * @param token - JWT 令牌
	 * @returns Promise<boolean> 是否成功
	 *
	 * @example
	 * ```typescript
	 * await jwtBlacklistService.remove('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
	 * ```
	 */
	async remove(token: string): Promise<boolean> {
		if (!this.redis) {
			return false;
		}

		try {
			const key = this.keyPrefix + token;
			await this.redis.del(key);
			this.logger.log(`令牌已从黑名单中移除`);
			return true;
		} catch (error) {
			this.logger.error('从黑名单中移除令牌失败', error);
			return false;
		}
	}

	/**
	 * 清空所有黑名单令牌
	 *
	 * @returns Promise<boolean> 是否成功
	 *
	 * @example
	 * ```typescript
	 * await jwtBlacklistService.clear();
	 * ```
	 */
	async clear(): Promise<boolean> {
		if (!this.redis) {
			return false;
		}

		try {
			const keys = await this.redis.keys(this.keyPrefix + '*');
			if (keys.length > 0) {
				await this.redis.del(...keys);
				this.logger.log(`已清空 ${keys.length} 个黑名单令牌`);
			}
			return true;
		} catch (error) {
			this.logger.error('清空黑名单失败', error);
			return false;
		}
	}

	/**
	 * 获取黑名单统计信息
	 *
	 * @returns 黑名单统计信息
	 *
	 * @example
	 * ```typescript
	 * const stats = await jwtBlacklistService.getStats();
	 * console.log(stats.count); // 黑名单令牌数量
	 * ```
	 */
	async getStats(): Promise<{
		count: number;
		available: boolean;
	}> {
		if (!this.redis) {
			return {
				count: 0,
				available: false
			};
		}

		try {
			const keys = await this.redis.keys(this.keyPrefix + '*');
			return {
				count: keys.length,
				available: true
			};
		} catch (error) {
			this.logger.error('获取黑名单统计信息失败', error);
			return {
				count: 0,
				available: false
			};
		}
	}

	/**
	 * 关闭 Redis 连接
	 */
	async onModuleDestroy(): Promise<void> {
		if (this.redis) {
			await this.redis.quit();
			this.logger.log('Redis 连接已关闭');
		}
	}
}
