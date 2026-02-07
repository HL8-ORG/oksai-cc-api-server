import { BootstrapConfig, ServiceType } from '../interfaces';
import { BootstrapTemplate } from '../interfaces/bootstrap-template.interface';

/**
 * MCP (Model Context Protocol) 服务模板
 *
 * 适用于 AI 交互的 MCP 服务
 */
export class McpTemplate implements BootstrapTemplate {
	readonly name = 'mcp';
	readonly description = '适用于 MCP AI 服务的预设配置模板';

	getConfig(overrides: Partial<BootstrapConfig> = {}): BootstrapConfig {
		const defaultConfig: BootstrapConfig = {
			serviceType: ServiceType.MCP,
			serviceName: 'mcp-service',

			database: {
				connection: {},
				runMigrations: false,
				synchronize: false,
				seedIfEmpty: false
			},

			monitoring: {
				enableHealthCheck: true,
				healthCheckPath: '/health',
				enablePerformanceMonitoring: false,
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
