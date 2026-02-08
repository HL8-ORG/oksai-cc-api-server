import { isClassInstance } from './is-class-instance';
import { isEmpty } from './is-empty';
import { isPlainObject } from './is-plain-object';

/**
 * 深度克隆输入值
 *
 * 对输入值进行递归深拷贝，支持原始类型、数组和对象
 *
 * @param input - 要深度克隆的值，可以是原始类型、数组或对象
 * @returns 输入值的深拷贝
 */
export function deepClone<T>(input: T): T {
	// 如果不是对象或为空，直接返回输入值
	if (!isPlainObject(input) || isEmpty(input)) {
		return input;
	}

	// 初始化输出变量
	let output: any;

	// 递归克隆数组类型
	if (Array.isArray(input)) {
		output = input.map((item) => deepClone(item));
		return output as T;
	}

	// 类实例直接返回
	if (isClassInstance(input)) {
		return input;
	}

	// 递归克隆对象
	output = {} as Record<string, any>;
	for (const key in input) {
		if (Object.prototype.hasOwnProperty.call(input, key)) {
			output[key] = deepClone(input[key]);
		}
	}
	return output as T;
}
