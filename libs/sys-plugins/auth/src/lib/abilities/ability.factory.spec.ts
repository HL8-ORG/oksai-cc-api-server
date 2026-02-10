import { Test, TestingModule } from '@nestjs/testing';
import { AbilityFactory } from '../abilities/ability.factory';
import { UnauthorizedException } from '@nestjs/common';

describe('简化的能力工厂测试', () => {
	describe('基础 RBAC - 简化的权限能力', () => {
		it('应该创建基本的能力对象', () => {
			const factory = new AbilityFactory();
			const ability = factory.createForUser({} as any);
			expect(ability).toBeDefined();
		});
	});
});
