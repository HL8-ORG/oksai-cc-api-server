import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IMailService, IMailOptions } from './interfaces/mail.interface';
import { Logger } from '@nestjs/common';

/**
 * 邮件服务
 *
 * 基于 Nodemailer 实现邮件发送功能，支持 SMTP 配置
 */
@Injectable()
export class MailService implements IMailService {
	private readonly logger = new Logger(MailService.name);
	private transporter: nodemailer.Transporter | null = null;

	constructor(private readonly configService: ConfigService) {
		this.initializeTransporter();
	}

	/**
	 * 初始化邮件传输器
	 *
	 * 从环境变量读取 SMTP 配置并创建传输器
	 */
	private initializeTransporter(): void {
		const host = this.configService.get<string>('SMTP_HOST');
		const port = this.configService.get<number>('SMTP_PORT');
		const secure = this.configService.get<boolean>('SMTP_SECURE', false);
		const user = this.configService.get<string>('SMTP_USER');
		const pass = this.configService.get<string>('SMTP_PASS');
		const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'OKSAI Platform');

		if (!host || !port || !user || !pass) {
			this.logger.warn('SMTP 配置不完整，邮件服务已禁用。请配置 SMTP_HOST、SMTP_PORT、SMTP_USER 和 SMTP_PASS');
			return;
		}

		try {
			this.transporter = nodemailer.createTransport({
				host,
				port,
				secure,
				auth: {
					user,
					pass
				}
			});
			this.logger.log('邮件传输器初始化成功');
		} catch (error) {
			this.logger.error('邮件传输器初始化失败', error);
		}
	}

	/**
	 * 检查邮件服务是否可用
	 *
	 * @returns 是否可用
	 */
	isAvailable(): boolean {
		return this.transporter !== null;
	}

	/**
	 * 发送邮件
	 *
	 * @param options - 邮件选项（收件人、主题、内容等）
	 * @returns Promise<void> 发送完成
	 * @throws Error 发送失败时
	 *
	 * @example
	 * ```typescript
	 * await mailService.send({
	 *   to: 'user@example.com',
	 *   subject: '欢迎',
	 *   text: '欢迎使用我们的平台'
	 * });
	 * ```
	 */
	async send(options: IMailOptions): Promise<void> {
		if (!this.transporter) {
			throw new Error('邮件服务未配置或初始化失败');
		}

		const fromName = options.fromName || this.configService.get<string>('SMTP_FROM_NAME', 'OKSAI Platform');
		const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL', 'noreply@oksai.io');

		try {
			await this.transporter.sendMail({
				from: `${fromName} <${fromEmail}>`,
				to: options.to,
				subject: options.subject,
				text: options.text,
				html: options.html,
				cc: options.cc,
				bcc: options.bcc,
				replyTo: options.replyTo
			});
			this.logger.log(`邮件发送成功: ${options.to} - ${options.subject}`);
		} catch (error) {
			this.logger.error(`邮件发送失败: ${options.to}`, error);
			throw error;
		}
	}
}
