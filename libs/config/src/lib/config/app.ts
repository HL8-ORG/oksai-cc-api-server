/**
 * 应用配置模块
 *
 * 使用 NestJS Config 库注册应用配置，包括应用名称、Logo URL 等基本信息
 */

import { registerAs } from '@nestjs/config';

/**
 * 应用配置
 *
 * 定义应用程序的基本配置设置，包括应用名称、Logo URL 等
 * 配置值从环境变量中读取，提供默认值作为备选
 */
export default registerAs('app', () => ({
	/**
	 * 应用名称
	 * 如果未提供 APP_NAME 环境变量，则默认为 'Gauzy'
	 */
	app_name: process.env.APP_NAME || 'Gauzy',

	/**
	 * 应用 Logo URL
	 * 如果未提供 APP_LOGO 环境变量，则使用 CLIENT_BASE_URL 构造默认 Logo URL
	 */
	app_logo: process.env.APP_LOGO || `${process.env.CLIENT_BASE_URL}/assets/images/logos/logo_Gauzy.png`
}));
