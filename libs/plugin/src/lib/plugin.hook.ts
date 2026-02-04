/**
 * Plugin Hooks
 *
 * Utility functions for managing plugin lifecycle hooks.
 */

import { Type } from '@nestjs/common';
import { hasLifecycleMethod } from './plugin.helper';

/**
 * Execute plugin bootstrap hooks.
 *
 * @param plugins Array of plugin classes or instances.
 */
export async function executePluginBootstrap(plugins: Array<Type<any>>): Promise<void> {
	for (const Plugin of plugins) {
		try {
			const pluginInstance = new Plugin();
			if (hasLifecycleMethod(pluginInstance, 'onPluginBootstrap')) {
				await pluginInstance.onPluginBootstrap();
			}
		} catch (error) {
			console.error(`Failed to bootstrap plugin:`, error);
			throw error;
		}
	}
}

/**
 * Execute plugin destroy hooks.
 *
 * @param plugins Array of plugin classes or instances.
 */
export async function executePluginDestroy(plugins: Array<Type<any>>): Promise<void> {
	for (const Plugin of plugins) {
		try {
			const pluginInstance = new Plugin();
			if (hasLifecycleMethod(pluginInstance, 'onPluginDestroy')) {
				await pluginInstance.onPluginDestroy();
			}
		} catch (error) {
			console.error(`Failed to destroy plugin:`, error);
			throw error;
		}
	}
}

/**
 * Execute plugin seed hooks.
 *
 * @param plugins Array of plugin classes or instances.
 * @param seedType Type of seed to execute ('basic', 'default', or 'random').
 */
export async function executePluginSeed(
	plugins: Array<Type<any>>,
	seedType: 'basic' | 'default' | 'random'
): Promise<void> {
	for (const Plugin of plugins) {
		try {
			const pluginInstance = new Plugin();
			const methodName = `onPlugin${seedType.charAt(0).toUpperCase() + seedType.slice(1)}Seed`;

			if (hasLifecycleMethod(pluginInstance, methodName as any)) {
				await (pluginInstance as any)[methodName]();
			}
		} catch (error) {
			console.error(`Failed to execute ${seedType} seed on plugin:`, error);
			throw error;
		}
	}
}
