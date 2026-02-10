import { Auth0Strategy } from './auth0.strategy';

describe('Auth0Strategy', () => {
	let strategy: Auth0Strategy;
	let mockDone: jest.Mock;

	beforeEach(() => {
		strategy = new Auth0Strategy();
		mockDone = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
		delete process.env.AUTH0_CLIENT_ID;
		delete process.env.AUTH0_CLIENT_SECRET;
		delete process.env.AUTH0_DOMAIN;
		delete process.env.API_BASE_URL;
	});

	describe('validate', () => {
		it('should successfully validate Auth0 OAuth profile with user_id', async () => {
			const mockProfile = {
				user_id: 'auth0|1234567890',
				email: 'user@auth0.com',
				name: 'John Doe',
				picture: 'https://example.com/photo.jpg'
			};

			await strategy.validate('access_token', 'refresh_token', {}, mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				id: 'auth0|1234567890',
				emails: [{ value: 'user@auth0.com', verified: true }],
				displayName: 'John Doe',
				picture: 'https://example.com/photo.jpg',
				accessToken: 'access_token',
				refreshToken: 'refresh_token'
			});
		});

		it('should successfully validate Auth0 OAuth profile with sub', async () => {
			const mockProfile = {
				sub: 'auth0|9876543210',
				email: 'user2@auth0.com',
				name: 'Jane Smith',
				picture: 'https://example.com/jane.jpg'
			};

			await strategy.validate('access_token', 'refresh_token', {}, mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				id: 'auth0|9876543210',
				emails: [{ value: 'user2@auth0.com', verified: true }],
				displayName: 'Jane Smith',
				picture: 'https://example.com/jane.jpg',
				accessToken: 'access_token',
				refreshToken: 'refresh_token'
			});
		});

		it('should handle profile with no email', async () => {
			const mockProfile = {
				user_id: 'auth0|111222333',
				email: null,
				name: 'No Email User',
				picture: 'https://example.com/noemail.jpg'
			};

			await strategy.validate('access_token', 'refresh_token', {}, mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				id: 'auth0|111222333',
				emails: [{ value: null, verified: false }],
				displayName: 'No Email User',
				picture: 'https://example.com/noemail.jpg',
				accessToken: 'access_token',
				refreshToken: 'refresh_token'
			});
		});

		it('should handle validation error gracefully', async () => {
			const invalidProfile = null as any;

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			await strategy.validate('access_token', 'refresh_token', {}, invalidProfile, mockDone);

			expect(consoleSpy).toHaveBeenCalledWith('Auth0 OAuth 验证错误:', expect.any(Error));
			expect(mockDone).toHaveBeenCalledWith(expect.any(Error), false);

			consoleSpy.mockRestore();
		});
	});

	describe('constructor', () => {
		it('should initialize with default configuration when env vars are not set', () => {
			delete process.env.AUTH0_CLIENT_ID;
			delete process.env.AUTH0_CLIENT_SECRET;
			delete process.env.AUTH0_DOMAIN;
			delete process.env.API_BASE_URL;

			const newStrategy = new Auth0Strategy();

			expect(newStrategy).toBeDefined();
		});

		it('should initialize with custom configuration when env vars are set', () => {
			process.env.AUTH0_CLIENT_ID = 'custom-client-id';
			process.env.AUTH0_CLIENT_SECRET = 'custom-client-secret';
			process.env.AUTH0_DOMAIN = 'custom-domain.auth0.com';
			process.env.API_BASE_URL = 'https://api.example.com';

			const newStrategy = new Auth0Strategy();

			expect(newStrategy).toBeDefined();

			delete process.env.AUTH0_CLIENT_ID;
			delete process.env.AUTH0_CLIENT_SECRET;
			delete process.env.AUTH0_DOMAIN;
			delete process.env.API_BASE_URL;
		});
	});
});
