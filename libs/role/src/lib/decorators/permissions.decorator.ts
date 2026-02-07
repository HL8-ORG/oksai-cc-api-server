import { SetMetadata } from '@nestjs/common';

/**
 * 权限装饰器元数据键
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * 权限元数据接口
 *
 * 用于存储路由所需的权限信息
 */
export interface PermissionsMetadata {
	/** 权限类型（如：USER、ORGANIZATION 等） */
	type: string;

	/** 权限操作（如：VIEW、CREATE、EDIT、DELETE 等） */
	action: string;

	/** 权限资源（可选，如：user、tenant、organization 等） */
	resource?: string;
}

/**
 * 权限装饰器
 *
 * 用于标记需要特定权限才能访问的路由
 *
 * @param metadata - 权限元数据
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   @Get()
 *   @Permissions({ type: 'USER', action: 'VIEW', resource: 'user' })
 *   findAll() {
 *     return '用户列表';
 *   }
 *
 *   @Post()
 *   @Permissions({ type: 'USER', action: 'CREATE', resource: 'user' })
 *   create() {
 *     return '创建用户';
 *   }
 * }
 * ```
 */
export const Permissions = (metadata: PermissionsMetadata) => SetMetadata(PERMISSIONS_KEY, metadata);
