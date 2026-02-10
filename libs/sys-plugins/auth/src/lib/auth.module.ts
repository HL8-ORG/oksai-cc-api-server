import { Module, OnModuleInit, Logger, InternalServerErrorException } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SocialAuthService } from './social-auth.service';
import { UnifiedOAuthCallbackService } from './unified-oauth-callback.service';
import { UnifiedOAuthCallbackController } from './unified-oauth-callback.controller';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { User, OAuthAccount, LoginHistory, Role, Permission } from './entities/index';
import { initJwtUtils } from '@oksai/core';
import { CoreModule } from '@oksai/core';
import { GoogleStrategy } from './google';
import { GithubStrategy } from './github';
import { Auth0Strategy } from './auth0';
import { MicrosoftStrategy } from './microsoft';
import { MicrosoftController } from './microsoft';

@Module({
	imports: [MikroOrmModule.forFeature([User, OAuthAccount, LoginHistory, Role, Permission]), CoreModule],
	providers: [
		AuthService,
		SocialAuthService,
		PermissionsService,
		GoogleStrategy,
		GithubStrategy,
		Auth0Strategy,
		MicrosoftStrategy,
		UnifiedOAuthCallbackService
	],
	controllers: [AuthController, MicrosoftController, UnifiedOAuthCallbackController, PermissionsController],
	exports: [
		AuthService,
		SocialAuthService,
		PermissionsService,
		GoogleStrategy,
		GithubStrategy,
		Auth0Strategy,
		MicrosoftStrategy,
		UnifiedOAuthCallbackService
	]
})
export class AuthModule implements OnModuleInit {
	private readonly logger = new Logger(AuthModule.name);

	onModuleInit() {
		const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
		const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

		if (!jwtAccessSecret || !jwtRefreshSecret) {
			this.logger.error('JWT 密钥未配置，请设置 JWT_ACCESS_SECRET 和 JWT_REFRESH_SECRET 环境变量');
			throw new InternalServerErrorException('JWT 密钥未配置，请联系管理员设置环境变量');
		}

		if (jwtAccessSecret === 'default-access-secret' || jwtRefreshSecret === 'default-refresh-secret') {
			this.logger.warn('警告：使用默认 JWT 密钥，建议在生产环境中设置自定义密钥');
		}

		initJwtUtils(
			jwtAccessSecret,
			jwtRefreshSecret,
			process.env.JWT_ACCESS_EXPIRES_IN || '1d',
			process.env.JWT_REFRESH_EXPIRES_IN || '7d'
		);

		this.logger.log('JWT 工具初始化完成');
	}
}
