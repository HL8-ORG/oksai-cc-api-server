// @ts-check
const tseslint = require('typescript-eslint');

/**
 * 根 ESLint 扁平化配置
 *
 * 所有子项目通过 ESLint 扁平化配置自动继承此根配置。
 * 子项目可在自身目录下创建 eslint.config.js / eslint.config.mjs 进行覆盖或扩展。
 */
module.exports = tseslint.config(
	// 全局忽略
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/*.js',
			'**/*.mjs',
			'**/coverage/**',
			'**/qauzy-backup/**',
			'**/packages/**',
			'**/_backup*/**'
		]
	},
	// TypeScript 推荐规则
	...tseslint.configs.recommended,
	// 项目自定义规则
	{
		rules: {
			// 允许显式 any（逐步收紧）
			'@typescript-eslint/no-explicit-any': 'warn',
			// 允许未使用变量以下划线开头
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			// 允许 require 导入（兼容旧代码）
			'@typescript-eslint/no-require-imports': 'off'
		}
	}
);
