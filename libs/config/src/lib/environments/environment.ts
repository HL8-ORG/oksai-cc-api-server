/**
 * 开发环境配置
 *
 * 定义应用程序在开发环境下的所有配置选项
 * 包括服务器配置、认证配置、第三方集成配置等
 */

import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { FileStorageProviderEnum } from '@oksai/contracts';
import { IEnvironment, IGauzyFeatures } from './ienvironment';
import { isFeatureEnabled } from './environment.helper';

/**
 * 开发环境配置对象
 *
 * 所有配置项都从环境变量中读取，如果没有设置则使用默认值
 */
export const environment: IEnvironment = {
	/** API 服务端口 */
	port: process.env.API_PORT || 3000,
	/** API 服务主机地址 */
	host: process.env.API_HOST || 'http://localhost',
	/** API 服务基础 URL */
	baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
	/** 客户端基础 URL */
	clientBaseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:4200',
	/** 是否为生产环境 */
	production: false,
	/** 环境名称 */
	envName: 'dev',

	/** 环境变量配置 */
	env: {
		LOG_LEVEL: 'debug'
	},

	/** Express 会话密钥 */
	EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET || 'gauzy',
	/** 用户密码 bcrypt 加密轮数 */
	USER_PASSWORD_BCRYPT_SALT_ROUNDS: 12,

	/** JWT 密钥 */
	JWT_SECRET: process.env.JWT_SECRET || 'secretKey',
	/** JWT 令牌过期时间（默认 1 天） */
	JWT_TOKEN_EXPIRATION_TIME: parseInt(process.env.JWT_TOKEN_EXPIRATION_TIME) || 86400 * 1,

	/**
	 * JWT 刷新令牌配置
	 */
	JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET || 'refreshSecretKey',
	/** JWT 刷新令牌过期时间（默认 7 天） */
	JWT_REFRESH_TOKEN_EXPIRATION_TIME: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME) || 86400 * 7,

	/**
	 * 邮箱验证令牌配置
	 */
	JWT_VERIFICATION_TOKEN_SECRET: process.env.JWT_VERIFICATION_TOKEN_SECRET || 'verificationSecretKey',
	/** 邮箱验证令牌过期时间（默认 7 天） */
	JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: parseInt(process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME) || 86400 * 7,

	/**
	 * 邮箱重置过期时间（默认 30 分钟） */
	EMAIL_RESET_EXPIRATION_TIME: parseInt(process.env.EMAIL_RESET_EXPIRATION_TIME) || 1800,

	/**
	 * 密码验证码过期时间（默认 30 分钟） */
	MAGIC_CODE_EXPIRATION_TIME: parseInt(process.env.MAGIC_CODE_EXPIRATION_TIME) || 60 * 30,

	/** 组织团队加入请求过期时间（默认 1 天） */
	TEAM_JOIN_REQUEST_EXPIRATION_TIME: parseInt(process.env.TEAM_JOIN_REQUEST_EXPIRATION_TIME) || 60 * 60 * 24,

	/**
	 * 限流配置
	 */
	THROTTLE_TTL: parseInt(process.env.THROTTLE_TTL) || 60 * 1000,
	THROTTLE_LIMIT: parseInt(process.env.THROTTLE_LIMIT) || 60000,
	THROTTLE_ENABLED: process.env.THROTTLE_ENABLED == 'true',

	/**
	 * Jitsu 事件追踪配置
	 */
	jitsu: {
		serverHost: process.env.JITSU_SERVER_URL,
		serverWriteKey: process.env.JITSU_SERVER_WRITE_KEY,
		debug: process.env.JITSU_SERVER_DEBUG === 'true',
		echoEvents: process.env.JITSU_SERVER_ECHO_EVENTS === 'true'
	},

	/** 文件存储配置 */
	fileSystem: {
		name: (process.env.FILE_PROVIDER as FileStorageProviderEnum) || FileStorageProviderEnum.LOCAL
	},

	/** AWS S3 配置 */
	awsConfig: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		region: process.env.AWS_REGION || 'us-east-1',
		s3: {
			bucket: process.env.AWS_S3_BUCKET || 'gauzy',
			forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true' || false
		}
	},

	/**
	 * Wasabi 存储配置
	 */
	wasabi: {
		accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
		secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
		region: process.env.WASABI_REGION || 'us-east-1',
		serviceUrl: process.env.WASABI_SERVICE_URL || 'https://s3.wasabisys.com',
		s3: {
			bucket: process.env.WASABI_S3_BUCKET || 'gauzy',
			forcePathStyle: process.env.WASABI_S3_FORCE_PATH_STYLE === 'true' || false
		}
	},

	/**
	 * DigitalOcean Spaces 配置
	 */
	digitalOcean: {
		accessKeyId: process.env.DIGITALOCEAN_ACCESS_KEY_ID,
		secretAccessKey: process.env.DIGITALOCEAN_SECRET_ACCESS_KEY,
		region: process.env.DIGITALOCEAN_REGION || 'us-east-1',
		serviceUrl: process.env.DIGITALOCEAN_SERVICE_URL || 'https://gauzy.sfo2.digitaloceanspaces.com',
		cdnUrl: process.env.DIGITALOCEAN_CDN_URL,
		s3: {
			bucket: process.env.DIGITALOCEAN_S3_BUCKET || 'gauzy',
			forcePathStyle: process.env.DIGITALOCEAN_S3_FORCE_PATH_STYLE === 'true' || false
		}
	},

	/**
	 * Cloudinary 存储配置
	 */
	cloudinary: {
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
		secure: process.env.CLOUDINARY_API_SECURE === 'false' ? false : true,
		delivery_url: process.env.CLOUDINARY_CDN_URL || `https://res.cloudinary.com`
	},

	/** GitHub 集成配置 */
	github: {
		/** GitHub App 安装配置 */
		clientId: process.env.GAUZY_GITHUB_CLIENT_ID,
		clientSecret: process.env.GAUZY_GITHUB_CLIENT_SECRET,
		appId: process.env.GAUZY_GITHUB_APP_ID,
		appName: process.env.GAUZY_GITHUB_APP_NAME,
		appPrivateKey: process.env.GAUZY_GITHUB_APP_PRIVATE_KEY
			? Buffer.from(process.env.GAUZY_GITHUB_APP_PRIVATE_KEY, 'base64').toString('ascii')
			: '',

		/** GitHub App 安装后回调 URL */
		postInstallUrl:
			process.env.GAUZY_GITHUB_POST_INSTALL_URL ||
			`${process.env.CLIENT_BASE_URL}/#/pages/integrations/github/setup/installation`,

		/** GitHub Webhook 配置 */
		webhookSecret: process.env.GAUZY_GITHUB_WEBHOOK_SECRET,
		webhookUrl: process.env.GAUZY_GITHUB_WEBHOOK_URL || `${process.env.API_BASE_URL}/api/integration/github/webhook`
	},

	/** Jira 集成配置 */
	jira: {
		appName: process.env.GAUZY_JIRA_APP_NAME,
		appDescription: process.env.GAUZY_JIRA_APP_DESCRIPTION,
		appKey: process.env.GAUZY_JIRA_APP_KEY,
		baseUrl: process.env.GAUZY_JIRA_APP_BASE_URL,
		vendorName: process.env.GAUZY_JIRA_APP_BASE_VENDOR_NAME,
		vendorUrl: process.env.GAUZY_JIRA_APP_BASE_VENDOR_URL
	},

	/** Fiverr 集成配置 */
	fiverrConfig: {
		clientId: process.env.FIVERR_CLIENT_ID,
		clientSecret: process.env.FIVERR_CLIENT_SECRET
	},

	/** Auth0 集成配置 */
	auth0Config: {
		clientID: process.env.AUTH0_CLIENT_ID,
		clientSecret: process.env.AUTH0_CLIENT_SECRET,
		domain: process.env.AUTH0_DOMAIN
	},

	/** ActivePieces 集成配置 */
	activepieces: {
		clientId: process.env.GAUZY_ACTIVEPIECES_CLIENT_ID,
		clientSecret: process.env.GAUZY_ACTIVEPIECES_CLIENT_SECRET,
		callbackUrl:
			process.env.GAUZY_ACTIVEPIECES_CALLBACK_URL ||
			`${process.env.API_BASE_URL}/api/integration/activepieces/callback`,
		postInstallUrl:
			process.env.GAUZY_ACTIVEPIECES_POST_INSTALL_URL ||
			`${process.env.CLIENT_BASE_URL}/#/pages/integrations/activepieces`,
		stateSecret: process.env.ACTIVEPIECES_STATE_SECRET
	},

	/** Sentry 错误追踪配置 */
	sentry: {
		dsn: process.env.SENTRY_DSN
	},

	/** PostHog 分析配置 */
	posthog: {
		posthogKey: process.env.POSTHOG_KEY,
		posthogHost: process.env.POSTHOG_HOST,
		posthogEnabled: process.env.POSTHOG_ENABLED === 'true',
		posthogFlushInterval: Number.parseInt(process.env.POSTHOG_FLUSH_INTERVAL) || 10000
	},

	/** 默认集成用户密码 */
	defaultIntegratedUserPass: process.env.INTEGRATED_USER_DEFAULT_PASS || '123456',

	/** Upwork 集成配置 */
	upwork: {
		apiKey: process.env.UPWORK_API_KEY,
		apiSecret: process.env.UPWORK_API_SECRET,
		callbackUrl: process.env.UPWORK_REDIRECT_URL || `${process.env.API_BASE_URL}/api/integrations/upwork/callback`,
		postInstallUrl:
			process.env.UPWORK_POST_INSTALL_URL || `${process.env.CLIENT_BASE_URL}/#/pages/integrations/upwork`
	},

	/** Hubstaff 集成配置 */
	hubstaff: {
		clientId: process.env.HUBSTAFF_CLIENT_ID,
		clientSecret: process.env.HUBSTAFF_CLIENT_SECRET,
		postInstallUrl:
			process.env.HUBSTAFF_POST_INSTALL_URL || `${process.env.CLIENT_BASE_URL}/#/pages/integrations/hubstaff`
	},

	/** Zapier 集成配置 */
	zapier: {
		clientId: process.env.GAUZY_ZAPIER_CLIENT_ID,
		clientSecret: process.env.GAUZY_ZAPIER_CLIENT_SECRET,
		allowedDomains: (process.env.GAUZY_ZAPIER_ALLOWED_DOMAINS ?? process.env.GAUZY_ALLOWED_DOMAINS ?? '')
			.split(',')
			.filter(Boolean)
			.map((domain) => domain.trim()),
		maxAuthCodes: Number.parseInt(process.env.GAUZY_ZAPIER_MAX_AUTH_CODES) || 1000,
		instanceCount: process.env.GAUZY_ZAPIER_INSTANCE_COUNT === 'true',
		redirectUri:
			process.env.GAUZY_ZAPIER_REDIRECT_URL ||
			`${process.env.API_BASE_URL}/api/integration/zapier/oauth/callback`,
		postInstallUrl:
			process.env.GAUZY_ZAPIER_POST_INSTALL_URL || `${process.env.CLIENT_BASE_URL}/#/pages/integrations/zapier`
	},

	/** Make.com 集成配置 */
	makeCom: {
		clientId: process.env.GAUZY_MAKE_CLIENT_ID,
		clientSecret: process.env.GAUZY_MAKE_CLIENT_SECRET,
		webhookUrl: process.env.GAUZY_MAKE_WEBHOOK_URL,
		redirectUri:
			process.env.GAUZY_MAKE_REDIRECT_URL ||
			`${process.env.API_BASE_URL}/api/integration/make-com/oauth/callback`,
		postInstallUrl:
			process.env.GAUZY_MAKE_POST_INSTALL_URL || `${process.env.CLIENT_BASE_URL}/#/pages/integrations/make`
	},

	/** 是否为 Electron 环境 */
	isElectron: process.env.IS_ELECTRON === 'true' ? true : false,
	/** Gauzy 用户路径 */
	gauzyUserPath: process.env.GAUZY_USER_PATH,
	/** 是否允许超级管理员角色 */
	allowSuperAdminRole: process.env.ALLOW_SUPER_ADMIN_ROLE === 'false' ? false : true,
	/** Gauzy 种子数据路径 */
	gauzySeedPath: process.env.GAUZY_SEED_PATH,
	/** Electron 资源路径 */
	electronResourcesPath: process.env.ELECTRON_RESOURCES_PATH,

	/**
	 * Gauzy AI GraphQL API 端点（可选）
	 */
	gauzyAIGraphQLEndpoint: process.env.GAUZY_AI_GRAPHQL_ENDPOINT,

	/**
	 * Gauzy AI REST API 端点（可选）
	 */
	gauzyAIRESTEndpoint: process.env.GAUZY_AI_REST_ENDPOINT,

	/** Gauzy Cloud 端点 */
	gauzyCloudEndpoint: process.env.GAUZY_CLOUD_ENDPOINT,

	/** SMTP 邮件配置 */
	smtpConfig: {
		host: process.env.MAIL_HOST,
		port: parseInt(process.env.MAIL_PORT, 10),
		secure: process.env.MAIL_PORT === '465' ? true : false,
		auth: {
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD
		},
		fromAddress: process.env.MAIL_FROM_ADDRESS
	},

	/** 默认货币 */
	defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',

	/** Unleash 功能开关配置 */
	unleashConfig: {
		url: process.env.UNLEASH_API_URL ? process.env.UNLEASH_API_URL.trim() : '',
		appName: process.env.UNLEASH_APP_NAME,
		environment: 'development',
		instanceId: process.env.UNLEASH_INSTANCE_ID,
		refreshInterval: parseInt(process.env.UNLEASH_REFRESH_INTERVAL) || 15000,
		metricsInterval: parseInt(process.env.UNLEASH_METRICS_INTERVAL) || 60000,
		apiKey: process.env.UNLEASH_API_KEY
	},

	/**
	 * 邮件模板配置
	 */
	appIntegrationConfig: {
		appName: process.env.APP_NAME || 'Gauzy',
		appLogo: process.env.APP_LOGO || `${process.env.CLIENT_BASE_URL}/assets/images/logos/logo_Gauzy.png`,
		appSignature: process.env.APP_SIGNATURE || 'Gauzy Team',
		appLink: process.env.APP_LINK || 'http://localhost:4200/',
		appEmailConfirmationUrl:
			process.env.APP_EMAIL_CONFIRMATION_URL || `${process.env.CLIENT_BASE_URL}/#/auth/confirm-email`,
		appMagicSignUrl: process.env.APP_MAGIC_SIGN_URL || `${process.env.CLIENT_BASE_URL}/#/auth/magic-sign-in`,
		companyLink: process.env.COMPANY_LINK || 'https://ever.co',
		companyName: process.env.COMPANY_NAME || 'Ever Co. LTD'
	},

	/** 是否为演示环境 */
	demo: process.env.DEMO === 'true' ? true : false,

	/** 演示环境凭证配置 */
	demoCredentialConfig: {
		superAdminEmail: process.env.DEMO_SUPER_ADMIN_EMAIL || `admin@ever.co`,
		superAdminPassword: process.env.DEMO_SUPER_ADMIN_PASSWORD || `admin`,
		adminEmail: process.env.DEMO_ADMIN_EMAIL || `local.admin@ever.co`,
		adminPassword: process.env.DEMO_ADMIN_PASSWORD || `admin`,
		employeeEmail: process.env.DEMO_EMPLOYEE_EMAIL || `employee@ever.co`,
		employeePassword: process.env.DEMO_EMPLOYEE_PASSWORD || `123456`
	}
};

/**
 * Gauzy 功能特性开关
 *
 * 定义所有功能模块的启用/禁用状态
 */
export const gauzyToggleFeatures: IGauzyFeatures = {
	FEATURE_DASHBOARD: isFeatureEnabled('FEATURE_DASHBOARD'),
	FEATURE_TIME_TRACKING: isFeatureEnabled('FEATURE_TIME_TRACKING'),
	FEATURE_ESTIMATE: isFeatureEnabled('FEATURE_ESTIMATE'),
	FEATURE_ESTIMATE_RECEIVED: isFeatureEnabled('FEATURE_ESTIMATE_RECEIVED'),
	FEATURE_INVOICE: isFeatureEnabled('FEATURE_INVOICE'),
	FEATURE_INVOICE_RECURRING: isFeatureEnabled('FEATURE_INVOICE_RECURRING'),
	FEATURE_INVOICE_RECEIVED: isFeatureEnabled('FEATURE_INVOICE_RECEIVED'),
	FEATURE_INCOME: isFeatureEnabled('FEATURE_INCOME'),
	FEATURE_EXPENSE: isFeatureEnabled('FEATURE_EXPENSE'),
	FEATURE_PAYMENT: isFeatureEnabled('FEATURE_PAYMENT'),
	FEATURE_PROPOSAL: isFeatureEnabled('FEATURE_PROPOSAL'),
	FEATURE_PROPOSAL_TEMPLATE: isFeatureEnabled('FEATURE_PROPOSAL_TEMPLATE'),
	FEATURE_PIPELINE: isFeatureEnabled('FEATURE_PIPELINE'),
	FEATURE_PIPELINE_DEAL: isFeatureEnabled('FEATURE_PIPELINE_DEAL'),
	FEATURE_DASHBOARD_TASK: isFeatureEnabled('FEATURE_DASHBOARD_TASK'),
	FEATURE_TEAM_TASK: isFeatureEnabled('FEATURE_TEAM_TASK'),
	FEATURE_MY_TASK: isFeatureEnabled('FEATURE_MY_TASK'),
	FEATURE_JOB: isFeatureEnabled('FEATURE_JOB'),
	FEATURE_EMPLOYEES: isFeatureEnabled('FEATURE_EMPLOYEES'),
	FEATURE_EMPLOYEE_TIME_ACTIVITY: isFeatureEnabled('FEATURE_EMPLOYEE_TIME_ACTIVITY'),
	FEATURE_EMPLOYEE_TIMESHEETS: isFeatureEnabled('FEATURE_EMPLOYEE_TIMESHEETS'),
	FEATURE_EMPLOYEE_APPOINTMENT: isFeatureEnabled('FEATURE_EMPLOYEE_APPOINTMENT'),
	FEATURE_EMPLOYEE_APPROVAL: isFeatureEnabled('FEATURE_EMPLOYEE_APPROVAL'),
	FEATURE_EMPLOYEE_APPROVAL_POLICY: isFeatureEnabled('FEATURE_EMPLOYEE_APPROVAL_POLICY'),
	FEATURE_EMPLOYEE_LEVEL: isFeatureEnabled('FEATURE_EMPLOYEE_LEVEL'),
	FEATURE_EMPLOYEE_POSITION: isFeatureEnabled('FEATURE_EMPLOYEE_POSITION'),
	FEATURE_EMPLOYEE_TIMEOFF: isFeatureEnabled('FEATURE_EMPLOYEE_TIMEOFF'),
	FEATURE_EMPLOYEE_RECURRING_EXPENSE: isFeatureEnabled('FEATURE_EMPLOYEE_RECURRING_EXPENSE'),
	FEATURE_EMPLOYEE_CANDIDATE: isFeatureEnabled('FEATURE_EMPLOYEE_CANDIDATE'),
	FEATURE_MANAGE_INTERVIEW: isFeatureEnabled('FEATURE_MANAGE_INTERVIEW'),
	FEATURE_MANAGE_INVITE: isFeatureEnabled('FEATURE_MANAGE_INVITE'),
	FEATURE_ORGANIZATION: isFeatureEnabled('FEATURE_ORGANIZATION'),
	FEATURE_ORGANIZATION_EQUIPMENT: isFeatureEnabled('FEATURE_ORGANIZATION_EQUIPMENT'),
	FEATURE_ORGANIZATION_INVENTORY: isFeatureEnabled('FEATURE_ORGANIZATION_INVENTORY'),
	FEATURE_ORGANIZATION_TAG: isFeatureEnabled('FEATURE_ORGANIZATION_TAG'),
	FEATURE_ORGANIZATION_VENDOR: isFeatureEnabled('FEATURE_ORGANIZATION_VENDOR'),
	FEATURE_ORGANIZATION_PROJECT: isFeatureEnabled('FEATURE_ORGANIZATION_PROJECT'),
	FEATURE_ORGANIZATION_DEPARTMENT: isFeatureEnabled('FEATURE_ORGANIZATION_DEPARTMENT'),
	FEATURE_ORGANIZATION_TEAM: isFeatureEnabled('FEATURE_ORGANIZATION_TEAM'),
	FEATURE_ORGANIZATION_DOCUMENT: isFeatureEnabled('FEATURE_ORGANIZATION_DOCUMENT'),
	FEATURE_ORGANIZATION_EMPLOYMENT_TYPE: isFeatureEnabled('FEATURE_ORGANIZATION_EMPLOYMENT_TYPE'),
	FEATURE_ORGANIZATION_RECURRING_EXPENSE: isFeatureEnabled('FEATURE_ORGANIZATION_RECURRING_EXPENSE'),
	FEATURE_ORGANIZATION_HELP_CENTER: isFeatureEnabled('FEATURE_ORGANIZATION_HELP_CENTER'),
	FEATURE_CONTACT: isFeatureEnabled('FEATURE_CONTACT'),
	FEATURE_GOAL: isFeatureEnabled('FEATURE_GOAL'),
	FEATURE_GOAL_REPORT: isFeatureEnabled('FEATURE_GOAL_REPORT'),
	FEATURE_GOAL_SETTING: isFeatureEnabled('FEATURE_GOAL_SETTING'),
	FEATURE_REPORT: isFeatureEnabled('FEATURE_REPORT'),
	FEATURE_USER: isFeatureEnabled('FEATURE_USER'),
	FEATURE_ORGANIZATIONS: isFeatureEnabled('FEATURE_ORGANIZATIONS'),
	FEATURE_APP_INTEGRATION: isFeatureEnabled('FEATURE_APP_INTEGRATION'),
	FEATURE_SETTING: isFeatureEnabled('FEATURE_SETTING'),
	FEATURE_EMAIL_HISTORY: isFeatureEnabled('FEATURE_EMAIL_HISTORY'),
	FEATURE_EMAIL_TEMPLATE: isFeatureEnabled('FEATURE_EMAIL_TEMPLATE'),
	FEATURE_IMPORT_EXPORT: isFeatureEnabled('FEATURE_IMPORT_EXPORT'),
	FEATURE_FILE_STORAGE: isFeatureEnabled('FEATURE_FILE_STORAGE'),
	FEATURE_PAYMENT_GATEWAY: isFeatureEnabled('FEATURE_PAYMENT_GATEWAY'),
	FEATURE_SMS_GATEWAY: isFeatureEnabled('FEATURE_SMS_GATEWAY'),
	FEATURE_SMTP: isFeatureEnabled('FEATURE_SMTP'),
	FEATURE_ROLES_PERMISSION: isFeatureEnabled('FEATURE_ROLES_PERMISSION'),
	FEATURE_EMAIL_VERIFICATION: isFeatureEnabled('FEATURE_EMAIL_VERIFICATION'),
	FEATURE_OPEN_STATS: process.env.FEATURE_OPEN_STATS === 'true'
};
