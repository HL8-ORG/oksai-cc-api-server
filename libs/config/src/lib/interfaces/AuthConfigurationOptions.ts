/**
 * 认证配置选项接口
 *
 * 定义应用程序认证相关的配置选项
 */

/**
 * 认证配置选项
 */
export interface AuthConfigurationOptions {
	/**
	 * Express 会话密钥
	 *
	 * 指定用于 Express 会话的密钥
	 */
	expressSessionSecret: string;

	/**
	 * 用户密码 bcrypt 加密轮数
	 *
	 * 定义用户密码使用 bcrypt 哈希时的加密轮数
	 */
	userPasswordBcryptSaltRounds: number;

	/**
	 * JWT 密钥
	 *
	 * 指定用于生成 JWT（JSON Web Token）的密钥
	 */
	jwtSecret: string;
}
