/**
 * 插件接口
 */
export interface IOksaisPluginBootstrap {
	onPluginBootstrap(): void | Promise<void>;
}

export interface IOksaisPluginDestroy {
	onPluginDestroy(): void | Promise<void>;
}

export interface IOksaisPluginLifecycle extends IOksaisPluginBootstrap, IOksaisPluginDestroy {}

export type PluginLifecycleMethods = {
	onPluginBootstrap: () => void | Promise<void>;
	onPluginDestroy: () => void | Promise<void>;
};
