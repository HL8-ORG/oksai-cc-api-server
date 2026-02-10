import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../constants/permissions.constants';
import { AbilityFactory } from '../abilities/ability.factory';

/**
 * 权限守卫
 *
 * 基于 CASL 检查用户权限
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private readonly reflector: Reflector, private readonly abilityFactory: AbilityFactory) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		if (!requiredPermissions || requiredPermissions.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user) {
			throw new UnauthorizedException('未登录用户无法访问此资源');
		}

		const ability = await this.abilityFactory.createForUser(user);

		for (const permission of requiredPermissions) {
			const [action, subject] = permission.split(':');

			if (!ability.can(action as any, subject as any)) {
				throw new ForbiddenException(`您没有执行 ${action} 操作的权限，需要权限: ${permission}`);
			}
		}

		return true;
	}
}
