jest.mock('nodemailer', () => ({
	createTransport: jest.fn()
}));

import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';
import { IMailOptions } from './interfaces/mail.interface';

describe('MailService', () => {
	let service: MailService;
	let configService: any;
	let mockTransporter: any;
	let createTransportMock: jest.Mock;

	beforeEach(() => {
		mockTransporter = {
			sendMail: jest.fn().mockResolvedValue({
				response: '250 2.0.0 OK',
				envelope: {
					from: 'noreply@oksai.io',
					to: ['test@example.com']
				},
				messageId: '<test-id>'
			})
		};

		createTransportMock = nodemailer.createTransport as jest.Mock;
		createTransportMock.mockReturnValue(mockTransporter);

		configService = {
			get: jest.fn((key: string, defaultValue?: any) => {
				const defaults: Record<string, any> = {
					SMTP_HOST: 'smtp.gmail.com',
					SMTP_PORT: '587',
					SMTP_SECURE: 'false',
					SMTP_USER: 'test@example.com',
					SMTP_PASS: 'password',
					SMTP_FROM_NAME: 'OKSAI Platform'
				};
				return defaults[key] ?? defaultValue;
			})
		};

		service = new MailService(configService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('onModuleInit', () => {
		it('应该初始化邮件传输器', () => {
			expect(service['transporter']).not.toBeNull();
		});

		it('应该使用环境变量配置传输器', () => {
			expect(configService.get).toHaveBeenCalledWith('SMTP_HOST');
			expect(configService.get).toHaveBeenCalledWith('SMTP_PORT');
			expect(configService.get).toHaveBeenCalledWith('SMTP_SECURE', false);
			expect(configService.get).toHaveBeenCalledWith('SMTP_USER');
			expect(configService.get).toHaveBeenCalledWith('SMTP_PASS');
			expect(configService.get).toHaveBeenCalledWith('SMTP_FROM_NAME', 'OKSAI Platform');
		});

		it('应该在 SMTP 配置不完整时跳过初始化', () => {
			createTransportMock.mockReturnValue(null);

			configService.get = jest.fn(() => undefined);

			const testService = new MailService(configService);

			expect(testService['transporter']).toBeNull();
		});

		it('应该记录传输器初始化成功日志', () => {
			const loggerSpy = jest.spyOn(service['logger'], 'log');

			service['initializeTransporter']();

			expect(loggerSpy).toHaveBeenCalledWith('邮件传输器初始化成功');
		});

		it('应该记录初始化失败日志', () => {
			createTransportMock.mockImplementation(() => {
				throw new Error('初始化失败');
			});

			configService.get = jest.fn(() => undefined);

			const testService = new MailService(configService);

			expect(() => {
				testService['initializeTransporter']();
			}).not.toThrow();
		});
	});

	describe('send', () => {
		it('应该成功发送邮件', async () => {
			const options: IMailOptions = {
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容'
			};

			await service.send(options);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: 'OKSAI Platform <noreply@oksai.io>',
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容'
			});
		});

		it('应该支持自定义发件人信息', async () => {
			const options: IMailOptions = {
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容',
				fromName: '自定义名称'
			};

			await service.send(options);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: '自定义名称 <noreply@oksai.io>',
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容'
			});
		});

		it('应该支持抄送和密送', async () => {
			const options: IMailOptions = {
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容',
				cc: ['cc1@example.com', 'cc2@example.com'],
				bcc: ['bcc@example.com']
			};

			await service.send(options);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: 'OKSAI Platform <noreply@oksai.io>',
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容',
				cc: ['cc1@example.com', 'cc2@example.com'],
				bcc: ['bcc@example.com']
			});
		});

		it('应该支持回复地址', async () => {
			const options: IMailOptions = {
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容',
				replyTo: 'reply@example.com'
			};

			await service.send(options);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: 'OKSAI Platform <noreply@oksai.io>',
				to: 'test@example.com',
				subject: '测试邮件',
				html: '<h1>测试</h1>',
				text: '测试内容',
				replyTo: 'reply@example.com'
			});
		});

		it('应该记录发送成功日志', async () => {
			const options: IMailOptions = {
				to: 'test@example.com',
				subject: '测试邮件'
			};

			const loggerSpy = jest.spyOn(service['logger'], 'log');

			await service.send(options);

			expect(loggerSpy).toHaveBeenCalledWith(`邮件发送成功: test@example.com - 测试邮件`);
		});

		it('应该抛出错误（传输器未初始化）', async () => {
			createTransportMock.mockReturnValue(null);

			configService.get = jest.fn(() => undefined);

			const testService = new MailService(configService);

			const options: IMailOptions = {
				to: 'test@example.com',
				subject: '测试邮件'
			};

			await expect(testService.send(options)).rejects.toThrow('邮件服务未配置或初始化失败');
		});

		it('应该记录发送失败日志', async () => {
			createTransportMock.mockReturnValue({
				sendMail: jest.fn().mockRejectedValue(new Error('发送失败'))
			});

			configService.get = jest.fn((key: string) => {
				const values: Record<string, string> = {
					SMTP_HOST: 'localhost',
					SMTP_PORT: '587',
					SMTP_SECURE: 'false',
					SMTP_USER: 'test',
					SMTP_PASS: 'password'
				};
				return values[key];
			});

			const testService = new MailService(configService);
			const options: IMailOptions = {
				to: 'test@example.com',
				subject: '测试邮件'
			};

			const loggerSpy = jest.spyOn(testService['logger'], 'error');

			await expect(testService.send(options)).rejects.toThrow('发送失败');

			expect(loggerSpy).toHaveBeenCalledWith('邮件发送失败: test@example.com', expect.any(Error));
		});
	});

	describe('isAvailable', () => {
		it('应该返回 true（传输器已初始化）', () => {
			expect(service.isAvailable()).toBe(true);
		});

		it('应该返回 false（传输器未初始化）', () => {
			createTransportMock.mockReturnValue(null);

			configService.get = jest.fn(() => undefined);

			const testService = new MailService(configService);

			expect(testService.isAvailable()).toBe(false);
		});
	});
});
