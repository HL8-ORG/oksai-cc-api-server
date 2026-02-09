/**
 * OAuth 2.0 授权服务器应用入口
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
	const logger = new Logger('Bootstrap');

	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true
		})
	);

	app.enableCors({
		origin: process.env.CORS_ORIGIN || '*',
		methods: 'GET,POST,PUT,DELETE,OPTIONS',
		allowedHeaders: 'Content-Type,Authorization'
	});

	const port = parseInt(process.env.PORT || '3003', 10);
	const host = process.env.HOST || '0.0.0.0';

	await app.listen(port, host);

	logger.log(`🚀 OAuth 2.0 授权服务器已启动`);
	logger.log(`📡 HTTP: http://${host}:${port}`);
	logger.log(`🔑 JWKS: http://${host}:${port}/.well-known/jwks.json`);
	logger.log(`🔍 Introspect: http://${host}:${port}/oauth/introspect`);
	logger.log(`💚 Health: http://${host}:${port}/health`);
}

process.on('SIGINT', () => {
	console.log('收到 SIGINT，优雅关闭...');
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('收到 SIGTERM，优雅关闭...');
	process.exit(0);
});

bootstrap().catch((error) => {
	console.error('OAuth 2.0 授权服务器启动失败', error);
	process.exit(1);
});
