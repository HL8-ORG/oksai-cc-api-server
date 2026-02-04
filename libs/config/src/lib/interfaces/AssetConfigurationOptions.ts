/**
 * 资源配置选项接口
 *
 * 定义应用程序资源处理的配置选项
 */

/**
 * 资源配置选项
 */
export interface AssetConfigurationOptions {
	/**
	 * 资源文件存储路径
	 *
	 * 指定资源文件的存储目录路径
	 */
	assetPath: string;

	/**
	 * 资源公共访问路径
	 *
	 * 定义资源的公共 URL 访问路径
	 */
	assetPublicPath: string;
}
