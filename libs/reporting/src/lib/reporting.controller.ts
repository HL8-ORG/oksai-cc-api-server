import {
	Controller,
	Get,
	Post,
	Delete,
	Param,
	Query,
	Body,
	NotFoundException,
	StreamableFile,
	Header
} from '@nestjs/common';
import { Readable } from 'stream';
import { ReportingService } from './reporting.service';
import { GenerateReportDto, Report as ReportEntity } from './entities/reporting.entity';

/**
 * Reporting 控制器
 *
 * 提供报表生成和导出功能的 API 端点
 */
@Controller('api/reporting')
export class ReportingController {
	constructor(private readonly reportingService: ReportingService) {}

	/**
	 * 生成报表
	 *
	 * @param reportConfig - 报表配置
	 * @returns Promise<ReportEntity>
	 */
	@Post('reports')
	async generateReport(@Body() reportConfig: GenerateReportDto): Promise<ReportEntity> {
		const report = await this.reportingService.generateReport(reportConfig);
		return report;
	}

	/**
	 * 获取报表列表
	 *
	 * @returns Promise<ReportEntity[]>
	 */
	@Get('reports')
	async getAllReports(): Promise<ReportEntity[]> {
		const reports = await this.reportingService.getAllReports();
		return reports;
	}

	/**
	 * 获取报表详情
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<ReportEntity>
	 */
	@Get('reports/:id')
	async getReportById(@Param('id') reportId: string): Promise<ReportEntity> {
		const report = await this.reportingService.getReportById(reportId);

		if (!report) {
			throw new NotFoundException(`未找到 ID 为 ${reportId} 的报表`);
		}

		return report;
	}

	/**
	 * 获取报表数据
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<ReportEntity>
	 */
	@Get('reports/:id/data')
	async getReportData(@Param('id') reportId: string): Promise<ReportEntity> {
		const report = await this.reportingService.getReportById(reportId);

		if (!report) {
			throw new NotFoundException(`未找到 ID 为 ${reportId} 的报表`);
		}

		return report;
	}

	/**
	 * 删除报表
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<void>
	 */
	@Delete('reports/:id')
	async deleteReport(@Param('id') reportId: string): Promise<void> {
		await this.reportingService.deleteReport(reportId);
	}

	/**
	 * 下载报表文件
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<StreamableFile>
	 */
	@Get('reports/:id/download')
	async downloadReport(@Param('id') reportId: string) {
		const { stream, contentType, fileName } = await this.reportingService.downloadReport(reportId);

		return new StreamableFile(stream as unknown as Readable, {
			type: contentType,
			disposition: `attachment; filename="${fileName}"`
		});
	}
}
