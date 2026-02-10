import { EntityRepository } from '@mikro-orm/core';
import { User, UserRole } from './entities/user.entity';
import { hashPassword } from '@oksai/core';

/**
 * OAuth 用户信息接口
 */
export interface IOAuthUserInfo {
	email: string;
	firstName?: string;
	lastName?: string;
	displayName?: string;
}

/**
 * 创建 OAuth 用户
 *
 * 统一的 OAuth 用户创建逻辑，用于所有 OAuth 提供者
 *
 * @param userRepo - 用户仓储
 * @param oAuthUserInfo - OAuth 用户信息
 * @returns 已创建的用户
 *
 * @example
 * ```typescript
 * const user = await createOAuthUser(userRepo, {
 *   email: 'user@example.com',
 *   displayName: 'John Doe',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 */
export async function createOAuthUser(userRepo: EntityRepository<User>, oAuthUserInfo: IOAuthUserInfo): Promise<User> {
	const em = userRepo.getEntityManager();

	const { randomBytes } = await import('crypto');

	const tempPassword = randomBytes(16).toString('hex');
	const hashedPassword = await hashPassword(tempPassword);

	const names = extractNames(oAuthUserInfo.displayName, oAuthUserInfo.firstName, oAuthUserInfo.lastName);

	const user = userRepo.create({
		email: oAuthUserInfo.email,
		password: hashedPassword,
		firstName: names.firstName || '',
		lastName: names.lastName || '',
		isActive: true,
		tenantId: 'default',
		emailVerifiedAt: new Date(),
		role: UserRole.USER,
		requirePasswordSetup: true,
		createdAt: new Date(),
		updatedAt: new Date()
	});

	em.persist(user);
	await em.flush();

	return user;
}

/**
 * 从显示名称中提取姓名
 *
 * 如果提供了 firstName 和 lastName，则直接使用
 * 否则从 displayName 中解析
 *
 * @param displayName - 显示名称
 * @param firstName - 名（可选）
 * @param lastName - 姓（可选）
 * @returns 包含名和姓的对象
 *
 * @example
 * ```typescript
 * extractNames('John Doe') // { firstName: 'John', lastName: 'Doe' }
 * extractNames('John Middle Doe') // { firstName: 'John Middle', lastName: 'Doe' }
 * extractNames('SingleName', 'John', 'Doe') // { firstName: 'John', lastName: 'Doe' }
 * ```
 */
export function extractNames(
	displayName?: string,
	firstName?: string,
	lastName?: string
): { firstName: string; lastName: string } {
	if (firstName && lastName) {
		return { firstName, lastName };
	}

	if (!displayName) {
		return { firstName: '', lastName: '' };
	}

	const parts = displayName.trim().split(/\s+/);

	if (parts.length === 1) {
		return { firstName: parts[0], lastName: '' };
	}

	if (parts.length === 2) {
		return { firstName: parts[0], lastName: parts[1] };
	}

	return {
		firstName: parts.slice(0, -1).join(' '),
		lastName: parts[parts.length - 1]
	};
}
