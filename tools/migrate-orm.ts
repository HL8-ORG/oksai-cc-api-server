/**
 * ORM 迁移工具
 *
 * 用于将 MultiORM 装饰器替换为纯 MikroORM 装饰器
 */

import * as fs from 'fs';
import * as path from 'path';

// 装饰器替换映射
const REPLACEMENTS = [
	{
		from: '@MultiORMColumn(',
		to: '@Property(',
		description: '替换 MultiORMColumn 为 Property'
	},
	{
		from: '@MultiORMManyToOne(() =>',
		to: '@ManyToOne(() =>',
		description: '替换 MultiORMManyToOne 为 ManyToOne'
	},
	{
		from: '@MultiORMOneToMany(() =>',
		to: '@OneToMany(() =>',
		description: '替换 MultiORMOneToMany 为 OneToMany'
	},
	{
		from: '@MultiORMManyToMany(() =>',
		to: '@ManyToMany(() =>',
		description: '替换 MultiORMManyToMany 为 ManyToMany'
	},
	{
		from: '@MultiORMEntity(',
		to: '@Entity(',
		description: '替换 MultiORMEntity 为 Entity'
	}
];

// 需要移除的导入
const TYPEORM_IMPORTS_TO_REMOVE = [
	"import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, RelationId, JoinColumn, JoinTable } from 'typeorm';",
	"import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';",
	"import { RelationId, JoinColumn, JoinTable } from 'typeorm';",
	"import { PrimaryGeneratedColumn } from 'typeorm';",
	"import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';"
];

// 需要保留的 MikroORM 导入
const MIKRO_ORM_IMPORTS = [
	"import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, ManyToMany, ManyToOneOptions, OneToManyOptions, ManyToManyOptions, Enum, Index } from '@mikro-orm/core';"
];

/**
 * 替换文件中的装饰器
 */
function replaceDecorators(content: string): string {
	let result = content;

	// 替换装饰器
	for (const replacement of REPLACEMENTS) {
		result = result.split(replacement.from).join(replacement.to);
	}

	return result;
}

/**
 * 移除 TypeORM 导入
 */
function removeTypeORMImports(content: string): string {
	let result = content;

	// 移除 TypeORM 导入
	for (const importToRemove of TYPEORM_IMPORTS_TO_REMOVE) {
		if (result.includes(importToRemove)) {
			// 找到下一个 import 或 from
			const nextImportIndex = result.indexOf(importToRemove);
			const nextImport = result.substring(nextImportIndex, result.indexOf('\n', nextImportIndex) + 1);

			// 移除这个导入
			result = result.replace(importToRemove, '');

			// 清理多余的空行
			result = result.replace(/\n\n\n/g, '\n');
		}
	}

	return result;
}

/**
 * 确保有 MikroORM 导入
 */
function ensureMikroORMImports(content: string): string {
	let result = content;

	// 检查是否已有 MikroORM 导入
	const hasMikroORMImport = MIKRO_ORM_IMPORTS.some((imp) => result.includes(imp));

	if (!hasMikroORMImport) {
		// 在第一个 import 之前添加 MikroORM 导入
		const firstImportIndex = result.indexOf('import ');
		if (firstImportIndex !== -1) {
			result = MIKRO_ORM_IMPORTS[0] + '\n' + result.substring(firstImportIndex);
		}
	}

	return result;
}

/**
 * 处理单个文件
 */
function processFile(filePath: string): void {
	try {
		let content = fs.readFileSync(filePath, 'utf-8');

		// 执行替换
		content = replaceDecorators(content);

		// 移除 TypeORM 导入
		content = removeTypeORMImports(content);

		// 确保有 MikroORM 导入
		content = ensureMikroORMImports(content);

		// 写回文件
		fs.writeFileSync(filePath, content, 'utf-8');

		console.log(`✓ 已处理: ${filePath}`);
	} catch (error) {
		console.error(`✗ 处理失败: ${filePath}`, error);
	}
}

/**
 * 递归处理目录
 */
function processDirectory(dirPath: string): void {
	const files = fs.readdirSync(dirPath);

	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
			// 递归处理子目录
			processDirectory(filePath);
		} else if (stat.isFile() && file.endsWith('.ts')) {
			// 处理 TypeScript 文件
			processFile(filePath);
		}
	}
}

/**
 * 主函数
 */
function main(): void {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.log('用法: ts-node tools/migrate-orm.ts <文件或目录>');
		console.log('');
		console.log('示例:');
		console.log('  ts-node tools/migrate-orm.ts libs/core/src/lib/entities/base.entity.ts');
		console.log('  ts-node tools/migrate-orm.ts libs/core/src/lib/entities/');
		console.log('');
		console.log('将自动:');
		console.log('  1. 替换 @MultiORM* 装饰器为 MikroORM 装饰器');
		console.log('  2. 移除 TypeORM 导入');
		console.log('  3. 添加 MikroORM 导入');
		process.exit(0);
	}

	const targetPath = args[0];
	const stat = fs.statSync(targetPath);

	if (stat.isDirectory()) {
		console.log(`处理目录: ${targetPath}`);
		processDirectory(targetPath);
	} else if (stat.isFile()) {
		console.log(`处理文件: ${targetPath}`);
		processFile(targetPath);
	}

	console.log('');
	console.log('处理完成！');
}

// 执行主函数
main();
