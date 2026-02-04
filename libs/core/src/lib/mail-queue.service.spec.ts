import { ConfigService } from '@nestjs/config';
import { MailQueueService } from './mail-queue.service';
import { IMailOptions } from './interfaces/mail.interface';

jest.mock('bullmq', () => ({
	Queue: jest.fn().mockImplementation(() => ({
		add: jest.fn().mockResolvedValue({ id: 'job-123' }),
		getWaitingCount: jest.fn().mockResolvedValue(5),
		getActiveCount: jest.fn().mockResolvedValue(3),
		getCompletedCount: jest.fn().mockResolvedValue(10),
		getFailedCount: jest.fn().mockResolvedValue(2),
		getDelayedCount: jest.fn().mockResolvedValue(1),
		close: jest.fn().mockResolvedValue(undefined)
	}))
}));

describe('MailQueueService', () => {
	let service: MailQueueService;
	let configService: any;

	beforeEach(() => {
		configService = {
			get: jest.fn((key: string, defaultValue?: any) => {
				const defaults: Record<string, any> = {
					REDIS_HOST: 'localhost',
					REDIS_PORT: '6379',
					REDIS_PASSWORD: undefined,
					REDIS_DB: '0'
				};
				return defaults[key] ?? defaultValue;
			})
		};

		service = new MailQueueService(configService);
	});

	afterEach(async () => {
		await service.onModuleDestroy();
	});

	describe('onModuleInit', () => {
		it('应该初始化邮件队列', () => {
			expect(service['mailQueue']).not.toBeNull();
		});

		it('应该使用环境变量配置队列', () => {
			expect(configService.get).toHaveBeenCalledWith('REDIS_HOST', 'localhost');
			expect(configService.get).toHaveBeenCalledWith('REDIS_PORT', '6379');
			expect(configService.get).toHaveBeenCalledWith('REDIS_PASSWORD');
			expect(configService.get).toHaveBeenCalledWith('REDIS_DB', '0');
		});
	});

	describe('add', () => {
		it('应该成功添加邮件到队列', async () => {
			const options: IMailOptions = {
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容'
			};

			const job = await service.add(options);

			expect(job.id).toBe('job-123');
		});

		it('应该抛出错误（队列未初始化）', async () => {
			(service as any).mailQueue = null;

			const options: IMailOptions = {
				to: 'test@example.com',
				subject: '测试邮件'
			};

			await expect(service.add(options)).rejects.toThrow('邮件队列未初始化');
		});
	});

	describe('getQueueStats', () => {
		it('应该返回队列统计信息', async () => {
			const stats = await service.getQueueStats();

			expect(stats.waiting).toBe(5);
			expect(stats.active).toBe(3);
			expect(stats.completed).toBe(10);
			expect(stats.failed).toBe(2);
			expect(stats.delayed).toBe(1);
		});

		it('应该抛出错误（队列未初始化）', async () => {
			(service as any).mailQueue = null;

			await expect(service.getQueueStats()).rejects.toThrow('邮件队列未初始化');
		});
	});

	describe('isAvailable', () => {
		it('应该返回 true（队列已初始化）', () => {
			expect(service.isAvailable()).toBe(true);
		});

		it('应该返回 false（队列未初始化）', () => {
			(service as any).mailQueue = null;

			expect(service.isAvailable()).toBe(false);
		});
	});

	describe('onModuleDestroy', () => {
		it('应该关闭队列', async () => {
			await service.onModuleDestroy();

			expect(service['mailQueue']).not.toBeNull();
		});
	});
});
