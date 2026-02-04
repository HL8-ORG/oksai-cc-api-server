import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, QueueOptions } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { IMailOptions } from './interfaces/mail.interface';

/**
 * 邮件队列服务
 *
 * 使用 BullMQ 实现异步邮件发送队列
 */
@Injectable()
export class MailQueueService implements OnModuleDestroy {
	private readonly logger = new Logger(MailQueueService.name);
	private mailQueue: Queue<IMailOptions, void> | null = null;

	constructor(private readonly configService: ConfigService) {
		this.initializeQueue();
	}

	/**
	 * 初始化邮件队列
	 */
	private initializeQueue(): void {
		const redisConfig = {
			host: this.configService.get<string>('REDIS_HOST', 'localhost'),
			port: parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10),
			password: this.configService.get<string>('REDIS_PASSWORD'),
			db: parseInt(this.configService.get<string>('REDIS_DB', '0'), 10)
		};

		try {
			const queueOptions: QueueOptions = {
				connection: redisConfig
			};

			this.mailQueue = new Queue<IMailOptions, void>('email-queue', queueOptions);
			this.logger.log('邮件队列已创建');
		} catch (error) {
			this.logger.error('邮件队列初始化失败', error);
		}
	}

	/**
	 * 检查队列是否可用
	 *
	 * @returns 是否可用
	 */
	isAvailable(): boolean {
		return this.mailQueue !== null;
	}

	/**
	 * 添加邮件到队列
	 *
	 * @param options - 邮件选项
	 * @returns Promise<Job> 队列任务
	 *
	 * @example
	 * ```typescript
	 * const job = await mailQueueService.add({
	 *   to: 'user@example.com',
	 *   subject: '欢迎',
	 *   html: '<h1>欢迎</h1>'
	 * });
	 * ```
	 */
	async add(options: IMailOptions): Promise<any> {
		if (!this.mailQueue) {
			throw new Error('邮件队列未初始化');
		}

		return await this.mailQueue.add('send-email', options, {
			attempts: 3,
			backoff: {
				type: 'exponential',
				delay: 2000
			}
		});
	}

	/**
	 * 获取队列统计信息
	 *
	 * @returns 队列统计信息
	 */
	async getQueueStats(): Promise<{
		waiting: number;
		active: number;
		completed: number;
		failed: number;
		delayed: number;
	}> {
		if (!this.mailQueue) {
			throw new Error('邮件队列未初始化');
		}

		const [waiting, active, completed, failed, delayed] = await Promise.all([
			this.mailQueue.getWaitingCount(),
			this.mailQueue.getActiveCount(),
			this.mailQueue.getCompletedCount(),
			this.mailQueue.getFailedCount(),
			this.mailQueue.getDelayedCount()
		]);

		return {
			waiting,
			active,
			completed,
			failed,
			delayed
		};
	}

	/**
	 * 关闭队列
	 */
	async onModuleDestroy(): Promise<void> {
		if (this.mailQueue) {
			await this.mailQueue.close();
			this.logger.log('邮件队列已关闭');
		}
	}
}
