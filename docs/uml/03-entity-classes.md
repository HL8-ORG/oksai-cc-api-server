# OKSAI Platform - 核心实体类图

## 实体关系图

```plantuml
@startuml
hide empty members

class "BaseEntity" {
  - id: string
  - createdAt: Date
  - updatedAt: Date
  -- BaseEntity 方法 --
  + beforeUpdate(): void
  + beforeCreate(): void
}

class "TenantAwareEntity" {
  - tenantId: string
  -- 继承 BaseEntity --
}

class "User" {
  - email: string
  - password: string
  - firstName: string
  - lastName: string
  - role: UserRole
  - isActive: boolean
  - emailVerifiedAt: Date
  - resetToken: string
  - resetTokenExpiresAt: Date
  -- 继承 BaseEntity --
}

class "Tenant" {
  - name: string
  - slug: string
  - status: TenantStatus
  - type: TenantType
  - maxUsers: number
  - allowSelfRegistration: boolean
  - subscriptionPlan: string
  - locale: string
  - timezone: string
  -- 继承 BaseEntity --
}

class "Role" {
  - name: string
  - slug: string
  - description: string
  - type: RoleType
  - isEnabled: boolean
  - tenantId: string
  -- 继承 BaseEntity --
  + permissions: Collection<Permission>
}

class "Permission" {
  - name: string
  - type: PermissionType
  - action: PermissionAction
  - resource: string
  - description: string
  - tenantId: string
  - isEnabled: boolean
  -- 继承 BaseEntity --
}

class "Organization" {
  - name: string
  - slug: string
  - description: string
  - tenantId: string
  - isEnabled: boolean
  -- 继承 TenantAwareEntity --
}

class "AuditLog" {
  - entityType: AuditLogEntityType
  - action: AuditLogAction
  - entityId: string
  - entityName: string
  - userId: string
  - tenantId: string
  - description: string
  - logLevel: string
  - metadata: Record<string, any>
  -- 继承 TenantAwareEntity --
}

class "AnalyticsEvent" {
  - event: string
  - properties: Record<string, any>
  - userId: string
  - tenantId: string
  - sessionId: string
  - timestamp: Date
  -- 继承 TenantAwareEntity --
}

class "AnalyticsMetric" {
  - metric: string
  - value: number
  - labels: Record<string, string>
  - userId: string
  - tenantId: string
  - timestamp: Date
  -- 继承 TenantAwareEntity --
}

class "Invite" {
  - email: string
  - token: string
  - expiresAt: Date
  - acceptedAt: Date
  - role: UserRole
  - tenantId: string
  -- 继承 BaseEntity --
}

enum "UserRole" {
  SUPER_ADMIN
  ADMIN
  MANAGER
  USER
}

enum "TenantStatus" {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum "TenantType" {
  ORGANIZATION
  INDIVIDUAL
}

enum "RoleType" {
  SYSTEM
  CUSTOM
}

enum "PermissionType" {
  ORGANIZATION
  USER
  ROLE
  PERMISSION
}

enum "PermissionAction" {
  VIEW
  CREATE
  EDIT
  DELETE
  ASSIGN
  REVOKE
}

enum "AuditLogEntityType" {
  USER
  TENANT
  ORGANIZATION
  ROLE
  PERMISSION
}

enum "AuditLogAction" {
  CREATE
  UPDATE
  DELETE
  VIEW
  LOGIN
  LOGOUT
}

"TenantAwareEntity" --|> "BaseEntity" : 继承
"User" --|> "BaseEntity" : 继承
"Tenant" --|> "BaseEntity" : 继承
"Role" --|> "BaseEntity" : 继承
"Permission" --|> "BaseEntity" : 继承
"Organization" --|> "TenantAwareEntity" : 继承
"AuditLog" --|> "TenantAwareEntity" : 继承
"AnalyticsEvent" --|> "TenantAwareEntity" : 继承
"AnalyticsMetric" --|> "TenantAwareEntity" : 继承
"Invite" --|> "BaseEntity" : 继承

"User" --> "Tenant" : belongsTo
"Role" --> "Tenant" : belongsTo
"Permission" --> "Tenant" : belongsTo
"Organization" --> "Tenant" : belongsTo
"Invite" --> "Tenant" : belongsTo

"User" --> "Role" : hasMany
"Role" "1" -- "*" "Permission" : contains

"User" --> "Organization" : belongsTo
"User" --> "Invite" : generates

"AuditLog" --> "User" : createdBy
"AnalyticsEvent" --> "User" : trackedBy
"AnalyticsMetric" --> "User" : measuredBy

note right of Tenant
  租户实体：
  - 租户隔离的核心
  - 支持组织和个人类型
  - 可激活/暂停
end note

note right of Role
  角色实体：
  - 支持系统角色和自定义角色
  - 可包含多个权限
  - 按租户隔离
end note

note right of Permission
  权限实体：
  - 细粒度访问控制
  - 支持多种权限类型
  - 支持多种操作类型
end note

@enduml
```

## 实体说明

### 核心实体

#### BaseEntity

-   **作用**: 所有实体的基类
-   **字段**:
    -   `id`: 主键（UUID）
    -   `createdAt`: 创建时间
    -   `updatedAt`: 更新时间

#### TenantAwareEntity

-   **作用**: 租户感知实体的基类
-   **字段**:
    -   `tenantId`: 租户 ID，用于多租户隔离

### 业务实体

#### User（用户）

-   **作用**: 系统用户
-   **关系**:
    -   属于一个租户（Tenant）
    -   拥有多个角色（Role）
    -   属于一个或多个组织（Organization）

#### Tenant（租户）

-   **作用**: 多租户隔离的核心
-   **状态**: ACTIVE, INACTIVE, SUSPENDED
-   **类型**: ORGANIZATION, INDIVIDUAL

#### Role（角色）

-   **作用**: 角色管理
-   **类型**: SYSTEM（系统角色）, CUSTOM（自定义角色）
-   **关系**:
    -   属于一个租户（Tenant）
    -   包含多个权限（Permission）

#### Permission（权限）

-   **作用**: 细粒度访问控制
-   **类型**: ORGANIZATION, USER, ROLE, PERMISSION
-   **操作**: VIEW, CREATE, EDIT, DELETE, ASSIGN, REVOKE

#### Organization（组织）

-   **作用**: 组织管理
-   **继承**: TenantAwareEntity（租户感知）

#### AuditLog（审计日志）

-   **作用**: 操作审计跟踪
-   **继承**: TenantAwareEntity（租户感知）
-   **实体类型**: USER, TENANT, ORGANIZATION, ROLE, PERMISSION
-   **操作类型**: CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT

#### AnalyticsEvent（分析事件）

-   **作用**: 事件追踪
-   **继承**: TenantAwareEntity（租户感知）

#### AnalyticsMetric（分析指标）

-   **作用**: 指标统计
-   **继承**: TenantAwareEntity（租户感知）

#### Invite（邀请）

-   **作用**: 用户邀请
-   **关系**:
    -   由用户（User）生成
    -   属于租户（Tenant）

## 实体设计原则

1. **继承关系**:

    - 所有实体继承自 BaseEntity
    - 租户相关实体继承自 TenantAwareEntity

2. **关系类型**:

    - 一对多：1:\*（用户到组织）
    - 多对多：_:_（角色到权限）

3. **租户隔离**:

    - 所有业务实体都包含 tenantId
    - 通过 TenantAwareEntity 强制租户感知

4. **类型安全**:

    - 使用枚举定义状态和类型
    - 避免 magic numbers

5. **审计友好**:
    - 所有实体都继承审计字段
    - 支持操作追踪
