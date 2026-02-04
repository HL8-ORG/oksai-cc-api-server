import { deepClone } from './deep-clone';
import { isClassInstance } from './is-class-instance';
import { isPlainObject } from './is-plain-object';

/**
 * 深度合并两个对象
 *
 * 将源对象的属性递归合并到目标对象中
 *
 * @param target - 要合并到的目标对象
 * @param source - 要合并的源对象
 * @param depth - 递归合并的深度级别（默认为 0）
 * @returns 合并后的对象
 *
 * @example
 * ```typescript
 * const target = { a: 1, b: { c: 2 } };
 * const source = { b: { d: 3 }, e: 4 };
 * const result = deepMerge(target, source);
 * // result = { a: 1, b: { c: 2, d: 3 }, e: 4 }
 * ```
 */
export function deepMerge(target: any, source: any, depth = 0): any {
	// 如果源不是对象，返回目标对象
	if (!source || typeof source !== 'object') {
		return target;
	}

	// 在深度 0 处克隆目标以避免修改原始目标
	if (depth === 0) {
		target = deepClone(target);
	}

	// 递归合并对象
	if (isPlainObject(target) && isPlainObject(source)) {
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				// 如果源值是对象，递归合并
				if (isPlainObject(source[key])) {
					if (!target[key]) {
						target[key] = {};
					}

					if (!isClassInstance(source[key])) {
						deepMerge(target[key], source[key], depth + 1);
					} else {
						// 如果源是类实例，不合并，直接赋值
						target[key] = source[key];
					}
				} else {
					// 直接从源赋值到目标
					target[key] = source[key];
				}
			}
		}
	}

	return target;
}
