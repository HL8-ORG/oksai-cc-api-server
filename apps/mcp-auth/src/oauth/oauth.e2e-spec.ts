/**
 * OAuth 2.0 授权服务器集成测试
 *
 * 测试 JWT 令牌生成、验证和内省功能
 */

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JwtPayload } from '../auth/jwt.service';
import { JwksService } from '../jwks/jwks.service';

describe('OAuth 2.0 授权服务器集成测试', () => {
	let jwtService: JwtService;
	let jwksService: JwksService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [JwtService, JwksService]
		}).compile();

		jwtService = module.get<JwtService>(JwtService);
		jwksService = module.get<JwksService>(JwksService);
	});

	describe('JWT 令牌生成和验证', () => {
		it('应该成功生成访问令牌', async () => {
			const payload: JwtPayload = {
				sub: 'user-1',
				name: 'Test User',
				email: 'test@example.com',
				tenantId: 'tenant-1'
			};

			const token = jwtService.sign(payload, 3600);

			expect(token).toBeDefined();
			expect(typeof token).toBe('string');

			// 验证令牌可以解析
			const result = jwtService.verify(token);
			expect(result.valid).toBe(true);
			expect(result.payload?.sub).toBe('user-1');
			expect(result.payload?.email).toBe('test@example.com');
		});

		it('应该成功生成令牌对', async () => {
			const payload: JwtPayload = {
				sub: 'user-1',
				name: 'Test User',
				email: 'test@example.com',
				tenantId: 'tenant-1'
			};

			const tokenPair = jwtService.generateTokenPair(payload);

			expect(tokenPair.accessToken).toBeDefined();
			expect(tokenPair.refreshToken).toBeDefined();

			// 验证访问令牌
			const accessResult = jwtService.verify(tokenPair.accessToken);
			expect(accessResult.valid).toBe(true);
			expect(accessResult.payload?.sub).toBe('user-1');

			// 验证刷新令牌
			const refreshResult = jwtService.verify(tokenPair.refreshToken);
			expect(refreshResult.valid).toBe(true);
			expect(refreshResult.payload?.sub).toBe('user-1');
			expect(refreshResult.payload?.tokenType).toBe('refresh');
		});

		it('应该成功刷新访问令牌', async () => {
			const payload: JwtPayload = {
				sub: 'user-1',
				name: 'Test User',
				email: 'test@example.com'
			};

			const { refreshToken } = jwtService.generateTokenPair(payload);

			// 使用刷新令牌生成新的访问令牌
			const newAccessToken = jwtService.refreshAccessToken(refreshToken);

			expect(newAccessToken).not.toBeNull();
			expect(typeof newAccessToken).toBe('string');

			// 验证新令牌
			const result = jwtService.verify(newAccessToken as string);
			expect(result.valid).toBe(true);
			expect(result.payload?.sub).toBe('user-1');
		});

		it('应该拒绝无效的刷新令牌', async () => {
			const invalidRefreshToken = 'invalid.refresh.token';

			const result = jwtService.refreshAccessToken(invalidRefreshToken);
			expect(result).toBeNull();
		});

		it('应该拒绝无效令牌', async () => {
			const invalidToken = 'invalid.token.here';

			const result = jwtService.verify(invalidToken);

			expect(result.valid).toBe(false);
			expect(result.payload).toBeNull();
			expect(result.error).toBeDefined();
		});
	});

	describe('JWKS 公钥端点', () => {
		it('应该返回 JWKS 响应', () => {
			const jwksResponse = jwksService.getJwks();

			expect(jwksResponse).toBeDefined();
			expect(jwksResponse.keys).toBeDefined();
			expect(Array.isArray(jwksResponse.keys)).toBe(true);
		});

		it('应该正确处理 HS256 算法（无公钥）', () => {
			const jwksResponse = jwksService.getJwks();

			// HS256 是对称加密，不应该返回公钥
			expect(jwksResponse.keys).toHaveLength(0);
		});
	});

	describe('令牌内省', () => {
		it('应该成功内省有效令牌', async () => {
			const payload: JwtPayload = {
				sub: 'user-1',
				name: 'Test User',
				email: 'test@example.com',
				tenantId: 'tenant-1',
				organizationId: 'org-1'
			};

			const token = jwtService.sign(payload, 3600);

			// 内省令牌（模拟）
			const result = jwtService.verify(token);

			expect(result.valid).toBe(true);
			expect(result.payload?.sub).toBe('user-1');
			expect(result.payload?.email).toBe('test@example.com');
			expect(result.payload?.tenantId).toBe('tenant-1');
			expect(result.payload?.organizationId).toBe('org-1');
		});

		it('应该拒绝内省无效令牌', () => {
			const invalidToken = 'invalid.token.here';

			const result = jwtService.verify(invalidToken);

			expect(result.valid).toBe(false);
			expect(result.payload).toBeNull();
			expect(result.error).toBeDefined();
		});

		it('应该拒绝内省无效令牌', () => {
			const invalidToken = 'invalid.token.here';

			const result = jwtService.verify(invalidToken);

			expect(result.valid).toBe(false);
			expect(result.payload).toBeNull();
			expect(result.error).toBeDefined();
		});
	});

	describe('OAuth 授权流程模拟', () => {
		it('应该支持完整的授权流程', async () => {
			// 步骤 1: 用户登录，生成令牌对
			const userCredentials: JwtPayload = {
				sub: 'user-1',
				name: 'Test User',
				email: 'test@example.com',
				tenantId: 'tenant-1',
				organizationId: 'org-1'
			};

			const { accessToken, refreshToken } = jwtService.generateTokenPair(userCredentials);

			expect(accessToken).toBeDefined();
			expect(refreshToken).toBeDefined();

			// 步骤 2: 验证访问令牌
			const accessResult = jwtService.verify(accessToken);

			expect(accessResult.valid).toBe(true);
			expect(accessResult.payload?.sub).toBe(userCredentials.sub);
			expect(accessResult.payload?.email).toBe(userCredentials.email);
			expect(accessResult.payload?.tenantId).toBe(userCredentials.tenantId);
			expect(accessResult.payload?.organizationId).toBe(userCredentials.organizationId);

			// 步骤 3: 使用刷新令牌获取新的访问令牌
			const newAccessToken = jwtService.refreshAccessToken(refreshToken);

			expect(newAccessToken).not.toBeNull();

			// 步骤 4: 验证新的访问令牌
			const newAccessResult = jwtService.verify(newAccessToken as string);

			expect(newAccessResult.valid).toBe(true);
			expect(newAccessResult.payload?.sub).toBe(userCredentials.sub);
		});
	});
});
