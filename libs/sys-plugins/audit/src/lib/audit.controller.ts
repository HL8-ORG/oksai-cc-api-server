import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto, QueryAuditLogDto } from './dto/audit-log.dto';

/**
 * 审计日志控制器
 *
 * 提供审计日志管理相关的 API 端点，包括审计日志的创建、查询、统计和清理
 */
@Controller('audit-logs')
export class AuditController {
	constructor(private readonly auditService: AuditService) {}

	/**
	 * 创建审计日志
	 *
	 * 记录系统操作和变更的审计日志
	 *
	 * @param createAuditLogDto - 审计日志创建数据
	 * @returns 已创建的审计日志
	 *
	 * @example
	 * ```bash
	 * POST /audit-logs
	 * {
	 *   "entityType": "USER",
	 *   "action": "CREATE",
	 *   "entityId": "user-123",
	 *   "entityName": "John Doe",
	 *   "userId": "admin-123",
	 *   "tenantId": "tenant-123",
	 *   "description": "创建新用户",
	 *   "metadata": { "role": "USER" }
	 * }
	 * ```
	 */
	@Post()
	async create(@Body() createAuditLogDto: CreateAuditLogDto) {
		return this.auditService.create(createAuditLogDto);
	}

	/**
	 * 查询审计日志列表
	 *
	 * 分页查询审计日志，支持按多种条件筛选
	 *
	 * @param query - 查询参数
	 * @returns 包含审计日志列表和总数的响应
	 *
	 * @example
	 * ```bash
	 * GET /audit-logs?entityType=USER&action=CREATE&tenantId=tenant-123&page=1&limit=10
	 * ```
	 */
	@Get()
	async findAll(@Query() query: QueryAuditLogDto) {
		return this.auditService.findAll(query);
	}

	/**
	 * 根据 ID 查找审计日志
	 *
	 * @param id - 审计日志 ID
	 * @returns 审计日志实体
	 *
	 * @example
	 * ```bash
	 * GET /audit-logs/:id
	 * ```
	 */
	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.auditService.findOne(id);
	}

	/**
	 * 根据用户 ID 查询审计日志
	 *
	 * 查询指定用户的所有审计日志
	 *
	 * @param userId - 用户 ID
	 * @param query - 查询参数
	 * @returns 包含审计日志列表和总数的响应
	 *
	 * @example
	 * ```bash
	 * GET /audit-logs/user/:userId?page=1&limit=10
	 * ```
	 */
	@Get('user/:userId')
	async findByUserId(@Param('userId') userId: string, @Query() query: QueryAuditLogDto) {
		return this.auditService.findByUserId(userId, query);
	}

	/**
	 * 根据租户 ID 查询审计日志
	 *
	 * 查询指定租户的所有审计日志
	 *
	 * @param tenantId - 租户 ID
	 * @param query - 查询参数
	 * @returns 包含审计日志列表和总数的响应
	 *
	 * @example
	 * ```bash
	 * GET /audit-logs/tenant/:tenantId?page=1&limit=10
	 * ```
	 */
	@Get('tenant/:tenantId')
	async findByTenantId(@Param('tenantId') tenantId: string, @Query() query: QueryAuditLogDto) {
		return this.auditService.findByTenantId(tenantId, query);
	}

	/**
	 * 获取审计统计信息
	 *
	 * 统计指定租户在指定时间范围内的审计日志数据
	 *
	 * @param tenantId - 租户 ID
	 * @param query - 查询参数（包含开始日期和结束日期）
	 * @returns 审计统计信息
	 *
	 * @example
	 * ```bash
	 * GET /audit-logs/stats/:tenantId?startDate=2024-01-01&endDate=2024-12-31
	 * ```
	 */
	@Get('stats/:tenantId')
	async getStats(@Param('tenantId') tenantId: string, @Query() query: { startDate?: string; endDate?: string }) {
		return this.auditService.getAuditStats(tenantId, query.startDate, query.endDate);
	}

	/**
	 * 清理旧审计日志
	 *
	 * 删除指定天数之前的所有审计日志
	 *
	 * @param body - 包含保留天数的请求体
	 * @returns 包含已删除日志数量的响应
	 *
	 * @example
	 * ```bash
	 * POST /audit-logs/cleanup
	 * {
	 *   "daysToKeep": 90
	 * }
	 * ```
	 */
	@Post('cleanup')
	async cleanup(@Body() body: { daysToKeep?: number }) {
		const deletedCount = await this.auditService.cleanupOldLogs(body.daysToKeep);
		return { deletedCount };
	}
}
