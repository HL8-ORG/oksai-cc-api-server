import { ClsService } from 'nestjs-cls';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 用户信息接口
 */
export interface IUser {
	id: string;
	email: string;
	tenantId: string;
	role?: string;
	organizationId?: string;
	employeeId?: string;
}

/**
 * 请求上下文接口
 *
 * 满足 ClsStore 约束，包含 symbol 索引签名
 */
export interface IRequestContext {
	id: string;
	req: Request;
	res: Response;
	user?: IUser;
	[key: symbol]: any;
}

/**
 * 请求上下文服务
 *
 * 基于 nestjs-cls 实现请求级别的上下文管理
 * 用于在请求生命周期内传递用户、租户等信息
 */
export class RequestContext {
	/** 请求上下文名称，用于 ClsService 存储 */
	private static readonly CONTEXT_NAME = 'REQUEST_CONTEXT';

	/** ClsService 实例（使用 any 避免 ClsStore 约束问题） */
	private static clsService: ClsService<any> | null = null;

	/** 私有构造函数，防止外部实例化 */
	private constructor() {}

	/**
	 * 设置 ClsService 实例
	 *
	 * @param clsService - ClsService 实例
	 */
	static setClsService(clsService: ClsService<any>): void {
		RequestContext.clsService = clsService;
	}

	/**
	 * 初始化请求上下文
	 *
	 * @param req - Express 请求对象
	 * @param res - Express 响应对象
	 */
	static initialize(req: Request, res: Response): void {
		if (!RequestContext.clsService) {
			throw new Error('ClsService 未初始化，请先调用 setClsService');
		}

		const context: IRequestContext = {
			id: uuidv4(),
			req,
			res
		};

		RequestContext.clsService.set(RequestContext.CONTEXT_NAME, context);
	}

	/**
	 * 设置当前用户
	 *
	 * @param user - 用户信息
	 */
	static setCurrentUser(user: IUser): void {
		const context = RequestContext.getContext();
		if (context) {
			context.user = user;
		}
	}

	/**
	 * 获取请求上下文
	 *
	 * @returns 请求上下文或 null
	 */
	private static getContext(): IRequestContext | null {
		if (!RequestContext.clsService) {
			return null;
		}

		return RequestContext.clsService.get(RequestContext.CONTEXT_NAME) || null;
	}

	/**
	 * 获取当前请求 ID
	 *
	 * @returns 请求 ID 或 null
	 */
	static getCurrentRequestId(): string | null {
		return RequestContext.getContext()?.id || null;
	}

	/**
	 * 获取当前请求对象
	 *
	 * @returns Express 请求对象或 null
	 */
	static getCurrentRequest(): Request | null {
		return RequestContext.getContext()?.req || null;
	}

	/**
	 * 获取当前响应对象
	 *
	 * @returns Express 响应对象或 null
	 */
	static getCurrentResponse(): Response | null {
		return RequestContext.getContext()?.res || null;
	}

	/**
	 * 获取当前用户
	 *
	 * @returns 用户信息或 null
	 */
	static getCurrentUser(): IUser | null {
		return RequestContext.getContext()?.user || null;
	}

	/**
	 * 获取当前用户 ID
	 *
	 * @returns 用户 ID 或 null
	 */
	static getCurrentUserId(): string | null {
		return RequestContext.getCurrentUser()?.id || null;
	}

	/**
	 * 获取当前租户 ID
	 *
	 * @returns 租户 ID 或 null
	 */
	static getCurrentTenantId(): string | null {
		return RequestContext.getCurrentUser()?.tenantId || null;
	}

	/**
	 * 获取当前组织 ID
	 *
	 * @returns 组织 ID 或 null
	 */
	static getCurrentOrganizationId(): string | null {
		return RequestContext.getCurrentUser()?.organizationId || null;
	}

	/**
	 * 获取当前员工 ID
	 *
	 * @returns 员工 ID 或 null
	 */
	static getCurrentEmployeeId(): string | null {
		return RequestContext.getCurrentUser()?.employeeId || null;
	}

	/**
	 * 获取当前角色
	 *
	 * @returns 角色或 null
	 */
	static getCurrentRole(): string | null {
		return RequestContext.getCurrentUser()?.role || null;
	}

	/**
	 * 检查是否设置了租户上下文
	 *
	 * @returns 如果租户 ID 存在返回 true，否则返回 false
	 */
	static hasTenantContext(): boolean {
		return !!RequestContext.getCurrentTenantId();
	}

	/**
	 * 检查用户是否已认证
	 *
	 * @returns 如果用户已认证返回 true，否则返回 false
	 */
	static isAuthenticated(): boolean {
		return !!RequestContext.getCurrentUser();
	}
}
