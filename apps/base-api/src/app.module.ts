import { Module, MiddlewareConsumer, NestModule, RequestMethod, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from './config/mikro-orm.config';

// Shared Modules
import { HealthModule } from './shared/health/health.module';

// Core Module
import { CoreModule } from '@oksai/core';

// Plugin Module
import { PluginModule, PluginRegistryService } from '@oksai/plugin';

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

// Plugin Bootstrap
import { AuthPlugin } from '@oksai/auth';
import { TenantPlugin } from '@oksai/tenant';
import { UserPlugin } from '@oksai/user';
import { AuditPlugin } from '@oksai/audit';
import { OrganizationPlugin } from '@oksai/organization';
import { RolePlugin } from '@oksai/role';
import { AnalyticsPlugin } from '@oksai/analytics';
import { ReportingPlugin } from '@oksai/reporting';

// Middleware
import { LoggerMiddleware } from '@oksai/common';
import { RateLimitMiddleware } from '@oksai/common';

// Interceptors
import { VersionInterceptor } from '@oksai/common';

// Services
import { MetricsService } from '@oksai/common';
import { ErrorTrackingService } from '@oksai/common';
import { RequestTracingService } from '@oksai/common';

const rateLimitMiddlewareProvider: Provider = {
	provide: RateLimitMiddleware,
	useFactory: () => {
		return new RateLimitMiddleware({
			windowMs: 60000,
			maxRequests: 100
		});
	}
};

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env'
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
		AuthPlugin,
		TenantPlugin,
		UserPlugin,
		AuditPlugin,
		OrganizationPlugin,
		RolePlugin,
		AnalyticsPlugin,
		ReportingPlugin,
		MetricsService,
		ErrorTrackingService,
		RequestTracingService,
		VersionInterceptor,
		rateLimitMiddlewareProvider
	]
})
export class AppModule implements NestModule {
	constructor(private readonly registry: PluginRegistryService) {}

	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('*');

		consumer
			.apply(RateLimitMiddleware)
			.exclude('/api/health')
			.forRoutes({ path: '/api', method: RequestMethod.ALL });
	}
}
