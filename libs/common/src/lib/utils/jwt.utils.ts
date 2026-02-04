import { sign, verify } from 'jsonwebtoken';

/**
 * JWT 载荷接口
 *
 * 定义 JWT 令牌中包含的用户信息
 */
export interface JwtPayload {
	sub: string;
	email: string;
	tenantId: string;
	role: string;
}

/**
 * Token 对接口
 *
 * 定义访问令牌和刷新令牌对
 */
export interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

/**
 * JWT 工具类
 *
 * 提供访问令牌和刷新令牌的生成与验证功能
 */
export class JwtUtils {
	private readonly accessTokenSecret: string;
	private readonly refreshTokenSecret: string;
	private readonly accessTokenExpiresIn: string;
	private readonly refreshTokenExpiresIn: string;

	constructor(
		accessTokenSecret: string,
		refreshTokenSecret: string,
		accessTokenExpiresIn: string = '1d',
		refreshTokenExpiresIn: string = '7d'
	) {
		this.accessTokenSecret = accessTokenSecret;
		this.refreshTokenSecret = refreshTokenSecret;
		this.accessTokenExpiresIn = accessTokenExpiresIn;
		this.refreshTokenExpiresIn = refreshTokenExpiresIn;
	}

	/**
	 * 生成访问令牌
	 *
	 * @param payload - JWT 载荷
	 * @returns 访问令牌字符串
	 *
	 * @example
	 * ```typescript
	 * const jwtUtils = new JwtUtils('secret', 'refresh-secret', '1d', '7d');
	 * const token = jwtUtils.generateAccessToken({ sub: '123', email: 'user@example.com' });
	 * ```
	 */
	generateAccessToken(payload: JwtPayload): string {
		return sign(payload, this.accessTokenSecret, {
			expiresIn: this.accessTokenExpiresIn
		});
	}

	/**
	 * 生成刷新令牌
	 *
	 * @param payload - JWT 载荷
	 * @returns 刷新令牌字符串
	 *
	 * @example
	 * ```typescript
	 * const jwtUtils = new JwtUtils('secret', 'refresh-secret', '1d', '7d');
	 * const token = jwtUtils.generateRefreshToken({ sub: '123', email: 'user@example.com' });
	 * ```
	 */
	generateRefreshToken(payload: JwtPayload): string {
		return sign(payload, this.refreshTokenSecret, {
			expiresIn: this.refreshTokenExpiresIn
		});
	}

	/**
	 * 生成访问令牌和刷新令牌对
	 *
	 * @param payload - JWT 载荷
	 * @returns 包含访问令牌和刷新令牌的对象
	 *
	 * @example
	 * ```typescript
	 * const jwtUtils = new JwtUtils('secret', 'refresh-secret', '1d', '7d');
	 * const tokens = jwtUtils.generateTokenPair({ sub: '123', email: 'user@example.com' });
	 * console.log(tokens.accessToken);
	 * console.log(tokens.refreshToken);
	 * ```
	 */
	generateTokenPair(payload: JwtPayload): TokenPair {
		return {
			accessToken: this.generateAccessToken(payload),
			refreshToken: this.generateRefreshToken(payload)
		};
	}

	/**
	 * 验证访问令牌
	 *
	 * @param token - 待验证的访问令牌
	 * @returns JWT 载荷
	 * @throws Error 当令牌无效或签名不正确时
	 *
	 * @example
	 * ```typescript
	 * const jwtUtils = new JwtUtils('secret', 'refresh-secret');
	 * const payload = jwtUtils.verifyAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
	 * console.log(payload);
	 * ```
	 */
	verifyAccessToken(token: string): JwtPayload {
		return verify(token, this.accessTokenSecret) as JwtPayload;
	}

	/**
	 * 验证刷新令牌
	 *
	 * @param token - 待验证的刷新令牌
	 * @returns JWT 载荷
	 * @throws Error 当令牌无效或签名不正确时
	 *
	 * @example
	 * ```typescript
	 * const jwtUtils = new JwtUtils('secret', 'refresh-secret');
	 * const payload = jwtUtils.verifyRefreshToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
	 * console.log(payload);
	 * ```
	 */
	verifyRefreshToken(token: string): JwtPayload {
		return verify(token, this.refreshTokenSecret) as JwtPayload;
	}
}

let jwtUtilsInstance: JwtUtils | null = null;

/**
 * 初始化 JWT 工具实例
 *
 * @param accessTokenSecret - 访问令牌密钥
 * @param refreshTokenSecret - 刷新令牌密钥
 * @param accessTokenExpiresIn - 访问令牌过期时间（可选，默认 1 天）
 * @param refreshTokenExpiresIn - 刷新令牌过期时间（可选，默认 7 天）
 *
 * @example
 * ```typescript
 * // 初始化 JWT 工具
 * initJwtUtils(
 *   'access-secret-key',
 *   'refresh-secret-key',
 *   '1d',
 *   '7d'
 * );
 *
 * // 使用 JWT 工具
 * const jwtUtils = getJwtUtils();
 * const token = jwtUtils.generateAccessToken({ sub: '123', email: 'user@example.com' });
 * ```
 */
export function initJwtUtils(
	accessTokenSecret: string,
	refreshTokenSecret: string,
	accessTokenExpiresIn?: string,
	refreshTokenExpiresIn?: string
): void {
	jwtUtilsInstance = new JwtUtils(accessTokenSecret, refreshTokenSecret, accessTokenExpiresIn, refreshTokenExpiresIn);
}

/**
 * 获取 JWT 工具实例
 *
 * @returns JWT 工具实例
 * @throws Error 如果未初始化
 *
 * @example
 * ```typescript
 * const jwtUtils = getJwtUtils();
 * const tokens = jwtUtils.generateTokenPair({ sub: '123', email: 'user@example.com' });
 * ```
 */
export function getJwtUtils(): JwtUtils {
	if (!jwtUtilsInstance) {
		throw new Error('JwtUtils not initialized. Call initJwtUtils() first.');
	}
	return jwtUtilsInstance;
}
