import { SetMetadata } from '@nestjs/common';
import { ServiceType } from '../interfaces';

/**
 * 服务类型装饰器
 *
 * 用于标记模块或服务的服务类型
 *
 * @param type - 服务类型
 * @returns 装饰器函数
 *
 * @example
 * ```typescript
 * @ServiceType(ServiceType.API)
 * export class AppModule {}
 * ```
 */
export const ServiceTypeMetadata = 'oksai:serviceType';

export function ServiceTypeDecorator(type: ServiceType): ClassDecorator {
	return SetMetadata(ServiceTypeMetadata, type);
}
