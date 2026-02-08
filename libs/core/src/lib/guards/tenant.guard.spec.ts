import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestContext } from '../context/request-context.service';
import { TenantGuard } from './tenant.guard';

describe('TenantGuard', () => {
	it('当路由标记为 Public 时，应跳过租户上下文校验', () => {
		const reflector = {
			getAllAndOverride: jest.fn().mockReturnValue(true)
		} as unknown as Reflector;

		const guard = new TenantGuard(reflector);

		jest.spyOn(RequestContext, 'getCurrentTenantId').mockReturnValue(null);

		const context: any = {
			getHandler: () => ({}),
			getClass: () => ({})
		};

		expect(guard.canActivate(context)).toBe(true);
	});

	it('当路由非 Public 且缺失租户上下文时，应拒绝访问', () => {
		const reflector = {
			getAllAndOverride: jest.fn().mockReturnValue(false)
		} as unknown as Reflector;

		const guard = new TenantGuard(reflector);

		jest.spyOn(RequestContext, 'getCurrentTenantId').mockReturnValue(null);

		const context: any = {
			getHandler: () => ({}),
			getClass: () => ({})
		};

		expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
	});
});
