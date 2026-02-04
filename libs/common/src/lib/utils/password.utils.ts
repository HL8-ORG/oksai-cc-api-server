import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const SCRYPT_PARAMS = {
	N: 16384,
	r: 8,
	p: 1,
	keyLength: 64,
	saltLength: 16
} as const;

/**
 * 密码工具函数
 *
 * 提供密码哈希、验证和强度检查功能
 */

/**
 * 使用 scrypt 算法哈希密码
 *
 * @param password - 原始密码
 * @returns Promise<string> 哈希后的密码
 *
 * @example
 * ```typescript
 * const hashedPassword = await hashPassword('myPassword123');
 * console.log(hashedPassword); // '$scrypt$16384$8$r$1$p$16$hash$123456789abcdef...'
 * ```
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(SCRYPT_PARAMS.saltLength);
	const { N, r, p, keyLength } = SCRYPT_PARAMS;
	const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer;
	return ['$scrypt', N, r, p, salt.toString('hex'), derivedKey.toString('hex')].join('$');
}

/**
 * 验证密码是否匹配哈希值
 *
 * @param password - 待验证的密码
 * @param hashedPassword - 存储的哈希密码
 * @returns Promise<boolean> 是否匹配
 *
 * @example
 * ```typescript
 * const isValid = await verifyPassword('myPassword123', hashedPassword);
 * console.log(isValid); // true 或 false
 * ```
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	try {
		const parts = hashedPassword.split('$');
		if (parts.length !== 7 || parts[1] !== 'scrypt') {
			return false;
		}

		const [, , nStr, rStr, pStr, saltHex, hashHex] = parts;
		const N = parseInt(nStr, 10);
		const r = parseInt(rStr, 10);
		const p = parseInt(pStr, 10);

		if (isNaN(N) || isNaN(r) || isNaN(p) || N <= 0 || r <= 0 || p <= 0) {
			return false;
		}
		if (N > 1048576 || r > 64 || p > 64) {
			return false;
		}
		if ((N & (N - 1)) !== 0) {
			return false;
		}

		const salt = Buffer.from(saltHex, 'hex');
		const storedHash = Buffer.from(hashHex, 'hex');
		const derivedKey = (await scryptAsync(password, salt, storedHash.length)) as Buffer;

		return timingSafeEqual(derivedKey, storedHash);
	} catch {
		return false;
	}
}

/**
 * 验证密码强度
 *
 * @param password - 待验证的密码
 * @returns 验证结果（是否有效和错误列表）
 *
 * @example
 * ```typescript
 * const result = validatePasswordStrength('Pass123');
 * console.log(result); // { valid: true, errors: [] }
 *
 * const result2 = validatePasswordStrength('weak');
 * console.log(result2); // { valid: false, errors: ['Password must be at least 8 characters long', 'Password must contain at least one lowercase letter', 'Password must contain at least one uppercase letter', 'Password must contain at least one number'] }
 * ```
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}
	if (password.length > 100) {
		errors.push('Password must not exceed 100 characters');
	}
	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}
	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}
	if (!/[0-9]/.test(password)) {
		errors.push('Password must contain at least one number');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
