import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles Decorator', () => {
	it('should have ROLES_KEY defined', () => {
		expect(ROLES_KEY).toBeDefined();
		expect(ROLES_KEY).toBe('roles');
	});

	it('should return a decorator function', () => {
		expect(typeof Roles).toBe('function');
	});

	it('should be callable with string arguments', () => {
		expect(() => Roles('ADMIN')).not.toThrow();
	});

	it('should be callable with multiple string arguments', () => {
		expect(() => Roles('ADMIN', 'MANAGER', 'USER')).not.toThrow();
	});
});
