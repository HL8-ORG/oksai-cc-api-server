import { Test, TestingModule } from '@nestjs/testing';
import { SocialAuthService, IOAuthRequestContext, IOAuthResponse } from './social-auth.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { User, UserRole } from './entities/user.entity';
import { JwtPayload, getJwtUtils, hashPassword } from '@oksai/core';

jest.mock('@oksai/core', () => ({
	...jest.requireActual('@oksai/core'),
	getJwtUtils: jest.fn(),
	hashPassword: jest.fn()
}));

describe('SocialAuthService', () => {
	let service: SocialAuthService;
	let userRepo: jest.Mocked<EntityRepository<User>>;
	let em: jest.Mocked<EntityManager>;
	let mockJwtUtils: any;

	beforeEach(async () => {
		jest.clearAllMocks();

		userRepo = {
			findOne: jest.fn(),
			create: jest.fn(),
			getEntityManager: jest.fn()
		} as any;

		em = {
			persist: jest.fn(),
			flush: jest.fn()
		} as any;

		userRepo.getEntityManager.mockReturnValue(em);

		mockJwtUtils = {
			generateTokenPair: jest.fn().mockReturnValue({
				accessToken: 'test_access_token',
				refreshToken: 'test_refresh_token'
			})
		};

		(getJwtUtils as jest.Mock).mockReturnValue(mockJwtUtils);
		(hashPassword as jest.Mock).mockResolvedValue('hashed_password');

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SocialAuthService,
				{
					provide: getRepositoryToken(User),
					useValue: userRepo
				}
			]
		}).compile();

		service = module.get<SocialAuthService>(SocialAuthService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('validateOAuthLoginEmail', () => {
		it('should successfully login existing user', async () => {
			const mockUser = {
				id: 'user123',
				email: 'existing@example.com',
				password: 'hashed_password',
				role: UserRole.USER,
				tenantId: 'default'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const context: IOAuthRequestContext = {
				user: {
					id: 'google123',
					emails: ['existing@example.com'],
					displayName: 'John Doe',
					firstName: 'John',
					lastName: 'Doe',
					picture: 'https://example.com/photo.jpg'
				}
			};

			const result = await service.validateOAuthLoginEmail(context);

			expect(result.success).toBe(true);
			expect(result.authData?.jwt).toBe('test_access_token');
			expect(result.authData?.userId).toBe('user123');
			expect(mockJwtUtils.generateTokenPair).toHaveBeenCalledWith({
				sub: 'user123',
				email: 'existing@example.com',
				tenantId: 'default',
				role: UserRole.USER
			});
		});

		it('should create new user when user does not exist', async () => {
			userRepo.findOne.mockResolvedValue(null);

			const mockNewUser = {
				id: 'newUser123',
				email: 'new@example.com',
				password: 'hashed_password',
				firstName: 'John',
				lastName: 'Doe',
				isActive: true,
				tenantId: 'default',
				emailVerifiedAt: expect.any(Date),
				role: UserRole.USER,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date)
			} as any;

			userRepo.create.mockReturnValue(mockNewUser);

			const context: IOAuthRequestContext = {
				user: {
					id: 'google456',
					emails: ['new@example.com'],
					displayName: 'John Doe',
					firstName: 'John',
					lastName: 'Doe'
				}
			};

			const result = await service.validateOAuthLoginEmail(context);

			expect(result.success).toBe(true);
			expect(result.authData?.jwt).toBe('test_access_token');
			expect(result.authData?.userId).toBe('newUser123');
			expect(em.persist).toHaveBeenCalledWith(mockNewUser);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should handle user with missing firstName and lastName', async () => {
			userRepo.findOne.mockResolvedValue(null);

			const mockNewUser = {
				id: 'newUser456',
				email: 'minimal@example.com',
				password: 'hashed_password',
				firstName: '',
				lastName: ''
			} as any;

			userRepo.create.mockReturnValue(mockNewUser);

			const context: IOAuthRequestContext = {
				user: {
					id: 'github789',
					emails: ['minimal@example.com'],
					displayName: 'MinimalUser'
				}
			};

			const result = await service.validateOAuthLoginEmail(context);

			expect(result.success).toBe(true);
		});

		it('should return error when email is missing', async () => {
			const context: IOAuthRequestContext = {
				user: {
					id: 'google000',
					emails: [],
					displayName: 'No Email User',
					firstName: 'No',
					lastName: 'Email'
				}
			};

			const result = await service.validateOAuthLoginEmail(context);

			expect(result.success).toBe(false);
			expect(result.error).toBe('邮箱地址缺失');
		});

		it('should handle database errors gracefully', async () => {
			userRepo.findOne.mockRejectedValue(new Error('Database error'));

			const context: IOAuthRequestContext = {
				user: {
					id: 'google111',
					emails: ['error@example.com'],
					displayName: 'Error User',
					firstName: 'Error',
					lastName: 'User'
				}
			};

			await expect(service.validateOAuthLoginEmail(context)).rejects.toThrow('Database error');
		});
	});

	describe('routeRedirect', () => {
		it('should redirect to success page with auth data', async () => {
			const auth = {
				jwt: 'test_jwt_token',
				userId: 'user123'
			};
			const res = {
				redirect: jest.fn()
			};

			await service.routeRedirect(true, auth, res as any);

			expect(res.redirect).toHaveBeenCalledWith(
				'http://localhost:4200/sign-in/success?jwt=test_jwt_token&userId=user123'
			);
		});

		it('should redirect to failure page when success is false', async () => {
			const auth = {
				jwt: 'test_jwt_token',
				userId: 'user123'
			};
			const res = {
				redirect: jest.fn()
			};

			await service.routeRedirect(false, auth, res as any);

			expect(res.redirect).toHaveBeenCalledWith('http://localhost:4200/auth/register');
		});

		it('should use custom CLIENT_BASE_URL when set', async () => {
			process.env.CLIENT_BASE_URL = 'https://custom.example.com';

			const auth = {
				jwt: 'test_jwt_token',
				userId: 'user456'
			};
			const res = {
				redirect: jest.fn()
			};

			await service.routeRedirect(true, auth, res as any);

			expect(res.redirect).toHaveBeenCalledWith(
				'https://custom.example.com/sign-in/success?jwt=test_jwt_token&userId=user456'
			);

			delete process.env.CLIENT_BASE_URL;
		});
	});

	describe('private methods behavior', () => {
		it('should extract names from displayName correctly', async () => {
			userRepo.findOne.mockResolvedValue(null);

			const mockNewUser = {
				id: 'newUser789',
				email: 'names@example.com',
				password: 'hashed_password',
				firstName: 'First Middle',
				lastName: 'Last'
			} as any;

			userRepo.create.mockReturnValue(mockNewUser);

			const context: IOAuthRequestContext = {
				user: {
					id: 'google999',
					emails: ['names@example.com'],
					displayName: 'First Middle Last'
				}
			};

			await service.validateOAuthLoginEmail(context);

			expect(mockNewUser.firstName).toBe('First Middle');
			expect(mockNewUser.lastName).toBe('Last');
		});
	});
});
