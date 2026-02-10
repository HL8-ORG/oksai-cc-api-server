import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionsMetadata } from '../decorators/permissions.decorator';

/**
 * 权限守卫
 *
 * 检查用户是否有访问路由所需的权限
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	/**
	 * 激活守卫
	 *
	 * 检查用户是否有访问路由所需的权限
	 *
	 * @param context - 执行上下文
	 * @returns 如果用户有权限返回 true，否则返回 false
	 * @throws ForbiddenException 当用户没有权限时
	 *
	 * @example
	 * ```typescript
	 * @Controller('users')
	 * @UseGuards(PermissionsGuard)
	 * export class UserController {
	 *   @Get()
	 *   @Permissions({ type: 'USER', action: 'VIEW', resource: 'user' })
	 *   findAll() {
	 *     return '用户列表';
	 *   }
	 * }
	 * ```
	 */
	canActivate(context: ExecutionContext): boolean {
		// 获取路由所需的权限
		const requiredPermissions = this.reflector.getAllAndOverride<PermissionsMetadata[]>(PERMISSIONS_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		// 如果没有权限要求，允许访问
		if (!requiredPermissions || requiredPermissions.length === 0) {
			return true;
		}

		// 获取用户和请求对象
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		// 如果用户不存在，拒绝访问
		if (!user) {
			throw new ForbiddenException('未登录或无权限访问');
		}

		// 检查用户是否有所有必需的权限
		for (const permission of requiredPermissions) {
			if (!this.hasPermission(user, permission)) {
				throw new ForbiddenException(`无权限执行此操作，需要 ${permission.type}:${permission.action} 权限`);
			}
		}

		return true;
	}

	/**
	 * 检查用户是否有特定权限
	 *
	 * @param user - 用户对象
	 * @param permission - 权限元数据
	 * @returns 如果用户有权限返回 true，否则返回 false
	 */
	private hasPermission(user: any, permission: PermissionsMetadata): boolean {
		// 管理员拥有所有权限
		if (user.role === 'ADMIN') {
			return true;
		}

		// 如果用户没有权限列表，拒绝访问
		if (!user.permissions || !Array.isArray(user.permissions)) {
			return false;
		}

		// 检查用户是否有匹配的权限
		return user.permissions.some((userPermission: any) => {
			const typeMatch = !permission.type || userPermission.type === permission.type;
			const actionMatch = !permission.action || userPermission.action === permission.action;
			const resourceMatch = !permission.resource || userPermission.resource === permission.resource;

			return typeMatch && actionMatch && resourceMatch;
		});
	}
}
