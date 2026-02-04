/**
 * 配置加载器
 *
 * 负责加载和管理应用程序配置，支持配置的动态更新和重置
 */

import { ApplicationPluginConfig } from './interfaces/ApplicationPluginConfig';
import { deepMerge } from '@oksai/utils';
import { defaultConfiguration } from './default-config';

/** 当前应用配置对象 */
let currentAppConfig: ApplicationPluginConfig = { ...defaultConfiguration };

/**
 * 合并提供的配置与默认配置
 *
 * 将用户提供的配置与默认配置深度合并，生成最终的配置对象
 *
 * @param providedConfig - 要合并的配置值
 * @returns Promise<void> - 配置成功更新后解析
 *
 * @example
 * ```typescript
 * await defineConfig({
 *   apiConfigOptions: {
 *     port: 8080
 *   }
 * });
 * ```
 *
 * @throws {Error} 如果提供的配置无效
 */
export async function defineConfig(providedConfig: Partial<ApplicationPluginConfig>): Promise<void> {
	if (!providedConfig || typeof providedConfig !== 'object') {
		throw new Error('无效的配置。请提供非空对象。');
	}

	currentAppConfig = await deepMerge(currentAppConfig, providedConfig);
}

/**
 * 获取当前应用配置
 *
 * 返回当前应用配置的只读副本，防止外部修改
 *
 * @returns 当前配置对象的只读副本
 */
export function getConfig(): Readonly<ApplicationPluginConfig> {
	return Object.freeze({ ...currentAppConfig });
}

/**
 * 重置配置为默认值
 *
 * 将配置恢复到默认状态，清除所有自定义配置
 */
export function resetConfig(): void {
	currentAppConfig = { ...defaultConfiguration };
	console.log('配置已重置为默认值');
}
