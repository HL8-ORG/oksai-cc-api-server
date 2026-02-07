import { Test, TestingModule } from '@nestjs/testing';
import { PluginLoaderService } from '../services/plugin-loader.service';
import { PluginRegistryService } from '../services/plugin-registry.service';
import { IPlugin, PluginStatus, PluginType, PluginPriority } from '../interfaces/plugin.interface';
import { IPluginConfig } from '../interfaces/plugin-config.interface';

describe('PluginLoaderService', () => {
	let service: PluginLoaderService;
	let registry: PluginRegistryService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PluginLoaderService, PluginRegistryService]
		}).compile();

		service = module.get<PluginLoaderService>(PluginLoaderService);
		registry = module.get<PluginRegistryService>(PluginRegistryService);
	});

	afterEach(() => {
		registry.clear();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('loadPlugins', () => {
		it('should load system plugins', async () => {
			const plugin1: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0,
				onApplicationBootstrap: jest.fn()
			};

			const plugin2: IPlugin = {
				name: 'tenant',
				version: '1.0.0',
				description: '租户插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0,
				onApplicationBootstrap: jest.fn()
			};

			registry.register(plugin1);
			registry.register(plugin2);

			const config: IPluginConfig = {
				systemPlugins: ['auth', 'tenant'],
				featurePlugins: {},
				plugins: {}
			};

			await service.loadPlugins(config);

			expect(registry.get('auth')).toBeDefined();
			expect(registry.get('tenant')).toBeDefined();
		});

		it('should load feature plugins when enabled', async () => {
			const plugin: IPlugin = {
				name: 'github-oauth',
				version: '1.0.0',
				description: 'GitHub OAuth 插件',
				type: PluginType.FEATURE,
				onApplicationBootstrap: jest.fn()
			};

			registry.register(plugin);

			const config: IPluginConfig = {
				systemPlugins: [],
				featurePlugins: {
					'github-oauth': {
						enabled: true
					}
				},
				plugins: {}
			};

			await service.loadPlugins(config);

			expect(registry.has('github-oauth')).toBe(true);
		});

		it('should skip feature plugins when disabled', async () => {
			const plugin: IPlugin = {
				name: 'github-oauth',
				version: '1.0.0',
				description: 'GitHub OAuth 插件',
				type: PluginType.FEATURE,
				onApplicationBootstrap: jest.fn()
			};

			registry.register(plugin);

			const config: IPluginConfig = {
				systemPlugins: [],
				featurePlugins: {
					'github-oauth': {
						enabled: false
					}
				},
				plugins: {}
			};

			await service.loadPlugins(config);

			expect(registry.has('github-oauth')).toBe(true);
			expect(registry.getStatus('github-oauth')).toBe(PluginStatus.DISABLED);
		});

		it('should load plugin with config', async () => {
			const plugin: IPlugin = {
				name: 'github-oauth',
				version: '1.0.0',
				description: 'GitHub OAuth 插件',
				type: PluginType.FEATURE,
				initialize: jest.fn(),
				onApplicationBootstrap: jest.fn()
			};

			registry.register(plugin);

			const config: IPluginConfig = {
				systemPlugins: [],
				featurePlugins: {
					'github-oauth': {
						enabled: true,
						config: { apiKey: 'test-key' }
					}
				},
				plugins: {}
			};

			await service.loadPlugins(config);

			expect(plugin.initialize).toHaveBeenCalledWith({ apiKey: 'test-key' });
			expect(registry.getStatus('github-oauth')).toBe(PluginStatus.INITIALIZED);
		});
	});

	describe('unloadPlugin', () => {
		it('should unload plugin', async () => {
			const plugin: IPlugin = {
				name: 'test-plugin',
				version: '1.0.0',
				description: '测试插件',
				type: PluginType.FEATURE,
				destroy: jest.fn(),
				onApplicationShutdown: jest.fn()
			};

			registry.register(plugin);
			registry.updateStatus('test-plugin', PluginStatus.INITIALIZED);

			await service.unloadPlugin('test-plugin');

			expect(registry.has('test-plugin')).toBe(false);
			expect(plugin.destroy).toHaveBeenCalled();
			expect(plugin.onApplicationShutdown).toHaveBeenCalled();
		});

		it('should throw error when plugin not registered', async () => {
			await expect(service.unloadPlugin('non-existent')).rejects.toThrow('插件 non-existent 未注册');
		});
	});

	describe('reloadPlugin', () => {
		it('should reload plugin', async () => {
			const plugin: IPlugin = {
				name: 'test-plugin',
				version: '1.0.0',
				description: '测试插件',
				type: PluginType.FEATURE,
				initialize: jest.fn(),
				destroy: jest.fn(),
				onApplicationBootstrap: jest.fn(),
				onApplicationShutdown: jest.fn()
			};

			registry.register(plugin);
			registry.updateStatus('test-plugin', PluginStatus.INITIALIZED);

			await service.reloadPlugin('test-plugin');

			expect(plugin.destroy).toHaveBeenCalled();
			expect(plugin.initialize).toHaveBeenCalled();
			expect(plugin.onApplicationBootstrap).toHaveBeenCalled();
		});
	});

	describe('onModuleDestroy', () => {
		it('should destroy all plugins', async () => {
			const plugin1: IPlugin = {
				name: 'plugin-1',
				version: '1.0.0',
				description: '插件 1',
				type: PluginType.FEATURE,
				destroy: jest.fn()
			};

			const plugin2: IPlugin = {
				name: 'plugin-2',
				version: '1.0.0',
				description: '插件 2',
				type: PluginType.FEATURE,
				destroy: jest.fn()
			};

			registry.register(plugin1);
			registry.register(plugin2);

			await service.onModuleDestroy();

			expect(plugin1.destroy).toHaveBeenCalled();
			expect(plugin2.destroy).toHaveBeenCalled();
		});
	});
});
