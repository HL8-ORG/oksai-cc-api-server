/**
 * 邮件模板
 *
 * 提供常用邮件模板生成函数
 */

/**
 * 密码重置邮件模板
 *
 * @param resetUrl - 密码重置链接
 * @param userName - 用户名
 * @param expiresHours - 过期小时数（默认：1）
 * @returns HTML 格式的邮件内容
 *
 * @example
 * ```typescript
 * const html = generateResetPasswordEmail(
 *   'http://localhost:4200/reset-password?token=abc123',
 *   'John Doe',
 *   1
 * );
 * ```
 */
export function generateResetPasswordEmail(resetUrl: string, userName: string, expiresHours: number = 1): string {
	return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>密码重置</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
	<table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
		<tr>
			<td style="padding: 40px 30px; background-color: #4CAF50; color: white; text-align: center;">
				<h1 style="margin: 0; font-size: 24px;">密码重置</h1>
			</td>
		</tr>
		<tr>
			<td style="padding: 30px;">
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					尊敬的 ${userName}，
				</p>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					我们收到了您的密码重置请求。如果这是您本人操作，请点击以下按钮重置密码：
				</p>
				<table style="margin: 30px auto;">
					<tr>
						<td style="background-color: #4CAF50; border-radius: 4px; text-align: center;">
							<a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; color: white; text-decoration: none; font-weight: bold;">重置密码</a>
						</td>
					</tr>
				</table>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					如果按钮无法点击，请复制以下链接到浏览器地址栏：
				</p>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6; word-break: break-all;">
					${resetUrl}
				</p>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					此链接将在 <strong>${expiresHours} 小时</strong>后失效。如果您没有请求密码重置，请忽略此邮件，您的密码不会被更改。
				</p>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					感谢您使用 OKSAI 平台！
				</p>
			</td>
		</tr>
		<tr>
			<td style="padding: 20px 30px; background-color: #f4f4f4; text-align: center; color: #999999; font-size: 12px;">
				<p style="margin: 0;">
					此邮件由系统自动发送，请勿直接回复。
				</p>
				<p style="margin: 10px 0 0 0;">
					&copy; ${new Date().getFullYear()} OKSAI Platform. All rights reserved.
				</p>
			</td>
		</tr>
	</table>
</body>
</html>
	`;
}

/**
 * 欢迎邮件模板
 *
 * @param userName - 用户名
 * @param loginUrl - 登录链接
 * @returns HTML 格式的邮件内容
 *
 * @example
 * ```typescript
 * const html = generateWelcomeEmail(
 *   'John Doe',
 *   'http://localhost:4200/login'
 * );
 * ```
 */
export function generateWelcomeEmail(userName: string, loginUrl: string): string {
	return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>欢迎加入 OKSAI 平台</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
	<table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
		<tr>
			<td style="padding: 40px 30px; background-color: #4CAF50; color: white; text-align: center;">
				<h1 style="margin: 0; font-size: 24px;">欢迎加入 OKSAI 平台！</h1>
			</td>
		</tr>
		<tr>
			<td style="padding: 30px;">
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					亲爱的 ${userName}，
				</p>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					感谢您注册 OKSAI 平台！我们很高兴您加入我们的社区。
				</p>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					OKSAI 平台是一个功能强大的企业级应用平台，提供以下核心功能：
				</p>
				<ul style="margin: 0 0 20px 0; padding-left: 30px; color: #333333; line-height: 1.6;">
					<li>租户管理和多租户隔离</li>
					<li>组织架构和团队管理</li>
					<li>用户认证和权限控制</li>
					<li>审计日志和操作追踪</li>
					<li>社交账号登录（Google、GitHub、Microsoft、Auth0）</li>
				</ul>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					点击以下按钮开始您的体验：
				</p>
				<table style="margin: 30px auto;">
					<tr>
						<td style="background-color: #4CAF50; border-radius: 4px; text-align: center;">
							<a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; color: white; text-decoration: none; font-weight: bold;">立即登录</a>
						</td>
					</tr>
				</table>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					如果您有任何问题或建议，请随时联系我们的客服团队。
				</p>
				<p style="margin: 0 0 20px 0; color: #333333; line-height: 1.6;">
					祝您使用愉快！
				</p>
			</td>
		</tr>
		<tr>
			<td style="padding: 20px 30px; background-color: #f4f4f4; text-align: center; color: #999999; font-size: 12px;">
				<p style="margin: 0;">
					此邮件由系统自动发送，请勿直接回复。
				</p>
				<p style="margin: 10px 0 0 0;">
					&copy; ${new Date().getFullYear()} OKSAI Platform. All rights reserved.
				</p>
			</td>
		</tr>
	</table>
</body>
</html>
	`;
}
