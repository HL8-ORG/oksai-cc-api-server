import { PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

/**
 * Base entity class with common fields for all entities.
 *
 * Provides:
 * - UUID primary key with automatic generation
 * - Automatic timestamps (createdAt, updatedAt)
 * - Soft delete support (deletedAt)
 */
export abstract class BaseEntity {
	/**
	 * Primary key with automatic UUID generation.
	 */
	@PrimaryKey()
	id: string = randomUUID();

	/**
	 * Creation timestamp, automatically set to current time.
	 */
	@Property({ defaultRaw: 'now()' })
	createdAt = new Date();

	/**
	 * Update timestamp, automatically updated on each save.
	 */
	@Property({ defaultRaw: 'now()', onUpdate: () => new Date() })
	updatedAt = new Date();

	/**
	 * Soft delete timestamp. Null if not deleted.
	 */
	@Property({ nullable: true })
	deletedAt?: Date;
}
