/**
 * OAuth 2.0 授权服务器应用模块
 */

import { Module } from '@nestjs/common';
import { OAuthController } from './oauth/oauth.controller';

@Module({
	imports: [],
	controllers: [OAuthController],
	providers: []
})
export class AppModule {}
