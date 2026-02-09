/**
 * Redis 会话存储实现
 *
 * 将会话数据持久化到 Redis，支持分布式部署
 */

import { Logger } from '@nestjs/common';
import { Session, SessionStorage } from './session-storage';

/**
 * Redis 会话配置接口
 */
export interface RedisConfig {
	/** Redis 连接 URL */
	redisUrl?: string;
	/** 连接超时（毫秒） */
	connectTimeout?: number;
	/** 数据库索引前缀 */
	keyPrefix?: string;
	/** 会话过期时间（秒） */
	ttl?: number;
}

/**
 * Redis 会话存储实现
 *
 * 将会话数据持久化到 Redis，支持分布式部署
 */
export class RedisStorage implements SessionStorage {
	private redisClient: any = null;
	private config: RedisConfig;

	constructor(config?: RedisConfig) {
		this.config = config || {};
		this.logger = new Logger('RedisStorage');
		this.connectRedis();
	}

	private logger: Logger;

	private async connectRedis(): Promise<void> {
		try {
			if (!this.config.redisUrl || process.env.REDIS_ENABLED !== 'true') {
				this.logger.warn('Redis 未启用，使用内存存储');
				return;
			}

			this.logger.log(`连接 Redis: ${this.config.redisUrl}`);

			const ioredis = await import('ioredis');
			this.redisClient = new (ioredis as any)(this.config.redisUrl, {
				connectTimeout: this.config.connectTimeout || 10000,
				maxRetries: 3,
				showFriendlyErrorStack: true,
				lazyConnect: true
			});

			await this.redisClient.ping();
			this.logger.log('Redis 连接成功');
		} catch (error) {
			this.logger.error('Redis 连接失败', error);
			this.redisClient = null;
		}
	}

	private getSessionKey(sessionId: string): string {
		const prefix = this.config.keyPrefix || 'mcp:session:';
		return `${prefix}${sessionId}`;
	}

	private getSessionTtl(): number {
		return this.config.ttl || 1800;
	}

	async create(session: Session): Promise<boolean> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接，创建会话失败');
			return false;
		}

		try {
			const key = this.getSessionKey(session.id);
			const ttl = this.getSessionTtl();

			const sessionData = JSON.stringify({
				id: session.id,
				userId: session.userId,
				organizationId: session.organizationId,
				tenantId: session.tenantId,
				createdAt: session.createdAt.getTime(),
				lastAccessedAt: session.lastAccessedAt.getTime(),
				data: session.data
			});

			await this.redisClient.setex(key, ttl, sessionData);
			this.logger.debug(`会话已创建: ${session.id}`);
			return true;
		} catch (error) {
			this.logger.error('创建 Redis 会话失败', error);
			return false;
		}
	}

	async findById(sessionId: string): Promise<Session | null> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接，查找会话失败');
			return null;
		}

		try {
			const key = this.getSessionKey(sessionId);
			const data = await this.redisClient.get(key);

			if (!data) {
				return null;
			}

			const sessionData = JSON.parse(data);
			return sessionData as Session;
		} catch (error) {
			this.logger.error('查找 Redis 会话失败', error);
			return null;
		}
	}

	async findByUserId(userId: string): Promise<Session[]> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接，查找会话失败');
			return [];
		}

		try {
			const prefix = this.config.keyPrefix || 'mcp:session:';
			const keys = await this.redisClient.keys(`${prefix}*`);
			const userSessions: Session[] = [];

			for (const key of keys) {
				const data = await this.redisClient.get(key);
				if (data) {
					const session = JSON.parse(data) as Session;
					if (session.userId === userId) {
						userSessions.push(session);
					}
				}
			}

			return userSessions;
		} catch (error) {
			this.logger.error('查找用户会话失败', error);
			return [];
		}
	}

	async update(session: Session): Promise<boolean> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接，更新会话失败');
			return false;
		}

		try {
			const key = this.getSessionKey(session.id);
			const ttl = this.getSessionTtl();

			const sessionData = JSON.stringify({
				...session,
				lastAccessedAt: new Date().getTime()
			});

			await this.redisClient.setex(key, ttl, sessionData);
			this.logger.debug(`会话已更新: ${session.id}`);
			return true;
		} catch (error) {
			this.logger.error('更新 Redis 会话失败', error);
			return false;
		}
	}

	async delete(sessionId: string): Promise<boolean> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接，删除会话失败');
			return false;
		}

		try {
			const key = this.getSessionKey(sessionId);
			const count = await this.redisClient.del(key);
			this.logger.debug(`会话已删除: ${sessionId}`);
			return count > 0;
		} catch (error) {
			this.logger.error('删除 Redis 会话失败', error);
			return false;
		}
	}

	async deleteByUserId(userId: string): Promise<number> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接，删除会话失败');
			return 0;
		}

		try {
			const prefix = this.config.keyPrefix || 'mcp:session:';
			const keys = await this.redisClient.keys(`${prefix}*`);
			let count = 0;

			for (const key of keys) {
				const data = await this.redisClient.get(key);
				if (data) {
					const session = JSON.parse(data) as Session;
					if (session.userId === userId) {
						await this.redisClient.del(key);
						count++;
					}
				}
			}

			return count;
		} catch (error) {
			this.logger.error('删除用户会话失败', error);
			return 0;
		}
	}

	async clear(): Promise<number> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接，清空会话失败');
			return 0;
		}

		try {
			const prefix = this.config.keyPrefix || 'mcp:session:';
			const keys = await this.redisClient.keys(`${prefix}*`);

			if (keys.length > 0) {
				await this.redisClient.del(...keys);
				this.logger.log(`已清空所有会话: ${keys.length} 个`);
			}

			return keys.length;
		} catch (error) {
			this.logger.error('清空 Redis 会话失败', error);
			return 0;
		}
	}

	async cleanupExpired(maxAge: number): Promise<number> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接，清理会话失败');
			return 0;
		}

		try {
			const prefix = this.config.keyPrefix || 'mcp:session:';
			const keys = await this.redisClient.keys(`${prefix}*`);
			let cleaned = 0;

			const now = new Date().getTime();

			for (const key of keys) {
				const data = await this.redisClient.get(key);
				if (data) {
					const session = JSON.parse(data) as Session;

					const isExpired = session.lastAccessedAt && now - (session.lastAccessedAt as any) > maxAge;

					if (isExpired) {
						await this.redisClient.del(key);
						cleaned++;
					}
				}
			}

			this.logger.debug(`清理了 ${cleaned} 个过期会话`);
			return cleaned;
		} catch (error) {
			this.logger.error('清理过期会话失败', error);
			return 0;
		}
	}

	async getStats(): Promise<{
		total: number;
		active: number;
		expired: number;
	}> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接，获取统计信息失败');
			return { total: 0, active: 0, expired: 0 };
		}

		try {
			const prefix = this.config.keyPrefix || 'mcp:session:';
			const keys = await this.redisClient.keys(`${prefix}*`);

			const total = keys.length;
			let active = 0;
			let expired = 0;
			const now = new Date().getTime();

			for (const key of keys) {
				const data = await this.redisClient.get(key);
				if (data) {
					const session = JSON.parse(data) as Session;
					const isExpired = session.lastAccessedAt && now - (session.lastAccessedAt as any) > 30 * 60 * 1000;

					if (isExpired) {
						expired++;
					} else if (session.userId) {
						active++;
					}
				}
			}

			return { total, active, expired };
		} catch (error) {
			this.logger.error('获取 Redis 统计信息失败', error);
			return { total: 0, active: 0, expired: 0 };
		}
	}

	async testConnection(): Promise<boolean> {
		if (!this.redisClient) {
			this.logger.warn('Redis 未连接');
			return false;
		}

		try {
			await this.redisClient.ping();
			return true;
		} catch (error) {
			this.logger.error('Redis 测试连接失败', error);
			return false;
		}
	}

	isConnected(): boolean {
		return !!this.redisClient;
	}
}
