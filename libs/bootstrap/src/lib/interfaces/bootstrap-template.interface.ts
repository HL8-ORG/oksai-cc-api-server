import { BootstrapConfig } from './bootstrap-config.interface';

/**
 * 启动模板接口
 *
 * 定义了不同服务类型的预设配置模板
 */
export interface BootstrapTemplate {
	/**
	 * 模板名称
	 */
	readonly name: string;

	/**
	 * 模板描述
	 */
	readonly description: string;

	/**
	 * 生成默认配置
	 *
	 * @param overrides - 覆盖默认配置的选项
	 * @returns 启动配置
	 */
	getConfig(overrides?: Partial<BootstrapConfig>): BootstrapConfig;
}
