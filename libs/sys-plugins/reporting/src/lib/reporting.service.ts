import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager, wrap } from '@mikro-orm/core';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { promises as fsPromises } from 'fs';
import { Readable } from 'stream';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import * as crypto from 'crypto';
import { Report, GenerateReportDto, ReportStatus, ReportType } from './entities/reporting.entity';

/**
 * Reporting 服务
 *
 * 提供报表生成和导出功能，支持多种格式（PDF、Excel）
 */
@Injectable()
export class ReportingService {
	private readonly logger = new Logger(ReportingService.name);
	private readonly reportsDir = '/tmp/reports';

	constructor(
		@InjectRepository(Report)
		private readonly reportRepo: EntityRepository<Report>
	) {
		this.ensureReportsDirectory();
	}

	private get em(): EntityManager {
		return this.reportRepo.getEntityManager();
	}

	/**
	 * 确保报告存储目录存在
	 */
	private ensureReportsDirectory(): void {
		if (!existsSync(this.reportsDir)) {
			mkdirSync(this.reportsDir, { recursive: true });
			this.logger.log(`创建报告存储目录: ${this.reportsDir}`);
		}
	}

	/**
	 * 生成报表
	 *
	 * @param reportConfig - 报表配置
	 * @returns Promise<Report>
	 */
	async generateReport(reportConfig: GenerateReportDto): Promise<Report> {
		this.logger.log(`开始生成 ${reportConfig.reportType} 报表: ${reportConfig.reportName}`);

		try {
			const report = this.reportRepo.create({
				name: reportConfig.reportName,
				type: reportConfig.reportType as ReportType,
				description: reportConfig.description,
				templateId: reportConfig.templateId,
				data: reportConfig.data,
				options: reportConfig.options,
				createdBy: reportConfig.userId,
				tenantId: reportConfig.tenantId,
				status: ReportStatus.GENERATING,
				generationStartedAt: new Date()
			});

			this.em.persist(report);
			await this.em.flush();

			const reportId = report.id;
			const fileExtension = reportConfig.reportType === ReportType.PDF ? 'pdf' : 'xlsx';
			const fileName = `${reportId}.${fileExtension}`;
			const filePath = `${this.reportsDir}/${fileName}`;

			let fileBuffer: Buffer;
			let fileHash: string;

			if (reportConfig.reportType === ReportType.PDF) {
				await this.generatePdfBuffer(reportConfig, filePath);
				fileBuffer = await fsPromises.readFile(filePath);
			} else {
				fileBuffer = await this.generateExcelBuffer(reportConfig);
				await this.saveFile(filePath, fileBuffer);
			}

			fileHash = this.calculateFileHash(fileBuffer);

			report.filePath = filePath;
			report.fileUrl = `/api/reporting/reports/${reportId}/download`;
			report.fileSize = fileBuffer.length;
			report.fileHash = fileHash;
			report.status = ReportStatus.COMPLETED;
			report.generationCompletedAt = new Date();

			await this.em.flush();

			this.logger.log(`报表生成成功: ${reportId} - ${filePath} (${fileBuffer.length} bytes)`);
			return report;
		} catch (error) {
			this.logger.error(`报表生成失败: ${reportConfig.reportName}`, error);
			throw new InternalServerErrorException(
				`报表生成失败: ${error instanceof Error ? error.message : '未知错误'}`
			);
		}
	}

	/**
	 * 获取报表列表
	 *
	 * @returns Promise<Report[]>
	 */
	async getAllReports(): Promise<Report[]> {
		const reports = await this.reportRepo.findAll();
		return reports;
	}

	/**
	 * 获取报表详情
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<Report>
	 */
	async getReportById(reportId: string): Promise<Report> {
		const report = await this.reportRepo.findOne({ id: reportId });

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
	async deleteReport(reportId: string): Promise<void> {
		const report = await this.getReportById(reportId);

		this.em.remove(report);
		await this.em.flush();

		this.logger.log(`Report deleted: ${reportId}`);
	}

	/**
	 * 获取报表数据
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<Report>
	 */
	async getReportData(reportId: string): Promise<Report> {
		const report = await this.getReportById(reportId);

		if (!report) {
			throw new NotFoundException(`未找到 ID 为 ${reportId} 的报表`);
		}

		return report;
	}

	/**
	 * 下载报表文件
	 *
	 * @param reportId - 报表 ID
	 * @returns Promise<{ stream: Readable; contentType: string; fileName: string }>
	 */
	async downloadReport(reportId: string): Promise<{ stream: Readable; contentType: string; fileName: string }> {
		const report = await this.getReportById(reportId);

		if (!report.filePath) {
			throw new NotFoundException(`报表文件不存在`);
		}

		if (!existsSync(report.filePath)) {
			throw new NotFoundException(`报表文件已过期或被删除`);
		}

		const stream = createReadStream(report.filePath);
		const contentType =
			report.type === ReportType.PDF
				? 'application/pdf'
				: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		const fileName = `${report.name}.${report.type.toLowerCase()}`;

		this.logger.log(`下载报表: ${reportId} - ${report.filePath}`);

		return { stream, contentType, fileName };
	}

	/**
	 * 生成 PDF 文件
	 *
	 * @param reportConfig - 报表配置
	 * @param filePath - 文件路径
	 * @returns Promise<Buffer>
	 */
	private async generatePdfBuffer(reportConfig: GenerateReportDto, filePath: string): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			try {
				const doc = new PDFDocument({
					size: 'A4',
					margins: { top: 50, bottom: 50, left: 50, right: 50 }
				});

				const writeStream = createWriteStream(filePath);

				doc.pipe(writeStream);

				doc.on('end', () => {
					resolve(Buffer.from(''));
				});

				doc.on('error', (error: Error) => {
					reject(error);
				});

				writeStream.on('finish', () => {
					resolve(Buffer.from(''));
				});

				writeStream.on('error', (error: Error) => {
					reject(error);
				});

				// 添加标题
				doc.fontSize(20).text(reportConfig.reportName, { align: 'center' });
				doc.moveDown();

				// 添加描述
				if (reportConfig.description) {
					doc.fontSize(12).text(reportConfig.description);
					doc.moveDown();
				}

				// 添加数据
				if (reportConfig.data) {
					doc.fontSize(10).text(`生成时间: ${new Date().toLocaleString('zh-CN')}`);
					doc.moveDown();
					doc.fontSize(10).text(JSON.stringify(reportConfig.data, null, 2));
				}

				doc.end();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * 生成 Excel 缓冲区
	 *
	 * @param reportConfig - 报表配置
	 * @returns Promise<Buffer>
	 */
	private async generateExcelBuffer(reportConfig: GenerateReportDto): Promise<Buffer> {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet(reportConfig.reportName);

		// 添加标题
		worksheet.mergeCells('A1:C1');
		const titleCell = worksheet.getCell('A1');
		titleCell.value = reportConfig.reportName;
		titleCell.font = { size: 16, bold: true };
		titleCell.alignment = { horizontal: 'center' };

		// 添加描述
		if (reportConfig.description) {
			worksheet.mergeCells('A2:C2');
			const descCell = worksheet.getCell('A2');
			descCell.value = reportConfig.description;
			descCell.alignment = { horizontal: 'center' };
		}

		// 添加数据
		if (reportConfig.data) {
			let rowIndex = 4;
			const data = reportConfig.data;

			// 如果是数组，添加表头和数据行
			if (Array.isArray(data) && data.length > 0) {
				const headers = Object.keys(data[0]);
				worksheet.addRow(headers);

				data.forEach((row) => {
					worksheet.addRow(Object.values(row));
				});
			} else {
				// 如果是对象，添加键值对
				Object.entries(data).forEach(([key, value]) => {
					worksheet.addRow([key, value]);
				});
			}

			// 添加生成时间
			worksheet.addRow([]);
			worksheet.addRow(['生成时间', new Date().toLocaleString('zh-CN')]);
		}

		// 自动调整列宽
		worksheet.columns.forEach((column) => {
			if (column.eachCell) {
				let maxLength = 0;
				column.eachCell({ includeEmpty: true }, (cell) => {
					const cellValue = cell.value ? cell.value.toString() : '';
					maxLength = Math.max(maxLength, cellValue.length);
				});
				column.width = Math.min(maxLength + 2, 50);
			}
		});

		const buffer = await workbook.xlsx.writeBuffer();
		return buffer as unknown as Buffer;
	}

	/**
	 * 保存文件到磁盘
	 *
	 * @param filePath - 文件路径
	 * @param buffer - 文件缓冲区
	 * @returns Promise<void>
	 */
	private async saveFile(filePath: string, buffer: Buffer): Promise<void> {
		await fsPromises.writeFile(filePath, buffer);
		this.logger.debug(`文件已保存: ${filePath} (${buffer.length} bytes)`);
	}

	/**
	 * 计算文件哈希
	 *
	 * @param buffer - 文件缓冲区
	 * @returns string - SHA256 哈希值
	 */
	private calculateFileHash(buffer: Buffer): string {
		return crypto.createHash('sha256').update(buffer).digest('hex');
	}

	/**
	 * 删除文件
	 *
	 * @param filePath - 文件路径
	 * @returns Promise<void>
	 */
	private async deleteFile(filePath: string): Promise<void> {
		if (existsSync(filePath)) {
			await fsPromises.unlink(filePath);
			this.logger.debug(`文件已删除: ${filePath}`);
		}
	}
}
