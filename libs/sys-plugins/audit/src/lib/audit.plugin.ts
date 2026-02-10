import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginType, PluginPriority } from '@oksai/plugin';
import { AuditModule } from './audit.module';
import { AuditLog } from './entities/audit-log.entity';

/**
 * 审计插件
 *
 * 提供操作日志和审计查询功能
 * 系统插件（P0 优先级），受保护，不能被禁用或卸载
 */
export class AuditPlugin implements IPlugin {
	/**
	 * 插件名称（唯一标识）
	 */
	readonly name: string = 'audit';

	/**
	 * 插件显示名称
	 */
	readonly displayName: string = '审计日志';

	/**
	 * 插件版本
	 */
	readonly version: string = '1.0.0';

	/**
	 * 插件描述
	 */
	readonly description: string = '提供操作日志和审计查询功能';

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
	readonly category: string = 'Audit';

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
	readonly permissions: string[] = ['audit:read', 'audit:delete'];

	/**
	 * API 端点
	 */
	readonly api: Array<{
		path: string;
		method: string;
		description: string;
	}> = [
		{
			path: '/api/audit-logs',
			method: 'GET',
			description: '获取审计日志列表'
		},
		{
			path: '/api/audit-logs/:id',
			method: 'GET',
			description: '获取审计日志详情'
		}
	];

	/** 是否启用日志 */
	private logEnabled = true;

	/**
	 * 应用启动钩子
	 *
	 * 初始化审计服务
	 */
	async onApplicationBootstrap(_module: ModuleRef): Promise<void> {
		this.logEnabled && console.log('✓ Audit Plugin initialized');

		// 初始化审计服务
	}

	/**
	 * 应用关闭钩子
	 *
	 * 清理审计服务，保存运行时状态
	 */
	async onApplicationShutdown(_module: ModuleRef): Promise<void> {
		this.logEnabled && console.log('✗ Audit Plugin destroyed');

		// 清理审计服务
	}
}
