/**
 * 组织相关常量
 *
 * 提供组织级别的默认配置值，包括时间格式、工作时间、奖金比例等
 */

/**
 * 默认时间格式数组
 *
 * 支持 12 小时制和 24 小时制
 */
export const DEFAULT_TIME_FORMATS: number[] = [12, 24];

/**
 * 默认标准每日工作小时数
 *
 * 通常设置为 8 小时，符合标准全职工作时间表
 */
export const DEFAULT_STANDARD_WORK_HOURS_PER_DAY = 8;

/**
 * 默认基于利润的奖金百分比
 *
 * 表示基于利润指标的 75% 奖金
 */
export const DEFAULT_PROFIT_BASED_BONUS = 75;

/**
 * 默认基于收入的奖金百分比
 *
 * 表示基于收入指标的 10% 奖金
 */
export const DEFAULT_REVENUE_BASED_BONUS = 10;

/**
 * 默认邀请过期周期（天）
 *
 * 邀请默认在 7 天后过期
 */
export const DEFAULT_INVITE_EXPIRY_PERIOD = 7;

/**
 * 默认日期格式数组
 *
 * - 'L': 本地化日期表示（如 09/04/1986）
 * - 'LL': 完整月份名称、日期和年份（如 September 4, 1986）
 * - 'dddd, LL': 星期、完整月份名称、日期和年份（如 Thursday, September 4, 1986）
 */
export const DEFAULT_DATE_FORMATS: string[] = ['L', 'LL', 'dddd, LL'];

/**
 * 默认非活动时间限制数组（分钟）
 *
 * 指定用户被认为不活跃的时间限制
 * - 常用值：1、5、10、20、30 分钟
 */
export const DEFAULT_INACTIVITY_TIME_LIMITS: number[] = [1, 5, 10, 20, 30];

/**
 * 默认活动证明持续时间数组（分钟）
 *
 * 定义捕获活动证明的持续时间
 * - 常用值：1、3、5、10 分钟
 */
export const DEFAULT_ACTIVITY_PROOF_DURATIONS: number[] = [1, 3, 5, 10];

/**
 * 默认截图频率选项数组（分钟）
 *
 * 确定监控活动时截图的频率
 * - 常用值：1、3、5、10 分钟
 */
export const DEFAULT_SCREENSHOT_FREQUENCY_OPTIONS: number[] = [1, 3, 5, 10];
