import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';

describe('TenantGuard', () => {
	let guard: TenantGuard;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TenantGuard]
		}).compile();

		guard = module.get<TenantGuard>(TenantGuard);
	});

	describe('canActivate', () => {
		it('should allow access when user has tenantId', () => {
			const mockRequest = { user: { id: 'user-1', tenantId: 'tenant-1' } };
			const context = createMockExecutionContext(mockRequest);

			expect(guard.canActivate(context)).toBe(true);
		});

		it('should throw ForbiddenException when user is missing', () => {
			const mockRequest = { user: undefined };
			const context = createMockExecutionContext(mockRequest);

			expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
		});

		it('should throw ForbiddenException when tenantId is missing', () => {
			const mockRequest = { user: { id: 'user-1' } };
			const context = createMockExecutionContext(mockRequest);

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
