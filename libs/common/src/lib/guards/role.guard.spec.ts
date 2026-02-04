import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleGuard, ROLES_KEY } from './role.guard';

describe('RoleGuard', () => {
	let guard: RoleGuard;
	let reflector: Reflector;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RoleGuard,
				{
					provide: Reflector,
					useValue: {
						getAllAndOverride: jest.fn()
					}
				}
			]
		}).compile();

		guard = module.get<RoleGuard>(RoleGuard);
		reflector = module.get<Reflector>(Reflector);
	});

	describe('canActivate', () => {
		it('should allow access when no roles are required', () => {
			const mockRequest = { user: { id: 'user-1', role: 'ADMIN' } };
			const context = createMockExecutionContext(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

			expect(guard.canActivate(context)).toBe(true);
		});

		it('should allow access when user has required role', () => {
			const mockRequest = { user: { id: 'user-1', role: 'ADMIN' } };
			const context = createMockExecutionContext(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

			expect(guard.canActivate(context)).toBe(true);
		});

		it('should allow access when user has one of required roles', () => {
			const mockRequest = { user: { id: 'user-1', role: 'ADMIN' } };
			const context = createMockExecutionContext(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'SUPER_ADMIN']);

			expect(guard.canActivate(context)).toBe(true);
		});

		it('should throw ForbiddenException when user is missing', () => {
			const mockRequest = { user: undefined };
			const context = createMockExecutionContext(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

			expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
		});

		it('should throw ForbiddenException when user role is missing', () => {
			const mockRequest = { user: { id: 'user-1' } };
			const context = createMockExecutionContext(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

			expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
		});

		it('should throw ForbiddenException when user does not have required role', () => {
			const mockRequest = { user: { id: 'user-1', role: 'USER' } };
			const context = createMockExecutionContext(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

			expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
		});
	});
});

function createMockExecutionContext(request: any = { user: undefined }): ExecutionContext {
	return {
		switchToHttp: () => ({
			getRequest: () => request
		}),
		getHandler: () => ({}),
		getClass: () => ({})
	} as any;
}
