import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

/**
 * Role-Based Access Control Guard
 *
 * Checks if the user has the required roles to access a route.
 * Use the @Roles() decorator to specify required roles.
 */
@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

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
			throw new ForbiddenException('User role is required');
		}

		const hasRole = requiredRoles.includes(user.role);

		if (!hasRole) {
			throw new ForbiddenException('You do not have the required permissions');
		}

		return true;
	}
}
