import { SetMetadata } from '@nestjs/common';

export const VERSION_KEY = 'version';

export type ApiVersion = string | string[];

/**
 * API 版本装饰器
 *
 * 用于标记控制器或路由处理程序的 API 版本
 *
 * @param versions - 支持的 API 版本（如 'v1'、'v2' 或 ['v1', 'v2']）
 *
 * @example
 * ```typescript
 * // 在控制器级别使用
 * @ApiVersion('v1')
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   findAll() {
 *     return [];
 *   }
 * }
 *
 * // 在路由级别使用
 * @Controller('users')
 * export class UsersController {
 *   @Get('profile')
 *   @ApiVersion('v2')
 *   getProfile() {
 *     return {};
 *   }
 *
 *   // 支持多个版本
 *   @Get('list')
 *   @ApiVersion(['v1', 'v2'])
 *   getList() {
 *     return [];
 *   }
 * }
 * ```
 */
export const ApiVersion = (versions: ApiVersion) => SetMetadata(VERSION_KEY, versions);
