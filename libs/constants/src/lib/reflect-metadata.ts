/**
 * 反射元数据键常量
 *
 * 提供用于装饰器和安全功能的元数据键
 */

/**
 * 公共路由元数据键
 *
 * 用于标识不需要身份验证的公共路由
 */
export const PUBLIC_METHOD_METADATA = '__public:route__';

/**
 * 角色元数据键
 *
 * 用于标识访问资源所需的角色
 */
export const ROLES_METADATA = '__roles__';

/**
 * 权限元数据键
 *
 * 用于标识访问资源所需的权限
 */
export const PERMISSIONS_METADATA = '__permissions__';

/**
 * 功能元数据键
 *
 * 用于标识路由依赖的功能开关
 */
export const FEATURE_METADATA = '__feature__';
