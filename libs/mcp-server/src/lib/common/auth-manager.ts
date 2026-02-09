/**
 * 认证管理器
 *
 * 管理用户登录、登出和令牌管理
 */

import { Logger } from '@nestjs/common';

/**
 * 认证响应接口
 */
interface AuthResponse {
	user: any;
	token: string;
	refresh_token: string;
}

/**
 * 令牌数据接口
 */
interface TokenData {
	accessToken: string;
	refreshToken: string;
	expiresAt: Date;
	userId: string;
	organizationId?: string;
	tenantId?: string;
}

/**
 * 认证状态接口
 */
interface AuthStatus {
	isAuthenticated: boolean;
	hasToken: boolean;
	hasRefreshToken: boolean;
	userId: string | null;
	organizationId: string | null;
	tenantId: string | null;
	tokenExpiresAt: Date | null;
	autoLoginEnabled: boolean;
	hasInitialized: boolean;
	isLoginInProgress: boolean;
	isRefreshInProgress: boolean;
}

/**
 * 认证管理器类
 */
export class AuthManager {
	private static instance: AuthManager | null = null;

	private tokenData: TokenData | null = null;

	private isLoginInProgress: boolean = false;
	private isRefreshInProgress: boolean = false;
	private hasInitialized: boolean = false;

	constructor() {
		// 私有实例化逻辑
	}

	private get logger(): Logger {
		return new Logger('AuthManager');
	}

	/**
	 * 获取单例实例
	 */
	public static getInstance(): AuthManager {
		if (!AuthManager.instance) {
			AuthManager.instance = new AuthManager();
		}
		return AuthManager.instance;
	}

	/**
	 * 用户登录
	 */
	async login(email?: string, password?: string): Promise<boolean> {
		if (this.isLoginInProgress) {
			this.logger.debug('登录已在进行中，跳过重复请求');
			return false;
		}

		this.isLoginInProgress = true;

		try {
			const credentials = {
				email: email || process.env.GAUZY_AUTH_EMAIL,
				password: password || process.env.GAUZY_AUTH_PASSWORD
			};

			if (!credentials.email || !credentials.password) {
				this.logger.warn('未提供认证凭证');
				return false;
			}

			this.logger.debug(`尝试登录: ${credentials.email}`);

			// 调用登录 API
			const response = (await this.apiClient().post('/auth/login', credentials)) as AuthResponse;

			if (response?.token && response?.refresh_token && response?.user) {
				// 获取当前用户信息（包含租户和组织）
				let organizationId: string | undefined;
				let tenantId: string | undefined;

				try {
					if (this.tokenData?.accessToken) {
						const userResponse = await this.apiClient().get('/user/me', {
							headers: { Authorization: `Bearer ${this.tokenData.accessToken}` }
						});

						if (userResponse) {
							tenantId = userResponse.tenantId || userResponse.tenant?.id;
							organizationId = userResponse.employee?.organizationId;
							if (
								!organizationId &&
								userResponse.organizations &&
								userResponse.organizations.length > 0
							) {
								organizationId = userResponse.organizations[0].id;
							}
						}
					}
				} catch (err) {
					this.logger.warn('获取用户信息失败', err);
				}

				this.tokenData = {
					accessToken: response.token,
					refreshToken: response.refresh_token,
					userId: response.user?.id,
					organizationId,
					tenantId,
					expiresAt: this.calculateTokenExpiry(response.token)
				};

				this.logger.debug(`登录成功: ${response.user?.email}`);
				return true;
			}

			this.logger.warn('登录失败：无效的响应格式');
			return false;
		} catch (error) {
			this.logger.error('登录失败', error);
			return false;
		} finally {
			this.isLoginInProgress = false;
		}
	}

	/**
	 * 用户登出
	 */
	async logout(): Promise<void> {
		try {
			if (this.tokenData?.accessToken) {
				await this.apiClient().get('/auth/logout');
			}
		} catch (error) {
			this.logger.warn('登出端点调用失败', error);
		} finally {
			this.clearTokenData();
			this.hasInitialized = false;
			this.logger.debug('已登出');
		}
	}

	/**
	 * 刷新访问令牌
	 */
	async refreshToken(): Promise<boolean> {
		if (this.isRefreshInProgress) {
			this.logger.debug('令牌刷新已在进行中，跳过重复请求');
			return false;
		}

		this.isRefreshInProgress = true;

		try {
			if (!this.tokenData?.refreshToken) {
				this.logger.warn('无刷新令牌可用');
				return false;
			}

			this.logger.debug('刷新访问令牌...');

			const response = (await this.apiClient().post('/auth/refresh-token', {
				refresh_token: this.tokenData.refreshToken
			})) as { token: string; refresh_token: string };

			if (response?.token) {
				this.tokenData.accessToken = response.token;
				this.tokenData.expiresAt = this.calculateTokenExpiry(response.token);

				this.logger.debug('令牌刷新成功');
				return true;
			}

			this.logger.warn('令牌刷新失败：无效的响应格式');
			return false;
		} catch (error) {
			this.logger.error('令牌刷新失败', error);
			return false;
		} finally {
			this.isRefreshInProgress = false;
		}
	}

	/**
	 * 检查是否已认证
	 */
	isAuthenticated(): boolean {
		if (!this.tokenData) {
			return false;
		}

		const now = new Date();
		const expiryWithBuffer = new Date(this.tokenData.expiresAt.getTime() - 10000);

		return now < expiryWithBuffer;
	}

	/**
	 * 获取访问令牌
	 */
	getAccessToken(): string | null {
		if (!this.isAuthenticated()) {
			return null;
		}
		return this.tokenData?.accessToken || null;
	}

	/**
	 * 获取刷新令牌
	 */
	getRefreshToken(): string | null {
		return this.tokenData?.refreshToken || null;
	}

	/**
	 * 获取用户 ID
	 */
	getUserId(): string | null {
		return this.tokenData?.userId || null;
	}

	/**
	 * 获取组织 ID
	 */
	getOrganizationId(): string | null {
		return this.tokenData?.organizationId || null;
	}

	/**
	 * 获取租户 ID
	 */
	getTenantId(): string | null {
		return this.tokenData?.tenantId || null;
	}

	/**
	 * 获取认证状态
	 */
	getAuthStatus(): AuthStatus {
		return {
			isAuthenticated: this.isAuthenticated(),
			hasToken: !!this.tokenData?.accessToken,
			hasRefreshToken: !!this.tokenData?.refreshToken,
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

	/**
	 * 清空令牌数据
	 */
	private clearTokenData(): void {
		this.tokenData = null;
	}

	/**
	 * 计算令牌过期时间
	 */
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
			this.logger.warn('无法解码 JWT 令牌过期时间', error);
		}

		return new Date(Date.now() + 3600000);
	}

	/**
	 * 获取 API 客户端
	 */
	private apiClient(): any {
		return (globalThis as any).apiClient;
	}
}
