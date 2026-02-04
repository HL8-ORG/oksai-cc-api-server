import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

/**
 * 角色守卫
 *
 * 根据用户角色验证访问权限
 */
@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	/**
	 * 激活守卫
	 *
	 * 检查用户是否具有所需的角色权限
	 *
	 * @param context - 执行上下文
	 * @returns boolean 是否允许访问
	 * @throws ForbiddenException 当用户角色缺失或权限不足时
	 *
	 * @example
	 * ```typescript
	 * // 在控制器中使用
	 * @UseGuards(RoleGuard)
	 * @Controller('admin')
	 * export class AdminController {
	 *   @Get('users')
	 *   @Roles('ADMIN', 'SUPER_ADMIN')
	 *   getUsers() {
	 *     return this.userService.findAll();
	 *   }
	 *
	 *   @Get('reports')
	 *   @Roles('ADMIN')
	 *   getReports() {
	 *     return this.reportService.findAll();
	 *   }
	 * }
	 * ```
	 */
	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user || !user.role) {
			throw new ForbiddenException('用户角色信息缺失');
		}

		const hasRole = requiredRoles.includes(user.role);

		if (!hasRole) {
			throw new ForbiddenException('您没有所需的权限');
		}

		return true;
	}
}
