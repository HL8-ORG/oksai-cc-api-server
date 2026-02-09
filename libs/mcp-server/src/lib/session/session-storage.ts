/**
 * 会话存储接口
 *
 * 定义会话存储的抽象接口
 */

export interface Session {
	/** 会话 ID */
	id: string;
	/** 用户 ID */
	userId: string | null;
	/** 组织 ID */
	organizationId: string | null;
	/** 租户 ID */
	tenantId: string | null;
	/** 创建时间 */
	createdAt: Date;
	/** 最后访问时间 */
	lastAccessedAt: Date;
	/** 会话数据 */
	data: Record<string, unknown>;
}

/**
 * 会话存储接口
 *
 * 定义会话存储的抽象接口
 */
export interface SessionStorage {
	/**
	 * 创建会话
	 *
	 * @param session - 会话数据
	 * @returns 是否创建成功
	 */
	create(session: Session): Promise<boolean>;

	/**
	 * 查找会话
	 *
	 * @param sessionId - 会话 ID
	 * @returns 会话数据或 null
	 */
	findById(sessionId: string): Promise<Session | null>;

	/**
	 * 通过用户 ID 查找所有会话
	 *
	 * @param userId - 用户 ID
	 * @returns 会话数组
	 */
	findByUserId(userId: string): Promise<Session[]>;

	/**
	 * 更新会话数据
	 *
	 * @param session - 会话数据
	 * @returns 是否更新成功
	 */
	update(session: Session): Promise<boolean>;

	/**
	 * 删除会话
	 *
	 * @param sessionId - 会话 ID
	 * @returns 是否删除成功
	 */
	delete(sessionId: string): Promise<boolean>;

	/**
	 * 通过用户 ID 删除所有会话
	 *
	 * @param userId - 用户 ID
	 * @returns 删除的会话数量
	 */
	deleteByUserId(userId: string): Promise<number>;

	/**
	 * 清空所有会话
	 *
	 * @returns 清空的会话数量
	 */
	clear(): Promise<number>;

	/**
	 * 清理过期会话
	 *
	 * @param maxAge - 最大会话年龄（毫秒）
	 * @returns 清理的会话数量
	 */
	cleanupExpired(maxAge: number): Promise<number>;

	/**
	 * 获取会话统计信息
	 *
	 * @returns 会话统计信息
	 */
	getStats(): Promise<{
		total: number;
		active: number;
		expired: number;
	}>;
}
