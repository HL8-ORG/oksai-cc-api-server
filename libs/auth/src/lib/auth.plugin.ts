import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginType, PluginPriority } from '@oksai/plugin';
import { AuthModule } from './auth.module';

/**
 * 认证插件
 *
 * 提供身份认证和权限管理功能
 * 系统插件（P0 优先级），受保护，不能被禁用或卸载
 */
export class AuthPlugin implements IPlugin {
	/**
	 * 插件名称（唯一标识）
	 */
	readonly name: string = 'auth';

	/**
	 * 插件显示名称
	 */
	readonly displayName: string = '认证系统';

	/**
	 * 插件版本
	 */
	readonly version: string = '1.0.0';

	/**
	 * 插件描述
	 */
	readonly description: string = '提供身份认证和权限管理功能';

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
	readonly category: string = 'Authentication';

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
	readonly permissions: string[] = ['users:read', 'users:write', 'roles:read', 'roles:write'];

	/**
	 * API 端点
	 */
	readonly api: Array<{
		path: string;
		method: string;
		description: string;
	}> = [
		{
			path: '/api/auth/login',
			method: 'POST',
			description: '用户登录'
		},
		{
			path: '/api/auth/logout',
			method: 'POST',
			description: '用户登出'
		},
		{
			path: '/api/auth/refresh',
			method: 'POST',
			description: '刷新令牌'
		}
	];

	/** 是否启用日志 */
	private logEnabled = true;

	/**
	 * 应用启动钩子
	 *
	 * 初始化认证服务，加载用户和权限数据
	 */
	async onApplicationBootstrap(module: ModuleRef): Promise<void> {
		this.logEnabled && console.log('✓ Auth Plugin initialized');

		const authModule = module.get(AuthModule);

		// 初始化认证服务
		// 这里可以添加认证服务的初始化逻辑
	}

	/**
	 * 应用关闭钩子
	 *
	 * 清理认证服务，保存运行时状态
	 */
	async onApplicationShutdown(module: ModuleRef): Promise<void> {
		this.logEnabled && console.log('✗ Auth Plugin destroyed');

		// 清理认证服务
		// 这里可以添加认证服务的清理逻辑
	}
}
