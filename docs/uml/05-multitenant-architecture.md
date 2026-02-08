# OKSAI Platform - 多租户架构图

## 租户隔离架构

```plantuml
@startuml
!define RECTANGLE class

package "租户上下文层" {
    [TenantContext] <<Service>>
    [TenantFilter] <<Middleware>>
    [TenantGuard] <<Guard>>
}

package "业务模块层" {
    [TenantModule] <<Module>>
    [UserModule] <<Module>>
    [RoleModule] <<Module>>
    [OrganizationModule] <<Module>>
    [AuditModule] <<Module>>
    [AnalyticsModule] <<Module>>
}

package "数据访问层" {
    [TenantRepository] <<Repository>>
    [UserRepository] <<Repository>>
    [RoleRepository] <<Repository>>
    [OrganizationRepository] <<Repository>>
    [AuditLogRepository] <<Repository>>
    [AnalyticsEventRepository] <<Repository>>
}

package "数据实体层" {
    [Tenant] <<Entity>>
    [User] <<Entity>>
    [Role] <<Entity>>
    [Permission] <<Entity>>
    [Organization] <<Entity>>
    [AuditLog] <<Entity>>
    [AnalyticsEvent] <<Entity>>
}

package "数据库层" {
    [PostgreSQL] <<Database>>
}

[TenantFilter] --> [TenantContext] : 获取租户
[TenantGuard] --> [TenantContext] : 获取租户

[TenantModule] --> [TenantRepository] : 操作
[UserModule] --> [UserRepository] : 操作
[RoleModule] --> [RoleRepository] : 操作
[OrganizationModule] --> [OrganizationRepository] : 操作
[AuditModule] --> [AuditLogRepository] : 操作
[AnalyticsModule] --> [AnalyticsEventRepository] : 操作

[TenantRepository] --> [Tenant] : 映射
[UserRepository] --> [User] : 映射
[RoleRepository] --> [Role] : 映射
[RoleRepository] --> [Permission] : 映射
[OrganizationRepository] --> [Organization] : 映射
[AuditLogRepository] --> [AuditLog] : 映射
[AnalyticsEventRepository] --> [AnalyticsEvent] : 映射

[Tenant] --> [PostgreSQL] : 存储
[User] --> [PostgreSQL] : 存储
[Role] --> [PostgreSQL] : 存储
[Permission] --> [PostgreSQL] : 存储
[Organization] --> [PostgreSQL] : 存储
[AuditLog] --> [PostgreSQL] : 存储
[AnalyticsEvent] --> [PostgreSQL] : 存储

[User] --> [Tenant] : belongsTo
[Role] --> [Tenant] : belongsTo
[Permission] --> [Tenant] : belongsTo
[Organization] --> [Tenant] : belongsTo
[AuditLog] --> [Tenant] : belongsTo
[AnalyticsEvent] --> [Tenant] : belongsTo

note right of TenantContext
  租户上下文服务：
  - 从请求头或子域名提取租户 ID
  - 提供租户信息给其他模块
  - 支持多种租户识别方式
end note

note right of TenantFilter
  租户中间件：
  - 拦截所有请求
  - 提取租户 ID
  - 设置租户上下文
end note

note right of TenantGuard
  租户守卫：
  - 验证租户有效性
  - 检查租户状态
  - 阻止对无效租户的访问
end note

@enduml
```

## 租户识别方式

```plantuml
@startuml
actor "外部系统" as system
participant "TenantFilter" as filter
participant "TenantContext" as context
participant "TenantService" as service
participant "TenantRepository" as repo
database "PostgreSQL" as db

note right of filter
  租户识别方式：
  1. 子域名（tenant.example.com）
  2. 请求头（X-Tenant-Id）
  3. URL 路径（/api/tenant/:id/...）
end note

alt 子域名方式
    system -> filter: https://tenant1.example.com/api/...
    activate filter
    filter -> filter: 从 Host 头提取 tenant1
    deactivate filter
    filter -> context: setTenantId("tenant1")
    activate context
    deactivate context
else 请求头方式
    system -> filter: https://api.example.com/api/...\nX-Tenant-Id: tenant2
    activate filter
    filter -> filter: 从 X-Tenant-Id 头读取 tenant2
    deactivate filter
    filter -> context: setTenantId("tenant2")
    activate context
    deactivate context
else URL 路径方式
    system -> filter: https://api.example.com/api/tenant/tenant3/...
    activate filter
    filter -> filter: 从 URL 路径提取 tenant3
    deactivate filter
    filter -> context: setTenantId("tenant3")
    activate context
    deactivate context
end

context -> service: getCurrentTenant()
activate service
service -> repo: findBySlug(tenantId)
activate repo
repo --> db: SELECT * FROM tenants WHERE slug = ?
db --> repo: Tenant
deactivate repo
repo --> service: Tenant
deactivate service
service --> context: setTenant(tenant)
activate context
context --> system: 租户信息已设置
deactivate context

@enduml
```

## 租户数据隔离

```plantuml
@startuml
participant "请求" as request
participant "TenantFilter" as filter
participant "TenantContext" as context
participant "MikroORM" as orm
database "PostgreSQL" as db

note right of context
  MikroORM 租户过滤：

  1. 全局过滤器
     所有查询自动添加 tenantId 条件

  2. 仓储层过滤
     Repository.findAll({ tenantId })

  3. 关联查询过滤
     自动关联 TenantAwareEntity
end note

request -> filter: 带租户标识的请求
activate filter
filter -> context: 设置租户 ID
activate context
context -> orm: 设置全局过滤器
activate orm

alt 自动租户过滤
    orm -> db: 查询自动添加 WHERE tenantId = ?
    activate db
    db --> orm: 仅返回当前租户的数据
    deactivate db
else 手动指定租户
    orm -> db: Repository.find({ tenantId: "xxx" })
    activate db
    db --> orm: 返回指定租户的数据
    deactivate db
end

orm --> context: 查询结果（已过滤）
deactivate orm
context --> request: 响应（仅当前租户数据）
deactivate context

@enduml
```

## 租户生命周期

```plantuml
@startuml
state "租户状态" as tenant_state {
    [*] --> 创建中
    创建中 --> 活跃 : 完成初始化
    活跃 --> 已暂停 : 暂停租户
    活跃 --> 已删除 : 删除租户
    已暂停 --> 活跃 : 激活租户
    已暂停 --> 已删除 : 删除暂停租户
}

state "数据状态" as data_state {
    [*] --> 正常
    正常 --> 冻结 : 超过配额
    冻结 --> 归档 : 超过保留期
    归档 --> 删除 : 达到删除条件
}

tenant_state -[hidden]-> data_state

@enduml
```

## 租户配置项

```plantuml
@startuml
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
  - logo: string
  - settings: Record<string, any>
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

enum "SubscriptionPlan" {
  FREE
  BASIC
  PROFESSIONAL
  ENTERPRISE
  CUSTOM
}

"Tenant" --> "TenantStatus" : uses
"Tenant" --> "TenantType" : uses
"Tenant" --> "SubscriptionPlan" : uses

note right of Tenant
  租户配置说明：

  **基本配置**:
  - name: 租户显示名称
  - slug: 唯一标识（用于 URL 或域名）
  - status: 当前状态

  **类型配置**:
  - type: ORGANIZATION（团队）或 INDIVIDUAL（个人）
  - maxUsers: 最大用户数限制

  **访问控制**:
  - allowSelfRegistration: 是否允许自助注册

  **订阅信息**:
  - subscriptionPlan: 订阅计划
  - locale: 默认语言
  - timezone: 默认时区

  **自定义配置**:
  - logo: 租户 Logo
  - settings: JSON 配置（可存储任何自定义设置）
end note

@enduml
```

## 多租户架构特性

### 1. 数据隔离

| 隔离级别         | 说明             | 实现                        |
| ---------------- | ---------------- | --------------------------- |
| **数据库级隔离** | 租户数据物理隔离 | 所有实体包含 tenantId       |
| **查询级隔离**   | 自动过滤查询     | MikroORM 全局过滤器         |
| **应用级隔离**   | 请求上下文隔离   | TenantContext + TenantGuard |

### 2. 租户识别

| 方式         | 使用场景       | 优先级 |
| ------------ | -------------- | ------ |
| **子域名**   | 公网部署       | 高     |
| **请求头**   | 内网或代理部署 | 中     |
| **URL 路径** | 测试或混合部署 | 低     |

### 3. 租户管理

| 操作      | API 端点                       | 权限要求               |
| --------- | ------------------------------ | ---------------------- |
| 创建租户  | POST /api/tenant               | 超级管理员             |
| 查询租户  | GET /api/tenant/:id            | 租户管理员或超级管理员 |
| 更新租户  | PUT /api/tenant/:id            | 租户管理员             |
| 激活/暂停 | PATCH /api/tenant/:id/activate | 租户管理员             |
| 删除租户  | DELETE /api/tenant/:id         | 超级管理员             |

### 4. 租户监控

| 监控项         | 说明                  | 告警条件    |
| -------------- | --------------------- | ----------- |
| **租户用户数** | 当前用户数 / maxUsers | >= 90%      |
| **租户存储**   | 租户数据大小          | >= 配额限制 |
| **租户请求**   | QPS / 限流阈值        | >= 90%      |
| **租户状态**   | 活跃 / 暂停 / 错误    | 状态异常    |

### 5. 安全措施

1. **租户隔离验证**:

    - 所有查询自动添加 tenantId 过滤条件
    - 防止跨租户数据访问

2. **租户访问控制**:

    - TenantGuard 验证请求的租户有效性
    - 检查租户状态（ACTIVE/INACTIVE/SUSPENDED）

3. **数据加密**:

    - 敏感数据按租户加密存储
    - 使用租户特定的加密密钥（可选）

4. **审计日志**:
    - 记录所有跨租户访问尝试
    - 租户管理员操作审计
