import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 角色要求装饰器
 *
 * 标记路由或控制器需要特定的角色权限才能访问
 *
 * @param roles - 允许访问的角色数组
 * @returns 装饰器函数
 *
 * @example
 * ```typescript
 * // 标记单个路由需要管理员权限
 * @Controller('admin')
 * export class AdminController {
 *   @Get('users')
 *   @Roles('ADMIN', 'SUPER_ADMIN')
 *   getUsers() {
 *     return this.userService.findAll();
 *   }
 * }
 *
 * // 标记整个控制器需要特定角色
 * @Roles('USER')
 * @Controller('profile')
 * export class ProfileController {
 *   @Get()
 *   getProfile() {
 *     return this.profileService.get();
 *   }
 * }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
