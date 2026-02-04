/**
 * 环境配置接口
 *
 * 定义应用程序的环境变量配置接口，包括服务器配置、认证配置、第三方集成配置等
 */

import { FileStorageProviderEnum } from '@oksai/contracts';

/**
 * 日志级别类型
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 环境变量配置
 *
 * 定义运行时环境变量，所有变量将注入到 process.env 中
 */
export interface Env {
	/** 日志级别 */
	LOG_LEVEL?: LogLevel;
	/** 其他自定义环境变量 */
	[key: string]: string;
}

/**
 * 文件存储系统配置
 */
export interface FileSystem {
	/** 文件存储提供者 */
	name: FileStorageProviderEnum;
}

/**
 * Gauzy 功能特性配置
 */
export interface IGauzyFeatures {
	/** 功能键到启用状态的映射 */
	[key: string]: boolean;
}

/**
 * 演示环境凭证配置
 */
export interface IDemoCredential {
	/** 超级管理员邮箱 */
	readonly superAdminEmail?: string;
	/** 超级管理员密码 */
	readonly superAdminPassword?: string;
	/** 管理员邮箱 */
	readonly adminEmail?: string;
	/** 管理员密码 */
	readonly adminPassword?: string;
	/** 员工邮箱 */
	readonly employeeEmail?: string;
	/** 员工密码 */
	readonly employeePassword?: string;
}

/**
 * 服务器环境配置接口
 *
 * 定义应用程序运行时环境的所有配置选项
 */
export interface IEnvironment {
	/** API 服务端口 */
	port: number | string;
	/** API 服务主机地址 */
	host: string;
	/** API 服务基础 URL */
	baseUrl: string;
	/** 客户端基础 URL */
	clientBaseUrl: string;

	/** 是否为生产环境 */
	production: boolean;
	/** 环境名称 */
	envName: string;

	/** 环境变量配置 */
	env?: Env;

	/** Express 会话密钥 */
	EXPRESS_SESSION_SECRET: string;
	/** 用户密码 bcrypt 加密轮数 */
	USER_PASSWORD_BCRYPT_SALT_ROUNDS?: number;

	/** JWT 密钥 */
	JWT_SECRET?: string;
	/** JWT 令牌过期时间（秒） */
	JWT_TOKEN_EXPIRATION_TIME?: number;

	/**
	 * JWT 刷新令牌配置
	 */
	JWT_REFRESH_TOKEN_SECRET?: string;
	/** JWT 刷新令牌过期时间（秒） */
	JWT_REFRESH_TOKEN_EXPIRATION_TIME?: number;

	/**
	 * 邮箱验证令牌配置
	 */
	JWT_VERIFICATION_TOKEN_SECRET?: string;
	/** 邮箱验证令牌过期时间（秒） */
	JWT_VERIFICATION_TOKEN_EXPIRATION_TIME?: number;

	/**
	 * 密码验证码过期时间（秒） */
	MAGIC_CODE_EXPIRATION_TIME?: number;

	/** 组织团队加入请求过期时间（秒） */
	TEAM_JOIN_REQUEST_EXPIRATION_TIME?: number;

	/**
	 * 限流配置
	 */
	THROTTLE_ENABLED?: boolean;
	/** 限流 TTL（毫秒） */
	THROTTLE_TTL?: number;
	/** 限流限制数量 */
	THROTTLE_LIMIT?: number;

	/** 文件存储配置 */
	fileSystem: FileSystem;
	/** AWS S3 配置 */
	awsConfig?: any;
	/** Wasabi 存储配置 */
	wasabi?: any;
	/** Cloudinary 配置 */
	cloudinary?: any;
	/** DigitalOcean Spaces 配置 */
	digitalOcean?: any;
	/** GitHub 集成配置 */
	github: any;
	/** Jira 集成配置 */
	jira: any;
	/** Fiverr 配置 */
	fiverrConfig: any;
	/** Auth0 配置 */
	auth0Config: any;

	/** Sentry 配置 */
	sentry?: {
		dsn: string;
	};

	/** PostHog 配置 */
	posthog?: any;

	/**
	 * 默认集成用户密码
	 */
	defaultIntegratedUserPass?: string;

	/** 第三方集成配置 */
	/** Upwork 集成配置 */
	upwork?: any;
	/** Hubstaff 集成配置 */
	hubstaff?: any;
	/** Zapier 集成配置 */
	zapier?: any;
	/** Make.com 集成配置 */
	makeCom?: any;
	/** ActivePieces 集成配置 */
	activepieces?: any;

	/** 是否为 Electron 环境 */
	isElectron?: boolean;
	/** Gauzy 用户路径 */
	gauzyUserPath?: string;
	/** 是否允许超级管理员角色 */
	allowSuperAdminRole?: boolean;
	/** Gauzy 种子数据路径 */
	gauzySeedPath?: string;
	/** Electron 资源路径 */
	electronResourcesPath?: string;

	/**
	 * Gauzy AI GraphQL API 端点（可选）
	 */
	gauzyAIGraphQLEndpoint?: string;

	/**
	 * Gauzy AI REST API 端点（可选）
	 */
	gauzyAIRESTEndpoint?: string;

	/** Gauzy Cloud 端点 */
	gauzyCloudEndpoint?: string;

	/** SMTP 配置 */
	smtpConfig?: any;
	/** 默认货币 */
	defaultCurrency: string;

	/** Unleash 功能开关配置 */
	unleashConfig?: any;

	/**
	 * 邮件模板配置
	 */
	appIntegrationConfig?: any;

	/** 是否为演示环境 */
	demo: boolean;
	/** 演示环境凭证配置 */
	demoCredentialConfig?: IDemoCredential;

	/**
	 * 邮箱重置过期时间（秒） */
	EMAIL_RESET_EXPIRATION_TIME?: number;

	/**
	 * Jitsu 事件追踪配置
	 */
	jitsu: any;
}
