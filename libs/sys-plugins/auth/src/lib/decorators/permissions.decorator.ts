import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../constants/permissions.constants';

/**
 * 权限装饰器
 *
 * 用于标记路由或方法所需的权限
 *
 * @param permissions - 所需权限列表
 *
 * @example
 * ```typescript
 * @RequirePermissions('users:read', 'users:write')
 * @Get('users')
 * async findAll() {
 *   // 返回用户列表
 * }
 * ```
 */
export const RequirePermissions = (permissions: string[]) => SetMetadata(PERMISSIONS_KEY, { permissions });
