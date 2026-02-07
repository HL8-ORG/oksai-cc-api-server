import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginType, PluginPriority } from '@oksai/plugin';

/**
 * 租户插件
 *
 * 提供多租户架构和租户隔离功能
 * 系统插件（P0 优先级），受保护，不能被禁用或卸载
 */
export class TenantPlugin implements IPlugin {
	/**
	 * 插件名称（唯一标识）
	 */
	readonly name: string = 'tenant';

	/**
	 * 插件显示名称
	 */
	readonly displayName: string = '租户管理';

	/**
	 * 插件版本
	 */
	readonly version: string = '1.0.0';

	/**
	 * 插件描述
	 */
	readonly description: string = '提供多租户架构和租户隔离功能';

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
	readonly category: string = 'Tenant';

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
	readonly permissions: string[] = ['tenants:read', 'tenants:write'];

	/**
	 * API 端点
	 */
	readonly api: Array<{
		path: string;
		method: string;
		description: string;
	}> = [
		{
			path: '/api/tenants',
			method: 'GET',
			description: '获取租户列表'
		},
		{
			path: '/api/tenants/:id',
			method: 'GET',
			description: '获取租户详情'
		},
		{
			path: '/api/tenants',
			method: 'POST',
			description: '创建租户'
		}
	];

	/** 是否启用日志 */
	private logEnabled = true;

	/**
	 * 应用启动钩子
	 *
	 * 初始化租户服务，确保默认租户存在
	 */
	async onApplicationBootstrap(_module: ModuleRef): Promise<void> {
		this.logEnabled && console.log('✓ Tenant Plugin initialized');

		// 初始化租户服务
		await this.ensureDefaultTenant();
	}

	/**
	 * 应用关闭钩子
	 *
	 * 清理租户服务，保存运行时状态
	 */
	async onApplicationShutdown(_module: ModuleRef): Promise<void> {
		this.logEnabled && console.log('✗ Tenant Plugin destroyed');

		// 清理租户服务
	}

	/**
	 * 初始化插件
	 *
	 * 确保默认租户存在
	 */
	async initialize(_config?: Record<string, any>): Promise<void> {
		await this.ensureDefaultTenant();
	}

	/**
	 * 确保默认租户存在
	 */
	private async ensureDefaultTenant(): Promise<void> {
		const tenantService = new (await import('./tenant.service')).TenantService({} as any);

		try {
			const defaultTenant = await tenantService.findBySlug('default');

			if (!defaultTenant) {
				console.log('Creating default tenant...');
				await tenantService.create({
					name: 'Default Tenant',
					slug: 'default',
					status: 'ACTIVE',
					type: 'ORGANIZATION',
					allowSelfRegistration: true,
					maxUsers: 100
				});
				console.log('Default tenant created');
			}
		} catch (error) {
			console.error('Failed to ensure default tenant', error);
		}
	}
}
