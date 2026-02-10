import {
	Entity,
	PrimaryKey,
	Property,
	ManyToOne,
	OneToMany,
	ManyToMany,
	ManyToOneOptions,
	OneToManyOptions,
	ManyToManyOptions,
	Enum,
	Index
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';

/**
 * 审计日志操作类型枚举
 */
export enum AuditLogAction {
	/** 创建操作 */
	CREATE = 'CREATE',
	/** 更新操作 */
	UPDATE = 'UPDATE',
	/** 删除操作 */
	DELETE = 'DELETE',
	/** 登录操作 */
	LOGIN = 'LOGIN',
	/** 登出操作 */
	LOGOUT = 'LOGOUT',
	/** 注册操作 */
	REGISTER = 'REGISTER',
	/** 修改密码操作 */
	PASSWORD_CHANGE = 'PASSWORD_CHANGE',
	/** 重置密码操作 */
	PASSWORD_RESET = 'PASSWORD_RESET',
	/** 验证邮箱操作 */
	EMAIL_VERIFY = 'EMAIL_VERIFY'
}

/**
 * 审计日志实体类型枚举
 */
export enum AuditLogEntityType {
	/** 用户实体 */
	USER = 'USER',
	/** 租户实体 */
	TENANT = 'TENANT',
	/** 组织实体 */
	ORGANIZATION = 'ORGANIZATION',
	/** 角色实体 */
	ROLE = 'ROLE',
	/** 权限实体 */
	PERMISSION = 'PERMISSION'
}

/**
 * 审计日志实体
 *
 * 记录系统中的所有操作和变更，用于审计追踪和安全监控
 */
@Entity({ tableName: 'audit_logs' })
@Index({ name: 'idx_audit_tenant', properties: ['tenantId'] })
@Index({ name: 'idx_audit_user', properties: ['userId'] })
@Index({ name: 'idx_audit_action', properties: ['action'] })
@Index({ name: 'idx_audit_entity', properties: ['entityId'] })
export class AuditLog {
	/** 主键 ID */
	@PrimaryKey()
	id: string = randomUUID();

	/** 创建时间 */
	@Property({ defaultRaw: 'now()' })
	createdAt = new Date();

	/** 更新时间 */
	@Property({ defaultRaw: 'now()', onUpdate: () => new Date() })
	updatedAt = new Date();

	/** 删除时间（软删除） */
	@Property({ nullable: true })
	deletedAt?: Date;
	/** 操作用户 ID（可为空，表示系统操作） */
	@Property({ nullable: true })
	userId?: string;

	/** 租户 ID */
	@Property()
	tenantId!: string;

	/** 受影响的实体类型 */
	@Property()
	entityType!: AuditLogEntityType;

	/** 操作类型 */
	@Property()
	action!: AuditLogAction;

	/** 受影响的实体 ID */
	@Property({ nullable: true })
	entityId?: string;

	/** 受影响的实体名称（用于显示） */
	@Property({ nullable: true })
	entityName?: string;

	/** 修改前的值（用于 UPDATE 操作） */
	@Property({ nullable: true })
	oldValue?: string;

	/** 修改后的值（用于 UPDATE 操作） */
	@Property({ nullable: true })
	newValue?: string;

	/** 操作描述信息 */
	@Property({ nullable: true })
	description?: string;

	/** 操作发起者的 IP 地址 */
	@Property({ nullable: true })
	ipAddress?: string;

	/** 操作发起者的 User-Agent */
	@Property({ nullable: true })
	userAgent?: string;

	/** 请求 ID（用于追踪请求链路） */
	@Property({ nullable: true })
	requestId?: string;

	/** 日志级别（默认：INFO） */
	@Property({ default: 'INFO' })
	logLevel: string = 'INFO';
}
