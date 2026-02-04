# API 参考

## 📑 目录

-   [API 概览](#api-概览)
-   [认证方式](#认证方式)
    -   [JWT 认证](#jwt-认证)
    -   [OAuth 2.0 认证](#oauth-20-认证)
-   [认证模块 API](#认证模块-api)
    -   [用户登录](#用户登录)
    -   [用户注册](#用户注册)
    -   [刷新令牌](#刷新令牌)
    -   [用户登出](#用户登出)
    -   [忘记密码](#忘记密码)
    -   [重置密码](#重置密码)
    -   [验证邮箱](#验证邮箱)
    -   [Google OAuth 登录](#google-oauth-登录)
    -   [GitHub OAuth 登录](#github-oauth-登录)
    -   [Auth0 OAuth 登录](#auth0-oauth-登录)
    -   [Microsoft OAuth 登录](#microsoft-oauth-登录)
-   [租户模块 API](#租户模块-api)
    -   [创建租户](#创建租户)
    -   [查询租户列表](#查询租户列表)
    -   [查询租户详情](#查询租户详情)
    -   [根据标识查询租户](#根据标识查询租户)
    -   [更新租户](#更新租户)
    -   [删除租户](#删除租户)
    -   [暂停租户](#暂停租户)
    -   [激活租户](#激活租户)
-   [用户模块 API](#用户模块-api)
    -   [创建用户](#创建用户)
    -   [查询用户列表](#查询用户列表)
    -   [查询用户详情](#查询用户详情)
    -   [更新用户](#更新用户)
    -   [删除用户](#删除用户)
-   [组织模块 API](#组织模块-api)
    -   [创建组织](#创建组织)
    -   [查询组织列表](#查询组织列表)
    -   [查询组织详情](#查询组织详情)
    -   [更新组织](#更新组织)
    -   [删除组织](#删除组织)
-   [角色模块 API](#角色模块-api)
    -   [创建角色](#创建角色)
    -   [查询角色列表](#查询角色列表)
    -   [查询角色详情](#查询角色详情)
    -   [更新角色](#更新角色)
    -   [删除角色](#删除角色)
    -   [为角色分配权限](#为角色分配权限)
    -   [移除角色权限](#移除角色权限)
-   [权限模块 API](#权限模块-api)
    -   [创建权限](#创建权限)
    -   [查询权限列表](#查询权限列表)
    -   [查询权限详情](#查询权限详情)
    -   [更新权限](#更新权限)
    -   [删除权限](#删除权限)
-   [审计日志 API](#审计日志-api)
    -   [查询审计日志列表](#查询审计日志列表)
    -   [查询审计日志详情](#查询审计日志详情)
-   [健康检查 API](#健康检查-api)
    -   [健康检查](#健康检查)
-   [错误码说明](#错误码说明)

---

## API 概览

OKSAI 平台提供 RESTful API 接口，支持多种认证方式和丰富的功能模块。

**API 基础信息：**

-   **基础 URL** - `http://localhost:3000/api/v1`
-   **内容类型** - `application/json`
-   **字符编码** - `UTF-8`
-   **日期格式** - `ISO 8601`（YYYY-MM-DDTHH:mm:ss.sssZ）

**API 版本策略：**

-   通过 URL 路径指定版本：`/api/v1/`
-   主版本变更需要 URL 路径变更
-   次版本变更向后兼容

**响应格式：**

所有 API 响应统一格式：

```typescript
interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	errors?: ValidationError[];
}
```

**错误响应格式：**

```typescript
interface ApiError {
	success: false;
	error: {
		code: string;
		message: string;
		details?: any;
	};
}
```

---

## 认证方式

### JWT 认证

JWT（JSON Web Token）认证是主要的认证方式。

**认证流程：**

1. 客户端使用用户名和密码登录
2. 服务器验证用户凭证
3. 服务器生成访问令牌（Access Token）和刷新令牌（Refresh Token）
4. 客户端在后续请求中携带访问令牌
5. 访问令牌过期后，使用刷新令牌获取新的访问令牌

**请求头：**

```http
Authorization: Bearer <access_token>
```

**示例：**

```http
GET /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**令牌过期处理：**

-   访问令牌过期后返回 401 Unauthorized
-   客户端使用刷新令牌获取新的访问令牌
-   刷新令牌过期后需要重新登录

### OAuth 2.0 认证

支持 OAuth 2.0 第三方认证，包括 Google、GitHub、Auth0、Microsoft。

**OAuth 流程：**

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant P as Provider

    C->>S: GET /auth/google
    S-->>C: Redirect to Google
    C->>P: OAuth Callback
    P-->>S: OAuth Code
    S->>P: Exchange Code for Token
    P-->>S: Access Token
    S->>P: Get User Profile
    P-->>S: User Profile
    S-->>C: Redirect with Tokens
```

**支持的 OAuth 提供商：**

-   **Google** - `/api/v1/auth/google`
-   **GitHub** - `/api/v1/auth/github`
-   **Auth0** - `/api/v1/auth/auth0`
-   **Microsoft** - `/api/v1/auth/microsoft`

---

## 认证模块 API

### 用户登录

使用用户名和密码登录，获取访问令牌和刷新令牌。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/auth/login`
-   **认证** - 不需要

**请求参数：**

```typescript
interface LoginDto {
	/** 用户邮箱 */
	email: string;
	/** 用户密码 */
	password: string;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"user": {
			"id": "550e8400-e29b-41d4-a716-446655440000",
			"email": "user@example.com",
			"firstName": "John",
			"lastName": "Doe",
			"tenantId": "660e8400-e29b-41d4-a716-446655440001",
			"role": "USER"
		}
	}
}
```

**错误响应：**

-   `400 Bad Request` - 请求参数错误
-   `401 Unauthorized` - 用户名或密码错误

---

### 用户注册

创建新用户账号并生成访问令牌和刷新令牌。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/auth/register`
-   **认证** - 不需要

**请求参数：**

```typescript
interface RegisterDto {
	/** 用户邮箱 */
	email: string;
	/** 用户密码 */
	password: string;
	/** 用户名 */
	firstName: string;
	/** 用户姓 */
	lastName: string;
	/** 用户角色（可选） */
	role?: 'ADMIN' | 'USER' | 'GUEST';
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123!",
    "firstName": "Jane",
    "lastName": "Doe"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"user": {
			"id": "770e8400-e29b-41d4-a716-446655440002",
			"email": "newuser@example.com",
			"firstName": "Jane",
			"lastName": "Doe",
			"tenantId": "660e8400-e29b-41d4-a716-446655440001",
			"role": "USER"
		}
	}
}
```

**错误响应：**

-   `400 Bad Request` - 密码强度不足
-   `409 Conflict` - 邮箱已被注册

---

### 刷新令牌

使用刷新令牌获取新的访问令牌。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/auth/refresh`
-   **认证** - 不需要

**请求参数：**

```typescript
interface RefreshTokenDto {
	/** 刷新令牌 */
	refreshToken: string;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```

**错误响应：**

-   `400 Bad Request` - 刷新令牌缺失
-   `401 Unauthorized` - 刷新令牌无效或过期

---

### 用户登出

清除用户的登录状态和令牌。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/auth/logout`
-   **认证** - 需要

**请求头：**

```http
Authorization: Bearer <access_token>
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"message": "登出成功"
}
```

---

### 忘记密码

生成密码重置令牌并发送邮件。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/auth/forgot-password`
-   **认证** - 不需要

**请求参数：**

```typescript
interface ForgotPasswordDto {
	/** 用户邮箱 */
	email: string;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"message": "密码重置邮件已发送"
}
```

**错误响应：**

-   `400 Bad Request` - 邮箱不存在

---

### 重置密码

验证密码重置令牌并设置新密码。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/auth/reset-password`
-   **认证** - 不需要

**请求参数：**

```typescript
interface ResetPasswordDto {
	/** 用户邮箱 */
	email: string;
	/** 重置令牌 */
	token: string;
	/** 新密码 */
	newPassword: string;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "token": "abc123...",
    "newPassword": "NewPassword123!"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"message": "密码重置成功"
}
```

**错误响应：**

-   `400 Bad Request` - 令牌无效或新密码不符合要求
-   `401 Unauthorized` - 令牌过期

---

### 验证邮箱

验证用户的邮箱地址。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/auth/verify-email`
-   **认证** - 不需要

**请求参数：**

```typescript
interface VerifyEmailDto {
	/** 用户邮箱 */
	email: string;
	/** 验证令牌 */
	token: string;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "token": "abc123..."
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"success": true
	}
}
```

---

### Google OAuth 登录

使用 Google OAuth 2.0 进行第三方登录。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/auth/google`
-   **认证** - 不需要

**OAuth 流程：**

1. 客户端访问 `/api/v1/auth/google`
2. 服务器重定向到 Google OAuth 授权页面
3. 用户授权后，Google 重定向到回调地址
4. 服务器处理回调并生成令牌

**重定向 URL：**

```bash
GET /api/v1/auth/google
```

---

### GitHub OAuth 登录

使用 GitHub OAuth 2.0 进行第三方登录。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/auth/github`
-   **认证** - 不需要

**OAuth 流程：**

1. 客户端访问 `/api/v1/auth/github`
2. 服务器重定向到 GitHub OAuth 授权页面
3. 用户授权后，GitHub 重定向到回调地址
4. 服务器处理回调并生成令牌

**重定向 URL：**

```bash
GET /api/v1/auth/github
```

---

### Auth0 OAuth 登录

使用 Auth0 OAuth 2.0 进行第三方登录。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/auth/auth0`
-   **认证** - 不需要

**OAuth 流程：**

1. 客户端访问 `/api/v1/auth/auth0`
2. 服务器重定向到 Auth0 OAuth 授权页面
3. 用户授权后，Auth0 重定向到回调地址
4. 服务器处理回调并生成令牌

**重定向 URL：**

```bash
GET /api/v1/auth/auth0
```

---

### Microsoft OAuth 登录

使用 Microsoft OAuth 2.0 进行第三方登录。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/auth/microsoft`
-   **认证** - 不需要

**OAuth 流程：**

1. 客户端访问 `/api/v1/auth/microsoft`
2. 服务器重定向到 Microsoft OAuth 授权页面
3. 用户授权后，Microsoft 重定向到回调地址
4. 服务器处理回调并生成令牌

**重定向 URL：**

```bash
GET /api/v1/auth/microsoft
```

---

## 租户模块 API

### 创建租户

创建新的租户。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/tenants`
-   **认证** - 需要

**请求参数：**

```typescript
interface CreateTenantDto {
	/** 租户名称 */
	name: string;
	/** 租户标识 */
	slug: string;
	/** 租户 Logo URL */
	logo?: string;
	/** 租户网站地址 */
	website?: string;
	/** 租户描述信息 */
	description?: string;
	/** 租户状态 */
	status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
	/** 租户类型 */
	type?: 'ORGANIZATION' | 'INDIVIDUAL';
	/** 试用结束日期 */
	trialEndDate?: Date;
	/** 订阅计划 */
	subscriptionPlan?: string;
	/** 最大用户数 */
	maxUsers?: number;
	/** 是否允许用户自行注册 */
	allowSelfRegistration?: boolean;
	/** 联系邮箱 */
	contactEmail?: string;
	/** 联系电话 */
	contactPhone?: string;
	/** 地址信息 */
	address?: string;
	/** 城市信息 */
	city?: string;
	/** 国家信息 */
	country?: string;
	/** 语言设置 */
	locale?: string;
	/** 时区设置 */
	timezone?: string;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Example Tenant",
    "slug": "example-tenant",
    "status": "ACTIVE",
    "type": "ORGANIZATION",
    "maxUsers": 100
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "880e8400-e29b-41d4-a716-446655440003",
		"name": "Example Tenant",
		"slug": "example-tenant",
		"status": "ACTIVE",
		"type": "ORGANIZATION",
		"maxUsers": 100,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

**错误响应：**

-   `400 Bad Request` - 租户标识已存在

---

### 查询租户列表

查询租户列表，支持分页和过滤。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/tenants`
-   **认证** - 需要

**查询参数：**

```typescript
interface QueryTenantDto {
	/** 租户状态 */
	status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
	/** 租户类型 */
	type?: 'ORGANIZATION' | 'INDIVIDUAL';
	/** 订阅计划 */
	subscriptionPlan?: string;
	/** 搜索关键词 */
	search?: string;
	/** 页码 */
	page?: number;
	/** 每页数量 */
	limit?: number;
}
```

**请求示例：**

```bash
curl -X GET "http://localhost:3000/api/v1/tenants?status=ACTIVE&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": [
		{
			"id": "880e8400-e29b-41d4-a716-446655440003",
			"name": "Example Tenant",
			"slug": "example-tenant",
			"status": "ACTIVE",
			"type": "ORGANIZATION",
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"total": 1,
	"page": 1,
	"limit": 10
}
```

---

### 查询租户详情

根据 ID 查询租户详情。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/tenants/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 租户 ID

**请求示例：**

```bash
curl -X GET http://localhost:3000/api/v1/tenants/880e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "880e8400-e29b-41d4-a716-446655440003",
		"name": "Example Tenant",
		"slug": "example-tenant",
		"status": "ACTIVE",
		"type": "ORGANIZATION",
		"maxUsers": 100,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

**错误响应：**

-   `404 Not Found` - 租户不存在

---

### 根据标识查询租户

根据标识查询租户详情。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/tenants/slug/:slug`
-   **认证** - 需要

**路径参数：**

-   `slug` - 租户标识

**请求示例：**

```bash
curl -X GET http://localhost:3000/api/v1/tenants/slug/example-tenant \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "880e8400-e29b-41d4-a716-446655440003",
		"name": "Example Tenant",
		"slug": "example-tenant",
		"status": "ACTIVE",
		"type": "ORGANIZATION",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

**错误响应：**

-   `404 Not Found` - 租户不存在

---

### 更新租户

更新租户信息。

**接口信息：**

-   **方法** - `PUT`
-   **路径** - `/api/v1/tenants/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 租户 ID

**请求参数：**

```typescript
interface UpdateTenantDto {
	/** 租户名称 */
	name?: string;
	/** 租户标识 */
	slug?: string;
	/** 租户 Logo URL */
	logo?: string;
	/** 租户网站地址 */
	website?: string;
	/** 租户描述信息 */
	description?: string;
	/** 租户状态 */
	status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
	/** 租户类型 */
	type?: 'ORGANIZATION' | 'INDIVIDUAL';
	/** 试用结束日期 */
	trialEndDate?: Date;
	/** 订阅计划 */
	subscriptionPlan?: string;
	/** 最大用户数 */
	maxUsers?: number;
	/** 是否允许用户自行注册 */
	allowSelfRegistration?: boolean;
	/** 联系邮箱 */
	contactEmail?: string;
	/** 联系电话 */
	contactPhone?: string;
	/** 地址信息 */
	address?: string;
	/** 城市信息 */
	city?: string;
	/** 国家信息 */
	country?: string;
	/** 语言设置 */
	locale?: string;
	/** 时区设置 */
	timezone?: string;
}
```

**请求示例：**

```bash
curl -X PUT http://localhost:3000/api/v1/tenants/880e8400-e29b-41d4-a716-446655440003 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Updated Tenant",
    "maxUsers": 200
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "880e8400-e29b-41d4-a716-446655440003",
		"name": "Updated Tenant",
		"slug": "example-tenant",
		"status": "ACTIVE",
		"type": "ORGANIZATION",
		"maxUsers": 200,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-02T00:00:00.000Z"
	}
}
```

**错误响应：**

-   `400 Bad Request` - 标识冲突
-   `404 Not Found` - 租户不存在

---

### 删除租户

删除租户（软删除）。

**接口信息：**

-   **方法** - `DELETE`
-   **路径** - `/api/v1/tenants/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 租户 ID

**请求示例：**

```bash
curl -X DELETE http://localhost:3000/api/v1/tenants/880e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"message": "租户删除成功"
}
```

---

### 暂停租户

暂停租户（设置状态为 SUSPENDED）。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/tenants/:id/suspend`
-   **认证** - 需要

**路径参数：**

-   `id` - 租户 ID

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/tenants/880e8400-e29b-41d4-a716-446655440003/suspend \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "880e8400-e29b-41d4-a716-446655440003",
		"name": "Example Tenant",
		"slug": "example-tenant",
		"status": "SUSPENDED",
		"type": "ORGANIZATION",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-02T00:00:00.000Z"
	}
}
```

---

### 激活租户

激活租户（设置状态为 ACTIVE）。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/tenants/:id/activate`
-   **认证** - 需要

**路径参数：**

-   `id` - 租户 ID

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/tenants/880e8400-e29b-41d4-a716-446655440003/activate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "880e8400-e29b-41d4-a716-446655440003",
		"name": "Example Tenant",
		"slug": "example-tenant",
		"status": "ACTIVE",
		"type": "ORGANIZATION",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-02T00:00:00.000Z"
	}
}
```

---

## 用户模块 API

### 创建用户

创建新用户。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/users`
-   **认证** - 需要

**请求参数：**

```typescript
interface CreateUserDto {
	/** 用户邮箱 */
	email: string;
	/** 用户密码 */
	password: string;
	/** 用户名 */
	firstName: string;
	/** 用户姓 */
	lastName: string;
	/** 用户角色 */
	role?: 'ADMIN' | 'USER' | 'GUEST';
	/** 所属租户 ID */
	tenantId: string;
	/** 是否活跃 */
	isActive?: boolean;
	/** 头像 URL */
	avatar?: string;
	/** 电话号码 */
	phoneNumber?: string;
	/** 时区设置 */
	timezone?: string;
	/** 语言设置 */
	locale?: string;
	/** 偏好语言 */
	preferredLanguage?: string;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123!",
    "firstName": "Jane",
    "lastName": "Doe",
    "tenantId": "880e8400-e29b-41d4-a716-446655440003"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "990e8400-e29b-41d4-a716-446655440004",
		"email": "newuser@example.com",
		"firstName": "Jane",
		"lastName": "Doe",
		"role": "USER",
		"tenantId": "880e8400-e29b-41d4-a716-446655440003",
		"isActive": true,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

---

### 查询用户列表

查询用户列表，支持分页和过滤。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/users`
-   **认证** - 需要

**查询参数：**

```typescript
interface QueryUserDto {
	/** 用户角色 */
	role?: 'ADMIN' | 'USER' | 'GUEST';
	/** 是否活跃 */
	isActive?: boolean;
	/** 搜索关键词 */
	search?: string;
	/** 页码 */
	page?: number;
	/** 每页数量 */
	limit?: number;
}
```

**请求示例：**

```bash
curl -X GET "http://localhost:3000/api/v1/users?role=USER&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": [
		{
			"id": "990e8400-e29b-41d4-a716-446655440004",
			"email": "newuser@example.com",
			"firstName": "Jane",
			"lastName": "Doe",
			"role": "USER",
			"isActive": true,
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"total": 1,
	"page": 1,
	"limit": 10
}
```

---

### 查询用户详情

根据 ID 查询用户详情。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/users/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 用户 ID

**请求示例：**

```bash
curl -X GET http://localhost:3000/api/v1/users/990e8400-e29b-41d4-a716-446655440004 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "990e8400-e29b-41d4-a716-446655440004",
		"email": "newuser@example.com",
		"firstName": "Jane",
		"lastName": "Doe",
		"role": "USER",
		"tenantId": "880e8400-e29b-41d4-a716-446655440003",
		"isActive": true,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

---

### 更新用户

更新用户信息。

**接口信息：**

-   **方法** - `PUT`
-   **路径** - `/api/v1/users/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 用户 ID

**请求参数：**

```typescript
interface UpdateUserDto {
	/** 用户邮箱 */
	email?: string;
	/** 用户名 */
	firstName?: string;
	/** 用户姓 */
	lastName?: string;
	/** 用户角色 */
	role?: 'ADMIN' | 'USER' | 'GUEST';
	/** 是否活跃 */
	isActive?: boolean;
	/** 头像 URL */
	avatar?: string;
	/** 电话号码 */
	phoneNumber?: string;
	/** 时区设置 */
	timezone?: string;
	/** 语言设置 */
	locale?: string;
	/** 偏好语言 */
	preferredLanguage?: string;
}
```

**请求示例：**

```bash
curl -X PUT http://localhost:3000/api/v1/users/990e8400-e29b-41d4-a716-446655440004 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "firstName": "Jane Updated",
    "phoneNumber": "+1234567890"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "990e8400-e29b-41d4-a716-446655440004",
		"email": "newuser@example.com",
		"firstName": "Jane Updated",
		"lastName": "Doe",
		"role": "USER",
		"isActive": true,
		"phoneNumber": "+1234567890",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-02T00:00:00.000Z"
	}
}
```

---

### 删除用户

删除用户（软删除）。

**接口信息：**

-   **方法** - `DELETE`
-   **路径** - `/api/v1/users/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 用户 ID

**请求示例：**

```bash
curl -X DELETE http://localhost:3000/api/v1/users/990e8400-e29b-41d4-a716-446655440004 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"message": "用户删除成功"
}
```

---

## 组织模块 API

### 创建组织

创建新的组织。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/organizations`
-   **认证** - 需要

**请求参数：**

```typescript
interface CreateOrganizationDto {
	/** 组织名称 */
	name: string;
	/** 组织标识 */
	slug: string;
	/** 组织 Logo URL */
	logo?: string;
	/** 组织网站地址 */
	website?: string;
	/** 组织电话号码 */
	phoneNumber?: string;
	/** 组织邮箱 */
	email?: string;
	/** 货币代码 */
	currency?: string;
	/** 时区设置 */
	timeZone?: string;
	/** 组织地址 */
	address?: string;
	/** 组织所在城市 */
	city?: string;
	/** 组织所在国家 */
	country?: string;
	/** 邮政编码 */
	postalCode?: string;
	/** 组织描述信息 */
	description?: string;
	/** 组织状态 */
	status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
	/** 所属租户 ID */
	tenantId: string;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Example Organization",
    "slug": "example-org",
    "tenantId": "880e8400-e29b-41d4-a716-446655440003"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "a00e8400-e29b-41d4-a716-446655440005",
		"name": "Example Organization",
		"slug": "example-org",
		"status": "ACTIVE",
		"tenantId": "880e8400-e29b-41d4-a716-446655440003",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

---

### 查询组织列表

查询组织列表，支持分页和过滤。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/organizations`
-   **认证** - 需要

**查询参数：**

```typescript
interface QueryOrganizationDto {
	/** 组织状态 */
	status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
	/** 搜索关键词 */
	search?: string;
	/** 页码 */
	page?: number;
	/** 每页数量 */
	limit?: number;
}
```

**请求示例：**

```bash
curl -X GET "http://localhost:3000/api/v1/organizations?status=ACTIVE&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": [
		{
			"id": "a00e8400-e29b-41d4-a716-446655440005",
			"name": "Example Organization",
			"slug": "example-org",
			"status": "ACTIVE",
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"total": 1,
	"page": 1,
	"limit": 10
}
```

---

### 查询组织详情

根据 ID 查询组织详情。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/organizations/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 组织 ID

**请求示例：**

```bash
curl -X GET http://localhost:3000/api/v1/organizations/a00e8400-e29b-41d4-a716-446655440005 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "a00e8400-e29b-41d4-a716-446655440005",
		"name": "Example Organization",
		"slug": "example-org",
		"status": "ACTIVE",
		"tenantId": "880e8400-e29b-41d4-a716-446655440003",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

---

### 更新组织

更新组织信息。

**接口信息：**

-   **方法** - `PUT`
-   **路径** - `/api/v1/organizations/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 组织 ID

**请求示例：**

```bash
curl -X PUT http://localhost:3000/api/v1/organizations/a00e8400-e29b-41d4-a716-446655440005 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Updated Organization",
    "phoneNumber": "+1234567890"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "a00e8400-e29b-41d4-a716-446655440005",
		"name": "Updated Organization",
		"slug": "example-org",
		"phoneNumber": "+1234567890",
		"status": "ACTIVE",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-02T00:00:00.000Z"
	}
}
```

---

### 删除组织

删除组织（软删除）。

**接口信息：**

-   **方法** - `DELETE`
-   **路径** - `/api/v1/organizations/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 组织 ID

**请求示例：**

```bash
curl -X DELETE http://localhost:3000/api/v1/organizations/a00e8400-e29b-41d4-a716-446655440005 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"message": "组织删除成功"
}
```

---

## 角色模块 API

### 创建角色

创建新的角色。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/roles`
-   **认证** - 需要

**请求参数：**

```typescript
interface CreateRoleDto {
	/** 角色名称 */
	name: string;
	/** 角色标识 */
	slug: string;
	/** 角色类型 */
	type?: 'ADMIN' | 'MANAGER' | 'USER' | 'GUEST';
	/** 角色描述 */
	description?: string;
	/** 所属租户 ID */
	tenantId: string;
	/** 是否启用 */
	isEnabled?: boolean;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Administrator",
    "slug": "administrator",
    "type": "ADMIN",
    "tenantId": "880e8400-e29b-41d4-a716-446655440003"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "b00e8400-e29b-41d4-a716-446655440006",
		"name": "Administrator",
		"slug": "administrator",
		"type": "ADMIN",
		"isEnabled": true,
		"tenantId": "880e8400-e29b-41d4-a716-446655440003",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

---

### 查询角色列表

查询角色列表，支持分页和过滤。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/roles`
-   **认证** - 需要

**查询参数：**

```typescript
interface QueryRoleDto {
	/** 角色类型 */
	type?: 'ADMIN' | 'MANAGER' | 'USER' | 'GUEST';
	/** 是否启用 */
	isEnabled?: boolean;
	/** 搜索关键词 */
	search?: string;
	/** 页码 */
	page?: number;
	/** 每页数量 */
	limit?: number;
}
```

**请求示例：**

```bash
curl -X GET "http://localhost:3000/api/v1/roles?type=ADMIN&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": [
		{
			"id": "b00e8400-e29b-41d4-a716-446655440006",
			"name": "Administrator",
			"slug": "administrator",
			"type": "ADMIN",
			"isEnabled": true,
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"total": 1,
	"page": 1,
	"limit": 10
}
```

---

### 查询角色详情

根据 ID 查询角色详情。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/roles/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 角色 ID

**请求示例：**

```bash
curl -X GET http://localhost:3000/api/v1/roles/b00e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "b00e8400-e29b-41d4-a716-446655440006",
		"name": "Administrator",
		"slug": "administrator",
		"type": "ADMIN",
		"isEnabled": true,
		"tenantId": "880e8400-e29b-41d4-a716-446655440003",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

---

### 更新角色

更新角色信息。

**接口信息：**

-   **方法** - `PUT`
-   **路径** - `/api/v1/roles/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 角色 ID

**请求示例：**

```bash
curl -X PUT http://localhost:3000/api/v1/roles/b00e8400-e29b-41d4-a716-446655440006 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Super Administrator",
    "description": "Super Administrator with all permissions"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "b00e8400-e29b-41d4-a716-446655440006",
		"name": "Super Administrator",
		"slug": "administrator",
		"type": "ADMIN",
		"description": "Super Administrator with all permissions",
		"isEnabled": true,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-02T00:00:00.000Z"
	}
}
```

---

### 删除角色

删除角色（软删除）。

**接口信息：**

-   **方法** - `DELETE`
-   **路径** - `/api/v1/roles/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 角色 ID

**请求示例：**

```bash
curl -X DELETE http://localhost:3000/api/v1/roles/b00e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"message": "角色删除成功"
}
```

---

### 为角色分配权限

为角色分配权限。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/roles/:id/permissions`
-   **认证** - 需要

**路径参数：**

-   `id` - 角色 ID

**请求参数：**

```typescript
interface AssignPermissionsDto {
	/** 权限 ID 列表 */
	permissionIds: string[];
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/roles/b00e8400-e29b-41d4-a716-446655440006/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "permissionIds": [
      "c00e8400-e29b-41d4-a716-446655440007",
      "d00e8400-e29b-41d4-a716-446655440008"
    ]
  }'
```

**响应示例：**

```json
{
	"success": true,
	"message": "权限分配成功"
}
```

---

### 移除角色权限

移除角色的权限。

**接口信息：**

-   **方法** - `DELETE`
-   **路径** - `/api/v1/roles/:id/permissions/:permissionId`
-   **认证** - 需要

**路径参数：**

-   `id` - 角色 ID
-   `permissionId` - 权限 ID

**请求示例：**

```bash
curl -X DELETE http://localhost:3000/api/v1/roles/b00e8400-e29b-41d4-a716-446655440006/permissions/c00e8400-e29b-41d4-a716-446655440007 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"message": "权限移除成功"
}
```

---

## 权限模块 API

### 创建权限

创建新的权限。

**接口信息：**

-   **方法** - `POST`
-   **路径** - `/api/v1/permissions`
-   **认证** - 需要

**请求参数：**

```typescript
interface CreatePermissionDto {
	/** 权限名称 */
	name: string;
	/** 权限类型 */
	type: 'ORGANIZATION' | 'USER' | 'ROLE' | 'PERMISSION';
	/** 权限操作 */
	action: 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'ASSIGN' | 'REVOKE';
	/** 权限描述 */
	description?: string;
	/** 所属租户 ID */
	tenantId: string;
	/** 权限资源 */
	resource?: string;
	/** 是否启用 */
	isEnabled?: boolean;
}
```

**请求示例：**

```bash
curl -X POST http://localhost:3000/api/v1/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "View Users",
    "type": "USER",
    "action": "VIEW",
    "tenantId": "880e8400-e29b-41d4-a716-446655440003"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "e00e8400-e29b-41d4-a716-446655440009",
		"name": "View Users",
		"type": "USER",
		"action": "VIEW",
		"isEnabled": true,
		"tenantId": "880e8400-e29b-41d4-a716-446655440003",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

---

### 查询权限列表

查询权限列表，支持分页和过滤。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/permissions`
-   **认证** - 需要

**查询参数：**

```typescript
interface QueryPermissionDto {
	/** 权限类型 */
	type?: 'ORGANIZATION' | 'USER' | 'ROLE' | 'PERMISSION';
	/** 权限操作 */
	action?: 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'ASSIGN' | 'REVOKE';
	/** 是否启用 */
	isEnabled?: boolean;
	/** 搜索关键词 */
	search?: string;
	/** 页码 */
	page?: number;
	/** 每页数量 */
	limit?: number;
}
```

**请求示例：**

```bash
curl -X GET "http://localhost:3000/api/v1/permissions?type=USER&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": [
		{
			"id": "e00e8400-e29b-41d4-a716-446655440009",
			"name": "View Users",
			"type": "USER",
			"action": "VIEW",
			"isEnabled": true,
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"total": 1,
	"page": 1,
	"limit": 10
}
```

---

### 查询权限详情

根据 ID 查询权限详情。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/permissions/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 权限 ID

**请求示例：**

```bash
curl -X GET http://localhost:3000/api/v1/permissions/e00e8400-e29b-41d4-a716-446655440009 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "e00e8400-e29b-41d4-a716-446655440009",
		"name": "View Users",
		"type": "USER",
		"action": "VIEW",
		"isEnabled": true,
		"tenantId": "880e8400-e29b-41d4-a716-446655440003",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

---

### 更新权限

更新权限信息。

**接口信息：**

-   **方法** - `PUT`
-   **路径** - `/api/v1/permissions/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 权限 ID

**请求示例：**

```bash
curl -X PUT http://localhost:3000/api/v1/permissions/e00e8400-e29b-41d4-a716-446655440009 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "View All Users",
    "description": "Permission to view all users in the organization"
  }'
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "e00e8400-e29b-41d4-a716-446655440009",
		"name": "View All Users",
		"type": "USER",
		"action": "VIEW",
		"description": "Permission to view all users in the organization",
		"isEnabled": true,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-02T00:00:00.000Z"
	}
}
```

---

### 删除权限

删除权限（软删除）。

**接口信息：**

-   **方法** - `DELETE`
-   **路径** - `/api/v1/permissions/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 权限 ID

**请求示例：**

```bash
curl -X DELETE http://localhost:3000/api/v1/permissions/e00e8400-e29b-41d4-a716-446655440009 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"message": "权限删除成功"
}
```

---

## 审计日志 API

### 查询审计日志列表

查询审计日志列表，支持分页和过滤。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/audit-logs`
-   **认证** - 需要

**查询参数：**

```typescript
interface QueryAuditLogDto {
	/** 操作用户 ID */
	userId?: string;
	/** 租户 ID */
	tenantId?: string;
	/** 操作类型 */
	action?:
		| 'CREATE'
		| 'UPDATE'
		| 'DELETE'
		| 'LOGIN'
		| 'LOGOUT'
		| 'REGISTER'
		| 'PASSWORD_CHANGE'
		| 'PASSWORD_RESET'
		| 'EMAIL_VERIFY';
	/** 受影响的实体类型 */
	entityType?: 'USER' | 'TENANT' | 'ORGANIZATION' | 'ROLE' | 'PERMISSION';
	/** 搜索关键词 */
	search?: string;
	/** 页码 */
	page?: number;
	/** 每页数量 */
	limit?: number;
}
```

**请求示例：**

```bash
curl -X GET "http://localhost:3000/api/v1/audit-logs?action=LOGIN&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": [
		{
			"id": "f00e8400-e29b-41d4-a716-446655440010",
			"userId": "550e8400-e29b-41d4-a716-446655440000",
			"tenantId": "880e8400-e29b-41d4-a716-446655440003",
			"entityType": "USER",
			"action": "LOGIN",
			"entityId": "550e8400-e29b-41d4-a716-446655440000",
			"ipAddress": "192.168.1.1",
			"userAgent": "Mozilla/5.0...",
			"logLevel": "INFO",
			"createdAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"total": 1,
	"page": 1,
	"limit": 10
}
```

---

### 查询审计日志详情

根据 ID 查询审计日志详情。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/audit-logs/:id`
-   **认证** - 需要

**路径参数：**

-   `id` - 审计日志 ID

**请求示例：**

```bash
curl -X GET http://localhost:3000/api/v1/audit-logs/f00e8400-e29b-41d4-a716-446655440010 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"id": "f00e8400-e29b-41d4-a716-446655440010",
		"userId": "550e8400-e29b-41d4-a716-446655440000",
		"tenantId": "880e8400-e29b-41d4-a716-446655440003",
		"entityType": "USER",
		"action": "LOGIN",
		"entityId": "550e8400-e29b-41d4-a716-446655440000",
		"entityName": "user@example.com",
		"oldValue": null,
		"newValue": null,
		"description": "用户登录",
		"ipAddress": "192.168.1.1",
		"userAgent": "Mozilla/5.0...",
		"requestId": "abc123",
		"logLevel": "INFO",
		"createdAt": "2024-01-01T00:00:00.000Z"
	}
}
```

---

## 健康检查 API

### 健康检查

检查应用的健康状态。

**接口信息：**

-   **方法** - `GET`
-   **路径** - `/api/v1/health`
-   **认证** - 不需要

**请求示例：**

```bash
curl -X GET http://localhost:3000/api/v1/health
```

**响应示例：**

```json
{
	"success": true,
	"data": {
		"status": "healthy",
		"timestamp": "2024-01-01T00:00:00.000Z",
		"version": "1.0.0",
		"environment": "development",
		"uptime": 3600
	}
}
```

---

## 错误码说明

### HTTP 状态码

| 状态码 | 含义                  | 说明           |
| ------ | --------------------- | -------------- |
| 200    | OK                    | 请求成功       |
| 201    | Created               | 资源创建成功   |
| 400    | Bad Request           | 请求参数错误   |
| 401    | Unauthorized          | 未授权         |
| 403    | Forbidden             | 禁止访问       |
| 404    | Not Found             | 资源不存在     |
| 409    | Conflict              | 资源冲突       |
| 500    | Internal Server Error | 服务器内部错误 |

### 错误码格式

```typescript
interface ApiError {
	success: false;
	error: {
		code: string;
		message: string;
		details?: any;
	};
}
```

### 常见错误码

| 错误码                     | 含义             | HTTP 状态码 |
| -------------------------- | ---------------- | ----------- |
| INVALID_CREDENTIALS        | 用户名或密码错误 | 401         |
| INVALID_TOKEN              | 令牌无效         | 401         |
| TOKEN_EXPIRED              | 令牌过期         | 401         |
| USER_NOT_FOUND             | 用户不存在       | 404         |
| TENANT_NOT_FOUND           | 租户不存在       | 404         |
| ROLE_NOT_FOUND             | 角色不存在       | 404         |
| PERMISSION_NOT_FOUND       | 权限不存在       | 404         |
| EMAIL_ALREADY_EXISTS       | 邮箱已存在       | 409         |
| TENANT_SLUG_ALREADY_EXISTS | 租户标识已存在   | 409         |
| WEAK_PASSWORD              | 密码强度不足     | 400         |
| INVALID_PARAMETER          | 请求参数无效     | 400         |

### 错误响应示例

```json
{
	"success": false,
	"error": {
		"code": "INVALID_CREDENTIALS",
		"message": "用户名或密码错误",
		"details": {
			"field": "email"
		}
	}
}
```

---

## 版本信息

-   **文档版本：** 1.0.0
-   **最后更新：** 2026-02-04
-   **维护者：** OKSAI 平台团队
