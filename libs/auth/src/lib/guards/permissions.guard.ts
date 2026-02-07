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
		// 获取所需权限
		const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		// 如果没有权限要求，直接通过
		if (!requiredPermissions || requiredPermissions.length === 0) {
			return true;
		}

		// 获取当前用户
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user) {
			throw new UnauthorizedException('未登录用户无法访问此资源');
		}

		// 为用户创建能力
		const ability = this.abilityFactory.createForUser(user);

		// 检查所有必需权限
		for (const permission of requiredPermissions) {
			const [action, subject] = permission.split(':');

			if (!ability.can(action as any, subject as any)) {
				throw new ForbiddenException(`您没有执行 ${action} 操作的权限，需要权限: ${permission}`);
			}
		}

		return true;
	}
}
