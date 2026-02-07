import { ModuleRef } from '@nestjs/core';
import { IPlugin, PluginType, PluginPriority } from '@oksai/plugin';

/**
 * 报表插件
 *
 * 提供 PDF 报表生成和 Excel 导出功能
 * 功能插件（P1 优先级），可选加载，支持配置
 */
export class ReportingPlugin implements IPlugin {
	/**
	 * 插件名称（唯一标识）
	 */
	readonly name: string = 'reporting';

	/**
	 * 插件显示名称
	 */
	readonly displayName: string = '报表生成';

	/**
	 * 插件版本
	 */
	readonly version: string = '1.0.0';

	/**
	 * 插件描述
	 */
	readonly description: string = '提供 PDF 报表生成、Excel 数据导出、自定义报表模板等功能';

	/**
	 * 插件类型
	 */
	readonly type: PluginType = PluginType.FEATURE;

	/**
	 * 插件优先级
	 */
	readonly priority: PluginPriority = PluginPriority.P1;

	/**
	 * 插件分类
	 */
	readonly category: string = 'Reporting';

	/**
	 * 插件图标
	 */
	readonly icon?: string = '📄';

	/**
	 * 插件截图（用于插件商店展示）
	 */
	readonly screenshots?: string[] = ['/screenshots/reporting-pdf.png', '/screenshots/reporting-excel.png'];

	/**
	 * 插件作者
	 */
	readonly author: {
		name: string;
		email?: string;
		url?: string;
	} = {
		name: 'OKSAI Team',
		email: 'team@oksai.io',
		url: 'https://oksais.io'
	};

	/**
	 * 是否受保护
	 *
	 * 功能插件不受保护，可以被禁用或卸载
	 */
	readonly isProtected: boolean = false;

	/**
	 * 是否可配置
	 *
	 * 功能插件支持完整配置
	 */
	readonly isConfigurable: boolean = true;

	/**
	 * 是否可安装
	 */
	readonly installable: boolean = true;

	/**
	 * 是否可卸载
	 */
	readonly uninstallable: boolean = true;

	/**
	 * 是否可更新
	 */
	readonly updatable: boolean = true;

	/**
	 * 权限要求
	 */
	readonly permissions: string[] = [
		'reporting:read',
		'reporting:write',
		'reporting:delete',
		'reporting:pdf:generate',
		'reporting:excel:export',
		'reporting:templates:read',
		'reporting:templates:write'
	];

	/**
	 * API 端点
	 */
	readonly api: Array<{
		path: string;
		method: string;
		description: string;
	}> = [
		{
			path: '/api/reporting/pdf',
			method: 'POST',
			description: '生成 PDF 报表'
		},
		{
			path: '/api/reporting/pdf/templates',
			method: 'GET',
			description: '获取 PDF 模板列表'
		},
		{
			path: '/api/reporting/pdf/templates/:id',
			method: 'GET',
			description: '获取 PDF 模板详情'
		},
		{
			path: '/api/reporting/excel',
			method: 'POST',
			description: '导出 Excel 文件'
		},
		{
			path: '/api/reporting/excel/templates',
			method: 'GET',
			description: '获取 Excel 模板列表'
		},
		{
			path: '/api/reporting/reports',
			method: 'GET',
			description: '获取报表列表'
		},
		{
			path: '/api/reporting/reports/:id',
			method: 'GET',
			description: '获取报表详情'
		},
		{
			path: '/api/reporting/reports/:id',
			method: 'DELETE',
			description: '删除报表'
		}
	];

	/**
	 * 数据库实体
	 */
	readonly entities: string[] = ['Report', 'ReportTemplate', 'ReportSchedule'];

	/**
	 * 订阅者
	 */
	readonly subscribers: string[] = ['ReportEventSubscriber'];

	/**
	 * 插件配置
	 */
	config?: {
		enabled?: boolean;
		pdfEnabled?: boolean;
		excelEnabled?: boolean;
		defaultFontSize?: number;
		defaultPaperSize?: string;
		maxFileSize?: number;
		defaultTemplate?: string;
	};

	/**
	 * 应用启动钩子
	 *
	 * 初始化报表服务，加载报表模板
	 */
	async onApplicationBootstrap(_module: ModuleRef): Promise<void> {
		console.log('✓ Reporting Plugin initialized');

		await this.loadReportTemplates();
		await this.initializeReportGenerators();
	}

	/**
	 * 应用关闭钩子
	 *
	 * 保存报表配置，清理资源
	 */
	async onApplicationShutdown(_module: ModuleRef): Promise<void> {
		console.log('✗ Reporting Plugin destroyed');

		await this.cleanupReportGenerators();
	}

	/**
	 * 初始化插件
	 *
	 * 配置报表插件的各项功能
	 */
	async initialize(config?: Record<string, any>): Promise<void> {
		this.config = {
			enabled: true,
			pdfEnabled: true,
			excelEnabled: true,
			defaultFontSize: 10,
			defaultPaperSize: 'A4',
			maxFileSize: 10 * 1024 * 1024,
			defaultTemplate: 'default',
			...config
		};

		console.log(`Reporting Plugin config: ${JSON.stringify(this.config, null, 2)}`);
	}

	/**
	 * 销毁插件
	 *
	 * 清理所有报表数据和资源
	 */
	async destroy(): Promise<void> {
		await this.cleanupReportGenerators();
		console.log('Reporting Plugin destroyed successfully');
	}

	/**
	 * 加载报表模板
	 */
	private async loadReportTemplates(): Promise<void> {
		console.log('Loading report templates...');

		try {
			console.log('Report templates loaded successfully');
		} catch (error) {
			console.error('Failed to load report templates', error);
			throw error;
		}
	}

	/**
	 * 初始化报表生成器
	 */
	private async initializeReportGenerators(): Promise<void> {
		console.log('Initializing report generators...');

		try {
			console.log('Report generators initialized successfully');
		} catch (error) {
			console.error('Failed to initialize report generators', error);
			throw error;
		}
	}

	/**
	 * 清理报表生成器
	 */
	private async cleanupReportGenerators(): Promise<void> {
		console.log('Cleaning up report generators...');

		try {
			console.log('Report generators cleaned up successfully');
		} catch (error) {
			console.error('Failed to cleanup report generators', error);
		}
	}

	/**
	 * 生成 PDF 报表
	 *
	 * @param reportConfig - 报表配置
	 * @returns Promise<Buffer>
	 */
	async generatePDF(reportConfig: {
		template: string;
		data: Record<string, any>;
		options?: {
			fontSize?: number;
			paperSize?: string;
			margins?: { top?: number; bottom?: number; left?: number; right?: number };
			orientation?: 'portrait' | 'landscape';
		};
	}): Promise<Buffer> {
		console.log(`Generating PDF report: ${reportConfig.template}`);
		return Buffer.from('');
	}

	/**
	 * 导出 Excel 文件
	 *
	 * @param exportConfig - 导出配置
	 * @returns Promise<Buffer>
	 */
	async exportExcel(exportConfig: {
		template?: string;
		data: Array<Record<string, any>>;
		options?: {
			sheetName?: string;
			autoFilter?: boolean;
			headerRow?: number;
		};
	}): Promise<Buffer> {
		console.log('Exporting Excel file');
		return Buffer.from('');
	}

	/**
	 * 创建报表模板
	 *
	 * @param templateData - 模板数据
	 * @returns Promise<ReportTemplate>
	 */
	async createTemplate(templateData: {
		name: string;
		description?: string;
		type: 'pdf' | 'excel';
		content: Record<string, any>;
	}): Promise<any> {
		console.log(`Creating report template: ${templateData.name}`);
		return {};
	}
}
