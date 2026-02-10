import { GithubStrategy } from './github.strategy';

describe('GithubStrategy', () => {
	let strategy: GithubStrategy;
	let mockDone: jest.Mock;

	beforeEach(() => {
		strategy = new GithubStrategy();
		mockDone = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('validate', () => {
		it('should successfully validate GitHub OAuth profile with complete data', async () => {
			const mockProfile = {
				id: '123456',
				provider: 'github',
				emails: [{ value: 'user@github.com', verified: true, primary: true }],
				displayName: 'John Doe',
				username: 'johndoe',
				profileUrl: 'https://github.com/johndoe',
				photos: [{ value: 'https://avatars.githubusercontent.com/u/123456?v=4', type: 'profile' }]
			};

			const mockRequest = {} as Request;

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				emails: [{ value: 'user@github.com', verified: true, primary: true }],
				firstName: 'John',
				lastName: 'Doe',
				username: 'johndoe',
				picture: 'https://avatars.githubusercontent.com/u/123456?v=4',
				providerId: '123456',
				provider: 'github'
			});
		});

		it('should handle display name with middle name', async () => {
			const mockProfile = {
				id: '789012',
				provider: 'github',
				emails: [{ value: 'user2@github.com', verified: true, primary: true }],
				displayName: 'John Middle Doe',
				username: 'johndoe',
				profileUrl: 'https://github.com/johndoe',
				photos: [{ value: 'https://avatars.githubusercontent.com/u/789012?v=4', type: 'profile' }]
			};

			const mockRequest = {} as Request;

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				emails: [{ value: 'user2@github.com', verified: true, primary: true }],
				firstName: 'John',
				lastName: 'Middle',
				username: 'johndoe',
				picture: 'https://avatars.githubusercontent.com/u/789012?v=4',
				providerId: '789012',
				provider: 'github'
			});
		});

		it('should handle display name with only first name', async () => {
			const mockProfile = {
				id: '345678',
				provider: 'github',
				emails: [{ value: 'single@github.com', verified: true, primary: true }],
				displayName: 'SingleName',
				username: 'singlename',
				profileUrl: 'https://github.com/singlename',
				photos: [{ value: 'https://avatars.githubusercontent.com/u/345678?v=4', type: 'profile' }]
			};

			const mockRequest = {} as Request;

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				emails: [{ value: 'single@github.com', verified: true, primary: true }],
				firstName: 'SingleName',
				lastName: undefined,
				username: 'singlename',
				picture: 'https://avatars.githubusercontent.com/u/345678?v=4',
				providerId: '345678',
				provider: 'github'
			});
		});

		it('should handle display name with space in first part', async () => {
			const mockProfile = {
				id: '567890',
				provider: 'github',
				emails: [{ value: 'undefinedphoto@github.com', verified: true, primary: true }],
				displayName: 'Undefined Photo',
				username: 'undefinedphoto',
				profileUrl: 'https://github.com/undefinedphoto',
				photos: undefined
			};

			const mockRequest = {} as Request;

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				emails: [{ value: 'undefinedphoto@github.com', verified: true, primary: true }],
				firstName: 'Undefined',
				lastName: 'Photo',
				username: 'undefinedphoto',
				picture: undefined,
				providerId: '567890',
				provider: 'github'
			});
		});

		it('should handle profile with no photos', async () => {
			const mockProfile = {
				id: '901234',
				provider: 'github',
				emails: [{ value: 'nophoto@github.com', verified: true, primary: true }],
				displayName: 'No Photo',
				username: 'nophoto',
				profileUrl: 'https://github.com/nophoto',
				photos: []
			};

			const mockRequest = {} as Request;

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				emails: [{ value: 'nophoto@github.com', verified: true, primary: true }],
				firstName: 'No',
				lastName: 'Photo',
				username: 'nophoto',
				picture: undefined,
				providerId: '901234',
				provider: 'github'
			});
		});

		it('should handle display name with space in first part', async () => {
			const mockProfile = {
				id: '567890',
				provider: 'github',
				emails: [{ value: 'undefinedphoto@github.com', verified: true, primary: true }],
				displayName: 'Undefined Photo',
				username: 'undefinedphoto',
				profileUrl: 'https://github.com/undefinedphoto',
				photos: undefined
			};

			const mockRequest = {} as Request;

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', mockProfile, mockDone);

			expect(mockDone).toHaveBeenCalledWith(null, {
				emails: [{ value: 'undefinedphoto@github.com', verified: true, primary: true }],
				firstName: 'Undefined',
				lastName: 'Photo',
				username: 'undefinedphoto',
				picture: undefined,
				providerId: '567890',
				provider: 'github'
			});
		});

		it('should handle validation error gracefully', async () => {
			const invalidProfile = null as any;

			const mockRequest = {} as Request;

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			await strategy.validate(mockRequest, 'access_token', 'refresh_token', invalidProfile, mockDone);

			expect(consoleSpy).toHaveBeenCalledWith('GitHub OAuth 验证错误:', expect.any(Error));
			expect(mockDone).toHaveBeenCalledWith(expect.any(Error), false);

			consoleSpy.mockRestore();
		});
	});

	describe('constructor', () => {
		it('should initialize with default configuration when env vars are not set', () => {
			delete process.env.GITHUB_CLIENT_ID;
			delete process.env.GITHUB_CLIENT_SECRET;
			delete process.env.API_BASE_URL;

			const newStrategy = new GithubStrategy();

			expect(newStrategy).toBeDefined();
		});

		it('should initialize with custom configuration when env vars are set', () => {
			process.env.GITHUB_CLIENT_ID = 'custom-client-id';
			process.env.GITHUB_CLIENT_SECRET = 'custom-client-secret';
			process.env.API_BASE_URL = 'https://api.example.com';

			const newStrategy = new GithubStrategy();

			expect(newStrategy).toBeDefined();

			delete process.env.GITHUB_CLIENT_ID;
			delete process.env.GITHUB_CLIENT_SECRET;
			delete process.env.API_BASE_URL;
		});
	});
});
