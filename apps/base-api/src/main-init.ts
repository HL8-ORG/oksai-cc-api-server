import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/core';
import config from './config/mikro-orm.config';

async function bootstrap() {
	console.log('🔄 Initializing database...');

	const orm = await MikroORM.init(config);
	const generator = orm.getSchemaGenerator();

	console.log('📊 Dropping schema...');
	await generator.dropSchema();

	console.log('📊 Creating schema...');
	await generator.createSchema();

	console.log('✅ Database initialized successfully!');

	await orm.close();

	console.log('🚀 Starting application...');
	const app = await NestFactory.create(AppModule);
	await app.listen(3000);
	console.log('🌐 Application is running on: http://localhost:3000');
}

bootstrap();
