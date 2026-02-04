import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from './config/mikro-orm.config';

// Shared Modules
import { HealthModule } from './shared/health/health.module';

// Core Module
import { CoreModule } from '@oksai/core';

// Plugin Modules
import { AuthModule } from '@oksai/auth';
import { TenantModule } from '@oksai/tenant';
import { UserModule } from '@oksai/user';
import { AuditModule } from '@oksai/audit';
import { OrganizationModule } from '@oksai/organization';
import { RoleModule } from '@oksai/role';

// Plugin Bootstrap
import { AuthPlugin } from '@oksai/auth';
import { TenantPlugin } from '@oksai/tenant';
import { UserPlugin } from '@oksai/user';
import { AuditPlugin } from '@oksai/audit';
import { OrganizationPlugin } from '@oksai/organization';
import { RolePlugin } from '@oksai/role';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env'
		}),
		MikroOrmModule.forRoot(config),
		CoreModule,
		HealthModule,
		AuthModule,
		TenantModule,
		UserModule,
		AuditModule,
		OrganizationModule,
		RoleModule
	],
	providers: [AuthPlugin, TenantPlugin, UserPlugin, AuditPlugin, OrganizationPlugin, RolePlugin]
})
export class AppModule {}
