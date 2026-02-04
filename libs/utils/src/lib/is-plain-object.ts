/**
 * 判断值是否为纯对象
 *
 * 纯对象是指通过对象字面量或 `new Object()` 创建的对象，不包括数组、null 或其他非对象类型
 *
 * @param item - 要检查的值
 * @returns 如果值是纯对象（非数组）返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isPlainObject({})        // true
 * isPlainObject([])        // false
 * isPlainObject(null)      // false
 * isPlainObject('string')  // false
 * ```
 */
export function isPlainObject(item: unknown): boolean {
	return !!item && typeof item === 'object' && !Array.isArray(item);
}
