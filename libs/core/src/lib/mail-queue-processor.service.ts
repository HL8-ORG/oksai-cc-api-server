import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Worker, Job, Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

/**
 * 邮件队列处理器
 *
 * 处理邮件队列中的任务，异步发送邮件
 */
@Injectable()
export class MailQueueProcessor implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(MailQueueProcessor.name);
	private worker: Worker | null = null;
	private queue: Queue | null = null;

	constructor(private readonly configService: ConfigService, private readonly mailService: MailService) {}

	/**
	 * 初始化邮件队列处理器
	 */
	async onModuleInit(): Promise<void> {
		const redisConfig = {
			host: this.configService.get<string>('REDIS_HOST', 'localhost'),
			port: parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10),
			password: this.configService.get<string>('REDIS_PASSWORD'),
			db: parseInt(this.configService.get<string>('REDIS_DB', '0'), 10)
		};

		try {
			this.queue = new Queue('email-queue', {
				connection: redisConfig
			});

			this.worker = new Worker('email-queue', this.processJob.bind(this), {
				connection: redisConfig,
				concurrency: 5,
				limiter: {
					max: 100,
					duration: 60000
				}
			});

			this.worker.on('completed', (job: Job) => {
				this.logger.log(`邮件发送成功: ${job.id} - ${job.data.to} - ${job.data.subject}`);
			});

			this.worker.on('failed', (job: Job | undefined, error: Error) => {
				this.logger.error(`邮件发送失败: ${job?.id} - ${job?.data.to}`, error.message);
			});

			this.worker.on('error', (error: Error) => {
				this.logger.error('邮件队列处理器错误', error);
			});

			this.logger.log('邮件队列处理器已启动');
		} catch (error) {
			this.logger.error('邮件队列处理器初始化失败', error);
		}
	}

	/**
	 * 处理邮件任务
	 *
	 * @param job - 队列任务
	 */
	private async processJob(job: Job<any, void, string>): Promise<void> {
		const { to, subject, html, text, fromName, cc, bcc, replyTo } = job.data;

		try {
			await this.mailService.send({
				to,
				subject,
				html,
				text,
				fromName,
				cc,
				bcc,
				replyTo
			});

			this.logger.log(`邮件发送成功: ${to} - ${subject}`);
		} catch (error) {
			this.logger.error(`邮件发送失败: ${to} - ${subject}`, error);
			throw error;
		}
	}

	/**
	 * 关闭邮件队列处理器
	 */
	async onModuleDestroy(): Promise<void> {
		if (this.worker) {
			await this.worker.close();
			this.logger.log('邮件队列处理器已关闭');
		}

		if (this.queue) {
			await this.queue.close();
			this.logger.log('邮件队列已关闭');
		}
	}

	/**
	 * 获取处理器统计信息
	 *
	 * @returns 处理器统计信息
	 */
	async getStats(): Promise<{
		active: number;
		waiting: number;
		completed: number;
		failed: number;
		delayed: number;
	}> {
		if (!this.queue) {
			return {
				active: 0,
				waiting: 0,
				completed: 0,
				failed: 0,
				delayed: 0
			};
		}

		const counts = await this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
		return {
			active: counts.active || 0,
			waiting: counts.waiting || 0,
			completed: counts.completed || 0,
			failed: counts.failed || 0,
			delayed: counts.delayed || 0
		};
	}
}
