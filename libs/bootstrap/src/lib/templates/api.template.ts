import { BootstrapConfig, ServiceType } from '../interfaces';
import { BootstrapTemplate } from '../interfaces/bootstrap-template.interface';

/**
 * API 服务模板
 *
 * 适用于需要 HTTP API 的 REST 服务
 */
export class ApiTemplate implements BootstrapTemplate {
	readonly name = 'api';
	readonly description = '适用于 HTTP API 服务的预设配置模板';

	getConfig(overrides: Partial<BootstrapConfig> = {}): BootstrapConfig {
		const defaultConfig: BootstrapConfig = {
			serviceType: ServiceType.API,
			serviceName: 'api-service',

			database: {
				connection: {},
				runMigrations: false,
				synchronize: false,
				seedIfEmpty: false
			},

			express: {
				globalPrefix: 'api',
				cors: {
					origin: '*',
					credentials: true,
					methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'].join(','),
					allowedHeaders: [
						'Authorization',
						'Language',
						'Tenant-Id',
						'Organization-Id',
						'X-Requested-With',
						'X-Auth-Token',
						'X-HTTP-Method-Override',
						'Content-Type',
						'Content-Language',
						'Accept',
						'Accept-Language',
						'Observe'
					].join(', ')
				},
				enableHelmet: true,
				bodyLimit: '50mb',
				enableSwagger: true,
				swaggerPath: 'api-docs'
			},

			monitoring: {
				enableHealthCheck: true,
				healthCheckPath: '/health',
				enablePerformanceMonitoring: true,
				enableRequestLogging: true
			},

			plugins: {
				systemPlugins: ['auth', 'tenant', 'user', 'audit', 'organization', 'role'],
				featurePlugins: {},
				autoLoad: true
			}
		};

		return {
			...defaultConfig,
			...overrides,
			database: {
				...defaultConfig.database,
				...overrides.database
			},
			express: {
				...defaultConfig.express,
				...overrides.express
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
