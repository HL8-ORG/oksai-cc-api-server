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
 * Hash a password using scrypt.
 *
 * @param password Plain text password
 * @returns Hashed password in format: $scrypt$N$r$p$salt$hash
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(SCRYPT_PARAMS.saltLength);
	const { N, r, p, keyLength } = SCRYPT_PARAMS;
	const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer;
	return ['$scrypt', N, r, p, salt.toString('hex'), derivedKey.toString('hex')].join('$');
}

/**
 * Verify a password against a hash.
 *
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns True if password matches hash
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
 * Validate password strength.
 *
 * @param password Plain text password
 * @returns Validation result with errors
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
