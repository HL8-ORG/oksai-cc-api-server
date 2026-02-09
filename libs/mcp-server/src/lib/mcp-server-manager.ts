/**
 * MCP 服务器管理器
 *
 * 管理 MCP 服务器的生命周期，支持启动、停止、重启操作
 */

import { McpServer, McpServerConfig, McpServerStatus } from './mcp-server';
import { TransportType } from './transports/types';
import { Logger } from '@nestjs/common';

/**
 * 服务器实例信息接口
 */
interface ServerInstance {
	id: string;
	server: McpServer;
	config: McpServerConfig;
	createdAt: Date;
	lastStartedAt?: Date;
}

/**
 * MCP 服务器管理器类
 *
 * 管理服务器生命周期，支持启动、停止、重启操作
 */
export class McpServerManager {
	/** 服务器实例映射 */
	private servers: Map<string, ServerInstance> = new Map();
	/** 主服务器 ID */
	private primaryServerId: string | null = null;
	/** 日志记录器 */
	private logger: Logger;

	constructor() {
		this.logger = new Logger('McpServerManager');
	}

	/**
	 * 创建并启动 MCP 服务器
	 *
	 * 创建一个新的 MCP 服务器实例并启动指定的传输层
	 *
	 * @param config - 服务器配置
	 * @param serverId - 服务器 ID（可选），默认为主服务器或 'primary'
	 * @param transportType - 传输类型（可选），默认从环境变量读取
	 * @returns 启动是否成功
	 *
	 * @throws {Error} 当启动失败时
	 *
	 * @example
	 * ```typescript
	 * const config = {
	 *   name: 'Server 1',
	 *   version: '1.0.0'
	 * };
	 * const started = await manager.start(config, 'server-1', TransportType.STDIO);
	 * ```
	 */
	async start(config: McpServerConfig, serverId?: string, transportType?: TransportType): Promise<boolean> {
		try {
			const id = serverId || this.primaryServerId || 'primary';

			if (this.servers.has(id)) {
				this.logger.warn(`服务器 ${id} 已存在，将先停止`);
				await this.stop(id);
			}

			this.logger.log(`创建服务器 ${id}...`);
			const server = new McpServer(config);

			this.logger.log(`启动服务器 ${id}...`);
			const started = await server.start(transportType);

			if (!started) {
				this.logger.error(`服务器 ${id} 启动失败`);
				return false;
			}

			const instance: ServerInstance = {
				id,
				server,
				config,
				createdAt: new Date(),
				lastStartedAt: new Date()
			};

			this.servers.set(id, instance);

			if (!this.primaryServerId) {
				this.primaryServerId = id;
				this.logger.log(`设置主服务器: ${id}`);
			}

			this.logger.log(`服务器 ${id} 启动成功`);
			return true;
		} catch (error) {
			this.logger.error(`启动服务器失败`, error);
			return false;
		}
	}

	/**
	 * 停止 MCP 服务器
	 *
	 * 停止指定 ID 的服务器，如果未指定则停止主服务器
	 *
	 * @param serverId - 服务器 ID（可选），默认为主服务器
	 * @returns 停止是否成功
	 *
	 * @example
	 * ```typescript
	 * const stopped = await manager.stop('server-1');
	 * ```
	 */
	async stop(serverId?: string): Promise<boolean> {
		try {
			const id = serverId || this.primaryServerId;

			if (!id) {
				this.logger.warn('没有服务器需要停止');
				return false;
			}

			const instance = this.servers.get(id);

			if (!instance) {
				this.logger.warn(`服务器 ${id} 不存在`);
				return false;
			}

			this.logger.log(`停止服务器 ${id}...`);
			await instance.server.stop();

			this.servers.delete(id);

			if (this.primaryServerId === id) {
				this.primaryServerId = null;
				this.logger.log('主服务器已移除');
			}

			this.logger.log(`服务器 ${id} 已停止`);
			return true;
		} catch (error) {
			this.logger.error(`停止服务器失败`, error);
			return false;
		}
	}

	/**
	 * 重启 MCP 服务器
	 *
	 * 重启指定 ID 的服务器，如果未指定则重启主服务器
	 *
	 * @param serverId - 服务器 ID（可选），默认为主服务器
	 * @returns 重启是否成功
	 *
	 * @example
	 * ```typescript
	 * const restarted = await manager.restart('server-1');
	 * ```
	 */
	async restart(serverId?: string): Promise<boolean> {
		try {
			const id = serverId || this.primaryServerId;

			if (!id) {
				this.logger.warn('没有服务器需要重启');
				return false;
			}

			const instance = this.servers.get(id);

			if (!instance) {
				this.logger.warn(`服务器 ${id} 不存在`);
				return false;
			}

			this.logger.log(`重启服务器 ${id}...`);

			const transportType = instance.config?.transport?.type;

			await instance.server.stop();
			const started = await instance.server.start(transportType);

			if (!started) {
				this.logger.error(`服务器 ${id} 重启失败`);
				return false;
			}

			instance.lastStartedAt = new Date();
			this.logger.log(`服务器 ${id} 重启成功`);
			return true;
		} catch (error) {
			this.logger.error(`重启服务器失败`, error);
			return false;
		}
	}

	/**
	 * 获取服务器状态
	 *
	 * 返回指定 ID 的服务器状态，如果未指定则返回主服务器状态
	 *
	 * @param serverId - 服务器 ID（可选），默认为主服务器
	 * @returns 服务器状态对象，如果服务器不存在则返回 null
	 *
	 * @example
	 * ```typescript
	 * const status = await manager.getStatus('server-1');
	 * console.log(`运行中: ${status.isRunning}`);
	 * ```
	 */
	async getStatus(serverId?: string): Promise<McpServerStatus | null> {
		try {
			const id = serverId || this.primaryServerId;

			if (!id) {
				this.logger.warn('没有服务器状态可获取');
				return null;
			}

			const instance = this.servers.get(id);

			if (!instance) {
				this.logger.warn(`服务器 ${id} 不存在`);
				return null;
			}

			return await instance.server.getStatus();
		} catch (error) {
			this.logger.error(`获取服务器状态失败`, error);
			return null;
		}
	}

	/**
	 * 获取服务器实例
	 *
	 * 返回指定 ID 的服务器实例，如果未指定则返回主服务器实例
	 *
	 * @param serverId - 服务器 ID（可选），默认为主服务器
	 * @returns MCP 服务器实例，如果不存在则返回 null
	 *
	 * @example
	 * ```typescript
	 * const server = manager.getServer('server-1');
	 * if (server) {
	 *   server.registerTool(new MyTool());
	 * }
	 * ```
	 */
	getServer(serverId?: string): McpServer | null {
		const id = serverId || this.primaryServerId;

		if (!id) {
			return null;
		}

		const instance = this.servers.get(id);
		return instance?.server || null;
	}

	/**
	 * 获取所有服务器 ID
	 *
	 * 返回所有已注册服务器的 ID 列表
	 *
	 * @returns 服务器 ID 数组
	 *
	 * @example
	 * ```typescript
	 * const serverIds = manager.getServerIds();
	 * console.log(`服务器数量: ${serverIds.length}`);
	 * ```
	 */
	getServerIds(): string[] {
		return Array.from(this.servers.keys());
	}

	/**
	 * 获取所有服务器状态
	 *
	 * 返回所有服务器的状态映射
	 *
	 * @returns 服务器 ID 到服务器状态的映射
	 *
	 * @example
	 * ```typescript
	 * const statusMap = await manager.getAllStatus();
	 * statusMap.forEach((status, id) => {
	 *   console.log(`${id}: ${status.isRunning ? '运行中' : '已停止'}`);
	 * });
	 * ```
	 */
	async getAllStatus(): Promise<Map<string, McpServerStatus>> {
		const statusMap = new Map<string, McpServerStatus>();

		for (const [id, instance] of this.servers.entries()) {
			try {
				const status = await instance.server.getStatus();
				statusMap.set(id, status);
			} catch (error) {
				this.logger.error(`获取服务器 ${id} 状态失败`, error);
			}
		}

		return statusMap;
	}

	/**
	 * 删除服务器
	 *
	 * 删除指定 ID 的服务器实例
	 *
	 * @param serverId - 服务器 ID
	 * @returns 删除是否成功
	 *
	 * @example
	 * ```typescript
	 * const removed = await manager.removeServer('server-1');
	 * ```
	 */
	async removeServer(serverId: string): Promise<boolean> {
		try {
			const instance = this.servers.get(serverId);

			if (!instance) {
				this.logger.warn(`服务器 ${serverId} 不存在`);
				return false;
			}

			this.logger.log(`删除服务器 ${serverId}...`);
			await instance.server.stop();

			this.servers.delete(serverId);

			if (this.primaryServerId === serverId) {
				this.primaryServerId = null;
				this.logger.log('主服务器已移除');
			}

			this.logger.log(`服务器 ${serverId} 已删除`);
			return true;
		} catch (error) {
			this.logger.error(`删除服务器失败`, error);
			return false;
		}
	}

	/**
	 * 停止所有服务器
	 *
	 * 停止所有已注册的服务器
	 *
	 * @returns 停止的服务器数量
	 *
	 * @example
	 * ```typescript
	 * const count = await manager.stopAll();
	 * console.log(`已停止 ${count} 个服务器`);
	 * ```
	 */
	async stopAll(): Promise<number> {
		let count = 0;

		for (const [id] of this.servers.entries()) {
			const stopped = await this.stop(id);
			if (stopped) {
				count++;
			}
		}

		this.logger.log(`已停止 ${count} 个服务器`);
		return count;
	}

	/**
	 * 设置主服务器
	 *
	 * 将指定 ID 的服务器设置为主服务器
	 *
	 * @param serverId - 服务器 ID
	 * @returns 设置是否成功
	 *
	 * @example
	 * ```typescript
	 * const success = manager.setPrimaryServer('server-2');
	 * ```
	 */
	setPrimaryServer(serverId: string): boolean {
		if (!this.servers.has(serverId)) {
			this.logger.warn(`服务器 ${serverId} 不存在`);
			return false;
		}

		this.primaryServerId = serverId;
		this.logger.log(`主服务器已设置为: ${serverId}`);
		return true;
	}

	/**
	 * 获取主服务器 ID
	 *
	 * @returns 主服务器 ID，如果不存在则返回 null
	 *
	 * @example
	 * ```typescript
	 * const primaryId = manager.getPrimaryServerId();
	 * if (primaryId) {
	 *   console.log(`主服务器: ${primaryId}`);
	 * }
	 * ```
	 */
	getPrimaryServerId(): string | null {
		return this.primaryServerId;
	}

	/**
	 * 获取主服务器实例
	 *
	 * @returns 主服务器实例，如果不存在则返回 null
	 *
	 * @example
	 * ```typescript
	 * const primaryServer = manager.getPrimaryServer();
	 * if (primaryServer) {
	 *   primaryServer.registerTool(new MyTool());
	 * }
	 * ```
	 */
	getPrimaryServer(): McpServer | null {
		return this.getServer(this.primaryServerId || undefined);
	}

	/**
	 * 获取服务器统计信息
	 *
	 * 返回所有服务器的统计信息，包括总数、运行中、已停止和主服务器 ID
	 *
	 * @returns 服务器统计信息对象
	 *
	 * @example
	 * ```typescript
	 * const stats = manager.getStats();
	 * console.log(`总服务器数: ${stats.total}`);
	 * console.log(`运行中: ${stats.running}`);
	 * console.log(`已停止: ${stats.stopped}`);
	 * ```
	 */
	getStats(): {
		total: number;
		running: number;
		stopped: number;
		primaryServerId: string | null;
	} {
		const total = this.servers.size;
		const running = Array.from(this.servers.values()).filter((instance) => {
			const status = instance.server.getStatus() as any;
			return status?.isRunning || false;
		}).length;

		return {
			total,
			running,
			stopped: total - running,
			primaryServerId: this.primaryServerId
		};
	}

	/**
	 * 清理所有服务器
	 *
	 * 停止并清理所有服务器实例
	 *
	 * @example
	 * ```typescript
	 * await manager.cleanup();
	 * ```
	 */
	async cleanup(): Promise<void> {
		this.logger.log('清理所有服务器...');
		await this.stopAll();
		this.servers.clear();
		this.primaryServerId = null;
		this.logger.log('所有服务器已清理');
	}
}

/**
 * 创建 MCP 服务器管理器实例
 *
 * 便捷函数，用于创建并初始化 MCP 服务器管理器
 *
 * @returns MCP 服务器管理器实例
 *
 * @example
 * ```typescript
 * const manager = createMcpServerManager();
 *
 * // 启动服务器
 * await manager.start({ name: 'Server 1', version: '1.0.0' }, 'server-1');
 *
 * // 清理所有服务器
 * await manager.cleanup();
 * ```
 */
export function createMcpServerManager(): McpServerManager {
	return new McpServerManager();
}
