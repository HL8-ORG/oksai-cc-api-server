import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PluginRegistryService, PluginLoaderService } from '@oksai/plugin';
import { configureRedisSession, setupSwagger, tracer } from '@oksai/bootstrap';
import { AuthPlugin } from '@oksai/auth';
import { TenantPlugin } from '@oksai/tenant';
import { UserPlugin } from '@oksai/user';
import { AuditPlugin } from '@oksai/audit';
import { OrganizationPlugin } from '@oksai/organization';
import { RolePlugin } from '@oksai/role';
import { AnalyticsPlugin } from '@oksai/analytics';
import { ReportingPlugin } from '@oksai/reporting';

async function bootstrap() {
	// 启动 OpenTelemetry 追踪
	tracer.start();

	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');

	// 配置 Redis 会话
	await configureRedisSession(app);

	// 配置 Swagger 文档
	await setupSwagger(app, {
		swaggerPath: 'api-docs',
		title: 'OKSAI API',
		version: '1.0.0',
		description: 'OKSAI 平台 API 文档'
	});

	const registry = app.get(PluginRegistryService);
	const loader = app.get(PluginLoaderService);

	// 创建系统插件实例
	const plugins = [
		new AuthPlugin(),
		new TenantPlugin(),
		new UserPlugin(),
		new AuditPlugin(),
		new OrganizationPlugin(),
		new RolePlugin(),
		new AnalyticsPlugin(),
		new ReportingPlugin()
	];

	// 注册所有插件
	for (const plugin of plugins) {
		registry.register(plugin);
	}

	// 加载插件配置
	await loader.loadPlugins({
		systemPlugins: ['auth', 'tenant', 'user', 'audit', 'organization', 'role', 'analytics', 'reporting'],
		featurePlugins: {},
		plugins: {},
		autoLoad: true
	});

	await app.listen(3000);
	console.log('🚀 应用已启动: http://localhost:3000/api');
	console.log('❤️  健康检查: http://localhost:3000/api/health');
	console.log('📊 分析服务: http://localhost:3000/api/analytics');
	console.log('📈 报表服务: http://localhost:3000/api/reporting');
}

bootstrap();
