import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { VersionInterceptor } from './version.interceptor';
import { ExecutionContext, CallHandler, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('VersionInterceptor', () => {
	let interceptor: VersionInterceptor;
	let reflector: Reflector;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				VersionInterceptor,
				{
					provide: Reflector,
					useValue: {
						getAllAndOverride: jest.fn()
					}
				}
			]
		}).compile();

		interceptor = module.get<VersionInterceptor>(VersionInterceptor);
		reflector = module.get<Reflector>(Reflector);
	});

	it('应该定义', () => {
		expect(interceptor).toBeDefined();
	});

	describe('intercept', () => {
		it('应该在没有版本元数据时通过请求', (done) => {
			const context = createMockContext();
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

			const next: CallHandler = { handle: () => of({ data: 'test' }) };

			interceptor.intercept(context, next).subscribe({
				next: (data) => {
					expect(data).toEqual({ data: 'test' });
					done();
				}
			});
		});

		it('应该支持默认版本', (done) => {
			const context = createMockContext();
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['v1']);

			const next: CallHandler = { handle: () => of({ data: 'test' }) };

			interceptor.intercept(context, next).subscribe({
				next: (data) => {
					expect(data).toEqual({ data: 'test' });
					expect(context.switchToHttp().getRequest().res.setHeader).toHaveBeenCalledWith(
						'X-API-Version',
						'v1'
					);
					done();
				}
			});
		});

		it('应该从请求头中提取版本', (done) => {
			const context = createMockContext({ 'x-api-version': 'v2' });
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['v1', 'v2']);

			const next: CallHandler = { handle: () => of({ data: 'test' }) };

			interceptor.intercept(context, next).subscribe({
				next: (data) => {
					expect(context.switchToHttp().getRequest().res.setHeader).toHaveBeenCalledWith(
						'X-API-Version',
						'v2'
					);
					done();
				}
			});
		});

		it('应该从查询参数中提取版本', (done) => {
			const context = createMockContext();
			context.switchToHttp().getRequest().query = { version: 'v2' };
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['v1', 'v2']);

			const next: CallHandler = { handle: () => of({ data: 'test' }) };

			interceptor.intercept(context, next).subscribe({
				next: (data) => {
					expect(context.switchToHttp().getRequest().res.setHeader).toHaveBeenCalledWith(
						'X-API-Version',
						'v2'
					);
					done();
				}
			});
		});

		it('应该拒绝不支持的版本', (done) => {
			const context = createMockContext({ 'x-api-version': 'v3' });
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['v1', 'v2']);

			const next: CallHandler = { handle: () => of({ data: 'test' }) };

			interceptor.intercept(context, next).subscribe({
				error: (error) => {
					expect(error).toBeInstanceOf(NotFoundException);
					expect(error.message).toContain('不支持的 API 版本');
					done();
				}
			});
		});

		it('应该为弃用版本添加警告头', (done) => {
			interceptor = new VersionInterceptor(reflector, { deprecatedVersions: ['v1'] });
			const context = createMockContext();
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['v1']);

			const next: CallHandler = { handle: () => of({ data: 'test' }) };

			interceptor.intercept(context, next).subscribe({
				next: (data) => {
					const request = context.switchToHttp().getRequest();
					expect(request.res.setHeader).toHaveBeenCalledWith('X-API-Deprecated', expect.any(String));
					done();
				}
			});
		});

		it('应该支持通配符版本', (done) => {
			const context = createMockContext({ 'x-api-version': 'v99' });
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['*']);

			const next: CallHandler = { handle: () => of({ data: 'test' }) };

			interceptor.intercept(context, next).subscribe({
				next: (data) => {
					expect(data).toEqual({ data: 'test' });
					done();
				}
			});
		});
	});
});

function createMockContext(headers?: Record<string, string>): ExecutionContext {
	return {
		switchToHttp: () => ({
			getRequest: () => ({
				headers: headers || {},
				query: {},
				res: {
					setHeader: jest.fn()
				}
			}),
			getResponse: () => ({})
		}),
		getClass: () => ({}),
		getHandler: () => ({}),
		getArgs: () => [],
		getArgByIndex: () => ({}),
		switchToRpc: () => ({}),
		switchToWs: () => ({}),
		getType: () => 'http'
	} as any as ExecutionContext;
}
