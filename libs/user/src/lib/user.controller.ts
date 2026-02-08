import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, UpdateAvatarDto, UpdatePasswordDto } from './dto/user.dto';

/**
 * 用户控制器
 *
 * 提供用户管理相关的 API 端点，包括用户的增删改查、激活、停用、头像更新和密码更新
 */
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * 创建新用户
	 *
	 * 在当前租户下创建新用户
	 *
	 * @param createUserDto - 用户创建数据
	 * @returns 已创建的用户
	 *
	 * @example
	 * ```bash
	 * POST /users
	 * {
	 *   "email": "user@example.com",
	 *   "password": "Password123!",
	 *   "firstName": "John",
	 *   "lastName": "Doe"
	 * }
	 * ```
	 */
	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	/**
	 * 查询用户列表
	 *
	 * 在当前租户下分页查询用户列表，支持按角色、状态、关键词筛选
	 *
	 * @param query - 查询参数
	 * @returns 包含用户列表和总数的响应
	 *
	 * @example
	 * ```bash
	 * GET /users?role=ADMIN&isActive=true&search=John&page=1&limit=10
	 * ```
	 */
	@Get()
	async findAll(@Query() query: QueryUserDto) {
		return this.userService.findAll(query);
	}

	/**
	 * 根据 ID 查找用户
	 *
	 * 在当前租户下查找指定 ID 的用户
	 *
	 * @param id - 用户 ID
	 * @returns 用户实体
	 *
	 * @example
	 * ```bash
	 * GET /users/:id
	 * ```
	 */
	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.userService.findOne(id);
	}

	/**
	 * 更新用户
	 *
	 * 更新用户信息
	 *
	 * @param id - 用户 ID
	 * @param updateUserDto - 更新数据
	 * @returns 已更新的用户
	 *
	 * @example
	 * ```bash
	 * PUT /users/:id
	 * {
	 *   "firstName": "Jane",
	 *   "lastName": "Doe"
	 * }
	 * ```
	 */
	@Put(':id')
	async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(id, updateUserDto);
	}

	/**
	 * 删除用户
	 *
	 * 从当前租户中删除指定用户
	 *
	 * @param id - 用户 ID
	 *
	 * @example
	 * ```bash
	 * DELETE /users/:id
	 * ```
	 */
	@Delete(':id')
	async remove(@Param('id') id: string) {
		return this.userService.remove(id);
	}

	/**
	 * 更新用户头像
	 *
	 * 更新用户的头像 URL
	 *
	 * @param id - 用户 ID
	 * @param updateAvatarDto - 头像数据
	 * @returns 已更新的用户
	 *
	 * @example
	 * ```bash
	 * PUT /users/:id/avatar
	 * {
	 *   "avatar": "https://example.com/avatar.jpg"
	 * }
	 * ```
	 */
	@Put(':id/avatar')
	async updateAvatar(@Param('id') id: string, @Body() updateAvatarDto: UpdateAvatarDto) {
		return this.userService.updateAvatar(id, updateAvatarDto);
	}

	/**
	 * 更新用户密码
	 *
	 * 验证当前密码后更新为新密码
	 *
	 * @param id - 用户 ID
	 * @param updatePasswordDto - 密码更新数据
	 *
	 * @example
	 * ```bash
	 * PUT /users/:id/password
	 * {
	 *   "currentPassword": "OldPassword123!",
	 *   "newPassword": "NewPassword456!"
	 * }
	 * ```
	 */
	@Put(':id/password')
	async updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
		return this.userService.updatePassword(id, updatePasswordDto);
	}

	/**
	 * 停用用户
	 *
	 * 将用户状态设置为非活跃
	 *
	 * @param id - 用户 ID
	 * @returns 已停用的用户
	 *
	 * @example
	 * ```bash
	 * PUT /users/:id/deactivate
	 * ```
	 */
	@Put(':id/deactivate')
	async deactivate(@Param('id') id: string) {
		return this.userService.deactivate(id);
	}

	/**
	 * 激活用户
	 *
	 * 将用户状态设置为活跃
	 *
	 * @param id - 用户 ID
	 * @returns 已激活的用户
	 *
	 * @example
	 * ```bash
	 * PUT /users/:id/activate
	 * ```
	 */
	@Put(':id/activate')
	async activate(@Param('id') id: string) {
		return this.userService.activate(id);
	}

	/**
	 * 更新用户最后登录时间
	 *
	 * 更新用户的最后登录时间和登录次数
	 *
	 * @param id - 用户 ID
	 *
	 * @example
	 * ```bash
	 * PUT /users/:id/last-login
	 * ```
	 */
	@Put(':id/last-login')
	async updateLastLogin(@Param('id') id: string) {
		return this.userService.updateLastLogin(id);
	}
}
