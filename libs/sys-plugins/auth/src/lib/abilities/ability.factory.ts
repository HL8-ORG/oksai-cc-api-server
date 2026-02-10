import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AbilityBuilder, Ability, createMongoAbility, createAliasResolver } from '@casl/ability';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permissions.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

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
	constructor(
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>,
		@InjectRepository(Role)
		private readonly roleRepo: EntityRepository<Role>
	) {}

	/**
	 * 为用户创建能力
	 *
	 * 根据用户角色和权限创建 Ability 对象
	 *
	 * @param user - 用户对象
	 * @returns 用户能力对象
	 */
	async createForUser(user: User): Promise<AppAbility> {
		const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

		if (user.role === 'ADMIN') {
			can(Action.MANAGE, 'all');
			return build();
		}

		const populatedUser = await this.userRepo.findOne(
			{ id: user.id },
			{ populate: ['roles', 'roles.permissions'] }
		);

		if (!populatedUser) {
			throw new UnauthorizedException('未找到该用户');
		}

		for (const role of populatedUser.roles) {
			for (const permission of role.permissions) {
				if (permission.effect === 'allow') {
					can(permission.action as Action, permission.resource as Subjects);
				} else if (permission.effect === 'deny') {
					cannot(permission.action as Action, permission.resource as Subjects).because(
						permission.description || '权限拒绝'
					);
				}
			}
		}

		can(Action.READ, 'User');
		can(Action.READ, 'Tenant');
		can(Action.READ, 'Plugin');

		cannot(Action.DELETE, 'User').because('不能删除自己');

		return build();
	}
}
