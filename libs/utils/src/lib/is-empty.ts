/**
 * 检查提供的值是否为空
 *
 * 此函数检查各种类型的值：
 * - 数组：过滤掉空值后，如果数组为空则返回 true
 * - 对象：移除 null、undefined 或空字符串属性后，如果没有自有属性则返回 true
 * - 其他类型：对于 null、undefined 或字符串 'null'、'undefined' 返回 true
 *
 * @param item - 要检查是否为空的值
 * @returns 如果值为空返回 true，否则返回 false
 */
export function isEmpty(item: any): boolean {
	if (Array.isArray(item)) {
		// 过滤数组中的空值
		const filteredArray = item.filter((val) => !isEmpty(val));
		return filteredArray.length === 0;
	} else if (item && typeof item === 'object') {
		// 创建浅拷贝以避免修改原始对象
		const shallowCopy = { ...item };
		for (const key in shallowCopy) {
			if (shallowCopy[key] === null || shallowCopy[key] === undefined || shallowCopy[key] === '') {
				delete shallowCopy[key];
			}
		}
		return Object.keys(shallowCopy).length === 0;
	} else {
		// 检查非对象/数组类型
		const strValue = (item + '').toLowerCase();
		return !item || strValue === 'null' || strValue === 'undefined';
	}
}
