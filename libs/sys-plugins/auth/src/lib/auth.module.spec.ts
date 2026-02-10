import { AuthModule } from './auth.module';
import { Logger } from '@nestjs/common';
import { initJwtUtils } from '@oksai/core';

jest.mock('@oksai/core', () => ({
	...jest.requireActual('@oksai/core'),
	CoreModule: {
		module: class CoreModule {}
	},
	initJwtUtils: jest.fn()
}));

describe('AuthModule', () => {
	let authModule: AuthModule;

	beforeEach(() => {
		process.env.JWT_ACCESS_SECRET = 'test-access-secret';
		process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
	});

	afterEach(() => {
		delete process.env.JWT_ACCESS_SECRET;
		delete process.env.JWT_REFRESH_SECRET;
		delete process.env.JWT_ACCESS_EXPIRES_IN;
		delete process.env.JWT_REFRESH_EXPIRES_IN;
		jest.clearAllMocks();
	});

	it('should initialize JWT utils with configured secrets', () => {
		authModule = new AuthModule();
		authModule.onModuleInit();

		expect(initJwtUtils).toHaveBeenCalledWith('test-access-secret', 'test-refresh-secret', '1d', '7d');
	});

	it('should throw InternalServerErrorException when JWT_ACCESS_SECRET is missing', () => {
		delete process.env.JWT_ACCESS_SECRET;
		authModule = new AuthModule();

		expect(() => authModule.onModuleInit()).toThrow('JWT 密钥未配置，请联系管理员设置环境变量');
	});

	it('should throw InternalServerErrorException when JWT_REFRESH_SECRET is missing', () => {
		delete process.env.JWT_REFRESH_SECRET;
		authModule = new AuthModule();

		expect(() => authModule.onModuleInit()).toThrow('JWT 密钥未配置，请联系管理员设置环境变量');
	});

	it('should use default expiration times if not configured', () => {
		authModule = new AuthModule();
		authModule.onModuleInit();

		expect(initJwtUtils).toHaveBeenCalledWith('test-access-secret', 'test-refresh-secret', '1d', '7d');
	});

	it('should use configured expiration times if provided', () => {
		process.env.JWT_ACCESS_EXPIRES_IN = '2d';
		process.env.JWT_REFRESH_EXPIRES_IN = '14d';

		authModule = new AuthModule();
		authModule.onModuleInit();

		expect(initJwtUtils).toHaveBeenCalledWith('test-access-secret', 'test-refresh-secret', '2d', '14d');
	});
});
