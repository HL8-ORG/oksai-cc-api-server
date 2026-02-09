/**
 * 会话管理器
 *
 * 管理会话的创建、查找、更新和删除操作
 */

import { Logger } from '@nestjs/common';
import { Session, SessionStorage } from './session-storage';
import { MemoryStorage } from './memory-storage';
import { RedisStorage, RedisConfig } from './redis-storage';

/**
 * 会话配置接口
 */
export interface SessionManagerConfig {
	/** 会话过期时间（毫秒） */
	ttl?: number;
	/** 是否启用 Redis */
	enableRedis?: boolean;
	/** Redis 配置 */
	redisConfig?: RedisConfig;
}

/**
 * 会话统计信息接口
 */
export interface SessionStats {
	total: number;
	active: number;
	expired: number;
}

/**
 * 会话管理器类
 *
 * 管理会话的生命周期，支持内存和 Redis 存储
 */
export class SessionManager {
	private storage: SessionStorage;
	private config: SessionManagerConfig;

	constructor(config?: SessionManagerConfig) {
		this.config = config || {};
		this.logger = new Logger('SessionManager');

		if (this.config.enableRedis && this.config.redisConfig?.redisUrl) {
			this.storage = new RedisStorage(this.config.redisConfig);
			this.logger.log('使用 Redis 会话存储');
		} else {
			this.storage = new MemoryStorage();
			this.logger.log('使用内存会话存储');
		}
	}

	private logger: Logger;

	/**
	 * 创建会话
	 *
	 * @param userId - 用户 ID
	 * @param organizationId - 组织 ID（可选）
	 * @param tenantId - 租户 ID（可选）
	 * @param data - 会话数据（可选）
	 * @returns 会话 ID
	 */
	async createSession(
		userId?: string,
		organizationId?: string,
		tenantId?: string,
		data?: Record<string, unknown>
	): Promise<string> {
		const sessionId = this.generateSessionId();
		const now = new Date();

		const session: Session = {
			id: sessionId,
			userId: userId || null,
			organizationId: organizationId || null,
			tenantId: tenantId || null,
			createdAt: now,
			lastAccessedAt: now,
			data: data || {}
		};

		const created = await this.storage.create(session);

		if (!created) {
			throw new Error('创建会话失败');
		}

		this.logger.debug(`会话已创建: ${sessionId}`);
		return sessionId;
	}

	/**
	 * 查找会话
	 *
	 * @param sessionId - 会话 ID
	 * @returns 会话数据或 null
	 */
	async findSession(sessionId: string): Promise<Session | null> {
		const session = await this.storage.findById(sessionId);

		if (!session) {
			return null;
		}

		const ttl = this.config.ttl || 30 * 60 * 1000;
		const now = new Date();
		const isExpired = now.getTime() - session.lastAccessedAt.getTime() > ttl;

		if (isExpired) {
			this.logger.debug(`会话已过期: ${sessionId}`);
			await this.storage.delete(sessionId);
			return null;
		}

		return session;
	}

	/**
	 * 更新会话
	 *
	 * @param sessionId - 会话 ID
	 * @param data - 更新的会话数据（可选）
	 * @returns 是否更新成功
	 */
	async updateSession(sessionId: string, data?: Record<string, unknown>): Promise<boolean> {
		const session = await this.storage.findById(sessionId);

		if (!session) {
			this.logger.warn(`会话不存在: ${sessionId}`);
			return false;
		}

		const updatedSession: Session = {
			...session,
			lastAccessedAt: new Date(),
			data: data ? { ...session.data, ...data } : session.data
		};

		const updated = await this.storage.update(updatedSession);

		if (updated) {
			this.logger.debug(`会话已更新: ${sessionId}`);
		}

		return updated;
	}

	/**
	 * 删除会话
	 *
	 * @param sessionId - 会话 ID
	 * @returns 是否删除成功
	 */
	async deleteSession(sessionId: string): Promise<boolean> {
		const deleted = await this.storage.delete(sessionId);

		if (deleted) {
			this.logger.debug(`会话已删除: ${sessionId}`);
		}

		return deleted;
	}

	/**
	 * 删除用户的所有会话
	 *
	 * @param userId - 用户 ID
	 * @returns 删除的会话数量
	 */
	async deleteUserSessions(userId: string): Promise<number> {
		const count = await this.storage.deleteByUserId(userId);

		if (count > 0) {
			this.logger.debug(`已删除用户 ${userId} 的 ${count} 个会话`);
		}

		return count;
	}

	/**
	 * 获取会话数据
	 *
	 * @param sessionId - 会话 ID
	 * @returns 会话数据或 null
	 */
	async getSessionData(sessionId: string): Promise<Record<string, unknown> | null> {
		const session = await this.findSession(sessionId);

		if (!session) {
			return null;
		}

		return session.data;
	}

	/**
	 * 设置会话数据
	 *
	 * @param sessionId - 会话 ID
	 * @param data - 会话数据
	 * @returns 是否设置成功
	 */
	async setSessionData(sessionId: string, data: Record<string, unknown>): Promise<boolean> {
		return await this.updateSession(sessionId, data);
	}

	/**
	 * 获取用户 ID
	 *
	 * @param sessionId - 会话 ID
	 * @returns 用户 ID 或 null
	 */
	async getUserId(sessionId: string): Promise<string | null> {
		const session = await this.findSession(sessionId);

		if (!session) {
			return null;
		}

		return session.userId;
	}

	/**
	 * 获取组织 ID
	 *
	 * @param sessionId - 会话 ID
	 * @returns 组织 ID 或 null
	 */
	async getOrganizationId(sessionId: string): Promise<string | null> {
		const session = await this.findSession(sessionId);

		if (!session) {
			return null;
		}

		return session.organizationId;
	}

	/**
	 * 获取租户 ID
	 *
	 * @param sessionId - 会话 ID
	 * @returns 租户 ID 或 null
	 */
	async getTenantId(sessionId: string): Promise<string | null> {
		const session = await this.findSession(sessionId);

		if (!session) {
			return null;
		}

		return session.tenantId;
	}

	/**
	 * 清空所有会话
	 *
	 * @returns 清空的会话数量
	 */
	async clearAllSessions(): Promise<number> {
		const count = await this.storage.clear();

		this.logger.log(`已清空所有会话: ${count} 个`);
		return count;
	}

	/**
	 * 清理过期会话
	 *
	 * @returns 清理的会话数量
	 */
	async cleanupExpiredSessions(): Promise<number> {
		const ttl = this.config.ttl || 30 * 60 * 1000;
		const count = await this.storage.cleanupExpired(ttl);

		if (count > 0) {
			this.logger.debug(`已清理 ${count} 个过期会话`);
		}

		return count;
	}

	/**
	 * 获取会话统计信息
	 *
	 * @returns 会话统计信息
	 */
	async getSessionStats(): Promise<SessionStats> {
		const stats = await this.storage.getStats();
		return stats;
	}

	/**
	 * 生成会话 ID
	 *
	 * @returns 会话 ID
	 */
	private generateSessionId(): string {
		return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
	}
}
