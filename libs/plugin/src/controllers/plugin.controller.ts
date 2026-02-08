import { Controller, Get, Post, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PluginRegistryService } from '../services/plugin-registry.service';
import { PluginLoaderService } from '../services/plugin-loader.service';
import { PluginType, PluginStatus } from '../interfaces/plugin.interface';
import { getPluginMetadata } from '../decorators/plugin.decorator';

/**
 * 插件控制器
 *
 * 提供插件管理的 API 端点
 * 支持插件查询、启用、禁用等操作
 */
@Controller('plugins')
export class PluginController {
	constructor(private readonly registry: PluginRegistryService, private readonly loader: PluginLoaderService) {}

	/**
	 * 获取所有插件状态
	 *
	 * @returns 插件状态列表
	 */
	@Get('status/list')
	async getAllPluginStatuses() {
		const statusMap = this.registry.getAllStatus();

		return {
			total: statusMap.size,
			data: Array.from(statusMap.entries()).map(([name, status]) => ({
				name,
				status
			}))
		};
	}

	/**
	 * 获取所有插件列表
	 *
	 * @returns 插件列表
	 */
	@Get()
	async getAllPlugins() {
		const plugins = this.registry.getAll().map((plugin) => {
			const metadata = getPluginMetadata(plugin.constructor);
			const pluginState = this.loader.getPluginState(plugin.name);

			return {
				name: plugin.name,
				version: plugin.version,
				description: plugin.description,
				type: plugin.type,
				status: this.registry.getStatus(plugin.name),
				enabled: pluginState?.enabled ?? true,
				isCore: metadata?.isCore || false,
				dependencies: metadata?.dependencies || [],
				config: plugin.config || {}
			};
		});

		return {
			total: plugins.length,
			data: plugins
		};
	}

	/**
	 * 获取插件详情
	 *
	 * @param name - 插件名称
	 * @returns 插件详情
	 */
	@Get(':name')
	async getPlugin(@Param('name') name: string) {
		const plugin = this.registry.get(name);

		if (!plugin) {
			throw new Error(`插件 ${name} 未找到`);
		}

		const metadata = getPluginMetadata(plugin.constructor);
		const pluginState = this.loader.getPluginState(plugin.name);

		return {
			name: plugin.name,
			version: plugin.version,
			description: plugin.description,
			type: plugin.type,
			status: this.registry.getStatus(name),
			enabled: pluginState?.enabled ?? true,
			isCore: metadata?.isCore || false,
			dependencies: metadata?.dependencies || [],
			config: plugin.config || {}
		};
	}

	/**
	 * 启用插件
	 *
	 * 仅功能插件可以被启用或禁用
	 * 系统插件始终启用
	 *
	 * @param name - 插件名称
	 * @returns 操作结果
	 */
	@Post(':name/enable')
	@HttpCode(HttpStatus.OK)
	async enablePlugin(@Param('name') name: string) {
		try {
			await this.loader.enablePlugin(name);
			return {
				success: true,
				message: `插件 ${name} 启用成功`,
				status: 'enabled'
			};
		} catch (error) {
			throw new Error(`启用插件 ${name} 失败：${error.message}`);
		}
	}

	/**
	 * 禁用插件
	 *
	 * 仅功能插件可以被启用或禁用
	 * 系统插件不能被禁用
	 *
	 * @param name - 插件名称
	 * @returns 操作结果
	 */
	@Post(':name/disable')
	@HttpCode(HttpStatus.OK)
	async disablePlugin(@Param('name') name: string) {
		try {
			await this.loader.disablePlugin(name);
			return {
				success: true,
				message: `插件 ${name} 禁用成功`,
				status: 'disabled'
			};
		} catch (error) {
			throw new Error(`禁用插件 ${name} 失败：${error.message}`);
		}
	}

	/**
	 * 重新加载插件
	 *
	 * 卸载并重新加载指定的插件
	 *
	 * @param name - 插件名称
	 * @returns 操作结果
	 */
	@Post(':name/reload')
	@HttpCode(HttpStatus.OK)
	async reloadPlugin(@Param('name') name: string) {
		try {
			await this.loader.reloadPlugin(name);
			return {
				success: true,
				message: `插件 ${name} 重新加载成功`,
				status: this.registry.getStatus(name)
			};
		} catch (error) {
			throw new Error(`重新加载插件 ${name} 失败：${error.message}`);
		}
	}
}
