import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
	let strategy: GoogleStrategy;
	let mockDone: jest.Mock;

	beforeEach(() => {
		strategy = new GoogleStrategy();
		mockDone = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('validate', () => {
		it('should successfully validate Google OAuth profile with complete data', async () => {
			const mockProfile = {
				id: 'google123',
				name: {
					givenName: 'John',
					familyName: 'Doe'
				},
				emails: [{ value: 'john.doe@gmail.com', verified: true }],
				photos: [{ value: 'https://example.com/photo.jpg' }]
			};

			const mockRequest = {
				headers: {},
				query: {}
			};

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				id: 'google123',
				emails: [{ value: 'john.doe@gmail.com', verified: true }],
				firstName: 'John',
				lastName: 'Doe',
				picture: { value: 'https://example.com/photo.jpg' },
				accessToken: 'access_token'
			});
		});

		it('should handle profile with no photos', async () => {
			const mockProfile = {
				id: 'google456',
				name: {
					givenName: 'Jane',
					familyName: 'Smith'
				},
				emails: [{ value: 'jane.smith@gmail.com', verified: true }],
				photos: []
			};

			const mockRequest = {
				headers: {},
				query: {}
			};

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				id: 'google456',
				emails: [{ value: 'jane.smith@gmail.com', verified: true }],
				firstName: 'Jane',
				lastName: 'Smith',
				picture: null,
				accessToken: 'access_token'
			});
		});

		it('should handle profile with empty photos array', async () => {
			const mockProfile = {
				id: 'google789',
				name: {
					givenName: 'Bob',
					familyName: 'Johnson'
				},
				emails: [{ value: 'bob.johnson@gmail.com', verified: true }],
				photos: null
			};

			const mockRequest = {
				headers: {},
				query: {}
			};

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				id: 'google789',
				emails: [{ value: 'bob.johnson@gmail.com', verified: true }],
				firstName: 'Bob',
				lastName: 'Johnson',
				picture: null,
				accessToken: 'access_token'
			});
		});

		it('should handle validation error gracefully', async () => {
			const mockProfile = {
				id: 'invalid',
				name: null,
				emails: null,
				photos: null
			};

			const mockRequest = {
				headers: {},
				query: {}
			};

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(consoleSpy).toHaveBeenCalledWith('Google OAuth 验证错误:', expect.any(Error));
			expect(mockDone).toHaveBeenCalledWith(expect.any(Error), false);

			consoleSpy.mockRestore();
		});
	});

	describe('constructor', () => {
		it('should initialize with default configuration when env vars are not set', () => {
			delete process.env.GOOGLE_CLIENT_ID;
			delete process.env.GOOGLE_CLIENT_SECRET;
			delete process.env.API_BASE_URL;

			const newStrategy = new GoogleStrategy();

			expect(newStrategy).toBeDefined();
		});

		it('should initialize with custom configuration when env vars are set', () => {
			process.env.GOOGLE_CLIENT_ID = 'custom-client-id';
			process.env.GOOGLE_CLIENT_SECRET = 'custom-client-secret';
			process.env.API_BASE_URL = 'https://api.example.com';

			const newStrategy = new GoogleStrategy();

			expect(newStrategy).toBeDefined();

			delete process.env.GOOGLE_CLIENT_ID;
			delete process.env.GOOGLE_CLIENT_SECRET;
			delete process.env.API_BASE_URL;
		});
	});
});
