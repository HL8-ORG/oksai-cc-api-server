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
	async onApplicationBootstrap(module: ModuleRef): Promise<void> {
		this.logEnabled && console.log('✓ Tenant Plugin initialized');

		// 初始化租户服务
		await this.ensureDefaultTenant(module);
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
	async initialize(_config?: Record<string, any>, module?: ModuleRef): Promise<void> {
		if (module) {
			await this.ensureDefaultTenant(module);
		}
	}

	/**
	 * 确保默认租户存在
	 *
	 * 在应用启动阶段调用，需要 fork EntityManager 以避免全局上下文限制
	 */
	private async ensureDefaultTenant(module: ModuleRef): Promise<void> {
		const { MikroORM } = await import('@mikro-orm/core');
		const { Tenant, TenantStatus, TenantType } = await import('./entities/tenant.entity');

		try {
			const orm = module.get(MikroORM, { strict: false });
			// 在应用启动阶段需要 fork EntityManager（全局上下文中不允许直接使用）
			const em = orm.em.fork();

			try {
				const defaultTenant = await em.findOne(Tenant, { slug: 'default' });

				if (!defaultTenant) {
					console.log('正在创建默认租户...');
					const tenant = em.create(Tenant, {
						name: 'Default Tenant',
						slug: 'default',
						status: TenantStatus.ACTIVE,
						type: TenantType.ORGANIZATION,
						allowSelfRegistration: true,
						maxUsers: 100
					});
					await em.persistAndFlush(tenant);
					console.log('默认租户已创建');
				}
			} catch (error) {
				console.error('确保默认租户存在时出错:', error);
			}
		} catch (error) {
			console.error('从模块中获取 MikroORM 失败:', error);
		}
	}
}
