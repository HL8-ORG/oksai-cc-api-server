import {
	Entity,
	PrimaryKey,
	Property,
	ManyToOne,
	OneToMany,
	ManyToMany,
	ManyToOneOptions,
	OneToManyOptions,
	ManyToManyOptions,
	Enum,
	Index
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { Role } from './role.entity';

/**
 * 权限实体
 *
 * 定义系统权限
 */
@Entity()
export class Permission {
	@PrimaryKey()
	id: string = randomUUID();

	@Property({ unique: true, nullable: false })
	code!: string;

	@Property({ nullable: false })
	name!: string;

	@Property({ nullable: true })
	description?: string;

	@Property({ nullable: false })
	resource!: string;

	@Property({ nullable: false })
	action!: string;

	@Property({ type: 'json', nullable: true })
	effect?: 'allow' | 'deny' = 'allow';

	@Property({ type: 'json', nullable: true })
	conditions?: any;

	@ManyToMany(() => Role, (role) => role.permissions)
	roles: Role[] = [];

	@Property({ nullable: false })
	createdAt!: Date;

	@Property({ nullable: false })
	updatedAt!: Date;
}
