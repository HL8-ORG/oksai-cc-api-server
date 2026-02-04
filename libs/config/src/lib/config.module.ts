/**
 * 配置模块
 *
 * 应用程序配置模块，负责加载和管理所有配置
 */

import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import configs from './config';

@Global()
@Module({
	imports: [
		/**
		 * NestConfigModule.forRoot 方法用于配置配置根模块
		 * load 选项用于加载不同提供者的配置模块
		 */
		NestConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			load: [...configs]
		})
	],
	providers: [ConfigService],
	exports: [ConfigService]
})
export class ConfigModule {}
