import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginType, PluginPriority } from '@oksai/plugin';
import { RoleModule } from './role.module';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

/**
 * 角色插件
 *
 * 提供基于角色的访问控制（RBAC）功能
 * 系统插件（P0 优先级），受保护，不能被禁用或卸载
 */
export class RolePlugin implements IPlugin {
	/**
	 * 插件名称（唯一标识）
	 */
	readonly name: string = 'role';

	/**
	 * 插件显示名称
	 */
	readonly displayName: string = '角色和权限';

	/**
	 * 插件版本
	 */
	readonly version: string = '1.0.0';

	/**
	 * 插件描述
	 */
	readonly description: string = '提供基于角色的访问控制（RBAC）功能';

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
	readonly category: string = 'Role';

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
	readonly permissions: string[] = [
		'roles:read',
		'roles:write',
		'roles:delete',
		'permissions:read',
		'permissions:write'
	];

	/**
	 * API 端点
	 */
	readonly api: Array<{
		path: string;
		method: string;
		description: string;
	}> = [
		{
			path: '/api/roles',
			method: 'GET',
			description: '获取角色列表'
		},
		{
			path: '/api/roles/:id',
			method: 'GET',
			description: '获取角色详情'
		},
		{
			path: '/api/roles',
			method: 'POST',
			description: '创建角色'
		},
		{
			path: '/api/permissions',
			method: 'GET',
			description: '获取权限列表'
		}
	];

	/**
	 * 应用启动钩子
	 *
	 * 初始化角色和权限服务
	 */
	async onApplicationBootstrap(_module: ModuleRef): Promise<void> {
		console.log('✓ Role Plugin initialized');

		// 初始化角色和权限服务
	}

	/**
	 * 应用关闭钩子
	 *
	 * 清理角色和权限服务，保存运行时状态
	 */
	async onApplicationShutdown(_module: ModuleRef): Promise<void> {
		console.log('✗ Role Plugin destroyed');

		// 清理角色和权限服务
	}
}
