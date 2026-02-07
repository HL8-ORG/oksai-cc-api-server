import { BootstrapConfig, ServiceType } from '../interfaces';
import { BootstrapTemplate } from '../interfaces/bootstrap-template.interface';

/**
 * Worker 服务模板
 *
 * 适用于后台任务处理服务
 */
export class WorkerTemplate implements BootstrapTemplate {
	readonly name = 'worker';
	readonly description = '适用于后台任务处理服务的预设配置模板';

	getConfig(overrides: Partial<BootstrapConfig> = {}): BootstrapConfig {
		const defaultConfig: BootstrapConfig = {
			serviceType: ServiceType.WORKER,
			serviceName: 'worker-service',

			database: {
				connection: {},
				runMigrations: false,
				synchronize: false,
				seedIfEmpty: false
			},

			monitoring: {
				enableHealthCheck: true,
				healthCheckPath: '/health',
				enablePerformanceMonitoring: true,
				enableRequestLogging: false
			},

			plugins: {
				systemPlugins: [],
				featurePlugins: {},
				autoLoad: false
			}
		};

		return {
			...defaultConfig,
			...overrides,
			database: {
				...defaultConfig.database,
				...overrides.database
			},
			monitoring: {
				...defaultConfig.monitoring,
				...overrides.monitoring
			},
			plugins: {
				...defaultConfig.plugins,
				...overrides.plugins
			}
		} as BootstrapConfig;
	}
}
