/**
 * MCP 应用主入口
 *
 * 创建并启动 MCP 服务器，支持三种传输层
 */
import { createAndStartMcpServer, McpServerConfig, TransportType } from '@oksai/mcp-server';
import { environment } from './environments/environment';
import { Logger } from '@nestjs/common';

const logger = new Logger('McpApp');

/**
 * MCP 应用主入口
 *
 * 创建并启动 MCP 服务器
 */
async function main(): Promise<void> {
	try {
		logger.log('🚀 启动 @oksai MCP 服务器...');

		// 创建 MCP 服务器配置
		const config: McpServerConfig = {
			name: environment.server.name,
			version: environment.server.version,
			authEnabled: environment.auth.enabled,
			session: {
				ttl: environment.session.ttl,
				enableRedis: environment.session.enableRedis,
				redisConfig: {
					redisUrl: environment.session.redisConfig.redisUrl || undefined
				}
			}
		};

		logger.log(`📋 服务器配置:`);
		logger.log(`   名称: ${config.name}`);
		logger.log(`   版本: ${config.version}`);
		logger.log(`   认证: ${environment.auth.enabled ? '启用' : '禁用'}`);
		logger.log(`   Redis: ${environment.session.enableRedis ? '启用' : '禁用'}`);

		// 创建并启动 MCP 服务器
		const { server, transport } = await createAndStartMcpServer(
			config,
			(environment.transport.type as TransportType) || undefined
		);

		logger.log(`✅ MCP 服务器已启动`);
		logger.log(`📡 传输类型: ${transport.type}`);

		if (transport.type === 'http' && transport.url) {
			logger.log(`🌐 HTTP 端点: ${transport.url}`);
			logger.log(`   - POST ${transport.url}/sse (JSON-RPC)`);
			logger.log(`   - GET  ${transport.url}/health`);
		} else if (transport.type === 'websocket' && transport.url) {
			logger.log(`🔌 WebSocket 端点: ${transport.url}`);
			logger.log(`   - ws://${transport.url}`);
		} else {
			logger.log('📟 Stdio 传输模式，等待 AI 助手连接...');
		}

		logger.log(`📝 监听端口:`);
		if (environment.transport.http) {
			logger.log(`   HTTP: ${environment.transport.http.host}:${environment.transport.http.port}`);
		}
		if (environment.transport.websocket) {
			logger.log(`   WebSocket: ${environment.transport.websocket.host}:${environment.transport.websocket.port}`);
		}
	} catch (error) {
		logger.error('❌ 启动失败', error);
		process.exit(1);
	}
}

/**
 * 优雅关闭处理
 */
process.on('SIGINT', () => {
	logger.log('🛑 收到 SIGINT，优雅关闭...');
	process.exit(0);
});

process.on('SIGTERM', () => {
	logger.log('🛑 收到 SIGTERM，优雅关闭...');
	process.exit(0);
});

main();
