# API 端点清单

**版本**: 1.0.0
**创建日期**: 2026-02-07
**文档类型**: API 文档
**状态**: 待实施

---

## 文档概述

本文档列出 OKSAI SAAS 服务端框架第一阶段的 API 端点清单，包括所有系统插件提供的 RESTful API。

---

## 目录

1. [API 设计原则](#1-api-设计原则)
2. [认证 API](#2-认证-api)
3. [租户 API](#3-租户-api)
4. [用户 API](#4-用户-api)
5. [组织 API](#5-组织-api)
6. [角色 API](#6-角色-api)
7. [审计 API](#7-审计-api)
8. [分析 API](#8-分析-api)
9. [报表 API](#9-报表-api)
10. [插件 API](#10-插件-api)
11. [状态码](#11-状态码)
12. [认证示例](#12-认证示例)

---

## 1. API 设计原则

### 1.1 URL 结构

```
https://api.oksai.io/api/v1/{resource}
```

### 1.2 HTTP 方法

| 方法   | 用途         | 幂等性 |
| ------ | ------------ | ------ |
| GET    | 获取资源     | 是     |
| POST   | 创建资源     | 否     |
| PUT    | 完整更新资源 | 是     |
| PATCH  | 部分更新资源 | 否     |
| DELETE | 删除资源     | 是     |

### 1.3 分页参数

所有列表端点支持分页：

| 参数   | 类型   | 必填 | 默认值 | 描述                 |
| ------ | ------ | ---- | ------ | -------------------- |
| page   | Number | 否   | 1      | 页码 (从 1 开始)     |
| limit  | Number | 否   | 10     | 每页数量 (1-100)     |
| sort   | String | 否   | -      | 排序字段             |
| order  | String | 否   | -      | 排序方向 (ASC, DESC) |
| search | String | 否   | -      | 搜索关键词           |

### 1.4 响应格式

#### 成功响应

```json
{
	"success": true,
	"data": {
		// 响应数据
	},
	"message": "操作成功"
}
```

#### 错误响应

```json
{
	"success": false,
	"error": {
		"code": "ERROR_CODE",
		"message": "错误描述",
		"details": {}
	}
}
```

#### 分页响应

```json
{
	"success": true,
	"data": {
		"items": [],
		"total": 100,
		"page": 1,
		"limit": 10,
		"pages": 10
	}
}
```

---

## 2. 认证 API

### 2.1 登录

**端点**: `POST /api/v1/auth/login`

**描述**: 用户登录，返回 JWT 令牌

**请求体**:

```json
{
	"email": "user@example.com",
	"password": "password123"
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"user": {
			"id": "uuid",
			"email": "user@example.com",
			"firstName": "John",
			"lastName": "Doe",
			"imageUrl": "https://example.com/avatar.jpg"
		},
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"expiresIn": 604800
	}
}
```

**错误码**:

-   `AUTH_INVALID_CREDENTIALS`: 邮箱或密码错误
-   `AUTH_USER_INACTIVE`: 用户未激活
-   `AUTH_ACCOUNT_LOCKED`: 账户被锁定

---

### 2.2 注册

**端点**: `POST /api/v1/auth/register`

**描述**: 用户注册

**请求体**:

```json
{
	"email": "user@example.com",
	"password": "password123",
	"firstName": "John",
	"lastName": "Doe"
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"user": {
			"id": "uuid",
			"email": "user@example.com",
			"firstName": "John",
			"lastName": "Doe"
		},
		"message": "注册成功，请验证邮箱"
	}
}
```

**错误码**:

-   `AUTH_EMAIL_ALREADY_EXISTS`: 邮箱已存在
-   `AUTH_PASSWORD_TOO_WEAK`: 密码强度不足
-   `AUTH_INVALID_EMAIL`: 邮箱格式错误

---

### 2.3 登出

**端点**: `POST /api/v1/auth/logout`

**描述**: 用户登出，使令牌失效

**请求头**:

```
Authorization: Bearer {accessToken}
```

**响应**:

```json
{
	"success": true,
	"message": "登出成功"
}
```

---

### 2.4 刷新令牌

**端点**: `POST /api/v1/auth/refresh`

**描述**: 使用 Refresh Token 刷新 Access Token

**请求体**:

```json
{
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"expiresIn": 604800
	}
}
```

**错误码**:

-   `AUTH_INVALID_REFRESH_TOKEN`: Refresh Token 无效
-   `AUTH_REFRESH_TOKEN_EXPIRED`: Refresh Token 已过期

---

### 2.5 获取当前用户信息

**端点**: `GET /api/v1/auth/me`

**描述**: 获取当前登录用户信息

**请求头**:

```
Authorization: Bearer {accessToken}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"user": {
			"id": "uuid",
			"email": "user@example.com",
			"firstName": "John",
			"lastName": "Doe",
			"imageUrl": "https://example.com/avatar.jpg",
			"role": {
				"id": "uuid",
				"name": "ADMIN",
				"permissions": ["users:read", "users:write"]
			},
			"tenant": {
				"id": "uuid",
				"name": "My Company"
			},
			"organizations": [
				{
					"id": "uuid",
					"name": "Organization 1"
				}
			]
		}
	}
}
```

---

### 2.6 第三方认证回调

#### Google OAuth

**端点**: `GET /api/v1/auth/google/callback`

**参数**: `code` (授权码）

#### Microsoft OAuth

**端点**: `GET /api/v1/auth/microsoft/callback`

**参数**: `code` (授权码)

#### GitHub OAuth

**端点**: `GET /api/v1/auth/github/callback`

**参数**: `code` (授权码)

#### Auth0 OAuth

**端点**: `GET /api/v1/auth/auth0/callback`

**参数**: `code` (授权码)

**响应**:

```json
{
	"success": true,
	"data": {
		"user": {
			/* 用户信息 */
		},
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```

---

## 3. 租户 API

### 3.1 获取租户列表

**端点**: `GET /api/v1/tenant`

**描述**: 获取所有租户列表（系统管理员）

**权限**: `tenant:read`

**分页参数**: 支持

**响应**:

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"name": "Company A",
				"logo": "https://example.com/logo.png",
				"standardWorkHoursPerDay": 8,
				"isActive": true,
				"createdAt": "2026-02-07T00:00:00Z"
			}
		],
		"total": 100,
		"page": 1,
		"limit": 10,
		"pages": 10
	}
}
```

---

### 3.2 创建租户

**端点**: `POST /api/v1/tenant`

**描述**: 创建新租户

**权限**: `tenant:write`

**请求体**:

```json
{
	"name": "My Company",
	"standardWorkHoursPerDay": 8
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "My Company",
		"standardWorkHoursPerDay": 8,
		"isActive": true,
		"createdAt": "2026-02-07T00:00:00Z"
	}
}
```

**错误码**:

-   `TENANT_NAME_EXISTS`: 租户名称已存在
-   `TENANT_NAME_TOO_LONG`: 租户名称过长

---

### 3.3 获取租户详情

**端点**: `GET /api/v1/tenant/:id`

**描述**: 获取租户详情

**权限**: `tenant:read`

**响应**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "My Company",
		"logo": "https://example.com/logo.png",
		"standardWorkHoursPerDay": 8,
		"isActive": true,
		"organizations": [
			/* 组织列表 */
		],
		"createdAt": "2026-02-07T00:00:00Z"
	}
}
```

**错误码**:

-   `TENANT_NOT_FOUND`: 租户不存在

---

### 3.4 更新租户

**端点**: `PATCH /api/v1/tenant/:id`

**描述**: 更新租户信息

**权限**: `tenant:write`

**请求体**:

```json
{
	"name": "Updated Company",
	"standardWorkHoursPerDay": 9
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "Updated Company",
		"standardWorkHoursPerDay": 9,
		"isActive": true,
		"updatedAt": "2026-02-07T00:00:00Z"
	}
}
```

---

### 3.5 删除租户

**端点**: `DELETE /api/v1/tenant/:id`

**描述**: 删除租户（系统管理员）

**权限**: `tenant:delete`

**响应**:

```json
{
	"success": true,
	"message": "租户删除成功"
}
```

**错误码**:

-   `TENANT_NOT_FOUND`: 租户不存在
-   `TENANT_HAS_ORGANIZATIONS`: 租户下还有组织，无法删除

---

## 4. 用户 API

### 4.1 获取用户列表

**端点**: `GET /api/v1/users`

**描述**: 获取当前租户的用户列表

**权限**: `users:read`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**分页参数**: 支持
**搜索参数**: `search` (搜索邮箱、姓名)

**响应**:

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"email": "user@example.com",
				"firstName": "John",
				"lastName": "Doe",
				"imageUrl": "https://example.com/avatar.jpg",
				"isActive": true,
				"verified": true,
				"role": {
					"id": "uuid",
					"name": "ADMIN"
				},
				"createdAt": "2026-02-07T00:00:00Z"
			}
		],
		"total": 100,
		"page": 1,
		"limit": 10,
		"pages": 10
	}
}
```

---

### 4.2 创建用户

**端点**: `POST /api/v1/users`

**描述**: 创建新用户

**权限**: `users:write`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**请求体**:

```json
{
	"email": "newuser@example.com",
	"password": "password123",
	"firstName": "John",
	"lastName": "Doe",
	"roleId": "uuid"
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"email": "newuser@example.com",
		"firstName": "John",
		"lastName": "Doe",
		"roleId": "uuid",
		"isActive": true,
		"createdAt": "2026-02-07T00:00:00Z"
	}
}
```

**错误码**:

-   `USER_EMAIL_EXISTS`: 邮箱已存在
-   `USER_ROLE_NOT_FOUND`: 角色不存在
-   `USER_PASSWORD_TOO_WEAK`: 密码强度不足

---

### 4.3 邀请用户

**端点**: `POST /api/v1/users/invite`

**描述**: 邀请用户加入组织

**权限**: `users:invite`

**请求头**:

```
X-Tenant-Id: {tenantId}
X-Organization-Id: {organizationId}
Authorization: Bearer {accessToken}
```

**请求体**:

```json
{
	"email": "invited@example.com",
	"fullName": "Jane Doe",
	"roleId": "uuid"
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"email": "invited@example.com",
		"token": "random-token-string",
		"status": "INVITED",
		"expireDate": "2026-02-14T00:00:00Z",
		"createdAt": "2026-02-07T00:00:00Z"
	}
}
```

**错误码**:

-   `USER_ALREADY_EXISTS`: 用户已存在
-   `USER_ALREADY_INVITED`: 用户已邀请

---

### 4.4 接受邀请

**端点**: `POST /api/v1/users/invites/:id/accept`

**描述**: 接受用户邀请

**权限**: 公开端点（使用邀请令牌）

**请求体**:

```json
{
	"token": "random-token-string",
	"password": "newpassword123"
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"user": {
			"id": "uuid",
			"email": "invited@example.com"
		},
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```

**错误码**:

-   `INVITE_NOT_FOUND`: 邀请不存在
-   `INVITE_EXPIRED`: 邀请已过期
-   `INVITE_ALREADY_ACCEPTED`: 邀请已被接受

---

## 5. 组织 API

### 5.1 获取组织列表

**端点**: `GET /api/v1/organizations`

**描述**: 获取当前租户的组织列表

**权限**: `organizations:read`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**分页参数**: 支持

**响应**:

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"name": "Organization A",
				"slug": "org-a",
				"imageUrl": "https://example.com/logo.png",
				"currency": "USD",
				"isActive": true,
				"createdAt": "2026-02-07T00:00:00Z"
			}
		],
		"total": 50,
		"page": 1,
		"limit": 10,
		"pages": 5
	}
}
```

---

### 5.2 创建组织

**端点**: `POST /api/v1/organizations`

**描述**: 创建新组织

**权限**: `organizations:write`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**请求体**:

```json
{
	"name": "My Organization",
	"slug": "my-organization",
	"currency": "USD"
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "My Organization",
		"slug": "my-organization",
		"currency": "USD",
		"isActive": true,
		"createdAt": "2026-02-07T00:00:00Z"
	}
}
```

**错误码**:

-   `ORGANIZATION_NAME_EXISTS`: 组织名称已存在
-   `ORGANIZATION_SLUG_EXISTS`: 组织标识已存在

---

## 6. 角色 API

### 6.1 获取角色列表

**端点**: `GET /api/v1/roles`

**描述**: 获取当前租户的角色列表

**权限**: `roles:read`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**分页参数**: 支持

**响应**:

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"name": "ADMIN",
				"description": "管理员角色",
				"isSystem": false,
				"permissions": [
					{
						"id": "uuid",
						"name": "users:read"
					}
				],
				"createdAt": "2026-02-07T00:00:00Z"
			}
		],
		"total": 20,
		"page": 1,
		"limit": 10,
		"pages": 2
	}
}
```

---

### 6.2 创建角色

**端点**: `POST /api/v1/roles`

**描述**: 创建新角色

**权限**: `roles:write`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**请求体**:

```json
{
	"name": "Manager",
	"description": "管理者角色",
	"permissions": ["uuid", "uuid"]
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "Manager",
		"description": "管理者角色",
		"createdAt": "2026-02-07T00:00:00Z"
	}
}
```

**错误码**:

-   `ROLE_NAME_EXISTS`: 角色名称已存在
-   `ROLE_NAME_RESERVED`: 角色名称为系统保留名称

---

### 6.3 分配权限

**端点**: `POST /api/v1/roles/:id/permissions`

**描述**: 为角色分配权限

**权限**: `permissions:write`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**请求体**:

```json
{
	"permissionIds": ["uuid", "uuid"]
}
```

**响应**:

```json
{
	"success": true,
	"message": "权限分配成功"
}
```

---

## 7. 审计 API

### 7.1 获取审计日志

**端点**: `GET /api/v1/audit`

**描述**: 获取审计日志列表

**权限**: `audit:read`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**查询参数**:

| 参数      | 类型   | 描述                              |
| --------- | ------ | --------------------------------- |
| action    | String | 操作类型 (CREATE, UPDATE, DELETE) |
| entity    | String | 实体名称                          |
| entityId  | String | 实体 ID                           |
| userId    | String | 用户 ID                           |
| startDate | Date   | 开始日期                          |
| endDate   | Date   | 结束日期                          |

**分页参数**: 支持

**响应**:

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"action": "CREATE",
				"entity": "User",
				"entityId": "uuid",
				"userId": "uuid",
				"userName": "John Doe",
				"oldValue": null,
				"newValue": {
					"email": "newuser@example.com",
					"firstName": "John"
				},
				"ipAddress": "192.168.1.1",
				"userAgent": "Mozilla/5.0...",
				"createdAt": "2026-02-07T00:00:00Z"
			}
		],
		"total": 10000,
		"page": 1,
		"limit": 100,
		"pages": 100
	}
}
```

---

## 8. 分析 API

### 8.1 记录分析事件

**端点**: `POST /api/v1/analytics/events`

**描述**: 记录用户行为事件

**权限**: `analytics:write`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**请求体**:

```json
{
	"eventType": "USER_ACTION",
	"eventName": "user_login",
	"properties": {
		"loginMethod": "email",
		"device": "desktop"
	}
}
```

**响应**:

```json
{
	"success": true,
	"message": "事件记录成功"
}
```

---

### 8.2 查询分析事件

**端点**: `GET /api/v1/analytics/events`

**描述**: 查询分析事件

**权限**: `analytics:read`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**查询参数**:

| 参数      | 类型   | 描述     |
| --------- | ------ | -------- |
| eventType | String | 事件类型 |
| eventName | String | 事件名称 |
| userId    | String | 用户 ID  |
| startDate | Date   | 开始日期 |
| endDate   | Date   | 结束日期 |

**分页参数**: 支持

**响应**:

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"eventType": "USER_ACTION",
				"eventName": "user_login",
				"userId": "uuid",
				"properties": {
					"loginMethod": "email"
				},
				"timestamp": "2026-02-07T00:00:00Z"
			}
		],
		"total": 100000,
		"page": 1,
		"limit": 100,
		"pages": 1000
	}
}
```

---

## 9. 报表 API

### 9.1 获取报表列表

**端点**: `GET /api/v1/reporting/reports`

**描述**: 获取当前租户的报表列表

**权限**: `reporting:read`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**分页参数**: 支持

**响应**:

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"name": "Monthly Sales Report",
				"description": "每月销售报表",
				"reportType": "TABLE",
				"templateId": "uuid",
				"isActive": true,
				"createdAt": "2026-02-07T00:00:00Z"
			}
		],
		"total": 50,
		"page": 1,
		"limit": 10,
		"pages": 5
	}
}
```

---

### 9.2 创建报表

**端点**: `POST /api/v1/reporting/reports`

**描述**: 创建新报表

**权限**: `reporting:write`

**请求头**:

```
X-Tenant-Id: {tenantId}
```

**请求体**:

```json
{
	"name": "New Report",
	"description": "报表描述",
	"reportType": "TABLE",
	"templateId": "uuid"
}
```

**响应**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "New Report",
		"reportType": "TABLE",
		"isActive": true,
		"createdAt": "2026-02-07T00:00:00Z"
	}
}
```

---

### 9.3 生成报表

**端点**: `POST /api/v1/reporting/reports/:id/generate`

**描述**: 生成报表数据

**权限**: `reporting:write`

**响应**:

```json
{
	"success": true,
	"data": {
		"reportId": "uuid",
		"status": "GENERATING",
		"estimatedTime": 30
	}
}
```

---

## 10. 插件 API

### 10.1 获取插件列表

**端点**: `GET /api/v1/plugins`

**描述**: 获取所有插件列表

**权限**: `plugins:read`

**查询参数**:

| 参数    | 类型    | 描述                        |
| ------- | ------- | --------------------------- |
| type    | String  | 插件类型 (system, business) |
| enabled | Boolean | 是否启用                    |

**响应**:

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"name": "auth",
				"displayName": "认证系统",
				"type": "system",
				"priority": "p0",
				"isProtected": true,
				"isEnabled": true,
				"version": "1.0.0",
				"description": "提供身份认证和权限管理功能"
			}
		],
		"total": 17
	}
}
```

---

### 10.2 获取插件详情

**端点**: `GET /api/v1/plugins/:name`

**描述**: 获取插件详情

**权限**: `plugins:read`

**响应**:

```json
{
	"success": true,
	"data": {
		"name": "auth",
		"displayName": "认证系统",
		"type": "system",
		"priority": "p0",
		"isProtected": true,
		"isEnabled": true,
		"version": "1.0.0",
		"description": "提供身份认证和权限管理功能",
		"category": "Authentication",
		"author": {
			"name": "OKSAI Team",
			"email": "team@oksai.io",
			"url": "https://oksais.io"
		},
		"permissions": ["auth:login", "auth:register", "auth:logout"],
		"api": [
			{
				"path": "/api/auth/login",
				"method": "POST",
				"description": "用户登录"
			}
		],
		"features": ["FEATURE_AUTHENTICATION"],
		"dependencies": []
	}
}
```

---

### 10.3 启用插件

**端点**: `POST /api/v1/plugins/:name/enable`

**描述**: 启用业务插件

**权限**: `plugins:manage`

**响应**:

```json
{
	"success": true,
	"message": "插件启用成功"
}
```

**错误码**:

-   `PLUGIN_NOT_FOUND`: 插件不存在
-   `PLUGIN_PROTECTED`: 系统插件不能启用或禁用
-   `PLUGIN_DEPENDENCY_MISSING`: 插件依赖不满足

---

### 10.4 禁用插件

**端点**: `POST /api/v1/plugins/:name/disable`

**描述**: 禁用业务插件

**权限**: `plugins:manage`

**响应**:

```json
{
	"success": true,
	"message": "插件禁用成功"
}
```

---

### 10.5 重载插件

**端点**: `POST /api/v1/plugins/:name/reload`

**描述**: 重载插件（热拔插）

**权限**: `plugins:manage`

**响应**:

```json
{
	"success": true,
	"message": "插件重载成功"
}
```

---

## 11. 状态码

### 11.1 成功状态码

| 状态码 | 描述       | 场景                 |
| ------ | ---------- | -------------------- |
| 200    | OK         | 请求成功             |
| 201    | Created    | 资源创建成功         |
| 204    | No Content | 请求成功，无返回内容 |

### 11.2 客户端错误状态码

| 状态码 | 描述                 | 场景             |
| ------ | -------------------- | ---------------- |
| 400    | Bad Request          | 请求参数错误     |
| 401    | Unauthorized         | 未认证或令牌无效 |
| 403    | Forbidden            | 无权限访问       |
| 404    | Not Found            | 资源不存在       |
| 409    | Conflict             | 资源冲突         |
| 422    | Unprocessable Entity | 请求无法处理     |
| 429    | Too Many Requests    | 请求过于频繁     |

### 11.3 服务端错误状态码

| 状态码 | 描述                  | 场景           |
| ------ | --------------------- | -------------- |
| 500    | Internal Server Error | 服务器内部错误 |
| 502    | Bad Gateway           | 网关错误       |
| 503    | Service Unavailable   | 服务不可用     |
| 504    | Gateway Timeout       | 网关超时       |

---

## 12. 认证示例

### 12.1 JWT 认证

#### 请求示例

```bash
curl -X POST https://api.oksai.io/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### 响应示例

```bash
{
  "success": true,
  "data": {
    "user": { /* 用户信息 */ },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

#### 后续请求示例

```bash
curl -X GET https://api.oksai.io/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 12.2 租户上下文

#### 设置租户上下文

```bash
curl -X GET https://api.oksai.io/api/v1/users \
  -H "X-Tenant-Id: tenant-uuid-here" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 附录

### A. API 统计

| 模块     | 端点数量 |
| -------- | -------- |
| 认证 API | 11       |
| 租户 API | 5        |
| 用户 API | 13       |
| 组织 API | 8        |
| 角色 API | 11       |
| 审计 API | 4        |
| 分析 API | 7        |
| 报表 API | 15       |
| 插件 API | 5        |
| **总计** | **79**   |

### B. 参考文档

-   01-技术规格文档.md - 技术规格
-   02-工作计划文档.md - 工作计划
-   03-核心实体清单.md - 实体清单
-   04-插件清单.md - 插件清单

### C. 变更历史

| 版本  | 日期       | 变更内容                      |
| ----- | ---------- | ----------------------------- |
| 1.0.0 | 2026-02-07 | 初始版本，列出 79 个 API 端点 |

---

**文档结束**
