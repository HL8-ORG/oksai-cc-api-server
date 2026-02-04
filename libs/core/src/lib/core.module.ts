import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard, TenantGuard, RoleGuard } from './guards';
import { MailService } from './mail.service';
import { TemplateEngineService } from './template-engine.service';
import { JwtBlacklistService } from './jwt-blacklist.service';
import { MailQueueService } from './mail-queue.service';
import { MailQueueProcessor } from './mail-queue-processor.service';
import { MailQueueMonitorService } from './mail-queue-monitor.service';

/**
 * OKSAI Core Module
 *
 * Exports shared guards used across all plugins:
 * - AuthGuard, TenantGuard, RoleGuard
 * - MailService
 * - TemplateEngineService
 * - JwtBlacklistService
 * - MailQueueService
 * - MailQueueProcessor
 * - MailQueueMonitorService
 */
@Module({
	imports: [ConfigModule],
	providers: [
		AuthGuard,
		TenantGuard,
		RoleGuard,
		MailService,
		TemplateEngineService,
		JwtBlacklistService,
		MailQueueService,
		MailQueueProcessor,
		MailQueueMonitorService
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
		MailQueueMonitorService
	]
})
export class CoreModule {}

export { Public, Roles } from './decorators';
export { hashPassword, verifyPassword, validatePasswordStrength, initJwtUtils, getJwtUtils } from './utils';
