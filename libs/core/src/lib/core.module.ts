import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { AuthGuard, TenantGuard, RoleGuard } from './guards';
import { MailService } from './mail.service';
import { TemplateEngineService } from './template-engine.service';
import { JwtBlacklistService } from './jwt-blacklist.service';
import { MailQueueService } from './mail-queue.service';
import { MailQueueProcessor } from './mail-queue-processor.service';
import { MailQueueMonitorService } from './mail-queue-monitor.service';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';
import { RequestContextMiddleware } from './context/request-context.middleware';

/**
 * OKSAI Core Module
 *
 * 提供核心共享功能，包括：
 * - 身份认证守卫（AuthGuard、TenantGuard、RoleGuard）
 * - 请求上下文管理（RequestContext、RequestContextMiddleware）
 * - 邮件发送服务
 * - JWT 工具函数
 * - 模板引擎服务
 * - JWT 黑名单服务
 * - 邮件队列服务
 * - 邮件队列处理器
 * - 邮件队列监控服务
 * - 请求关联 ID 中间件（CorrelationIdMiddleware）
 */
@Module({
	imports: [ConfigModule, ClsModule.forRoot({ global: true, middleware: { mount: true } })],
	providers: [
		AuthGuard,
		TenantGuard,
		RoleGuard,
		MailService,
		TemplateEngineService,
		JwtBlacklistService,
		MailQueueService,
		MailQueueProcessor,
		MailQueueMonitorService,
		CorrelationIdMiddleware,
		RequestContextMiddleware
	],
	exports: [
		// Guards
		AuthGuard,
		TenantGuard,
		RoleGuard,
		// Services
		MailService,
		TemplateEngineService,
		JwtBlacklistService,
		MailQueueService,
		MailQueueProcessor,
		MailQueueMonitorService,
		// Middleware
		CorrelationIdMiddleware,
		RequestContextMiddleware
	]
})
export class CoreModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(RequestContextMiddleware).forRoutes('*');
	}
}

export { Public, Roles } from './decorators';
export { hashPassword, verifyPassword, validatePasswordStrength, initJwtUtils, getJwtUtils } from './utils';

/**
 * 请求上下文服务
 *
 * 提供统一的请求上下文访问接口
 *
 * @deprecated 使用 RequestContext 代替
 */
export { RequestContext, type IRequestContext, type IUser } from './context/request-context.service';
