/**
 * 可以分配给管理员的实体接口
 */
export interface IManagerAssignable {
	/** 是否为管理员 */
	isManager?: boolean;
	/** 管理员分配时间 */
	assignedAt?: Date;
}
