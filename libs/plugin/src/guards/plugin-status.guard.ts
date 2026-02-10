import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PluginRegistryService } from '../services/plugin-registry.service';
import { IPlugin } from '../interfaces/plugin.interface';
import { PluginType, PluginStatus } from '../enums/plugin-type.enum';

export const PUBLIC_KEY = 'isPublic';

/**
 * 插件状态守卫
 *
 * 检查插件状态，如果插件被禁用则拒绝请求
 * 系统插件（isProtected: true）跳过状态检查
 */
@Injectable()
export class PluginStatusGuard implements CanActivate {
	constructor(private readonly reflector: Reflector, private readonly pluginRegistry: PluginRegistryService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
			context.getHandler(),
			context.getClass()
		]);
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();

		// 从路由中提取插件名称
		const pluginName = this.extractPluginName(request);
		if (!pluginName) {
			return true;
		}

		const plugin = this.pluginRegistry.get(pluginName);
		if (!plugin) {
			throw new NotFoundException(`插件 ${pluginName} 不存在`);
		}

		// 系统插件（受保护）始终允许
		if (plugin.isProtected) {
			return true;
		}

		// 检查插件状态
		const status = this.pluginRegistry.getStatus(pluginName);
		if (!status) {
			throw new NotFoundException(`插件 ${pluginName} 状态未找到`);
		}
		if (status !== PluginStatus.INITIALIZED) {
			throw new ForbiddenException(`插件 ${pluginName} 已禁用或未初始化`);
		}

		return true;
	}

	/**
	 * 从请求中提取插件名称
	 *
	 * @param request - HTTP 请求对象
	 * @returns 插件名称或 null
	 */
	private extractPluginName(request: any): string | null {
		const url = request.url || '';

		// 从 URL 路径中提取插件名称
		const match = url.match(/^\/api\/([^\/]+)/);
		if (match && match[1]) {
			const path = match[1].toLowerCase();
			// 映射路径到插件名称
			// 注意：plugins（插件管理端点）不在此映射中，因为它是管理端点，应始终可访问
			const pluginMapping: Record<string, string> = {
				auth: 'auth',
				tenants: 'tenant',
				users: 'user',
				organizations: 'organization',
				roles: 'roles',
				permissions: 'permissions',
				audit: 'audit',
				analytics: 'analytics',
				reporting: 'reporting'
			};
			return pluginMapping[path] || null;
		}

		return null;
	}
}
