import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MailQueueProcessor } from './mail-queue-processor.service';
import { MailService } from './mail.service';

/**
 * 邮件队列监控服务
 *
 * 监控邮件队列状态，发送告警通知
 */
@Injectable()
export class MailQueueMonitorService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(MailQueueMonitorService.name);
	private monitorInterval: NodeJS.Timeout | null = null;
	private cleanupInterval: NodeJS.Timeout | null = null;
	private lastFailedCount = 0;
	private lastFailedAlertTime = 0;

	constructor(private readonly mailQueueProcessor: MailQueueProcessor, private readonly mailService: MailService) {}

	/**
	 * 模块初始化
	 */
	onModuleInit(): void {
		this.startMonitoring();
		this.startCleanup();
	}

	/**
	 * 启动监控任务（每分钟执行）
	 */
	private startMonitoring(): void {
		this.monitorInterval = setInterval(() => {
			this.monitorQueue().catch((error) => {
				this.logger.error('监控任务执行失败', error);
			});
		}, 60000);

		this.logger.log('邮件队列监控已启动（每分钟执行）');
	}

	/**
	 * 启动清理任务（每小时执行）
	 */
	private startCleanup(): void {
		this.cleanupInterval = setInterval(() => {
			this.cleanup().catch((error) => {
				this.logger.error('清理任务执行失败', error);
			});
		}, 3600000);

		this.logger.log('邮件队列清理任务已启动（每小时执行）');
	}

	/**
	 * 监控队列状态
	 */
	async monitorQueue(): Promise<void> {
		try {
			const health = await this.getHealthStatus();

			if (!health.healthy) {
				this.logger.warn('邮件队列状态异常', health);

				for (const alert of health.alerts) {
					await this.sendAlert(alert);
				}
			} else {
				this.logger.debug('邮件队列状态正常', health);
			}

			this.lastFailedCount = health.stats.failed;
		} catch (error) {
			this.logger.error('监控队列失败', error);
		}
	}

	/**
	 * 清理队列
	 */
	async cleanup(): Promise<void> {
		try {
			const stats = await this.mailQueueProcessor.getStats();
			this.logger.log(`队列清理任务执行：已完成 ${stats.completed} 封邮件`);
		} catch (error) {
			this.logger.error('清理任务执行失败', error);
		}
	}

	/**
	 * 获取队列健康状态
	 *
	 * @returns 队列健康状态
	 */
	async getHealthStatus(): Promise<{
		healthy: boolean;
		stats: {
			active: number;
			waiting: number;
			completed: number;
			failed: number;
			delayed: number;
		};
		metrics: {
			successRate: number;
			failedRate: number;
			throughput: number;
		};
		alerts: string[];
	}> {
		const stats = await this.mailQueueProcessor.getStats();
		const alerts: string[] = [];

		const successRate =
			stats.completed + stats.failed > 0 ? (stats.completed / (stats.completed + stats.failed)) * 100 : 100;

		const failedRate =
			stats.completed + stats.failed > 0 ? (stats.failed / (stats.completed + stats.failed)) * 100 : 0;

		if (stats.waiting > 1000) {
			alerts.push(`队列积压严重：${stats.waiting} 封邮件等待处理`);
		}

		if (stats.failed > 100) {
			alerts.push(`失败邮件过多：${stats.failed} 封邮件发送失败`);
		}

		if (failedRate > 10) {
			alerts.push(`失败率过高：${failedRate.toFixed(2)}%`);
		}

		if (stats.failed > this.lastFailedCount + 10) {
			const now = Date.now();
			if (now - this.lastFailedAlertTime > 300000) {
				alerts.push(`失败邮件快速增长：${stats.failed - this.lastFailedCount} 封邮件失败`);
				this.lastFailedAlertTime = now;
			}
		}

		const healthy = alerts.length === 0 && this.mailService.isAvailable();

		return {
			healthy,
			stats,
			metrics: {
				successRate,
				failedRate,
				throughput: stats.completed
			},
			alerts
		};
	}

	/**
	 * 发送告警通知
	 *
	 * @param alert - 告警信息
	 */
	async sendAlert(alert: string): Promise<void> {
		this.logger.warn(`邮件队列告警：${alert}`);

		try {
			const adminEmail = process.env.ADMIN_EMAIL || 'admin@oksai.io';

			await this.mailService.send({
				to: adminEmail,
				subject: '邮件队列告警',
				html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<title>邮件队列告警</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
	<table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
		<tr>
			<td style="padding: 40px 30px; background-color: #f44336; color: white; text-align: center;">
				<h1 style="margin: 0; font-size: 24px;">邮件队列告警</h1>
			</td>
		</tr>
		<tr>
			<td style="padding: 30px;">
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					检测到邮件队列异常，请及时处理：
				</p>
				<div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
					<p style="margin: 0; color: #856404; line-height: 1.6;">
						${alert}
					</p>
				</div>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					请登录管理后台查看详细信息和采取措施。
				</p>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					<strong>时间：</strong>${new Date().toLocaleString('zh-CN')}
				</p>
			</td>
		</tr>
		<tr>
			<td style="padding: 20px 30px; background-color: #f4f4f4; text-align: center; color: #999999; font-size: 12px;">
				<p style="margin: 0;">
					此邮件由系统自动发送，请勿直接回复。
				</p>
				<p style="margin: 10px 0 0 0;">
					&copy; ${new Date().getFullYear()} OKSAI Platform. All rights reserved.
				</p>
			</td>
		</tr>
	</table>
</body>
</html>
				`,
				text: `邮件队列告警：${alert}\n\n时间：${new Date().toLocaleString('zh-CN')}`
			});
		} catch (error) {
			this.logger.error('发送告警邮件失败', error);
		}
	}

	/**
	 * 获取监控统计信息
	 *
	 * @returns 监控统计信息
	 */
	async getMonitorStats(): Promise<{
		queueHealth: any;
		queueStats: any;
		uptime: number;
		lastCheck: Date;
	}> {
		const queueHealth = await this.getHealthStatus();
		const queueStats = await this.mailQueueProcessor.getStats();

		return {
			queueHealth,
			queueStats,
			uptime: Date.now(),
			lastCheck: new Date()
		};
	}

	/**
	 * 模块销毁
	 */
	onModuleDestroy(): void {
		if (this.monitorInterval) {
			clearInterval(this.monitorInterval);
			this.logger.log('邮件队列监控已停止');
		}

		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.logger.log('邮件队列清理任务已停止');
		}
	}
}
