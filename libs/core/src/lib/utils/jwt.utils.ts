import { sign, verify } from 'jsonwebtoken';

export interface JwtPayload {
	sub: string;
	email: string;
	tenantId: string;
	role: string;
	[key: string]: any;
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

/**
 * JWT Utility Class
 *
 * Provides methods for generating and verifying JWT tokens.
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

	// @ts-nocheck - jsonwebtoken types compatibility issue
	generateAccessToken(payload: JwtPayload): string {
		return sign(payload, this.accessTokenSecret, {
			expiresIn: this.accessTokenExpiresIn as string
		} as any);
	}

	// @ts-nocheck - jsonwebtoken types compatibility issue
	generateRefreshToken(payload: JwtPayload): string {
		return sign(payload, this.refreshTokenSecret, {
			expiresIn: this.refreshTokenExpiresIn as string
		} as any);
	}

	generateTokenPair(payload: JwtPayload): TokenPair {
		return {
			accessToken: this.generateAccessToken(payload),
			refreshToken: this.generateRefreshToken(payload)
		};
	}

	verifyAccessToken(token: string): JwtPayload {
		return verify(token as any, this.accessTokenSecret) as any;
	}

	verifyRefreshToken(token: string): JwtPayload {
		return verify(token, this.refreshTokenSecret) as JwtPayload as any;
	}
}

let jwtUtilsInstance: JwtUtils | null = null;

/**
 * Initialize JwtUtils with secrets.
 *
 * @param accessTokenSecret JWT access token secret
 * @param refreshTokenSecret JWT refresh token secret
 * @param accessTokenExpiresIn Access token expiration time (default: '1d')
 * @param refreshTokenExpiresIn Refresh token expiration time (default: '7d')
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
 * Get the JwtUtils singleton instance.
 *
 * @returns JwtUtils instance
 * @throws Error if not initialized
 */
export function getJwtUtils(): JwtUtils {
	if (!jwtUtilsInstance) {
		throw new Error('JwtUtils not initialized. Call initJwtUtils() first.');
	}
	return jwtUtilsInstance;
}
