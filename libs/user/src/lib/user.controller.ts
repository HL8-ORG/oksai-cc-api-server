import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
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
	 * @param req - HTTP 请求对象（包含租户 ID）
	 * @returns 已创建的用户
	 *
	 * @example
	 * ```bash
	 * POST /users
	 * {
	 *   "email": "user@example.com",
	 *   "password": "Password123!",
	 *   "firstName": "John",
	 *   "lastName": "Doe",
	 *   "tenantId": "tenant-123"
	 * }
	 * ```
	 */
	@Post()
	async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
		const currentTenantId = req.user?.tenantId || 'default';
		return this.userService.create(createUserDto, currentTenantId);
	}

	/**
	 * 查询用户列表
	 *
	 * 在当前租户下分页查询用户列表，支持按角色、状态、关键词筛选
	 *
	 * @param query - 查询参数
	 * @param req - HTTP 请求对象（包含租户 ID）
	 * @returns 包含用户列表和总数的响应
	 *
	 * @example
	 * ```bash
	 * GET /users?role=ADMIN&isActive=true&search=John&page=1&limit=10
	 * ```
	 */
	@Get()
	async findAll(@Query() query: QueryUserDto, @Req() req: any) {
		const currentTenantId = req.user?.tenantId || 'default';
		return this.userService.findAll(query, currentTenantId);
	}

	/**
	 * 根据 ID 查找用户
	 *
	 * 在当前租户下查找指定 ID 的用户
	 *
	 * @param id - 用户 ID
	 * @param req - HTTP 请求对象（包含租户 ID）
	 * @returns 用户实体
	 *
	 * @example
	 * ```bash
	 * GET /users/:id
	 * ```
	 */
	@Get(':id')
	async findOne(@Param('id') id: string, @Req() req: any) {
		const currentTenantId = req.user?.tenantId || 'default';
		return this.userService.findOne(id, currentTenantId);
	}

	/**
	 * 更新用户
	 *
	 * 更新用户信息
	 *
	 * @param id - 用户 ID
	 * @param updateUserDto - 更新数据
	 * @param req - HTTP 请求对象（包含租户 ID）
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
	async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
		const currentTenantId = req.user?.tenantId || 'default';
		return this.userService.update(id, updateUserDto, currentTenantId);
	}

	/**
	 * 删除用户
	 *
	 * 删除指定用户
	 *
	 * @param id - 用户 ID
	 * @param req - HTTP 请求对象（包含租户 ID）
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * DELETE /users/:id
	 * ```
	 */
	@Delete(':id')
	async remove(@Param('id') id: string, @Req() req: any) {
		const currentTenantId = req.user?.tenantId || 'default';
		return this.userService.remove(id, currentTenantId);
	}

	/**
	 * 更新用户头像
	 *
	 * 更新用户的头像 URL
	 *
	 * @param id - 用户 ID
	 * @param updateAvatarDto - 头像数据
	 * @param req - HTTP 请求对象（包含租户 ID）
	 * @returns 已更新的用户
	 *
	 * @example
	 * ```bash
	 * POST /users/:id/avatar
	 * {
	 *   "avatar": "https://example.com/avatar.jpg"
	 * }
	 * ```
	 */
	@Post(':id/avatar')
	async updateAvatar(@Param('id') id: string, @Body() updateAvatarDto: UpdateAvatarDto, @Req() req: any) {
		const currentTenantId = req.user?.tenantId || 'default';
		return this.userService.updateAvatar(id, updateAvatarDto, currentTenantId);
	}

	/**
	 * 更新用户密码
	 *
	 * 验证当前密码后更新为新密码
	 *
	 * @param id - 用户 ID
	 * @param updatePasswordDto - 密码更新数据（当前密码和新密码）
	 * @param req - HTTP 请求对象（包含租户 ID）
	 * @returns Promise<void> 无返回值
	 *
	 * @example
	 * ```bash
	 * POST /users/:id/password
	 * {
	 *   "currentPassword": "OldPassword123!",
	 *   "newPassword": "NewPassword456!"
	 * }
	 * ```
	 */
	@Post(':id/password')
	async updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto, @Req() req: any) {
		const currentTenantId = req.user?.tenantId || 'default';
		return this.userService.updatePassword(id, updatePasswordDto, currentTenantId);
	}

	/**
	 * 停用用户
	 *
	 * 将用户状态设置为非活跃
	 *
	 * @param id - 用户 ID
	 * @param req - HTTP 请求对象（包含租户 ID）
	 * @returns 已停用的用户
	 *
	 * @example
	 * ```bash
	 * POST /users/:id/deactivate
	 * ```
	 */
	@Post(':id/deactivate')
	async deactivate(@Param('id') id: string, @Req() req: any) {
		const currentTenantId = req.user?.tenantId || 'default';
		return this.userService.deactivate(id, currentTenantId);
	}

	/**
	 * 激活用户
	 *
	 * 将用户状态设置为活跃
	 *
	 * @param id - 用户 ID
	 * @param req - HTTP 请求对象（包含租户 ID）
	 * @returns 已激活的用户
	 *
	 * @example
	 * ```bash
	 * POST /users/:id/activate
	 * ```
	 */
	@Post(':id/activate')
	async activate(@Param('id') id: string, @Req() req: any) {
		const currentTenantId = req.user?.tenantId || 'default';
		return this.userService.activate(id, currentTenantId);
	}
}
