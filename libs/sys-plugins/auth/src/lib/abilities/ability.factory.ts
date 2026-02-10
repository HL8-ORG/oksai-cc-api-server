import { Injectable } from '@nestjs/common';
import { AbilityBuilder, Ability, createMongoAbility, createAliasResolver } from '@casl/ability';
import { User } from '../entities/user.entity';

/**
 * 动作类型
 */
export enum Action {
	MANAGE = 'manage',
	CREATE = 'create',
	READ = 'read',
	UPDATE = 'update',
	DELETE = 'delete'
}

/**
 * 主体类型
 */
export type Subjects = 'all' | 'User' | 'Tenant' | 'Plugin' | 'Role' | 'Permission';

export type AppAbility = Ability<[Action, Subjects]>;

/**
 * 能力工厂
 *
 * 提供基于 CASL 的权限管理能力创建
 */
@Injectable()
export class AbilityFactory {
	/**
	 * 为用户创建能力
	 *
	 * 根据用户角色和权限创建 Ability 对象
	 *
	 * @param user - 用户对象
	 * @returns 用户能力对象
	 */
	createForUser(user: User): AppAbility {
		const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

		// 超级管理员拥有所有权限
		if (user.role === 'ADMIN') {
			can(Action.MANAGE, 'all');
			return build();
		}

		// 普通用户只读权限
		can(Action.READ, 'User');
		can(Action.READ, 'Tenant');
		can(Action.READ, 'Plugin');

		// 默认禁止删除自己
		cannot(Action.DELETE, 'User').because('不能删除自己');

		return build();
	}
}
