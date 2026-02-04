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
 * - Services: Email sending, Core Module: Exports all shared functionality
 */

export * from './lib/entities';
export * from './lib/guards';
export * from './lib/decorators';
export * from './lib/utils';
export { JwtPayload, TokenPair, JwtUtils, initJwtUtils, getJwtUtils } from './lib/utils';
export { CoreModule } from './lib/core.module';
export { PUBLIC_KEY, ROLES_KEY } from './lib/decorators';
export { MailService } from './lib/mail.service';
export { TemplateEngineService } from './lib/template-engine.service';
export { JwtBlacklistService } from './lib/jwt-blacklist.service';
export { MailQueueService } from './lib/mail-queue.service';
export { MailQueueProcessor } from './lib/mail-queue-processor.service';
export { MailQueueMonitorService } from './lib/mail-queue-monitor.service';
export { generateResetPasswordEmail, generateWelcomeEmail } from './lib/mail-templates';
export type { IMailOptions, IMailService } from './lib/interfaces/mail.interface';
