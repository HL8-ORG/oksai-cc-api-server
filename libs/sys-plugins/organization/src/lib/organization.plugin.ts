import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginType, PluginPriority } from '@oksai/plugin';
import { OrganizationModule } from './organization.module';
import { Organization } from './entities/organization.entity';

/**
 * 组织插件
 *
 * 提供组织管理功能
 * 系统插件（P0 优先级），受保护，不能被禁用或卸载
 */
export class OrganizationPlugin implements IPlugin {
	/**
	 * 插件名称（唯一标识）
	 */
	readonly name: string = 'organization';

	/**
	 * 插件显示名称
	 */
	readonly displayName: string = '组织管理';

	/**
	 * 插件版本
	 */
	readonly version: string = '1.0.0';

	/**
	 * 插件描述
	 */
	readonly description: string = '提供组织管理功能';

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
	readonly category: string = 'Organization';

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
	readonly permissions: string[] = ['organizations:read', 'organizations:write', 'organizations:delete'];

	/**
	 * API 端点
	 */
	readonly api: Array<{
		path: string;
		method: string;
		description: string;
	}> = [
		{
			path: '/api/organizations',
			method: 'GET',
			description: '获取组织列表'
		},
		{
			path: '/api/organizations/:id',
			method: 'GET',
			description: '获取组织详情'
		},
		{
			path: '/api/organizations',
			method: 'POST',
			description: '创建组织'
		}
	];

	/**
	 * 应用启动钩子
	 *
	 * 初始化组织服务
	 */
	async onApplicationBootstrap(_module: ModuleRef): Promise<void> {
		console.log('✓ Organization Plugin initialized');

		// 初始化组织服务
	}

	/**
	 * 应用关闭钩子
	 *
	 * 清理组织服务，保存运行时状态
	 */
	async onApplicationShutdown(_module: ModuleRef): Promise<void> {
		console.log('✗ Organization Plugin destroyed');

		// 清理组织服务
	}
}
