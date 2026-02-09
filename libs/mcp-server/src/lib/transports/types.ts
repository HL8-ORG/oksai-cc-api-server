/**
 * 传输类型定义
 *
 * 定义 MCP 服务器支持的传输层类型和相关接口
 */

/**
 * 传输层类型
 */
export enum TransportType {
	STDIO = 'stdio',
	HTTP = 'http',
	WEBSOCKET = 'websocket'
}

/**
 * 传输层结果
 *
 * 包含传输层实例和相关信息
 */
export interface TransportResult {
	/** 传输类型 */
	type: TransportType;
	/** 传输层实例 */
	transport: unknown;
	/** 服务器 URL (HTTP/WebSocket) */
	url?: string;
	/** 端口号 */
	port?: number;
}

/**
 * 传输配置
 *
 * 定义传输层的配置选项
 */
export interface TransportConfig {
	/** 传输类型 */
	type: TransportType;
	/** HTTP 服务器配置 */
	http?: HttpTransportConfig;
	/** WebSocket 服务器配置 */
	websocket?: WebSocketTransportConfig;
}

/**
 * HTTP 传输配置
 */
export interface HttpTransportConfig {
	/** 主机地址 */
	host?: string;
	/** 端口号 */
	port?: number;
	/** CORS 源 */
	corsOrigin?: string | string[];
	/** 是否启用 CORS 凭证 */
	corsCredentials?: boolean;
	/** 信任的代理 */
	trustedProxies?: string[];
}

/**
 * WebSocket 传输配置
 */
export interface WebSocketTransportConfig {
	/** 主机地址 */
	host?: string;
	/** 端口号 */
	port?: string;
	/** 路径 */
	path?: string;
	/** 是否启用 TLS */
	tls?: boolean;
	/** TLS 证书路径 */
	certPath?: string;
	/** TLS 密钥路径 */
	keyPath?: string;
	/** 允许的源 */
	allowedOrigins?: string[];
	/** 是否启用压缩 */
	compression?: boolean;
	/** 最大负载大小 */
	maxPayload?: number;
}

/**
 * 传输工厂配置
 *
 * 定义传输工厂的配置选项
 */
export interface TransportFactoryConfig {
	/** 是否启用调试模式 */
	debug?: boolean;
	/** 是否启用 OAuth 授权 */
	authEnabled?: boolean;
	/** OAuth 授权服务器 */
	authServers?: OAuthServerConfig[];
	/** 是否启用会话管理 */
	sessionEnabled?: boolean;
	/** 会话配置 */
	session?: SessionConfig;
}

/**
 * OAuth 授权服务器配置
 */
export interface OAuthServerConfig {
	/** 授权服务器地址 */
	issuer: string;
	/** 授权端点 */
	authorizationEndpoint: string;
	/** 令牌端点 */
	tokenEndpoint: string;
	/** 支持的授权类型 */
	grantTypesSupported: string[];
	/** 支持的响应类型 */
	responseTypesSupported: string[];
	/** 支持的范围 */
	scopesSupported: string[];
	/** 支持的 PKCE 方式 */
	codeChallengeMethodsSupported?: string[];
}

/**
 * 会话配置
 */
export interface SessionConfig {
	/** 是否启用会话 */
	enabled: boolean;
	/** Cookie 名称 */
	cookieName?: string;
	/** 会话 TTL (毫秒） */
	ttl?: number;
	/** Redis 连接 URL */
	redisUrl?: string;
}
