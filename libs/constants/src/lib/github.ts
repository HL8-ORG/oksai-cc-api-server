/**
 * GitHub 同步标签常量
 *
 * 提供用于分类同步源的标签常量
 */

/**
 * 同步标签集合
 *
 * 用于标识数据来自哪个同步源
 */
export const SyncTags = {
	/** GitHub 同步源标签 */
	GITHUB: 'GitHub',
	/** Gauzy 系统标签 */
	GAUZY: 'Gauzy'
} as const;

/**
 * 同步标签类型
 *
 * 有效的同步标签值类型
 */
export type SyncTag = (typeof SyncTags)[keyof typeof SyncTags];
