/**
 * 内存会话存储实现
 *
 * 将会话数据存储在内存中
 */
import { Session, SessionStorage } from './session-storage';

export class MemoryStorage implements SessionStorage {
	private sessions: Map<string, Session> = new Map();

	async create(session: Session): Promise<boolean> {
		this.sessions.set(session.id, session);
		return true;
	}

	async findById(id: string): Promise<Session | null> {
		return this.sessions.get(id) || null;
	}

	async findByUserId(userId: string): Promise<Session[]> {
		const userSessions: Session[] = [];

		for (const session of this.sessions.values()) {
			if (session.userId === userId) {
				userSessions.push(session);
			}
		}

		return userSessions;
	}

	async update(session: Session): Promise<boolean> {
		const existing = this.sessions.get(session.id);

		if (existing) {
			this.sessions.set(session.id, session);
			return true;
		}

		return false;
	}

	async delete(id: string): Promise<boolean> {
		const deleted = this.sessions.delete(id);
		return deleted;
	}

	async deleteByUserId(userId: string): Promise<number> {
		let count = 0;

		for (const [id, session] of this.sessions.entries()) {
			if (session.userId === userId) {
				this.sessions.delete(id);
				count++;
			}
		}

		return count;
	}

	async clear(): Promise<number> {
		const count = this.sessions.size;
		this.sessions.clear();
		return count;
	}

	async cleanupExpired(maxAge: number): Promise<number> {
		const now = new Date();
		const expiredKeys: string[] = [];

		for (const [id, session] of this.sessions.entries()) {
			const isExpired = now.getTime() - session.lastAccessedAt.getTime() > maxAge;

			if (isExpired) {
				expiredKeys.push(id);
			}
		}

		for (const id of expiredKeys) {
			this.sessions.delete(id);
		}

		return expiredKeys.length;
	}

	async getStats(): Promise<{
		total: number;
		active: number;
		expired: number;
	}> {
		const now = new Date();
		const total = this.sessions.size;
		let active = 0;
		let expired = 0;

		for (const session of this.sessions.values()) {
			const isExpired =
				session.lastAccessedAt && now.getTime() - session.lastAccessedAt.getTime() > 30 * 60 * 1000;

			if (isExpired) {
				expired++;
			} else if (session.userId !== null) {
				active++;
			}
		}

		return { total, active, expired };
	}
}
