/**
 * 任务相关常量
 *
 * 提供任务管理和跟踪的默认配置值，包括通知周期、自动关闭周期等
 */

/**
 * 任务完成类型枚举
 *
 * 定义任务完成证明的可见性类型
 */
export enum TaskProofOfCompletionTypeEnum {
	/** 公开完成证明，所有人可见 */
	PUBLIC = 'PUBLIC',
	/** 私有完成证明，仅相关人员可见 */
	PRIVATE = 'PRIVATE'
}

/**
 * 任务通知默认周期（天）
 *
 * 在发送待处理任务通知之前的默认天数
 */
export const DEFAULT_TASK_NOTIFY_PERIOD = 7;

/**
 * 问题自动关闭默认周期（天）
 *
 * 未解决的问题自动关闭之前的默认天数
 */
export const DEFAULT_AUTO_CLOSE_ISSUE_PERIOD = 7;

/**
 * 问题自动归档默认周期（天）
 *
 * 不活跃的问题自动归档之前的默认天数
 */
export const DEFAULT_AUTO_ARCHIVE_ISSUE_PERIOD = 7;

/**
 * 任务默认完成证明类型
 *
 * 默认设置为私有完成证明
 */
export const DEFAULT_PROOF_COMPLETION_TYPE = TaskProofOfCompletionTypeEnum.PRIVATE;
