/**
 * 类型化 API 客户端
 */

import { Logger } from '@nestjs/common';
import { AxiosInstance, AxiosRequestConfig } from 'axios';

const logger = new Logger('ApiClient');

export interface ApiClientConfig {
	baseUrl: string;
	timeout?: number;
	headers?: Record<string, string>;
}

export interface AuthStatus {
	isAuthenticated: boolean;
	hasToken: boolean;
	userId: string | null;
	organizationId: string | null;
	tenantId: string | null;
	tokenExpiresAt: Date | null;
	autoLoginEnabled: boolean;
	hasInitialized: boolean;
	isLoginInProgress: boolean;
	isRefreshInProgress: boolean;
}

interface AuthResponse {
	user: any;
	token: string;
	refresh_token: string;
}

interface TokenData {
	accessToken: string;
	refreshToken: string;
	expiresAt: Date;
	userId: string;
	organizationId?: string;
	tenantId?: string;
}

export class ApiClient {
	private static instance: ApiClient | null = null;
	private client: AxiosInstance;
	private config: ApiClientConfig;
	private tokenData: TokenData | null = null;
	private isLoginInProgress = false;
	private isRefreshInProgress = false;
	private hasInitialized = false;

	private constructor(config: ApiClientConfig) {
		this.config = config;
		this.client = this.createAxiosInstance();
	}

	static getInstance(config?: ApiClientConfig): ApiClient {
		if (!ApiClient.instance && config) {
			ApiClient.instance = new ApiClient(config);
		}
		if (!ApiClient.instance) {
			throw new Error('ApiClient 实例未初始化，请提供配置参数');
		}
		return ApiClient.instance;
	}

	private createAxiosInstance(): AxiosInstance {
		const axios = require('axios');
		const instance = axios.create({
			baseURL: this.config.baseUrl,
			timeout: this.config.timeout || 30000,
			headers: {
				'Content-Type': 'application/json',
				...this.config.headers
			}
		});
		this.setupInterceptors(instance);
		return instance;
	}

	private setupInterceptors(instance: AxiosInstance): void {
		instance.interceptors.request.use(async (config) => {
			const isAuthEndpoint = config.url?.includes('/auth/') || config.url?.includes('/login');

			if (!isAuthEndpoint) {
				if (!this.isLoginInProgress && !this.isRefreshInProgress) {
					const hasValidToken = await this.ensureValidToken();

					if (hasValidToken && this.tokenData) {
						(config.headers as any).Authorization = `Bearer ${this.tokenData.accessToken}`;
					}
				}
			}
			return config;
		});

		instance.interceptors.response.use(
			async (response) => {
				return response;
			},
			async (error: any) => {
				if (
					error.response?.status === 401 &&
					!error.config?.url?.includes('/auth/') &&
					!error.config?.url?.includes('/login')
				) {
					const refreshed = await this.refreshToken();
					if (refreshed && this.tokenData && error.config) {
						(error.config.headers as any).Authorization = `Bearer ${this.tokenData.accessToken}`;
						return instance.request(error.config);
					}
				}
				return Promise.reject(error);
			}
		);
	}

	async login(email?: string, password?: string): Promise<boolean> {
		if (this.isLoginInProgress) {
			logger.debug('登录已在进行中，跳过重复请求');
			return false;
		}

		this.isLoginInProgress = true;

		try {
			const credentials = {
				email: email || process.env.GAUZY_AUTH_EMAIL,
				password: password || process.env.GAUZY_AUTH_PASSWORD
			};

			if (!credentials.email || !credentials.password) {
				logger.warn('未提供认证凭证');
				return false;
			}

			logger.debug(`尝试登录: ${credentials.email}`);

			const response: AuthResponse = await this.client.post('/auth/login', credentials);

			if (response?.token && response?.refresh_token && response?.user) {
				let organizationId: string | undefined;
				let tenantId: string | undefined;

				try {
					if (this.tokenData?.accessToken) {
						const userResponse = await this.get('/user/me', {
							headers: { Authorization: `Bearer ${this.tokenData.accessToken}` }
						});
						if (userResponse) {
							tenantId = (userResponse as any).tenantId || (userResponse as any).tenant?.id;
							organizationId = (userResponse as any).employee?.organizationId;
							if (
								!organizationId &&
								(userResponse as any).organizations &&
								(userResponse as any).organizations.length > 0
							) {
								organizationId = (userResponse as any).organizations[0].id;
							}
						}
					}
				} catch (error) {
					logger.warn('获取用户信息失败', error);
				}

				this.tokenData = {
					accessToken: response.token,
					refreshToken: response.refresh_token,
					userId: response.user?.id,
					organizationId,
					tenantId,
					expiresAt: this.calculateTokenExpiry(response.token)
				};

				logger.debug(`登录成功: ${response.user?.email}`);
				return true;
			}

			logger.warn('登录失败：无效的响应格式');
			return false;
		} catch (error) {
			logger.error('登录失败', error);
			return false;
		} finally {
			this.isLoginInProgress = false;
		}
	}

	async logout(): Promise<void> {
		try {
			if (this.tokenData?.accessToken) {
				await this.get('/auth/logout');
			}
		} catch (error) {
			logger.warn('登出端点调用失败', error);
		} finally {
			this.clearTokenData();
			this.hasInitialized = false;
			logger.debug('已登出');
		}
	}

	async refreshToken(): Promise<boolean> {
		if (this.isRefreshInProgress) {
			logger.debug('令牌刷新已在进行中，跳过重复请求');
			return false;
		}

		this.isRefreshInProgress = true;

		try {
			if (!this.tokenData?.refreshToken) {
				logger.warn('无刷新令牌可用');
				return false;
			}

			logger.debug('刷新访问令牌...');

			const response = await this.post<{ token: string }>('/auth/refresh-token', {
				refresh_token: this.tokenData.refreshToken
			});

			if (response?.token) {
				this.tokenData.accessToken = response.token;
				this.tokenData.expiresAt = this.calculateTokenExpiry(response.token);

				logger.debug('令牌刷新成功');
				return true;
			}

			logger.warn('令牌刷新失败：无效的响应格式');
			return false;
		} catch (error) {
			logger.error('令牌刷新失败', error);
			return false;
		} finally {
			this.isRefreshInProgress = false;
		}
	}

	async ensureValidToken(): Promise<boolean> {
		if (this.isAuthenticated()) {
			return true;
		}

		if (this.tokenData?.refreshToken && !this.isRefreshInProgress) {
			const refreshed = await this.refreshToken();
			return refreshed;
		}

		return false;
	}

	isAuthenticated(): boolean {
		if (!this.tokenData) {
			return false;
		}

		const now = new Date();
		const expiryWithBuffer = new Date(this.tokenData.expiresAt.getTime() - 10000);

		return now < expiryWithBuffer;
	}

	getAccessToken(): string | null {
		if (!this.isAuthenticated()) {
			return null;
		}
		return this.tokenData?.accessToken || null;
	}

	getRefreshToken(): string | null {
		return this.tokenData?.refreshToken || null;
	}

	getUserId(): string | null {
		return this.tokenData?.userId || null;
	}

	getOrganizationId(): string | null {
		return this.tokenData?.organizationId || null;
	}

	getTenantId(): string | null {
		return this.tokenData?.tenantId || null;
	}

	getAuthStatus(): AuthStatus {
		return {
			isAuthenticated: this.isAuthenticated(),
			hasToken: !!this.tokenData?.accessToken,
			userId: this.getUserId(),
			organizationId: this.getOrganizationId(),
			tenantId: this.getTenantId(),
			tokenExpiresAt: this.tokenData?.expiresAt || null,
			autoLoginEnabled: !!process.env.GAUZY_AUTO_LOGIN,
			hasInitialized: this.hasInitialized,
			isLoginInProgress: this.isLoginInProgress,
			isRefreshInProgress: this.isRefreshInProgress
		};
	}

	configure(config: Partial<ApiClientConfig>): void {
		if (config.baseUrl) {
			this.client.defaults.baseURL = config.baseUrl;
			this.config.baseUrl = config.baseUrl;
			logger.debug(`基础 URL 已更新: ${config.baseUrl}`);
		}
		if (config.timeout) {
			this.client.defaults.timeout = config.timeout;
			logger.debug(`超时时间已更新: ${config.timeout}ms`);
		}
		if (config.headers) {
			Object.assign(this.client.defaults.headers, config.headers);
			logger.debug('默认请求头已更新');
		}
	}

	async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await this.client.get<T>(path, config);
			return response.data;
		} catch (error) {
			this.logError('GET', path, error);
			throw error;
		}
	}

	private logError(method: string, path: string, error: unknown): void {
		logger.error(`${method} ${path} 请求失败:`, error);
	}

	async post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await this.client.post<T>(path, data, config);
			return response.data;
		} catch (error) {
			this.logError('POST', path, error);
			throw error;
		}
	}

	async put<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await this.client.put<T>(path, data, config);
			return response.data;
		} catch (error) {
			this.logError('PUT', path, error);
			throw error;
		}
	}

	async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await this.client.delete<T>(path, config);
			return response.data;
		} catch (error) {
			this.logError('DELETE', path, error);
			throw error;
		}
	}

	async patch<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await this.client.patch<T>(path, data, config);
			return response.data;
		} catch (error) {
			this.logError('PATCH', path, error);
			throw error;
		}
	}

	async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
		try {
			const healthEndpoints = ['/health', '/api/health', '/api/public/health'];
			let lastError: any = null;
			let healthCheckSuccess = false;

			for (const endpoint of healthEndpoints) {
				try {
					await this.get(endpoint);
					healthCheckSuccess = true;
					break;
				} catch (error) {
					lastError = error;
				}
			}

			if (!healthCheckSuccess) {
				return {
					success: false,
					error: this.getErrorMessage(lastError),
					details: {
						baseUrl: this.config.baseUrl,
						authStatus: this.getAuthStatus(),
						lastError: lastError instanceof Error ? lastError.message : '未知错误',
						triedEndpoints: healthEndpoints
					}
				};
			}

			if (
				process.env.GAUZY_AUTO_LOGIN &&
				!this.getAuthStatus().isAuthenticated &&
				!this.getAuthStatus().isLoginInProgress
			) {
				const loginResult = await this.login();
				if (!loginResult) {
					return {
						success: false,
						error: `健康检查通过但认证失败`,
						details: {
							baseUrl: this.config.baseUrl,
							authStatus: this.getAuthStatus(),
							healthCheckPassed: true
						}
					};
				}
			}

			return {
				success: true,
				details: {
					baseUrl: this.config.baseUrl,
					authStatus: this.getAuthStatus(),
					healthCheckPassed: true,
					authenticatedTestPassed: this.getAuthStatus().isAuthenticated
				}
			};
		} catch (error) {
			return {
				success: false,
				error: this.getErrorMessage(error),
				details: {
					baseUrl: this.config.baseUrl,
					authStatus: this.getAuthStatus(),
					error: error instanceof Error ? error.message : '未知错误'
				}
			};
		}
	}

	private getErrorMessage(error: any): string {
		if (error?.code === 'ECONNREFUSED') {
			return `连接被拒绝 - Gauzy API 服务器是否运行在 ${this.config.baseUrl}?`;
		}
		if (error?.code === 'ENOTFOUND') {
			return `主机未找到 - 请检查 API_BASE_URL: ${this.config.baseUrl}`;
		}
		if (error?.code === 'ETIMEDOUT') {
			return '连接超时 - 服务器可能缓慢或无法访问';
		}
		if (error?.response?.status === 404) {
			return 'API 端点未找到 - 服务器正在运行但健康检查端点缺失';
		}
		if (error?.response?.status === 401) {
			return '认证失败 - 请检查您的凭证或手动登录';
		}
		if (error?.response?.status === 403) {
			return '访问被拒绝 - 权限不足';
		}
		if (error?.response?.status >= 500) {
			return `服务器错误 (${error.response.status}) - Gauzy API 服务器内部错误`;
		}

		return error instanceof Error ? error.message : '未知连接错误';
	}

	private clearTokenData(): void {
		this.tokenData = null;
	}

	private calculateTokenExpiry(token: string): Date {
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = atob(base64);
			const decoded = JSON.parse(jsonPayload);

			if (decoded.exp) {
				return new Date(decoded.exp * 1000);
			}
		} catch (error) {
			logger.warn('无法解码 JWT 令牌过期时间');
		}

		return new Date(Date.now() + 3600000);
	}
}

// 注意：初始化时需要提供配置参数
export const apiClient = ApiClient.getInstance({
	baseUrl: process.env.API_BASE_URL || 'http://localhost:3000'
});
