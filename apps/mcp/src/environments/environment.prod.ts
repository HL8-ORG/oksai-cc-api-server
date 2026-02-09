/**
 * 环境配置
 *
 * 生产环境配置
 */

export const environment = {
	production: true,
	server: {
		name: '@oksai/mcp-server',
		version: '0.1.0'
	},
	transport: {
		type: process.env.MCP_TRANSPORT || 'stdio',
		http: {
			host: process.env.MCP_HTTP_HOST || '0.0.0.0',
			port: parseInt(process.env.MCP_HTTP_PORT || '3001', 10),
			corsOrigin: process.env.MCP_CORS_ORIGIN
		},
		websocket: {
			host: process.env.MCP_WS_HOST || '0.0.0.0',
			port: process.env.MCP_WS_PORT || '3002',
			path: process.env.MCP_WS_PATH || '/sse'
		}
	},
	session: {
		ttl: parseInt(process.env.MCP_SESSION_TTL || '1800000', 10),
		enableRedis: process.env.MCP_REDIS_ENABLED === 'true',
		redisUrl: process.env.MCP_REDIS_URL || ''
	},
	auth: {
		enabled: process.env.MCP_AUTH_ENABLED === 'true',
		email: process.env.GAUZY_AUTH_EMAIL,
		password: process.env.GAUZY_AUTH_PASSWORD,
		autoLogin: process.env.GAUZY_AUTO_LOGIN === 'true'
	},
	api: {
		baseUrl: process.env.GAUZY_API_URL
	},
	debug: process.env.MCP_DEBUG === 'true'
};
