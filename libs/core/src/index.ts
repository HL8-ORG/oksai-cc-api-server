/**
 * OKSAI Core Library
 *
 * Provides shared functionality used across all OKSAI plugins.
 *
 * Includes:
 * - Entities: BaseEntity with UUID, timestamps, soft delete
 * - Guards: Authentication, Tenant Context, RBAC
 * - Decorators: @Public, @Roles
 * - Utils: Password hashing, JWT utilities
 * - Services: Email sending
 * - Request Context: Request-level context management
 * - Middleware: Correlation ID, Request Context
 * - Monitoring: Prometheus metrics
 */

// Entities
export * from './lib/entities';
export { CoreModule } from './lib/core.module';

// Guards
export { AuthGuard, TenantGuard, RoleGuard } from './lib/guards';
export { Public, Roles } from './lib/decorators';

// Utils
export {
	hashPassword,
	verifyPassword,
	validatePasswordStrength,
	initJwtUtils,
	getJwtUtils,
	JwtPayload
} from './lib/utils';

// Services
export { MailService } from './lib/mail.service';
export { TemplateEngineService } from './lib/template-engine.service';
export { JwtBlacklistService } from './lib/jwt-blacklist.service';
export { MailQueueService } from './lib/mail-queue.service';
export { MailQueueProcessor } from './lib/mail-queue-processor.service';
export { MailQueueMonitorService } from './lib/mail-queue-monitor.service';

// Request Context
export { RequestContext } from './lib/context/request-context.service';
export { type IRequestContext, type IUser } from './lib/context/request-context.service';
export {
	RequestContextMiddleware,
	type RequestContextMiddlewareConfig
} from './lib/context/request-context.middleware';

// Middleware
export { CorrelationIdMiddleware } from './lib/middleware/correlation-id.middleware';

// Controllers
// TODO: PrometheusController 尚未完成依赖注入配置，暂不导出
// export { PrometheusController } from './lib/controllers/prometheus.controller';

// Mail Templates
export { generateResetPasswordEmail, generateWelcomeEmail } from './lib/mail-templates';

// Interfaces
export type { IMailOptions, IMailService } from './lib/interfaces/mail.interface';

// Tenant Filters
export { TenantFilterService } from './lib/filters/tenant-filter.service';
export { TenantRepository } from './lib/repositories/tenant-repository.service';
