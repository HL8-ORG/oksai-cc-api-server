import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

/**
 * 权限实体
 *
 * 定义系统权限
 *
 * @property code - 权限代码（唯一）
 * @property name - 权限名称
 * @property description - 权限描述
 * @property resource - 资源类型
 * @property action - 操作类型
 * @property effect - 策略效果（allow/deny）
 * @property conditions - 条件（JSON 格式）
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
}
