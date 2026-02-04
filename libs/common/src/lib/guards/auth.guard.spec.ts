import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PUBLIC_KEY } from './auth.guard';
import { verify } from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('AuthGuard', () => {
	let guard: AuthGuard;
	let reflector: Reflector;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthGuard,
				{
					provide: Reflector,
					useValue: {
						getAllAndOverride: jest.fn()
					}
				}
			]
		}).compile();

		guard = module.get<AuthGuard>(AuthGuard);
		reflector = module.get<Reflector>(Reflector);
	});

	describe('canActivate', () => {
		it('should allow access for public routes', () => {
			const context = createMockExecutionContext({
				headers: {
					authorization: 'Bearer test-token'
				}
			});
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

			expect(guard.canActivate(context)).toBe(true);
		});

		it('should throw UnauthorizedException when token is missing', () => {
			const context = createMockExecutionContext({
				headers: {}
			});
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

			expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
		});

		it('should throw UnauthorizedException for invalid token', () => {
			const context = createMockExecutionContext({
				headers: {
					authorization: 'Bearer invalid-token'
				}
			});
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
			(verify as jest.Mock).mockImplementation(() => {
				throw new Error('Invalid token');
			});

			expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
		});

		it('should allow access with valid token', () => {
			const mockRequest = {
				headers: {
					authorization: 'Bearer valid-token'
				},
				user: null
			};
			const context = createMockExecutionContext(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
			const mockPayload = { id: 'user-id', tenantId: 'tenant-1' };
			(verify as jest.Mock).mockReturnValue(mockPayload);

			const result = guard.canActivate(context);

			expect(result).toBe(true);
			expect(mockRequest.user).toEqual(mockPayload);
		});
	});
});

function createMockExecutionContext(
	request: any = {
		headers: {
			authorization: 'Bearer test-token'
		},
		user: null
	}
): ExecutionContext {
	return {
		switchToHttp: () => ({
			getRequest: () => request
		}),
		getHandler: () => ({}),
		getClass: () => ({})
	} as any;
}
