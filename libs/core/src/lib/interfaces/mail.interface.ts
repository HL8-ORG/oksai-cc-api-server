/**
 * 邮件传输对象接口
 */
export interface IMailOptions {
	/** 收件人邮箱地址 */
	to: string;
	/** 邮件主题 */
	subject: string;
	/** 邮件内容 */
	html?: string;
	/** 邮件纯文本内容 */
	text?: string;
	/** 发件人姓名 */
	fromName?: string;
	/** 抄送副本的邮箱地址列表 */
	cc?: string[];
	/** 抄送密送副本的邮箱地址列表 */
	bcc?: string[];
	/** 回复邮箱地址 */
	replyTo?: string;
}

/**
 * 邮件发送服务接口
 *
 * 定义邮件发送服务的统一接口
 */
export interface IMailService {
	/**
	 * 发送邮件
	 *
	 * @param options - 邮件选项（收件人、主题、内容等）
	 * @returns Promise<void> 发送完成
	 * @throws Error 发送失败时
	 *
	 * @example
	 * ```typescript
	 * await mailService.send({
	 *   to: 'user@example.com',
	 *   subject: '欢迎',
	 *   text: '欢迎使用我们的平台'
	 * });
	 * ```
	 */
	send(options: IMailOptions): Promise<void>;
}
