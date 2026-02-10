import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import {
	hashPassword,
	verifyPassword,
	validatePasswordStrength,
	getJwtUtils,
	MailQueueService,
	TemplateEngineService,
	JwtBlacklistService,
	JwtPayload
} from '@oksai/core';

jest.mock('@oksai/core', () => ({
	...jest.requireActual('@oksai/core'),
	hashPassword: jest.fn(),
	verifyPassword: jest.fn(),
	validatePasswordStrength: jest.fn(),
	getJwtUtils: jest.fn(),
	MailQueueService: jest.fn(),
	TemplateEngineService: jest.fn(),
	JwtBlacklistService: jest.fn()
}));

describe('AuthService', () => {
	let service: AuthService;
	let userRepo: any;
	let em: any;
	let mockJwtUtils: any;

	beforeEach(async () => {
		jest.clearAllMocks();

		userRepo = {
			findOne: jest.fn(),
			create: jest.fn(),
			getEntityManager: jest.fn()
		};

		em = {
			persist: jest.fn(),
			flush: jest.fn()
		};

		userRepo.getEntityManager.mockReturnValue(em);

		mockJwtUtils = {
			generateTokenPair: jest.fn().mockReturnValue({
				accessToken: 'test_access_token',
				refreshToken: 'test_refresh_token'
			}),
			verifyAccessToken: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
			verifyRefreshToken: jest.fn()
		};

		(getJwtUtils as jest.Mock).mockReturnValue(mockJwtUtils);
		(verifyPassword as jest.Mock).mockResolvedValue(true);
		(validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true, errors: [] });
		(hashPassword as jest.Mock).mockResolvedValue('hashed_password');

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: getRepositoryToken(User),
					useValue: userRepo
				},
				{
					provide: MailQueueService,
					useValue: {
						add: jest.fn()
					}
				},
				{
					provide: TemplateEngineService,
					useValue: {
						renderWelcomeEmail: jest.fn().mockReturnValue('<html>Welcome</html>'),
						renderResetPasswordEmail: jest.fn().mockReturnValue('<html>Reset</html>')
					}
				},
				{
					provide: JwtBlacklistService,
					useValue: {
						isAvailable: jest.fn().mockReturnValue(true),
						isBlacklisted: jest.fn().mockResolvedValue(false),
						add: jest.fn().mockResolvedValue(undefined)
					}
				}
			]
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('login', () => {
		it('should successfully login with valid credentials', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				password: 'hashed_password',
				role: UserRole.ADMIN,
				tenantId: 'tenant123',
				firstName: 'John',
				lastName: 'Doe'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const result = await service.login({ email: 'test@example.com', password: 'password123' });

			expect(result).toBeDefined();
			expect(result.user).toBeDefined();
			expect(result.user.email).toBe('test@example.com');
			expect(result.accessToken).toBe('test_access_token');
			expect(result.refreshToken).toBe('test_refresh_token');
			expect(mockJwtUtils.generateTokenPair).toHaveBeenCalledWith({
				sub: 'user123',
				email: 'test@example.com',
				tenantId: 'tenant123',
				role: UserRole.ADMIN
			});
		});

		it('should throw UnauthorizedException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			await expect(service.login({ email: 'nonexistent@example.com', password: 'password123' })).rejects.toThrow(
				UnauthorizedException
			);
		});

		it('should throw UnauthorizedException when password is invalid', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				password: 'hashed_password',
				role: UserRole.USER,
				tenantId: 'tenant123'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);
			(verifyPassword as jest.Mock).mockResolvedValueOnce(false);

			await expect(service.login({ email: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow(
				UnauthorizedException
			);
		});
	});

	describe('register', () => {
		it('should successfully register a new user', async () => {
			userRepo.findOne.mockResolvedValue(null);

			const createdUser = {
				id: 'newUser123',
				email: 'new@example.com',
				password: 'hashed_password',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				isActive: true,
				tenantId: 'default'
			} as any;

			userRepo.create.mockReturnValue(createdUser);

			const registerDto = {
				email: 'new@example.com',
				password: 'SecurePass123!',
				firstName: 'John',
				lastName: 'Doe'
			};

			const result = await service.register(registerDto);

			expect(result).toBeDefined();
			expect(result.user.email).toBe('new@example.com');
			expect(em.persist).toHaveBeenCalledWith(createdUser);
			expect(em.flush).toHaveBeenCalled();
			expect(hashPassword).toHaveBeenCalledWith('SecurePass123!');
		});

		it('should throw BadRequestException when password is weak', async () => {
			userRepo.findOne.mockResolvedValue(null);
			(validatePasswordStrength as jest.Mock).mockReturnValue({ valid: false, errors: ['密码太短'] });

			const registerDto = {
				email: 'new@example.com',
				password: '123',
				firstName: 'John',
				lastName: 'Doe'
			};

			await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
		});

		it('should throw ConflictException when email already exists', async () => {
			const mockUser = { id: 'existing123', email: 'existing@example.com' } as any;
			userRepo.findOne.mockResolvedValue(mockUser);

			const registerDto = {
				email: 'existing@example.com',
				password: 'SecurePass123!',
				firstName: 'John',
				lastName: 'Doe'
			};

			await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
		});
	});

	describe('refreshToken', () => {
		it('should successfully refresh token', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				password: 'hashed_password',
				role: UserRole.USER,
				tenantId: 'tenant123'
			} as any;

			const mockPayload: JwtPayload = {
				sub: 'user123',
				email: 'test@example.com',
				tenantId: 'tenant123',
				role: UserRole.USER
			};

			userRepo.findOne.mockResolvedValue(mockUser);
			mockJwtUtils.verifyRefreshToken.mockReturnValue(mockPayload);

			const result = await service.refreshToken({ refreshToken: 'valid_refresh_token' });

			expect(result).toBeDefined();
			expect(result.accessToken).toBe('test_access_token');
			expect(result.refreshToken).toBe('test_refresh_token');
		});

		it('should throw UnauthorizedException when refresh token is invalid', async () => {
			userRepo.findOne.mockResolvedValue(null);
			mockJwtUtils.verifyRefreshToken.mockImplementation(() => {
				throw new Error('Invalid token');
			});

			await expect(service.refreshToken({ refreshToken: 'invalid_token' })).rejects.toThrow(
				UnauthorizedException
			);
		});
	});

	describe('logout', () => {
		it('should successfully logout with token', async () => {
			await service.logout('user123', 'valid_token');

			const jwtBlacklistService = service['jwtBlacklistService'];
			expect(jwtBlacklistService.add).toHaveBeenCalledWith('valid_token', expect.any(Number));
		});

		it('should successfully logout without token', async () => {
			await service.logout('user123');

			const jwtBlacklistService = service['jwtBlacklistService'];
			expect(jwtBlacklistService.add).not.toHaveBeenCalled();
		});
	});

	describe('forgotPassword', () => {
		it('should successfully send password reset email', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				password: 'old_password',
				resetToken: undefined,
				resetTokenExpiresAt: undefined
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			await service.forgotPassword({ email: 'test@example.com' });

			expect(mockUser.resetToken).toBeDefined();
			expect(mockUser.resetTokenExpiresAt).toBeDefined();
			expect(em.persist).toHaveBeenCalledWith(mockUser);
			expect(em.flush).toHaveBeenCalled();

			const mailQueueService = service['mailQueueService'];
			expect(mailQueueService.add).toHaveBeenCalled();
		});

		it('should throw BadRequestException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			await expect(service.forgotPassword({ email: 'nonexistent@example.com' })).rejects.toThrow(
				BadRequestException
			);
		});
	});

	describe('resetPassword', () => {
		it('should successfully reset password', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				password: 'hashed_password',
				resetToken: 'valid_reset_token',
				resetTokenExpiresAt: new Date(Date.now() + 3600000)
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const resetDto = {
				email: 'test@example.com',
				resetToken: 'valid_reset_token',
				newPassword: 'NewSecurePass456!'
			};

			await service.resetPassword(resetDto);

			expect(hashPassword).toHaveBeenCalledWith('NewSecurePass456!');
			expect(em.persist).toHaveBeenCalled();
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw BadRequestException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			const resetDto = {
				email: 'nonexistent@example.com',
				resetToken: 'invalid_token',
				newPassword: 'NewSecurePass456!'
			};

			await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
		});
	});

	describe('verifyEmail', () => {
		it('should successfully verify email', async () => {
			const mockUser = {
				id: 'user123',
				email: 'test@example.com',
				emailVerifiedAt: null,
				verificationToken: 'valid_token',
				verificationCode: '123456',
				verificationCodeExpiresAt: new Date(Date.now() + 3600000)
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const result = await service.verifyEmail({
				email: 'test@example.com',
				verificationToken: 'valid_token',
				verificationCode: '123456'
			});

			expect(result.success).toBe(true);
			expect(mockUser.emailVerifiedAt).toBeDefined();
			expect(em.persist).toHaveBeenCalledWith(mockUser);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should return false when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			const result = await service.verifyEmail({
				email: 'nonexistent@example.com',
				verificationToken: 'invalid_token',
				verificationCode: '123456'
			});

			expect(result.success).toBe(false);
		});
	});
});
