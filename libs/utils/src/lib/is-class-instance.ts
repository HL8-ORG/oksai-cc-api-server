import { isPlainObject } from './is-plain-object';

/**
 * 判断值是否为类实例
 *
 * 类实例是指通过类构造函数创建的对象，而不是通过对象字面量创建的普通对象
 *
 * @param item - 要检查的值
 * @returns 如果值是类实例返回 true，否则返回 false
 */
export function isClassInstance(item: any): boolean {
	return isPlainObject(item) && item.constructor.name !== 'Object';
}
