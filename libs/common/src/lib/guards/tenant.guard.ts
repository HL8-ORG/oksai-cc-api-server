import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * 租户守卫
 *
 * 确保请求包含有效的租户上下文信息
 */
@Injectable()
export class TenantGuard implements CanActivate {
	/**
	 * 激活守卫
	 *
	 * 检查请求中是否包含有效的租户 ID
	 *
	 * @param context - 执行上下文
	 * @returns boolean 是否允许访问
	 * @throws ForbiddenException 当租户上下文信息缺失时
	 *
	 * @example
	 * ```typescript
	 * // 在控制器中使用
	 * @UseGuards(TenantGuard)
	 * @Controller('users')
	 * export class UserController {
	 *   @Get()
	 *   getUsers() {
	 *     return this.userService.findAll();
	 *   }
	 * }
	 * ```
	 */
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user || !user.tenantId) {
			throw new ForbiddenException('租户上下文信息缺失');
		}

		return true;
	}
}
