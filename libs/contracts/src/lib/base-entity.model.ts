/**
 * JSON 数据类型
 */
export type JsonData = Record<string, any> | string;

/**
 * 实体 ID 类型
 *
 * @docsCategory 类型定义
 * @docsSubcategory 标识符
 */
export type ID = string;

/**
 * 动态排除默认系统管理字段
 *
 * 动态排除默认系统管理的字段（'id'、'createdAt'、'updatedAt'）
 * 以及任何额外提供的键
 *
 * @template T - 原始类型
 * @template K - （可选）要从 T 中排除的额外键
 */
export type OmitFields<T, K extends keyof T = never> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | K>;

/**
 * 具有关系属性的实体
 */
export interface IBaseRelationsEntityModel {
	/** 相关实体列表 */
	relations?: string[];
}

/**
 * 软删除实体的公共属性
 */
export interface IBaseSoftDeleteEntityModel {
	/** 指示记录是否被软删除 */
	deletedAt?: Date;
}

/**
 * 实体的公共属性
 */
export interface IBaseEntityModel extends IBaseEntityActionByUserModel, IBaseSoftDeleteEntityModel {
	/** 唯一标识符 */
	id?: ID;

	/** 记录创建日期 */
	readonly createdAt?: Date;

	/** 记录最后更新日期 */
	readonly updatedAt?: Date;

	/** 指示记录当前是否活跃 */
	isActive?: boolean;

	/** 指示记录是否已归档 */
	isArchived?: boolean;

	/** 记录归档日期 */
	archivedAt?: Date;
}

/**
 * 包含用户操作信息的实体
 */
export interface IBaseEntityActionByUserModel {
	/** 创建记录的用户 */
	createdByUser?: any;

	/** 创建记录的用户 ID */
	createdByUserId?: ID;

	/** 最后更新记录的用户 */
	updatedByUser?: any;

	/** 最后更新记录的用户 ID */
	updatedByUserId?: ID;

	/** 删除记录的用户 */
	deletedByUser?: any;

	/** 删除记录的用户 ID */
	deletedByUserId?: ID;
}

/**
 * 与租户关联的实体的公共属性
 */
export interface IBasePerTenantEntityModel extends IBaseEntityModel {
	/** 关联租户的标识符 */
	tenantId?: ID;

	/** 关联租户的引用 */
	tenant?: any;
}

/**
 * 与租户关联的实体的变更输入属性
 */
export interface IBasePerTenantEntityMutationInput extends IBaseEntityModel {
	/** 关联租户的标识符 */
	tenantId?: ID;

	/** 来自 ITenant 的可选字段 */
	tenant?: Partial<any>;
}

/**
 * 与租户和组织都关联的实体的公共属性
 */
export interface IBasePerTenantAndOrganizationEntityModel extends IBasePerTenantEntityModel {
	/** 关联组织的标识符 */
	organizationId?: ID;

	/** 关联组织的引用 */
	organization?: any;
}

/**
 * 与租户和组织都关联的实体的变更输入属性
 */
export interface IBasePerTenantAndOrganizationEntityMutationInput extends Partial<IBasePerTenantEntityMutationInput> {
	/** 关联组织的标识符 */
	organizationId?: ID;

	/** 允许来自 IOrganization 的额外字段 */
	organization?: Partial<any>;
}
