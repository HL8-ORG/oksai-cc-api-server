import { PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

export abstract class BaseEntity {
	@PrimaryKey()
	id: string = randomUUID();

	@Property({ defaultRaw: 'now()' })
	createdAt = new Date();

	@Property({ defaultRaw: 'now()', onUpdate: () => new Date() })
	updatedAt = new Date();

	@Property({ nullable: true })
	deletedAt?: Date;
}
