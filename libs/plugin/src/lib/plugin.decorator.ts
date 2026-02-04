/**
 * 插件装饰器
 * MVP 版本：简化实现
 */
import { Module } from '@nestjs/common';

export function OksaisPlugin(metadata: any = {}): ClassDecorator {
	return (target) => {
		console.log('Plugin registered:', (target as any).name || 'Anonymous');

		// 只传递有效的 Module 元数据
		const moduleMetadata: any = {};
		if (metadata.imports) moduleMetadata.imports = metadata.imports;
		if (metadata.providers) moduleMetadata.providers = metadata.providers;
		if (metadata.exports) moduleMetadata.exports = metadata.exports;

		// 存储插件元数据供其他用途
		(target as any).__oksaisPluginMetadata = {
			...metadata
		};

		Module(moduleMetadata)(target);
	};
}
