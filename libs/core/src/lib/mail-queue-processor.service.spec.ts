import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailQueueProcessor } from './mail-queue-processor.service';
import { MailService } from './mail.service';
import { Job } from 'bullmq';

jest.mock('bullmq', () => ({
	Worker: jest.fn().mockImplementation(() => ({
		on: jest.fn(),
		close: jest.fn().mockResolvedValue(undefined)
	})),
	Queue: jest.fn().mockImplementation(() => ({
		getJobCounts: jest.fn().mockResolvedValue({
			waiting: 5,
			active: 3,
			completed: 10,
			failed: 2,
			delayed: 1
		}),
		close: jest.fn().mockResolvedValue(undefined)
	}))
}));

describe('MailQueueProcessor', () => {
	let processor: MailQueueProcessor;
	let mailService: any;
	let configService: any;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MailQueueProcessor,
				{
					provide: MailService,
					useValue: {
						send: jest.fn().mockResolvedValue(undefined)
					}
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn()
					}
				}
			]
		}).compile();

		processor = module.get<MailQueueProcessor>(MailQueueProcessor);
		mailService = module.get<MailService>(MailService);
		configService = module.get<ConfigService>(ConfigService);
	});

	afterEach(async () => {
		await processor.onModuleDestroy();
	});

	describe('processJob', () => {
		it('应该成功处理邮件任务', async () => {
			const job = {
				data: {
					to: 'test@example.com',
					subject: '测试邮件',
					html: '<h1>测试</h1>',
					text: '测试内容'
				}
			} as Job<any, void, string>;

			await processor['processJob'](job);

			expect(mailService.send).toHaveBeenCalledWith({
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容'
			});
		});

		it('应该处理邮件发送失败', async () => {
			const job = {
				id: '2',
				data: {
					to: 'test@example.com',
					subject: '测试邮件',
					html: '<h1>测试</h1>',
					text: '测试内容'
				}
			} as Job<any, void, string>;

			mailService.send.mockRejectedValue(new Error('发送失败'));

			await expect(processor['processJob'](job)).rejects.toThrow('发送失败');
		});
	});

	describe('getStats', () => {
		it('应该返回队列统计信息', async () => {
			const mockQueue = {
				getJobCounts: jest.fn().mockResolvedValue({
					waiting: 5,
					active: 3,
					completed: 10,
					failed: 2,
					delayed: 1
				}),
				close: jest.fn().mockResolvedValue(undefined)
			} as any;

			processor['queue'] = mockQueue;

			const stats = await processor.getStats();

			expect(stats.active).toBe(3);
			expect(stats.waiting).toBe(5);
			expect(stats.completed).toBe(10);
			expect(stats.failed).toBe(2);
			expect(stats.delayed).toBe(1);
		});
	});

	describe('onModuleDestroy', () => {
		it('应该关闭邮件队列处理器', async () => {
			const mockWorker: any = {
				close: jest.fn().mockResolvedValue(undefined)
			};
			const mockQueue: any = {
				close: jest.fn().mockResolvedValue(undefined)
			};

			processor['worker'] = mockWorker;
			processor['queue'] = mockQueue;

			await processor.onModuleDestroy();

			expect(mockWorker.close).toHaveBeenCalled();
			expect(mockQueue.close).toHaveBeenCalled();
		});
	});
});
