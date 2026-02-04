import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Tenant Context Guard
 *
 * Ensures that the request contains a valid tenant context.
 * All protected routes should have a tenantId in the user payload.
 */
@Injectable()
export class TenantGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user || !user.tenantId) {
			throw new ForbiddenException('Tenant context is required');
		}

		return true;
	}
}
