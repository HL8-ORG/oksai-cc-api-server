import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestContext } from '../context/request-context.service';
import { PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * 租户上下文守卫
 *
 * 确保请求包含有效的租户上下文
 * 所有受保护的路由应该在 RequestContext 中包含 tenantId
 */
@Injectable()
export class TenantGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [context.getHandler(), context.getClass()]);
		if (isPublic) {
			return true;
		}

		const tenantId = RequestContext.getCurrentTenantId();

		if (!tenantId) {
			throw new ForbiddenException('租户上下文缺失');
		}

		return true;
	}
}
