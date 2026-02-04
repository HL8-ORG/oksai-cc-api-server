import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'isPublic';

/**
 * 公共路由装饰器
 *
 * 标记路由或控制器为公开访问，无需 JWT 认证
 *
 * @example
 * ```typescript
 * // 标记单个路由为公开
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   login() {
 *     return { token: '...' };
 *   }
 * }
 *
 * // 标记整个控制器为公开
 * @Public()
 * @Controller('health')
 * export class HealthController {
 *   @Get()
 *   check() {
 *     return { status: 'ok' };
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true);
