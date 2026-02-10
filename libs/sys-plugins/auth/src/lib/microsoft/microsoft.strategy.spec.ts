import { MicrosoftStrategy, parseMicrosoftConfig } from './microsoft.strategy';

describe('MicrosoftStrategy', () => {
	let strategy: MicrosoftStrategy;
	let mockDone: jest.Mock;

	beforeEach(() => {
		strategy = new MicrosoftStrategy();
		mockDone = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
		delete process.env.MICROSOFT_CLIENT_ID;
		delete process.env.MICROSOFT_CLIENT_SECRET;
		delete process.env.MICROSOFT_CALLBACK_URL;
		delete process.env.MICROSOFT_AUTHORIZATION_URL;
		delete process.env.MICROSOFT_TOKEN_URL;
		delete process.env.API_BASE_URL;
	});

	describe('validate', () => {
		it('should successfully validate Microsoft OAuth profile with complete data', async () => {
			const mockProfile = {
				emails: [{ value: 'user@outlook.com', type: 'account', primary: true }],
				displayName: 'John Doe',
				name: {
					givenName: 'John',
					familyName: 'Doe'
				}
			};

			const mockRequest = {} as any;

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				emails: [{ value: 'user@outlook.com', type: 'account', primary: true }],
				firstName: 'John',
				lastName: 'Doe',
				displayName: 'John Doe',
				provider: 'microsoft'
			});
		});

		it('should handle profile with no name object', async () => {
			const mockProfile = {
				emails: [{ value: 'noname@outlook.com', type: 'account', primary: true }],
				displayName: 'No Name',
				name: null
			};

			const mockRequest = {} as any;

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				emails: [{ value: 'noname@outlook.com', type: 'account', primary: true }],
				firstName: undefined,
				lastName: undefined,
				displayName: 'No Name',
				provider: 'microsoft'
			});
		});

		it('should handle validation error gracefully', async () => {
			const invalidProfile = null as any;

			const mockRequest = {} as any;

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', invalidProfile, mockDone);

			expect(consoleSpy).toHaveBeenCalledWith('Microsoft OAuth 验证错误:', expect.any(Error));
			expect(mockDone).toHaveBeenCalledWith(expect.any(Error), false);

			consoleSpy.mockRestore();
		});
	});

	describe('constructor', () => {
		it('should initialize with default configuration when env vars are not set', () => {
			const newStrategy = new MicrosoftStrategy();

			expect(newStrategy).toBeDefined();
		});

		it('should initialize with custom configuration when env vars are set', () => {
			process.env.MICROSOFT_CLIENT_ID = 'custom-client-id';
			process.env.MICROSOFT_CLIENT_SECRET = 'custom-client-secret';
			process.env.MICROSOFT_CALLBACK_URL = 'https://api.example.com/api/auth/microsoft/callback';
			process.env.MICROSOFT_AUTHORIZATION_URL = 'https://login.microsoftonline.com/authorize';
			process.env.MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/token';

			const newStrategy = new MicrosoftStrategy();

			expect(newStrategy).toBeDefined();
		});
	});

	describe('parseMicrosoftConfig', () => {
		it('should return config with default values when env vars are not set', () => {
			const config = parseMicrosoftConfig();

			expect(config).toEqual({
				clientID: 'disabled',
				clientSecret: 'disabled',
				callbackURL: 'http://localhost:3000/api/auth/microsoft/callback',
				authorizationURL: '',
				tokenURL: '',
				passReqToCallback: true,
				scope: ['openid', 'profile', 'email', 'user.read']
			});
		});

		it('should return config with custom values when env vars are set', () => {
			process.env.MICROSOFT_CLIENT_ID = 'test-client-id';
			process.env.MICROSOFT_CLIENT_SECRET = 'test-client-secret';
			process.env.MICROSOFT_CALLBACK_URL = 'https://test.example.com/callback';
			process.env.MICROSOFT_AUTHORIZATION_URL = 'https://auth.example.com';
			process.env.MICROSOFT_TOKEN_URL = 'https://token.example.com';

			const config = parseMicrosoftConfig();

			expect(config).toEqual({
				clientID: 'test-client-id',
				clientSecret: 'test-client-secret',
				callbackURL: 'https://test.example.com/callback',
				authorizationURL: 'https://auth.example.com',
				tokenURL: 'https://token.example.com',
				passReqToCallback: true,
				scope: ['openid', 'profile', 'email', 'user.read']
			});
		});

		it('should use API_BASE_URL when CALLBACK_URL is not set', () => {
			process.env.API_BASE_URL = 'https://api.example.com';
			delete process.env.MICROSOFT_CALLBACK_URL;

			const config = parseMicrosoftConfig();

			expect(config.callbackURL).toBe('https://api.example.com/api/auth/microsoft/callback');
		});
	});
});
