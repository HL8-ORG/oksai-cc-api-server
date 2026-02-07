import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PluginModule } from '@oksai/plugin';
import { BootstrapService } from './services/bootstrap.service';

/**
 * Bootstrap 模块
 *
 * 提供应用启动功能，包括插件启动、数据库初始化、Express 配置和监控日志
 */
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env'
		}),
		PluginModule
	],
	providers: [BootstrapService],
	exports: [BootstrapService]
})
export class BootstrapModule {}
