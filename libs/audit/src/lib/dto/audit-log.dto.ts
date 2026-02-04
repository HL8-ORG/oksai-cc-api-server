import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsInt, Min, Max } from 'class-validator';

/**
 * 创建审计日志 DTO
 *
 * 用于创建审计日志的数据传输对象
 */
export class CreateAuditLogDto {
	/** 操作用户 ID（可选，表示系统操作） */
	@IsString()
	userId?: string;

	/** 租户 ID（非空） */
	@IsString()
	tenantId!: string;

	/** 实体类型（非空：USER、TENANT、ORGANIZATION、ROLE、PERMISSION） */
	@IsEnum(['USER', 'TENANT', 'ORGANIZATION', 'ROLE', 'PERMISSION'])
	entityType!: 'USER' | 'TENANT' | 'ORGANIZATION' | 'ROLE' | 'PERMISSION';

	/** 操作类型（非空） */
	@IsEnum([
		'CREATE',
		'UPDATE',
		'DELETE',
		'LOGIN',
		'LOGOUT',
		'REGISTER',
		'PASSWORD_CHANGE',
		'PASSWORD_RESET',
		'EMAIL_VERIFY'
	])
	action!:
		| 'CREATE'
		| 'UPDATE'
		| 'DELETE'
		| 'LOGIN'
		| 'LOGOUT'
		| 'REGISTER'
		| 'PASSWORD_CHANGE'
		| 'PASSWORD_RESET'
		| 'EMAIL_VERIFY';

	/** 受影响的实体 ID（可选） */
	@IsOptional()
	@IsString()
	entityId?: string;

	/** 受影响的实体名称（可选，用于显示） */
	@IsOptional()
	@IsString()
	entityName?: string;

	/** 修改前的值（可选，用于 UPDATE 操作） */
	@IsOptional()
	@IsString()
	oldValue?: string;

	/** 修改后的值（可选，用于 UPDATE 操作） */
	@IsOptional()
	@IsString()
	newValue?: string;

	/** 操作描述信息（可选） */
	@IsOptional()
	@IsString()
	description?: string;

	/** 操作发起者的 IP 地址（可选） */
	@IsOptional()
	@IsString()
	ipAddress?: string;

	/** 操作发起者的 User-Agent（可选） */
	@IsOptional()
	@IsString()
	userAgent?: string;

	/** 请求 ID（可选，用于追踪请求链路） */
	@IsOptional()
	@IsUUID()
	requestId?: string;

	/** 日志级别（可选：DEBUG、INFO、WARN、ERROR、CRITICAL） */
	@IsOptional()
	@IsEnum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'])
	logLevel?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
}

/**
 * 查询审计日志 DTO
 *
 * 用于查询审计日志列表的数据传输对象
 */
export class QueryAuditLogDto {
	/** 搜索关键词（可选，用于搜索实体名称和描述） */
	@IsOptional()
	@IsString()
	search?: string;

	/** 实体类型（可选） */
	@IsOptional()
	@IsEnum(['USER', 'TENANT', 'ORGANIZATION', 'ROLE', 'PERMISSION'])
	entityType?: 'USER' | 'TENANT' | 'ORGANIZATION' | 'ROLE' | 'PERMISSION';

	/** 操作类型（可选） */
	@IsOptional()
	@IsEnum([
		'CREATE',
		'UPDATE',
		'DELETE',
		'LOGIN',
		'LOGOUT',
		'REGISTER',
		'PASSWORD_CHANGE',
		'PASSWORD_RESET',
		'EMAIL_VERIFY'
	])
	action?:
		| 'CREATE'
		| 'UPDATE'
		| 'DELETE'
		| 'LOGIN'
		| 'LOGOUT'
		| 'REGISTER'
		| 'PASSWORD_CHANGE'
		| 'PASSWORD_RESET'
		| 'EMAIL_VERIFY';

	/** 用户 ID（可选） */
	@IsOptional()
	@IsString()
	userId?: string;

	/** 租户 ID（可选） */
	@IsOptional()
	@IsString()
	tenantId?: string;

	/** 开始日期（可选） */
	@IsOptional()
	@IsDateString()
	startDate?: string;

	/** 结束日期（可选） */
	@IsOptional()
	@IsDateString()
	endDate?: string;

	/** 日志级别（可选） */
	@IsOptional()
	@IsString()
	logLevel?: string;

	/** 页码（可选，最小 1） */
	@IsOptional()
	@IsInt()
	@Min(1)
	page?: number;

	/** 每页数量（可选，最小 1，最大 100） */
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;
}
