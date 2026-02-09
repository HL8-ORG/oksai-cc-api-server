/**
 * 开发环境配置
 */

export const environment = {
	production: false,
	server: {
		name: '@oksai/mcp-auth',
		version: '0.1.0',
		host: process.env.HOST || '0.0.0.0',
		port: parseInt(process.env.PORT || '3003', 10)
	},
	oauth: {
		issuer: process.env.JWT_ISSUER || 'oksai-mcp-auth',
		audience: process.env.JWT_AUDIENCE || 'oksai-mcp',
		authorizeEndpoint: '/oauth/authorize',
		tokenEndpoint: '/oauth/token',
		introspectionEndpoint: '/oauth/introspect',
		userinfoEndpoint: '/oauth/userinfo',
		jwksEndpoint: '/.well-known/jwks.json'
	},
	jwt: {
		algorithm: process.env.JWT_ALGORITHM || 'RS256',
		accessTokenExpiry: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRY || '3600', 10),
		refreshTokenExpiry: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY || '86400', 10),
		privateKey: process.env.JWT_PRIVATE_KEY || '',
		publicKey: process.env.JWT_PUBLIC_KEY || ''
	},
	jwks: {
		enabled: process.env.JWT_JWKS_ENABLED === 'true',
		path: process.env.JWT_JWKS_PATH || '/.well-known/jwks.json',
		keyId: process.env.JWT_KEY_ID || 'default',
		keyUse: 'sig',
		keyAlg: process.env.JWT_ALGORITHM || 'RS256'
	},
	cors: {
		enabled: true,
		origin: process.env.CORS_ORIGIN || '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
	},
	debug: process.env.DEBUG === 'true'
};
