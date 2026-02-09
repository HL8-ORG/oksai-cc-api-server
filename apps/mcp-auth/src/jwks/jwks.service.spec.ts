/**
 * JWKS 服务测试
 */

import { JwksService } from './jwks.service';

describe('JwksService', () => {
	let service: JwksService;

	beforeEach(() => {
		service = new JwksService();
	});

	describe('constructor', () => {
		it('should create service instance', () => {
			expect(service).toBeDefined();
		});
	});

	describe('getJwks', () => {
		it('should return empty JWKS for HS256', () => {
			const jwks = service.getJwks();
			expect(jwks).toBeDefined();
			expect(jwks.keys).toEqual([]);
		});
	});

	describe('getConfig', () => {
		it('should return config', () => {
			const config = service.getConfig();
			expect(config).toBeDefined();
			expect(config.enabled).toBeDefined();
			expect(config.path).toBeDefined();
			expect(config.keyAlg).toBeDefined();
		});
	});

	describe('isEnabled', () => {
		it('should return enabled status', () => {
			const enabled = service.isEnabled();
			expect(typeof enabled).toBe('boolean');
		});
	});
});
