import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { BaseEntity } from '@oksai/core';
import { User } from './user.entity';

/**
 * OAuth 提供者类型
 */
export enum OAuthProvider {
	GOOGLE = 'google',
	GITHUB = 'github',
	MICROSOFT = 'microsoft',
	AUTH0 = 'auth0'
}

/**
 * OAuth 账号实体
 *
 * 存储用户的 OAuth 账号绑定信息
 */
@Entity()
export class OAuthAccount extends BaseEntity {
	/** 主键 ID */
	@PrimaryKey()
	id: string = randomUUID();

	/** 用户 ID */
	@Property({ nullable: false })
	userId!: string;

	/** OAuth 提供者 ID */
	@Property({ nullable: false })
	provider!: OAuthProvider;

	/** OAuth 提供者的用户 ID */
	@Property({ nullable: false })
	providerId!: string;

	/** OAuth 提供者的用户邮箱 */
	@Property({ nullable: true })
	providerEmail?: string;

	/** OAuth 提供者的用户名称 */
	@Property({ nullable: true })
	providerName?: string;

	/** OAuth 提供者的用户头像 */
	@Property({ nullable: true })
	providerAvatar?: string;

	/** 是否为主账号 */
	@Property({ default: false })
	isPrimary: boolean = false;
}
