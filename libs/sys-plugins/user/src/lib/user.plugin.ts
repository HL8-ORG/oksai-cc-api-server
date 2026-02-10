import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginType, PluginPriority } from '@oksai/plugin';

/**
 * 用户插件
 *
 * 提供用户 CRUD 操作和用户资料管理
 * 系统插件（P0 优先级），受保护，不能被禁用或卸载
 */
export class UserPlugin implements IPlugin {
	/**
	 * 插件名称（唯一标识）
	 */
	readonly name: string = 'user';

	/**
	 * 插件显示名称
	 */
	readonly displayName: string = '用户管理';

	/**
	 * 插件版本
	 */
	readonly version: string = '1.0.0';

	/**
	 * 插件描述
	 */
	readonly description: string = '提供用户 CRUD 操作和用户资料管理';

	/**
	 * 插件类型
	 */
	readonly type: PluginType = PluginType.SYSTEM;

	/**
	 * 插件优先级
	 */
	readonly priority: PluginPriority = PluginPriority.P0;

	/**
	 * 插件分类
	 */
	readonly category: string = 'User';

	/**
	 * 插件作者
	 */
	readonly author: {
		name: string;
		email?: string;
		url?: string;
	} = {
		name: 'OKSAI Team',
		email: 'team@oksai.io'
	};

	/**
	 * 是否受保护
	 *
	 * 系统插件标记为受保护，不能被误操作
	 */
	readonly isProtected: boolean = true;

	/**
	 * 是否可配置
	 *
	 * 系统插件支持部分配置
	 */
	readonly isConfigurable: boolean = true;

	/**
	 * 权限要求
	 */
	readonly permissions: string[] = ['users:read', 'users:write', 'users:delete'];

	/**
	 * API 端点
	 */
	readonly api: Array<{
		path: string;
		method: string;
		description: string;
	}> = [
		{
			path: '/api/users',
			method: 'GET',
			description: '获取用户列表'
		},
		{
			path: '/api/users/:id',
			method: 'GET',
			description: '获取用户详情'
		},
		{
			path: '/api/users',
			method: 'POST',
			description: '创建用户'
		},
		{
			path: '/api/users/:id',
			method: 'PATCH',
			description: '更新用户'
		},
		{
			path: '/api/users/:id',
			method: 'DELETE',
			description: '删除用户'
		}
	];

	/** 是否启用日志 */
	private logEnabled = true;

	/**
	 * 应用启动钩子
	 *
	 * 初始化用户服务
	 */
	async onApplicationBootstrap(_module: ModuleRef): Promise<void> {
		this.logEnabled && console.log('✓ User Plugin initialized');

		// 初始化用户服务
	}

	/**
	 * 应用关闭钩子
	 *
	 * 清理用户服务，保存运行时状态
	 */
	async onApplicationShutdown(_module: ModuleRef): Promise<void> {
		this.logEnabled && console.log('✗ User Plugin destroyed');

		// 清理用户服务
	}
}
