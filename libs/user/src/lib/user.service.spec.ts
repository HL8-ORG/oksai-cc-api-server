import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole } from './entities/user.entity';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { hashPassword, verifyPassword, validatePasswordStrength } from '@oksai/core';

describe('UserService', () => {
	let service: UserService;
	let userRepo: any;
	let em: any;

	beforeEach(async () => {
		userRepo = {
			findOne: jest.fn(),
			create: jest.fn(),
			find: jest.fn(),
			findAndCount: jest.fn(),
			getEntityManager: jest.fn()
		};

		em = {
			persist: jest.fn(),
			flush: jest.fn(),
			remove: jest.fn()
		};

		userRepo.getEntityManager.mockReturnValue(em);

		jest.mock('@oksai/core', () => ({
			...jest.requireActual('@oksai/core'),
			hashPassword: jest.fn().mockResolvedValue('hashed_password'),
			verifyPassword: jest.fn().mockResolvedValue(true),
			validatePasswordStrength: jest.fn().mockReturnValue({ valid: true, errors: [] })
		}));

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: EntityRepository,
					useValue: userRepo
				}
			]
		}).compile();

		service = module.get<UserService>(UserService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should successfully create a new user', async () => {
			userRepo.findOne.mockResolvedValue(null);

			const createdUser = {
				id: 'new-user-123',
				email: 'new@example.com',
				password: 'hashed_password',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123'
			} as any;

			userRepo.create.mockReturnValue(createdUser);

			const createUserDto = {
				email: 'new@example.com',
				password: 'SecurePass123!',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123'
			};

			const result = await service.create(createUserDto, 'tenant123');

			expect(result).toBeDefined();
			expect(result.email).toBe('new@example.com');
			expect(result.role).toBe(UserRole.USER);
			expect(em.persist).toHaveBeenCalledWith(createdUser);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw ForbiddenException when creating user in different tenant', async () => {
			const createUserDto = {
				email: 'new@example.com',
				password: 'SecurePass123!',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'different-tenant'
			};

			await expect(service.create(createUserDto, 'tenant123')).rejects.toThrow(ForbiddenException);
		});

		it('should throw BadRequestException when email already exists in same tenant', async () => {
			const existingUser = {
				id: 'existing123',
				email: 'existing@example.com',
				tenantId: 'tenant123'
			} as any;

			userRepo.findOne.mockResolvedValue(existingUser);

			const createUserDto = {
				email: 'existing@example.com',
				password: 'SecurePass123!',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123'
			};

			await expect(service.create(createUserDto, 'tenant123')).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException when password is weak', async () => {
			userRepo.findOne.mockResolvedValue(null);

			jest.mock('@oksai/core', () => ({
				...jest.requireActual('@oksai/core'),
				validatePasswordStrength: jest.fn().mockReturnValue({ valid: false, errors: ['密码太短'] })
			}));

			const createUserDto = {
				email: 'new@example.com',
				password: '123',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123'
			};

			await expect(service.create(createUserDto, 'tenant123')).rejects.toThrow(BadRequestException);
		});
	});

	describe('findAll', () => {
		it('should return all users in tenant', async () => {
			const mockUsers: User[] = [
				{
					id: 'user1',
					email: 'user1@example.com',
					tenantId: 'tenant123',
					role: UserRole.ADMIN
				} as any,
				{
					id: 'user2',
					email: 'user2@example.com',
					tenantId: 'tenant123',
					role: UserRole.USER
				} as any
			];

			userRepo.find.mockResolvedValue(mockUsers);
			userRepo.findAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

			const result = await service.findAll({ tenantId: 'tenant123' });

			expect(result.data).toHaveLength(2);
			expect(result.total).toBe(2);
		});

		it('should filter users by role', async () => {
			const mockUsers: User[] = [
				{
					id: 'user1',
					email: 'admin@example.com',
					tenantId: 'tenant123',
					role: UserRole.ADMIN
				} as any
			];

			userRepo.find.mockResolvedValue(mockUsers);
			userRepo.findAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

			const result = await service.findAll({ tenantId: 'tenant123', role: 'ADMIN' });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].role).toBe(UserRole.ADMIN);
		});

		it('should filter users by active status', async () => {
			const mockUsers: User[] = [
				{
					id: 'user1',
					email: 'active@example.com',
					tenantId: 'tenant123',
					role: UserRole.USER,
					isActive: true
				} as any
			];

			userRepo.find.mockResolvedValue(mockUsers);
			userRepo.findAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

			const result = await service.findAll({ tenantId: 'tenant123', isActive: true });

			expect(result.data).toHaveLength(1);
			expect(result.data[0].isActive).toBe(true);
		});

		it('should filter users by search keyword', async () => {
			const mockUsers: User[] = [
				{
					id: 'user123',
					email: 'search@example.com',
					tenantId: 'tenant123',
					role: UserRole.USER,
					firstName: 'Search',
					lastName: 'User'
				} as any
			];

			userRepo.find.mockResolvedValue(mockUsers);
			userRepo.findAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

			const result = await service.findAll({ tenantId: 'tenant123', search: 'Search' });

			expect(result.data).toHaveLength(1);
		});
	});

	describe('findOne', () => {
		it('should find user by id', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.ADMIN
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const result = await service.findOne('user123', 'tenant123');

			expect(result).toBeDefined();
			expect(result.id).toBe('user123');
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			await expect(service.findOne('nonexistent', 'tenant123')).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should successfully update user', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'Old Name',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const updateUserDto = { firstName: 'New Name', lastName: 'New Doe' };

			const result = await service.update('user123', updateUserDto, 'tenant123');

			expect(result.firstName).toBe('New Name');
			expect(result.lastName).toBe('New Doe');
			expect(em.persist).toHaveBeenCalled();
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			const updateUserDto = { firstName: 'Updated Name' };

			await expect(service.update('nonexistent', updateUserDto, 'tenant123')).rejects.toThrow(NotFoundException);
		});

		it('should not allow updating email', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'original@example.com',
				firstName: 'First',
				lastName: 'Last',
				role: UserRole.USER,
				tenantId: 'tenant123'
			} as any;

			const otherUser: User = {
				id: 'other-user',
				email: 'new@example.com',
				tenantId: 'tenant123'
			} as any;

			userRepo.findOne.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(otherUser);

			const updateUserDto = { email: 'new@example.com' };

			const result = await service.update('user123', updateUserDto, 'tenant123');

			expect(result.email).toBe('original@example.com');
		});
	});

	describe('remove', () => {
		it('should successfully delete user', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'deleted@example.com',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			await service.remove('user123', 'tenant123');

			expect(em.remove).toHaveBeenCalledWith(mockUser);
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			await expect(service.remove('nonexistent', 'tenant123')).rejects.toThrow(NotFoundException);
		});
	});

	describe('updateAvatar', () => {
		it('should successfully update user avatar', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123',
				avatar: 'old-avatar.jpg'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const updateAvatarDto = { avatar: 'https://example.com/new-avatar.jpg' };

			const result = await service.updateAvatar('user123', updateAvatarDto, 'tenant123');

			expect(result.avatar).toBe('https://example.com/new-avatar.jpg');
			expect(em.persist).toHaveBeenCalled();
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			const updateAvatarDto = { avatar: 'https://example.com/new-avatar.jpg' };

			await expect(service.updateAvatar('nonexistent', updateAvatarDto, 'tenant123')).rejects.toThrow(
				NotFoundException
			);
		});
	});

	describe('updatePassword', () => {
		it('should successfully update password', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'test@example.com',
				password: 'old_hashed_password',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const updatePasswordDto = {
				currentPassword: 'old_password',
				newPassword: 'NewSecurePass456!'
			};

			const result = await service.updatePassword('user123', updatePasswordDto, 'tenant123');

			expect(em.persist).toHaveBeenCalled();
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw BadRequestException when old password is incorrect', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'test@example.com',
				password: 'actual_hashed_password',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			jest.mock('@oksai/core', () => ({
				...jest.requireActual('@oksai/core'),
				verifyPassword: jest.fn().mockResolvedValue(false)
			}));

			const updatePasswordDto = {
				currentPassword: 'wrong_old',
				newPassword: 'NewPass123!'
			};

			await expect(service.updatePassword('user123', updatePasswordDto, 'tenant123')).rejects.toThrow(
				BadRequestException
			);
		});

		it('should throw BadRequestException when new password is weak', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'test@example.com',
				password: 'old_hashed_password',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123'
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			jest.mock('@oksai/core', () => ({
				...jest.requireActual('@oksai/core'),
				validatePasswordStrength: jest.fn().mockReturnValue({ valid: false, errors: ['密码太短'] })
			}));

			const updatePasswordDto = {
				currentPassword: 'old_password',
				newPassword: '123'
			};

			await expect(service.updatePassword('user123', updatePasswordDto, 'tenant123')).rejects.toThrow(
				BadRequestException
			);
		});
	});

	describe('deactivate', () => {
		it('should successfully deactivate user', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123',
				isActive: true
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const result = await service.deactivate('user123', 'tenant123');

			expect(result.isActive).toBe(false);
			expect(em.persist).toHaveBeenCalled();
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			await expect(service.deactivate('nonexistent', 'tenant123')).rejects.toThrow(NotFoundException);
		});
	});

	describe('activate', () => {
		it('should successfully activate user', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123',
				isActive: false,
				loginCount: 0
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			const result = await service.activate('user123', 'tenant123');

			expect(result.isActive).toBe(true);
			expect(em.persist).toHaveBeenCalled();
			expect(em.flush).toHaveBeenCalled();
		});

		it('should throw NotFoundException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);

			await expect(service.activate('nonexistent', 'tenant123')).rejects.toThrow(NotFoundException);
		});
	});

	describe('updateLastLogin', () => {
		it('should successfully update last login', async () => {
			const mockUser: User = {
				id: 'user123',
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe',
				role: UserRole.USER,
				tenantId: 'tenant123',
				loginCount: 5
			} as any;

			userRepo.findOne.mockResolvedValue(mockUser);

			await service.updateLastLogin('user123', 'tenant123');

			const updatedUser = {
				...mockUser,
				lastLoginAt: expect.any(Date),
				loginCount: 6
			};

			expect(em.persist).toHaveBeenCalledWith(updatedUser);
			expect(em.flush).toHaveBeenCalled();
		});
	});
});
