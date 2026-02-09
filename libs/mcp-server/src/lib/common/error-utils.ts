/**
 * 错误处理工具
 */

/**
 * 清理错误消息，避免泄露敏感信息
 */
export function sanitizeErrorMessage(error: unknown): string {
	if (!error) {
		return '未知错误';
	}

	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === 'string') {
		return error;
	}

	try {
		return JSON.stringify(error);
	} catch {
		return '无法序列化错误对象';
	}
}

/**
 * 清理错误栈，避免泄露路径信息
 */
export function sanitizeStackTrace(error: unknown): string | null {
	if (!error) {
		return null;
	}

	if (error instanceof Error) {
		const stack = error.stack;

		if (!stack) {
			return null;
		}

		const lines = stack.split('\n');

		const sanitized = lines
			.filter((line) => {
				return !line.includes(process.cwd());
			})
			.join('\n');

		return sanitized;
	}

	return null;
}
