import { Entity, Property, Index, OneToMany, ManyToOne } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

/**
 * 功能特性枚举
 */
export enum FeatureStatus {
	/** 激活状态 */
	ACTIVE = 'ACTIVE',
	/** 未激活状态 */
	INACTIVE = 'INACTIVE',
	/** 归档状态 */
	ARCHIVED = 'ARCHIVED'
}

/**
 * 功能特性实体
 *
 * 定义系统中可用的功能特性
 */
@Entity({ tableName: 'features' })
export class Feature extends BaseEntity {
	/**
	 * 功能名称（唯一）
	 */
	@Property({ unique: true })
	name!: string;

	/**
	 * 功能代码（唯一，用于程序引用）
	 */
	@Index({ name: 'idx_feature_code' })
	@Property({ unique: true })
	code!: string;

	/**
	 * 功能描述
	 */
	@Property({ nullable: true })
	description?: string;

	/**
	 * 是否为付费功能
	 */
	@Property({ default: false })
	isPaid?: boolean;

	/**
	 * 功能状态
	 */
	@Property({ default: FeatureStatus.ACTIVE })
	status: FeatureStatus = FeatureStatus.ACTIVE;

	/**
	 * 功能图标
	 */
	@Property({ nullable: true })
	icon?: string;

	/**
	 * 功能图片
	 */
	@Property({ nullable: true })
	image?: string;

	/**
	 * 功能链接
	 */
	@Property({ nullable: true })
	link?: string;

	/**
	 * 功能分类
	 */
	@Property({ nullable: true })
	category?: string;

	/**
	 * 子功能
	 */
	@ManyToOne({ entity: () => Feature, nullable: true })
	parent?: Feature;

	/**
	 * 子功能列表
	 */
	@OneToMany({ entity: () => Feature, mappedBy: 'parent' })
	children?: Feature[];
}
