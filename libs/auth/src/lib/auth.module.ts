import { Module, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SocialAuthService } from './social-auth.service';
import { UnifiedOAuthCallbackService } from './unified-oauth-callback.service';
import { UnifiedOAuthCallbackController } from './unified-oauth-callback.controller';
import { User } from './entities/user.entity';
import { initJwtUtils } from '@oksai/core';
import { CoreModule } from '@oksai/core';
import { GoogleStrategy } from './google';
import { GithubStrategy } from './github';
import { Auth0Strategy } from './auth0';
import { MicrosoftStrategy } from './microsoft';
import { MicrosoftController } from './microsoft';

@Module({
	imports: [MikroOrmModule.forFeature([User]), CoreModule],
	providers: [
		AuthService,
		SocialAuthService,
		GoogleStrategy,
		GithubStrategy,
		Auth0Strategy,
		MicrosoftStrategy,
		UnifiedOAuthCallbackService
	],
	controllers: [AuthController, MicrosoftController, UnifiedOAuthCallbackController],
	exports: [
		AuthService,
		SocialAuthService,
		GoogleStrategy,
		GithubStrategy,
		Auth0Strategy,
		MicrosoftStrategy,
		UnifiedOAuthCallbackService
	]
})
export class AuthModule implements OnModuleInit {
	onModuleInit() {
		initJwtUtils(
			process.env.JWT_ACCESS_SECRET || 'default-access-secret',
			process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
			process.env.JWT_ACCESS_EXPIRES_IN || '1d',
			process.env.JWT_REFRESH_EXPIRES_IN || '7d'
		);
	}
}
