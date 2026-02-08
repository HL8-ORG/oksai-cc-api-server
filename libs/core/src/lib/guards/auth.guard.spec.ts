import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestContext } from '../context/request-context.service';
import { AuthGuard } from './auth.guard';

const verifyAccessTokenMock = jest.fn();
const getJwtUtilsMock = jest.fn(() => ({ verifyAccessToken: verifyAccessTokenMock }));

jest.mock('../utils/jwt.utils', () => ({
	getJwtUtils: () => getJwtUtilsMock()
}));

describe('AuthGuard（core）', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('当路由标记为 Public 时，应跳过认证', async () => {
		const reflector = { getAllAndOverride: jest.fn().mockReturnValue(true) } as unknown as Reflector;
		const guard = new AuthGuard(reflector);

		const context: any = {
			switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
			getHandler: () => ({}),
			getClass: () => ({})
		};

		await expect(guard.canActivate(context)).resolves.toBe(true);
		expect(getJwtUtilsMock).not.toHaveBeenCalled();
	});

	it('当 token 合法时，应写入 request.user 与 RequestContext.currentUser', async () => {
		const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
		const guard = new AuthGuard(reflector);

		const payload = { sub: 'u1', email: 'u1@test.com', tenantId: 't1', role: 'USER' };
		verifyAccessTokenMock.mockReturnValue(payload);

		const request: any = { headers: { authorization: 'Bearer test-token' } };
		const setCurrentUserSpy = jest.spyOn(RequestContext, 'setCurrentUser').mockImplementation(() => undefined);

		const context: any = {
			switchToHttp: () => ({ getRequest: () => request }),
			getHandler: () => ({}),
			getClass: () => ({})
		};

		await expect(guard.canActivate(context)).resolves.toBe(true);
		expect(request.user).toEqual(payload);
		expect(setCurrentUserSpy).toHaveBeenCalledWith({
			id: 'u1',
			email: 'u1@test.com',
			tenantId: 't1',
			role: 'USER'
		});
	});

	it('当缺失 token 时，应抛出 UnauthorizedException', async () => {
		const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
		const guard = new AuthGuard(reflector);

		const context: any = {
			switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
			getHandler: () => ({}),
			getClass: () => ({})
		};

		await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
	});
});
