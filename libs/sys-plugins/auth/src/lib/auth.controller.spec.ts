import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginResponse, RefreshTokenResponse, VerifyEmailResponse } from './interfaces';
import {
	LoginDto,
	RegisterDto,
	RefreshTokenDto,
	ForgotPasswordDto,
	ResetPasswordDto,
	VerifyEmailDto,
	ChangePasswordDto
} from './dto';

describe('AuthController', () => {
	let controller: AuthController;
	let authService: jest.Mocked<AuthService>;

	const mockAuthService = {
		login: jest.fn(),
		register: jest.fn(),
		refreshToken: jest.fn(),
		logout: jest.fn(),
		forgotPassword: jest.fn(),
		resetPassword: jest.fn(),
		verifyEmail: jest.fn(),
		changePassword: jest.fn()
	} as any;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: mockAuthService
				}
			]
		}).compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get(AuthService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('login', () => {
		it('should successfully login with valid credentials', async () => {
			const loginDto: LoginDto = {
				email: 'user@example.com',
				password: 'password123'
			};

			const mockResponse: LoginResponse = {
				accessToken: 'test_access_token',
				refreshToken: 'test_refresh_token',
				user: {
					id: 'user123',
					email: 'user@example.com',
					firstName: 'John',
					lastName: 'Doe',
					tenantId: 'tenant123',
					role: 'USER'
				}
			};

			authService.login.mockResolvedValue(mockResponse);

			const result = await controller.login(loginDto);

			expect(result).toEqual(mockResponse);
			expect(authService.login).toHaveBeenCalledWith(loginDto);
		});
	});

	describe('register', () => {
		it('should successfully register a new user', async () => {
			const registerDto: RegisterDto = {
				email: 'new@example.com',
				password: 'SecurePass123!',
				firstName: 'John',
				lastName: 'Doe'
			};

			const mockResponse: LoginResponse = {
				accessToken: 'test_access_token',
				refreshToken: 'test_refresh_token',
				user: {
					id: 'newUser123',
					email: 'new@example.com',
					firstName: 'John',
					lastName: 'Doe',
					tenantId: 'default',
					role: 'USER'
				}
			};

			authService.register.mockResolvedValue(mockResponse);

			const result = await controller.register(registerDto);

			expect(result).toEqual(mockResponse);
			expect(authService.register).toHaveBeenCalledWith(registerDto);
		});
	});

	describe('refresh', () => {
		it('should successfully refresh token', async () => {
			const refreshTokenDto: RefreshTokenDto = {
				refreshToken: 'valid_refresh_token'
			};

			const mockResponse: RefreshTokenResponse = {
				accessToken: 'new_access_token',
				refreshToken: 'new_refresh_token'
			};

			authService.refreshToken.mockResolvedValue(mockResponse);

			const result = await controller.refresh(refreshTokenDto);

			expect(result).toEqual(mockResponse);
			expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
		});
	});

	describe('me', () => {
		it('should return current user info', async () => {
			const mockUser = {
				id: 'user123',
				email: 'user@example.com',
				firstName: 'John',
				lastName: 'Doe',
				role: 'USER'
			};

			const req = { user: mockUser } as any;

			const result = await controller.me(req);

			expect(result).toEqual(mockUser);
		});
	});

	describe('logout', () => {
		it('should successfully logout with authenticated user', async () => {
			const mockUser = { id: 'user123' };

			const req = {
				user: mockUser,
				headers: {
					authorization: 'Bearer valid_token'
				}
			} as any;

			authService.logout.mockResolvedValue(undefined);

			const result = await controller.logout(req);

			expect(result).toEqual({ message: '成功退出登录' });
			expect(authService.logout).toHaveBeenCalledWith('user123', 'valid_token');
		});

		it('should successfully logout without user', async () => {
			const req = {
				user: null,
				headers: {}
			} as any;

			const result = await controller.logout(req);

			expect(result).toEqual({ message: '成功退出登录' });
			expect(authService.logout).not.toHaveBeenCalled();
		});
	});

	describe('forgotPassword', () => {
		it('should successfully send password reset email', async () => {
			const forgotPasswordDto: ForgotPasswordDto = {
				email: 'user@example.com'
			};

			authService.forgotPassword.mockResolvedValue(undefined);

			await controller.forgotPassword(forgotPasswordDto);

			expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
		});
	});

	describe('resetPassword', () => {
		it('should successfully reset password', async () => {
			const resetPasswordDto: ResetPasswordDto = {
				email: 'user@example.com',
				resetToken: 'valid_reset_token',
				newPassword: 'NewSecurePass456!'
			};

			authService.resetPassword.mockResolvedValue(undefined);

			await controller.resetPassword(resetPasswordDto);

			expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
		});
	});

	describe('verifyEmail', () => {
		it('should successfully verify email', async () => {
			const verifyEmailDto: VerifyEmailDto = {
				verificationToken: 'valid_token',
				email: 'user@example.com',
				verificationCode: '123456'
			};

			const mockResponse: VerifyEmailResponse = {
				success: true
			};

			authService.verifyEmail.mockResolvedValue(mockResponse);

			const result = await controller.verifyEmail(verifyEmailDto);

			expect(result).toEqual(mockResponse);
			expect(authService.verifyEmail).toHaveBeenCalledWith(verifyEmailDto);
		});
	});

	describe('changePassword', () => {
		it('should successfully change password for authenticated user', async () => {
			const mockUser = { id: 'user123', email: 'user@example.com' };

			const req = {
				user: mockUser,
				headers: {
					authorization: 'Bearer test_token'
				}
			} as any;

			const changePasswordDto = {
				newPassword: 'NewSecurePass456!'
			};

			await controller.changePassword(req, changePasswordDto as any);

			expect(authService.changePassword).toHaveBeenCalledWith('user123', changePasswordDto);
		});

		it('should throw UnauthorizedException when user is not authenticated', async () => {
			const req = {
				user: null,
				headers: {}
			} as any;

			const changePasswordDto = {
				newPassword: 'NewSecurePass456!'
			};

			await expect(controller.changePassword(req, changePasswordDto as any)).rejects.toThrow(
				'未登录用户无法访问此资源'
			);
		});
	});
});
