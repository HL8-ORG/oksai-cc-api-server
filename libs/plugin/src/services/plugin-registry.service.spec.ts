import { Test, TestingModule } from '@nestjs/testing';
import { PluginRegistryService } from '../services/plugin-registry.service';
import { IPlugin, PluginStatus, PluginType, PluginPriority } from '../interfaces/plugin.interface';

describe('PluginRegistryService', () => {
	let service: PluginRegistryService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PluginRegistryService]
		}).compile();

		service = module.get<PluginRegistryService>(PluginRegistryService);
	});

	afterEach(() => {
		service.clear();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('register', () => {
		it('should register a plugin', () => {
			const plugin: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			service.register(plugin);

			expect(service.has('auth')).toBe(true);
			expect(service.get('auth')).toBe(plugin);
		});

		it('should throw error when registering duplicate plugin', () => {
			const plugin: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			service.register(plugin);

			expect(() => service.register(plugin)).toThrow('插件 auth 已注册');
		});

		it('should throw error when plugin name is empty', () => {
			const plugin: IPlugin = {
				name: '',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			expect(() => service.register(plugin)).toThrow('插件名称不能为空');
		});
	});

	describe('unregister', () => {
		it('should unregister a plugin', () => {
			const plugin: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.FEATURE,
				destroy: jest.fn()
			};

			service.register(plugin);
			expect(service.has('auth')).toBe(true);

			service.unregister('auth');

			expect(service.has('auth')).toBe(false);
			expect(plugin.destroy).toHaveBeenCalled();
		});

		it('should throw error when unregistering non-existent plugin', () => {
			expect(() => service.unregister('non-existent')).toThrow('插件 non-existent 未注册');
		});
	});

	describe('get', () => {
		it('should return plugin by name', () => {
			const plugin: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			service.register(plugin);
			const retrieved = service.get('auth');

			expect(retrieved).toBe(plugin);
		});

		it('should return undefined for non-existent plugin', () => {
			const retrieved = service.get('non-existent');
			expect(retrieved).toBeUndefined();
		});
	});

	describe('getAll', () => {
		it('should return all registered plugins', () => {
			const plugin1: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			const plugin2: IPlugin = {
				name: 'tenant',
				version: '1.0.0',
				description: '租户插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			service.register(plugin1);
			service.register(plugin2);

			const all = service.getAll();

			expect(all).toHaveLength(2);
			expect(all).toContain(plugin1);
			expect(all).toContain(plugin2);
		});
	});

	describe('getEnabled', () => {
		it('should return only enabled plugins', () => {
			const plugin1: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			const plugin2: IPlugin = {
				name: 'tenant',
				version: '1.0.0',
				description: '租户插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			service.register(plugin1);
			service.register(plugin2);

			service.updateStatus('auth', PluginStatus.INITIALIZED);
			service.updateStatus('tenant', PluginStatus.UNLOADED);

			const enabled = service.getEnabled();

			expect(enabled).toHaveLength(1);
			expect(enabled).toContain(plugin1);
			expect(enabled).not.toContain(plugin2);
		});
	});

	describe('getSystemPlugins', () => {
		it('should return only system plugins', () => {
			const systemPlugin: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			const featurePlugin: IPlugin = {
				name: 'optional-plugin',
				version: '1.0.0',
				description: '功能插件',
				type: PluginType.FEATURE
			};

			service.register(systemPlugin);
			service.register(featurePlugin);

			const systemPlugins = service.getSystemPlugins();

			expect(systemPlugins).toHaveLength(1);
			expect(systemPlugins).toContain(systemPlugin);
			expect(systemPlugins).not.toContain(featurePlugin);
		});
	});

	describe('getFeaturePlugins', () => {
		it('should return only feature plugins', () => {
			const systemPlugin: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			const featurePlugin: IPlugin = {
				name: 'optional-plugin',
				version: '1.0.0',
				description: '功能插件',
				type: PluginType.FEATURE
			};

			service.register(systemPlugin);
			service.register(featurePlugin);

			const featurePlugins = service.getFeaturePlugins();

			expect(featurePlugins).toHaveLength(1);
			expect(featurePlugins).toContain(featurePlugin);
			expect(featurePlugins).not.toContain(systemPlugin);
		});
	});

	describe('getStatus', () => {
		it('should return plugin status', () => {
			const plugin: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			service.register(plugin);
			service.updateStatus('auth', PluginStatus.INITIALIZED);

			const status = service.getStatus('auth');

			expect(status).toBe(PluginStatus.INITIALIZED);
		});

		it('should return undefined for non-existent plugin', () => {
			const status = service.getStatus('non-existent');
			expect(status).toBeUndefined();
		});
	});

	describe('getAllStatus', () => {
		it('should return all plugin statuses', () => {
			const plugin1: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			const plugin2: IPlugin = {
				name: 'tenant',
				version: '1.0.0',
				description: '租户插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			service.register(plugin1);
			service.register(plugin2);

			service.updateStatus('auth', PluginStatus.INITIALIZED);
			service.updateStatus('tenant', PluginStatus.UNLOADED);

			const allStatus = service.getAllStatus();

			expect(allStatus).toBeInstanceOf(Map);
			expect(allStatus.size).toBe(2);
			expect(allStatus.get('auth')).toBe(PluginStatus.INITIALIZED);
			expect(allStatus.get('tenant')).toBe(PluginStatus.UNLOADED);
		});
	});

	describe('has', () => {
		it('should return true for registered plugin', () => {
			const plugin: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0
			};

			service.register(plugin);

			expect(service.has('auth')).toBe(true);
		});

		it('should return false for non-existent plugin', () => {
			expect(service.has('non-existent')).toBe(false);
		});
	});

	describe('clear', () => {
		it('should clear all plugins', () => {
			const plugin1: IPlugin = {
				name: 'auth',
				version: '1.0.0',
				description: '认证插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0,
				destroy: jest.fn()
			};

			const plugin2: IPlugin = {
				name: 'tenant',
				version: '1.0.0',
				description: '租户插件',
				type: PluginType.SYSTEM,
				priority: PluginPriority.P0,
				destroy: jest.fn()
			};

			service.register(plugin1);
			service.register(plugin2);

			expect(service.getAll()).toHaveLength(2);

			service.clear();

			expect(service.getAll()).toHaveLength(0);
			expect(plugin1.destroy).toHaveBeenCalled();
			expect(plugin2.destroy).toHaveBeenCalled();
		});
	});
});
