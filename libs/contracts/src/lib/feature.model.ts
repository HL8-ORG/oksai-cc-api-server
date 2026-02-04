import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model';

/**
 * 功能接口
 */
export interface IFeature extends IBasePerTenantAndOrganizationEntityModel {
	/** 功能代码 */
	code: FeatureEnum;
	/** 功能描述 */
	description: string;
	/** 功能组织 */
	featureOrganizations?: IFeatureOrganization[];
	/** 功能图片 */
	image: string;
	/** 功能图片 URL（只读） */
	readonly imageUrl?: string;
	/** 功能链接 */
	link: string;
	/** 功能名称 */
	name: string;
	/** 功能状态 */
	status: string;
	/** 功能图标 */
	icon: string;
	/** 功能是否启用 */
	isEnabled?: boolean;
	/** 功能是否付费 */
	isPaid?: boolean;
	/** 父功能 ID（只读） */
	readonly parentId?: string;
	/** 父功能 */
	parent?: IFeature;
	/** 子功能列表 */
	children?: IFeature[];
}

/**
 * 功能创建输入
 */
export interface IFeatureCreateInput extends IFeature {
	/** 功能是否启用 */
	isEnabled: boolean;
}

/**
 * 功能组织接口
 */
export interface IFeatureOrganization extends IBasePerTenantAndOrganizationEntityModel {
	/** 功能 */
	feature: IFeature;
	/** 功能 ID */
	featureId?: string;
	/** 功能是否启用 */
	isEnabled: boolean;
}

/**
 * 功能组织更新输入
 */
export interface IFeatureOrganizationUpdateInput extends IBasePerTenantAndOrganizationEntityModel {
	/** 功能 ID */
	featureId: string;
	/** 功能是否启用 */
	isEnabled: boolean;
}

/**
 * 功能组织查找输入
 */
export interface IFeatureOrganizationFindInput extends IBasePerTenantAndOrganizationEntityModel {
	/** 功能 ID */
	featureId?: string;
}

/**
 * 功能状态枚举
 */
export enum FeatureStatusEnum {
	INFO = 'info',
	PRIMARY = 'primary',
	SUCCESS = 'success',
	WARNING = 'warning'
}

/**
 * 功能开关类型枚举
 */
export enum IFeatureToggleTypeEnum {
	/** 发布 */
	RELEASE = 'release',
	/** 终止开关 */
	KILL_SWITCH = 'kill-switch',
	/** 实验 */
	EXPERIMENT = 'experiment',
	/** 操作性 */
	OPERATIONAL = 'operational',
	/** 权限 */
	PERMISSION = 'permission'
}

/**
 * 功能开关变体接口
 */
export interface IFeatureToggleVariant {
	/** 变体名称 */
	name?: string;
	/** 变体权重 */
	weight?: number;
	/** 权重类型 */
	weightType?: string;
	/** 变体负载 */
	payload?: IFeatureTogglePayload;
	/** 变体覆盖 */
	overrides?: IFeatureToggleOverride[];
}

/**
 * 功能开关覆盖接口
 */
export interface IFeatureToggleOverride {
	/** 上下文名称 */
	contextName?: string;
	/** 值列表 */
	values?: string[];
}

/**
 * 功能开关负载接口
 */
export interface IFeatureTogglePayload {
	/** 类型 */
	type?: string;
	/** 值 */
	value?: string;
}

/**
 * 功能开关接口
 */
export interface IFeatureToggle {
	/** 名称 */
	name: string;
	/** 描述 */
	description?: string;
	/** 类型 */
	type: IFeatureToggleTypeEnum;
	/** 项目 */
	project?: string;
	/** 是否启用 */
	enabled: boolean;
	/** 是否过期 */
	stale?: boolean;
	/** 策略 */
	strategies?: any;
	/** 变体列表 */
	variants?: IFeatureToggleVariant[];
	/** 创建日期 */
	createdAt?: string;
	/** 最后见日期 */
	lastSeenAt?: string | null;
}

/**
 * 功能枚举
 */
export enum FeatureEnum {
	/** 仪表板功能 */
	FEATURE_DASHBOARD = 'FEATURE_DASHBOARD',
	/** 时间跟踪功能 */
	FEATURE_TIME_TRACKING = 'FEATURE_TIME_TRACKING',
	/** 估算功能 */
	FEATURE_ESTIMATE = 'FEATURE_ESTIMATE',
	/** 收到估算功能 */
	FEATURE_ESTIMATE_RECEIVED = 'FEATURE_ESTIMATE_RECEIVED',
	/** 发票功能 */
	FEATURE_INVOICE = 'FEATURE_INVOICE',
	/** 循环发票功能 */
	FEATURE_INVOICE_RECURRING = 'FEATURE_INVOICE_RECURRING',
	/** 收到发票功能 */
	FEATURE_INVOICE_RECEIVED = 'FEATURE_INVOICE_RECEIVED',
	/** 收入功能 */
	FEATURE_INCOME = 'FEATURE_INCOME',
	/** 支出功能 */
	FEATURE_EXPENSE = 'FEATURE_EXPENSE',
	/** 支付功能 */
	FEATURE_PAYMENT = 'FEATURE_PAYMENT',
	/** 提案功能 */
	FEATURE_PROPOSAL = 'FEATURE_PROPOSAL',
	/** 提案模板功能 */
	FEATURE_PROPOSAL_TEMPLATE = 'FEATURE_PROPOSAL_TEMPLATE',
	/** 流程功能 */
	FEATURE_PIPELINE = 'FEATURE_PIPELINE',
	/** 流程交易功能 */
	FEATURE_PIPELINE_DEAL = 'FEATURE_PIPELINE_DEAL',
	/** 仪表板任务功能 */
	FEATURE_DASHBOARD_TASK = 'FEATURE_DASHBOARD_TASK',
	/** 团队任务功能 */
	FEATURE_TEAM_TASK = 'FEATURE_TEAM_TASK',
	/** 我的任务功能 */
	FEATURE_MY_TASK = 'FEATURE_MY_TASK',
	/** 工作功能 */
	FEATURE_JOB = 'FEATURE_JOB',
	/** 员工功能 */
	FEATURE_EMPLOYEES = 'FEATURE_EMPLOYEES',
	/** 员工时间活动功能 */
	FEATURE_EMPLOYEE_TIME_ACTIVITY = 'FEATURE_EMPLOYEE_TIME_ACTIVITY',
	/** 员工工时表功能 */
	FEATURE_EMPLOYEE_TIMESHEETS = 'FEATURE_EMPLOYEE_TIMESHEETS',
	/** 员工预约功能 */
	FEATURE_EMPLOYEE_APPOINTMENT = 'FEATURE_EMPLOYEE_APPOINTMENT',
	/** 员工审批功能 */
	FEATURE_EMPLOYEE_APPROVAL = 'FEATURE_EMPLOYEE_APPROVAL',
	/** 员工审批策略功能 */
	FEATURE_EMPLOYEE_APPROVAL_POLICY = 'FEATURE_EMPLOYEE_APPROVAL_POLICY',
	/** 员工级别功能 */
	FEATURE_EMPLOYEE_LEVEL = 'FEATURE_EMPLOYEE_LEVEL',
	/** 员工职位功能 */
	FEATURE_EMPLOYEE_POSITION = 'FEATURE_EMPLOYEE_POSITION',
	/** 员工休假功能 */
	FEATURE_EMPLOYEE_TIMEOFF = 'FEATURE_EMPLOYEE_TIMEOFF',
	/** 员工循环支出功能 */
	FEATURE_EMPLOYEE_RECURRING_EXPENSE = 'FEATURE_EMPLOYEE_RECURRING_EXPENSE',
	/** 员工候选人功能 */
	FEATURE_EMPLOYEE_CANDIDATE = 'FEATURE_EMPLOYEE_CANDIDATE',
	/** 管理面试功能 */
	FEATURE_MANAGE_INTERVIEW = 'FEATURE_MANAGE_INTERVIEW',
	/** 管理邀请功能 */
	FEATURE_MANAGE_INVITE = 'FEATURE_MANAGE_INVITE',
	/** 组织功能 */
	FEATURE_ORGANIZATION = 'FEATURE_ORGANIZATION',
	/** 组织设备功能 */
	FEATURE_ORGANIZATION_EQUIPMENT = 'FEATURE_ORGANIZATION_EQUIPMENT',
	/** 组织库存功能 */
	FEATURE_ORGANIZATION_INVENTORY = 'FEATURE_ORGANIZATION_INVENTORY',
	/** 组织标签功能 */
	FEATURE_ORGANIZATION_TAG = 'FEATURE_ORGANIZATION_TAG',
	/** 组织供应商功能 */
	FEATURE_ORGANIZATION_VENDOR = 'FEATURE_ORGANIZATION_VENDOR',
	/** 组织项目功能 */
	FEATURE_ORGANIZATION_PROJECT = 'FEATURE_ORGANIZATION_PROJECT',
	/** 组织部门功能 */
	FEATURE_ORGANIZATION_DEPARTMENT = 'FEATURE_ORGANIZATION_DEPARTMENT',
	/** 组织团队功能 */
	FEATURE_ORGANIZATION_TEAM = 'FEATURE_ORGANIZATION_TEAM',
	/** 组织文档功能 */
	FEATURE_ORGANIZATION_DOCUMENT = 'FEATURE_ORGANIZATION_DOCUMENT',
	/** 组织雇佣类型功能 */
	FEATURE_ORGANIZATION_EMPLOYMENT_TYPE = 'FEATURE_ORGANIZATION_EMPLOYMENT_TYPE',
	/** 组织循环支出功能 */
	FEATURE_ORGANIZATION_RECURRING_EXPENSE = 'FEATURE_ORGANIZATION_RECURRING_EXPENSE',
	/** 组织帮助中心功能 */
	FEATURE_ORGANIZATION_HELP_CENTER = 'FEATURE_ORGANIZATION_HELP_CENTER',
	/** 联系人功能 */
	FEATURE_CONTACT = 'FEATURE_CONTACT',
	/** 目标功能 */
	FEATURE_GOAL = 'FEATURE_GOAL',
	/** 目标报告功能 */
	FEATURE_GOAL_REPORT = 'FEATURE_GOAL_REPORT',
	/** 目标设置功能 */
	FEATURE_GOAL_SETTING = 'FEATURE_GOAL_SETTING',
	/** 报告功能 */
	FEATURE_REPORT = 'FEATURE_REPORT',
	/** 用户功能 */
	FEATURE_USER = 'FEATURE_USER',
	/** 组织功能（复数） */
	FEATURE_ORGANIZATIONS = 'FEATURE_ORGANIZATIONS',
	/** 应用集成功能 */
	FEATURE_APP_INTEGRATION = 'FEATURE_APP_INTEGRATION',
	/** 设置功能 */
	FEATURE_SETTING = 'FEATURE_SETTING',
	/** 邮件历史功能 */
	FEATURE_EMAIL_HISTORY = 'FEATURE_EMAIL_HISTORY',
	/** 邮件模板功能 */
	FEATURE_EMAIL_TEMPLATE = 'FEATURE_EMAIL_TEMPLATE',
	/** 导入导出功能 */
	FEATURE_IMPORT_EXPORT = 'FEATURE_IMPORT_EXPORT',
	/** 文件存储功能 */
	FEATURE_FILE_STORAGE = 'FEATURE_FILE_STORAGE',
	/** 支付网关功能 */
	FEATURE_PAYMENT_GATEWAY = 'FEATURE_PAYMENT_GATEWAY',
	/** 短信网关功能 */
	FEATURE_SMS_GATEWAY = 'FEATURE_SMS_GATEWAY',
	/** SMTP 功能 */
	FEATURE_SMTP = 'FEATURE_SMTP',
	/** 角色权限功能 */
	FEATURE_ROLES_PERMISSION = 'FEATURE_ROLES_PERMISSION',
	/** 邮件验证功能 */
	FEATURE_EMAIL_VERIFICATION = 'FEATURE_EMAIL_VERIFICATION',
	/** 开放统计功能（启用/禁用全局开放统计端点配置） */
	FEATURE_OPEN_STATS = 'FEATURE_OPEN_STATS',

	/** 定义与用户认证方法相关的功能标志和设置 */
	/** 邮箱密码登录 */
	FEATURE_EMAIL_PASSWORD_LOGIN = 'FEATURE_EMAIL_PASSWORD_LOGIN',
	/** 魔法登录 */
	FEATURE_MAGIC_LOGIN = 'FEATURE_MAGIC_LOGIN',
	/** GitHub 登录 */
	FEATURE_GITHUB_LOGIN = 'FEATURE_GITHUB_LOGIN',
	/** Google 登录 */
	FEATURE_GOOGLE_LOGIN = 'FEATURE_GOOGLE_LOGIN',
	/** Microsoft 登录 */
	FEATURE_MICROSOFT_LOGIN = 'FEATURE_MICROSOFT_LOGIN'
}

/**
 * 认证功能标志接口
 *
 * 定义标志功能用于用户身份验证方法
 */
export interface IAuthenticationFlagFeatures {
	/** 标志指示邮箱/密码登录是否启用 */
	FEATURE_EMAIL_PASSWORD_LOGIN: boolean;

	/** 标志指示魔法登录是否启用 */
	FEATURE_MAGIC_LOGIN: boolean;

	/** 标志指示 GitHub 登录是否启用 */
	FEATURE_GITHUB_LOGIN: boolean;

	/** 标志指示 Google 登录是否启用 */
	FEATURE_GOOGLE_LOGIN: boolean;

	/** 标志指示 Microsoft 登录是否启用 */
	FEATURE_MICROSOFT_LOGIN: boolean;
}
