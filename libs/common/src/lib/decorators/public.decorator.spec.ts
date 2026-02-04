import { PUBLIC_KEY, Public } from './public.decorator';

describe('Public Decorator', () => {
	it('should have PUBLIC_KEY defined', () => {
		expect(PUBLIC_KEY).toBeDefined();
		expect(PUBLIC_KEY).toBe('isPublic');
	});

	it('should return a decorator function', () => {
		expect(typeof Public).toBe('function');
	});
});
