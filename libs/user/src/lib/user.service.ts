import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, wrap, EntityManager } from '@mikro-orm/core';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, QueryUserDto, UpdateAvatarDto, UpdatePasswordDto } from './dto/user.dto';
import { hashPassword, verifyPassword, validatePasswordStrength, RequestContext } from '@oksai/core';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>
	) {}

	private get em(): EntityManager {
		return this.userRepo.getEntityManager();
	}

	/**
	 * 创建新用户
	 *
	 * 在当前租户下创建新用户账号，包含密码验证和邮箱唯一性检查
	 *
	 * @param createUserDto - 用户创建数据
	 * @returns 已创建的用户
	 * @throws BadRequestException 当邮箱已存在或密码强度不足时
	 *
	 * @example
	 * ```typescript
	 * const user = await userService.create({
	 *   email: 'user@example.com',
	 *   password: 'Password123!',
	 *   firstName: 'John',
	 *   lastName: 'Doe'
	 * });
	 * ```
	 */
	async create(createUserDto: CreateUserDto): Promise<User> {
		const currentTenantId = RequestContext.getCurrentTenantId();

		if (!currentTenantId) {
			throw new ForbiddenException('租户上下文缺失');
		}

		const existingUser = await this.userRepo.findOne({
			email: createUserDto.email,
			tenantId: currentTenantId
		});

		if (existingUser) {
			throw new BadRequestException('此邮箱在该租户下已存在');
		}

		const passwordValidation = validatePasswordStrength(createUserDto.password);

		if (!passwordValidation.valid) {
			throw new BadRequestException(passwordValidation.errors.join(', '));
		}

		const hashedPassword = await hashPassword(createUserDto.password);

		const user = this.userRepo.create({
			...createUserDto,
			tenantId: currentTenantId,
			password: hashedPassword,
			role: createUserDto.role ? UserRole[createUserDto.role] : UserRole.USER
		} as any);

		this.em.persist(user);
		await this.em.flush();

		return user;
	}

	/**
	 * 查询用户列表
	 *
	 * 在当前租户下分页查询用户列表，支持按角色、状态、关键词筛选
	 *
	 * @param query - 查询参数（角色、状态、搜索关键词、分页）
	 * @returns 包含用户列表和总数的响应
	 *
	 * @example
	 * ```typescript
	 * const result = await userService.findAll({
	 *   role: 'ADMIN',
	 *   isActive: true,
	 *   search: 'John',
	 *   page: 1,
	 *   limit: 10
	 * });
	 * ```
	 */
	async findAll(query: QueryUserDto): Promise<{ data: User[]; total: number }> {
		const currentTenantId = RequestContext.getCurrentTenantId();

		if (!currentTenantId) {
			throw new ForbiddenException('租户上下文缺失');
		}

		const where: any = { tenantId: currentTenantId };

		if (query.role) {
			where.role = UserRole[query.role];
		}

		if (query.isActive !== undefined) {
			where.isActive = query.isActive;
		}

		if (query.search) {
			where.$or = [
				{ email: { $like: `%${query.search}%` } },
				{ firstName: { $like: `%${query.search}%` } },
				{ lastName: { $like: `%${query.search}%` } }
			];
		}

		const page = query.page || 1;
		const limit = query.limit || 10;
		const offset = (page - 1) * limit;

		const [data, total] = await this.userRepo.findAndCount(where, {
			limit,
			offset
		});

		return { data, total };
	}

	/**
	 * 根据 ID 查找用户
	 *
	 * 在当前租户下查找指定 ID 的用户
	 *
	 * @param id - 用户 ID
	 * @returns 用户实体（如果找到），否则抛出异常
	 * @throws NotFoundException 当用户不存在时
	 *
	 * @example
	 * ```typescript
	 * const user = await userService.findOne('user-123');
	 * ```
	 */
	async findOne(id: string): Promise<User> {
		const currentTenantId = RequestContext.getCurrentTenantId();

		if (!currentTenantId) {
			throw new ForbiddenException('租户上下文缺失');
		}

		const user = await this.userRepo.findOne({
			id,
			tenantId: currentTenantId
		});

		if (!user) {
			throw new NotFoundException(`未找到 ID 为 ${id} 的用户`);
		}

		return user;
	}

	/**
	 * 更新用户信息
	 *
	 * 更新用户的基本信息，支持邮箱、密码、角色等字段更新
	 *
	 * @param id - 用户 ID
	 * @param updateUserDto - 更新数据
	 * @returns 已更新的用户
	 * @throws NotFoundException 当用户不存在时
	 * @throws BadRequestException 当邮箱已存在或密码强度不足时
	 *
	 * @example
	 * ```typescript
	 * const user = await userService.update('user-123', {
	 *   firstName: 'Jane',
	 *   lastName: 'Doe'
	 * });
	 * ```
	 */
	async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
		const currentTenantId = RequestContext.getCurrentTenantId();

		if (!currentTenantId) {
			throw new ForbiddenException('租户上下文缺失');
		}

		const user = await this.userRepo.findOne({
			id,
			tenantId: currentTenantId
		});

		if (!user) {
			throw new NotFoundException(`未找到 ID 为 ${id} 的用户`);
		}

		if (updateUserDto.email) {
			const existingUser = await this.userRepo.findOne({
				email: updateUserDto.email,
				tenantId: currentTenantId,
				id: { $ne: id }
			});

			if (existingUser) {
				throw new BadRequestException('此邮箱在该租户下已存在');
			}
		}

		const updateData: any = { ...updateUserDto };

		if (updateUserDto.role) {
			updateData.role = UserRole[updateUserDto.role];
		}

		if (updateUserDto.password) {
			const passwordValidation = validatePasswordStrength(updateUserDto.password);

			if (!passwordValidation.valid) {
				throw new BadRequestException(passwordValidation.errors.join(', '));
			}

			updateData.password = await hashPassword(updateUserDto.password);
		}

		wrap(user).assign(updateData);

		this.em.persist(user);
		await this.em.flush();

		return user;
	}

	/**
	 * 删除用户
	 *
	 * 从当前租户中删除指定用户
	 *
	 * @param id - 用户 ID
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当用户不存在时
	 *
	 * @example
	 * ```typescript
	 * await userService.remove('user-123');
	 * ```
	 */
	async remove(id: string): Promise<void> {
		const user = await this.findOne(id);

		this.em.remove(user);
		await this.em.flush();
	}

	/**
	 * 更新用户头像
	 *
	 * 更新用户的头像 URL
	 *
	 * @param id - 用户 ID
	 * @param updateAvatarDto - 头像数据
	 * @returns 已更新的用户
	 * @throws NotFoundException 当用户不存在时
	 *
	 * @example
	 * ```typescript
	 * const user = await userService.updateAvatar('user-123', {
	 *   avatar: 'https://example.com/avatar.jpg'
	 * });
	 * ```
	 */
	async updateAvatar(id: string, updateAvatarDto: UpdateAvatarDto): Promise<User> {
		const user = await this.findOne(id);

		user.avatar = updateAvatarDto.avatar;

		this.em.persist(user);
		await this.em.flush();

		return user;
	}

	/**
	 * 更新用户密码
	 *
	 * 验证当前密码后更新为新密码
	 *
	 * @param id - 用户 ID
	 * @param updatePasswordDto - 密码更新数据（当前密码和新密码）
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当用户不存在时
	 * @throws BadRequestException 当当前密码错误或新密码强度不足时
	 *
	 * @example
	 * ```typescript
	 * await userService.updatePassword('user-123', {
	 *   currentPassword: 'OldPassword123!',
	 *   newPassword: 'NewPassword456!'
	 * });
	 * ```
	 */
	async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
		const user = await this.findOne(id);

		const isValidPassword = await verifyPassword(updatePasswordDto.currentPassword, user.password);

		if (!isValidPassword) {
			throw new BadRequestException('当前密码错误');
		}

		const passwordValidation = validatePasswordStrength(updatePasswordDto.newPassword);

		if (!passwordValidation.valid) {
			throw new BadRequestException(passwordValidation.errors.join(', '));
		}

		const hashedPassword = await hashPassword(updatePasswordDto.newPassword);
		user.password = hashedPassword;

		this.em.persist(user);
		await this.em.flush();
	}

	/**
	 * 停用用户
	 *
	 * 将用户状态设置为非活跃
	 *
	 * @param id - 用户 ID
	 * @returns 已停用的用户
	 * @throws NotFoundException 当用户不存在时
	 *
	 * @example
	 * ```typescript
	 * const user = await userService.deactivate('user-123');
	 * ```
	 */
	async deactivate(id: string): Promise<User> {
		const user = await this.findOne(id);

		user.isActive = false;

		this.em.persist(user);
		await this.em.flush();

		return user;
	}

	/**
	 * 激活用户
	 *
	 * 将用户状态设置为活跃
	 *
	 * @param id - 用户 ID
	 * @returns 已激活的用户
	 * @throws NotFoundException 当用户不存在时
	 *
	 * @example
	 * ```typescript
	 * const user = await userService.activate('user-123');
	 * ```
	 */
	async activate(id: string): Promise<User> {
		const user = await this.findOne(id);

		user.isActive = true;

		this.em.persist(user);
		await this.em.flush();

		return user;
	}

	/**
	 * 更新用户最后登录时间
	 *
	 * 更新用户的最后登录时间和登录次数
	 *
	 * @param id - 用户 ID
	 * @returns Promise<void> 无返回值
	 * @throws NotFoundException 当用户不存在时
	 *
	 * @example
	 * ```typescript
	 * await userService.updateLastLogin('user-123');
	 * ```
	 */
	async updateLastLogin(id: string): Promise<void> {
		const user = await this.findOne(id);

		user.lastLoginAt = new Date();
		user.loginCount = (user.loginCount || 0) + 1;

		this.em.persist(user);
		await this.em.flush();
	}
}
