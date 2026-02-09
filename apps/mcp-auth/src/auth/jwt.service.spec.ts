/**
 * JWT 服务测试
 */

import { JwtService, JwtPayload } from './jwt.service';

describe('JwtService', () => {
	let service: JwtService;

	beforeEach(() => {
		service = new JwtService();
	});

	describe('constructor', () => {
		it('should create service instance', () => {
			expect(service).toBeDefined();
		});
	});

	describe('sign', () => {
		it('should sign JWT token successfully', () => {
			const payload: JwtPayload = {
				sub: 'test-user',
				name: 'Test User',
				email: 'test@example.com'
			};

			const token = service.sign(payload, 3600);
			expect(token).toBeDefined();
			expect(typeof token).toBe('string');
		});
	});

	describe('decode', () => {
		it('should return null for invalid token', () => {
			const result = service.decode('invalid-token');
			expect(result).toBeNull();
		});

		it('should return null for malformed token', () => {
			const result = service.decode('not.a.valid.jwt');
			expect(result).toBeNull();
		});

		it('should decode valid token', () => {
			const payload: JwtPayload = {
				sub: 'test-user',
				name: 'Test User'
			};
			const token = service.sign(payload, 3600);
			const decoded = service.decode(token);

			expect(decoded).toBeDefined();
			expect(decoded?.sub).toBe('test-user');
		});
	});

	describe('generateTokenPair', () => {
		it('should generate access and refresh tokens', () => {
			const payload: JwtPayload = {
				sub: 'test-user',
				name: 'Test User',
				email: 'test@example.com'
			};

			const tokenPair = service.generateTokenPair(payload);
			expect(tokenPair).toBeDefined();
			expect(tokenPair.accessToken).toBeDefined();
			expect(tokenPair.refreshToken).toBeDefined();
			expect(tokenPair.expiresIn).toBe(3600);
		});
	});

	describe('refreshAccessToken', () => {
		it('should return null for invalid token', () => {
			const result = service.refreshAccessToken('invalid-token');
			expect(result).toBeNull();
		});

		it('should return null for access token (not refresh token)', () => {
			const payload: JwtPayload = {
				sub: 'test-user'
			};
			const accessToken = service.sign({ ...payload, tokenType: 'access' }, 3600);
			const result = service.refreshAccessToken(accessToken);
			expect(result).toBeNull();
		});

		it('should return new access token for valid refresh token', () => {
			const payload: JwtPayload = {
				sub: 'test-user'
			};
			const tokenPair = service.generateTokenPair(payload);

			// Debug: verify refresh token to check tokenType
			const verifyResult = service.verify(tokenPair.refreshToken);
			expect(verifyResult.valid).toBe(true);
			expect(verifyResult.payload?.tokenType).toBe('refresh');

			const newAccessToken = service.refreshAccessToken(tokenPair.refreshToken);
			expect(newAccessToken).toBeDefined();
			expect(typeof newAccessToken).toBe('string');
		});
	});

	describe('verify', () => {
		it('should return invalid for empty token', () => {
			const result = service.verify('');
			expect(result.valid).toBe(false);
		});

		it('should return invalid for malformed token', () => {
			const result = service.verify('not.a.valid.jwt');
			expect(result.valid).toBe(false);
		});

		it('should verify valid token', () => {
			const payload: JwtPayload = {
				sub: 'test-user',
				name: 'Test User'
			};
			const token = service.sign(payload, 3600);
			const result = service.verify(token);

			expect(result.valid).toBe(true);
			expect(result.payload).toBeDefined();
			expect(result.payload?.sub).toBe('test-user');
		});

		it('should reject expired token', () => {
			const payload: JwtPayload = {
				sub: 'test-user'
			};
			const token = service.sign(payload, -1);
			const result = service.verify(token);

			expect(result.valid).toBe(false);
			expect(result.payload).toBeNull();
		});
	});
});
