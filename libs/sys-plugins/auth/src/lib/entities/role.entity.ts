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
import { Permission } from './permissions.entity';
import { User } from './user.entity';

/**
 * 角色实体
 *
 * 定义系统角色
 */
@Entity()
export class Role {
	@PrimaryKey()
	id: string = randomUUID();

	@Property({ unique: true, nullable: false })
	code!: string;

	@Property({ nullable: false })
	name!: string;

	@Property({ nullable: true })
	description?: string;

	@ManyToMany(() => Permission, (permission) => permission.roles, { owner: true })
	permissions: Permission[] = [];

	@ManyToMany(() => User, (user) => user.roles, { owner: true })
	users: User[] = [];

	@Property({ nullable: false })
	createdAt!: Date;

	@Property({ nullable: false })
	updatedAt!: Date;
}
