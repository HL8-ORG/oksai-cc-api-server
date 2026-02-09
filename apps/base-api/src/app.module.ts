import { Module, MiddlewareConsumer, NestModule, RequestMethod, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from './config/mikro-orm.config';

// Shared Modules
import { HealthModule } from './shared/health/health.module';

// Core Module
import { CoreModule, AuthGuard, TenantGuard } from '@oksai/core';

// Plugin Module
import { PluginModule, PluginRegistryService, PluginStatusGuard } from '@oksai/plugin';

// Bootstrap Module
import { BootstrapModule } from '@oksai/bootstrap';

// Plugin Modules
import { AuthModule } from '@oksai/auth';
import { TenantModule } from '@oksai/tenant';
import { UserModule } from '@oksai/user';
import { AuditModule } from '@oksai/audit';
import { OrganizationModule } from '@oksai/organization';
import { RoleModule } from '@oksai/role';
import { AnalyticsModule } from '@oksai/analytics';
import { ReportingModule } from '@oksai/reporting';

// Middleware
import { LoggerMiddleware } from '@oksai/common';
import { RateLimitMiddleware, RATE_LIMIT_OPTIONS } from '@oksai/common';

// Interceptors
import { VersionInterceptor } from '@oksai/common';

// Services
import { MetricsService } from '@oksai/common';
import { ErrorTrackingService } from '@oksai/common';
import { RequestTracingService } from '@oksai/common';

/** 限流配置提供者 */
const rateLimitOptionsProvider: Provider = {
	provide: RATE_LIMIT_OPTIONS,
	useValue: {
		windowMs: 60000,
		maxRequests: 100
	}
};

const versionInterceptorProvider: Provider = {
	provide: VersionInterceptor,
	useFactory: (reflector: Reflector) => {
		return new VersionInterceptor(reflector, {
			defaultVersion: 'v1',
			versionHeader: 'X-API-Version',
			versionQueryKey: 'version'
		});
	},
	inject: [Reflector]
};

/** 全局插件状态守卫（检查插件是否启用） */
const globalPluginStatusGuardProvider: Provider = {
	provide: APP_GUARD,
	useFactory: (reflector: Reflector, pluginRegistry: PluginRegistryService) => {
		return new PluginStatusGuard(reflector, pluginRegistry);
	},
	inject: [Reflector, PluginRegistryService]
};

/** 全局认证守卫（基于 @oksai/core，写入 RequestContext） */
const globalAuthGuardProvider: Provider = {
	provide: APP_GUARD,
	useClass: AuthGuard
};

/** 全局租户守卫（基于 RequestContext；@Public() 路由会自动跳过） */
const globalTenantGuardProvider: Provider = {
	provide: APP_GUARD,
	useClass: TenantGuard
};

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `${process.cwd()}/.env`
		}),
		MikroOrmModule.forRoot(config),
		CoreModule,
		PluginModule,
		BootstrapModule,
		HealthModule,
		AuthModule,
		TenantModule,
		UserModule,
		AuditModule,
		OrganizationModule,
		RoleModule,
		AnalyticsModule,
		ReportingModule
	],
	providers: [
		MetricsService,
		ErrorTrackingService,
		RequestTracingService,
		globalPluginStatusGuardProvider,
		globalAuthGuardProvider,
		globalTenantGuardProvider,
		versionInterceptorProvider,
		rateLimitOptionsProvider,
		RateLimitMiddleware
	]
})
export class AppModule implements NestModule {
	constructor(private readonly registry: PluginRegistryService) {}

	configure(consumer: MiddlewareConsumer) {
		// NestJS v11 + Express v5 要求使用命名参数代替旧式通配符 *
		consumer.apply(LoggerMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });

		consumer
			.apply(RateLimitMiddleware)
			.exclude('/api/health')
			.forRoutes({ path: '{*path}', method: RequestMethod.ALL });
	}
}
