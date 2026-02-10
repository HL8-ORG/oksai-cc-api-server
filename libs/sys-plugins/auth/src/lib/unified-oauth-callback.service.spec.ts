import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import {
	UnifiedOAuthCallbackService,
	OAuthProvider,
	IOAuthUser,
	IOAuthCallbackResponse
} from './unified-oauth-callback.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { User, UserRole } from './entities/user.entity';
import { JwtPayload, getJwtUtils, hashPassword } from '@oksai/core';

jest.mock('@oksai/core', () => ({
	...jest.requireActual('@oksai/core'),
	getJwtUtils: jest.fn(),
	hashPassword: jest.fn()
}));

describe('UnifiedOAuthCallbackService', () => {
	let service: UnifiedOAuthCallbackService;
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
				UnifiedOAuthCallbackService,
				{
					provide: getRepositoryToken(User),
					useValue: userRepo
				}
			]
		}).compile();

		service = module.get<UnifiedOAuthCallbackService>(UnifiedOAuthCallbackService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('handleOAuthCallback', () => {
		it('should successfully handle OAuth callback with existing user', async () => {
			const mockUser = {
				id: 'user123',
				email: 'existing@example.com',
				password: 'hashed_password',
				role: UserRole.USER,
				tenantId: 'default'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const oAuthUser: IOAuthUser = {
				id: 'google123',
				email: 'existing@example.com',
				displayName: 'John Doe',
				firstName: 'John',
				lastName: 'Doe',
				picture: 'https://example.com/photo.jpg'
			};

			const result = await service.handleOAuthCallback(OAuthProvider.GOOGLE, oAuthUser);

			expect(result.success).toBe(true);
			expect(result.authData?.jwt).toBe('test_access_token');
			expect(result.authData?.userId).toBe('user123');
			expect(result.authData?.provider).toBe(OAuthProvider.GOOGLE);
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

			const oAuthUser: IOAuthUser = {
				id: 'github456',
				email: 'new@example.com',
				displayName: 'John Doe',
				firstName: 'John',
				lastName: 'Doe'
			};

			const result = await service.handleOAuthCallback(OAuthProvider.GITHUB, oAuthUser);

			expect(result.success).toBe(true);
			expect(result.authData?.jwt).toBe('test_access_token');
			expect(result.authData?.userId).toBe('newUser123');
			expect(result.authData?.provider).toBe(OAuthProvider.GITHUB);
			expect(em.persist).toHaveBeenCalledWith(mockNewUser);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should return error when email is missing', async () => {
			const oAuthUser: IOAuthUser = {
				id: 'microsoft789',
				email: '',
				displayName: 'No Email User'
			};

			const result = await service.handleOAuthCallback(OAuthProvider.MICROSOFT, oAuthUser);

			expect(result.success).toBe(false);
			expect(result.error).toBe('邮箱地址缺失');
		});

		it('should handle database errors gracefully', async () => {
			userRepo.findOne.mockRejectedValue(new Error('Database error'));

			const oAuthUser: IOAuthUser = {
				id: 'auth0123',
				email: 'error@example.com',
				displayName: 'Error User'
			};

			const result = await service.handleOAuthCallback(OAuthProvider.AUTH0, oAuthUser);

			expect(result.success).toBe(false);
			expect(result.error).toBe('OAuth 认证失败，请稍后重试');
		});

		it('should handle GitHub OAuth provider', async () => {
			const mockUser = {
				id: 'github123',
				email: 'github@example.com',
				password: 'hashed_password',
				role: UserRole.USER,
				tenantId: 'default'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const oAuthUser: IOAuthUser = {
				id: 'github123',
				email: 'github@example.com',
				displayName: 'GitHub User'
			};

			const result = await service.handleOAuthCallback(OAuthProvider.GITHUB, oAuthUser);

			expect(result.success).toBe(true);
			expect(result.authData?.provider).toBe(OAuthProvider.GITHUB);
		});

		it('should handle Microsoft OAuth provider', async () => {
			const mockUser = {
				id: 'microsoft123',
				email: 'microsoft@example.com',
				password: 'hashed_password',
				role: UserRole.USER,
				tenantId: 'default'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const oAuthUser: IOAuthUser = {
				id: 'microsoft123',
				email: 'microsoft@example.com',
				displayName: 'Microsoft User'
			};

			const result = await service.handleOAuthCallback(OAuthProvider.MICROSOFT, oAuthUser);

			expect(result.success).toBe(true);
			expect(result.authData?.provider).toBe(OAuthProvider.MICROSOFT);
		});

		it('should handle Auth0 OAuth provider', async () => {
			const mockUser = {
				id: 'auth0123',
				email: 'auth0@example.com',
				password: 'hashed_password',
				role: UserRole.USER,
				tenantId: 'default'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const oAuthUser: IOAuthUser = {
				id: 'auth0123',
				email: 'auth0@example.com',
				displayName: 'Auth0 User'
			};

			const result = await service.handleOAuthCallback(OAuthProvider.AUTH0, oAuthUser);

			expect(result.success).toBe(true);
			expect(result.authData?.provider).toBe(OAuthProvider.AUTH0);
		});
	});

	describe('generateSuccessRedirect', () => {
		it('should generate correct success redirect URL', () => {
			const url = service.generateSuccessRedirect('test_jwt', 'user123');

			expect(url).toBe('http://localhost:4200/sign-in/success?jwt=test_jwt&userId=user123');
		});

		it('should use custom CLIENT_BASE_URL when set', () => {
			process.env.CLIENT_BASE_URL = 'https://custom.example.com';

			const url = service.generateSuccessRedirect('custom_jwt', 'user456');

			expect(url).toBe('https://custom.example.com/sign-in/success?jwt=custom_jwt&userId=user456');

			delete process.env.CLIENT_BASE_URL;
		});
	});

	describe('generateFailureRedirect', () => {
		it('should generate correct failure redirect URL', () => {
			const url = service.generateFailureRedirect();

			expect(url).toBe('http://localhost:4200/auth/register');
		});

		it('should use custom CLIENT_BASE_URL when set', () => {
			process.env.CLIENT_BASE_URL = 'https://custom.example.com';

			const url = service.generateFailureRedirect();

			expect(url).toBe('https://custom.example.com/auth/register');

			delete process.env.CLIENT_BASE_URL;
		});
	});
});
