/**
 * 邮箱存在检查响应接口
 */
export interface IEmailCheckResponse {
	/** 指示提供的邮箱是否存在于数据库中 */
	exists: boolean;
}

/**
 * 邮箱存在检查请求接口
 */
export interface IEmailCheckRequest {
	/** 要在数据库中检查的邮箱地址 */
	email: string;
}
