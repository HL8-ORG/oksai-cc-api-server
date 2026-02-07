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

/**
 * 角色实体
 *
 * 定义系统角色
 *
 * @property id - 角色唯一标识
 * @property code - 角色代码（唯一）
 * @property name - 角色名称
 * @property description - 角色描述
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
}
