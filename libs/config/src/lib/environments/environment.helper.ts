/**
 * 环境配置工具函数
 */

import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

/**
 * 检查功能是否启用
 *
 * 根据 process.env 中的环境变量判断功能是否启用
 *
 * @param featureKey - 功能键名称
 * @returns 如果功能启用返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * const isDashboardEnabled = isFeatureEnabled('FEATURE_DASHBOARD');
 * ```
 */
export const isFeatureEnabled = (featureKey: string): boolean => {
	return process.env[featureKey] === 'false' ? false : true;
};
