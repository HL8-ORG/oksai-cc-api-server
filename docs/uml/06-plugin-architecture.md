# OKSAI Platform - 插件系统架构图

## 插件系统架构

```plantuml
@startuml
!define RECTANGLE class

package "插件系统核心" {
    [PluginRegistryService] <<Service>>
    [PluginLoaderService] <<Service>>
    [IPlugin] <<Interface>>
    [IPluginMetadata] <<Interface>>
    [ILifecycleHooks] <<Interface>>
}

package "插件类型" {
    [IModulePlugin] <<Interface>>
    [IObjectPlugin] <<Interface>>
    [IPluginState] <<Interface>>
}

package "系统插件" {
    [AuthPlugin] <<Plugin>>
    [TenantPlugin] <<Plugin>>
    [UserPlugin] <<Plugin>>
    [AuditPlugin] <<Plugin>>
    [OrganizationPlugin] <<Plugin>>
    [RolePlugin] <<Plugin>>
}

package "功能插件" {
    [AnalyticsPlugin] <<Plugin>>
    [ReportingPlugin] <<Plugin>>
    [IntegrationPlugin] <<Plugin>>
}

package "插件生命周期" {
    [onApplicationBootstrap] <<Hook>>
    [onApplicationShutdown] <<Hook>>
    [initialize] <<Hook>>
    [destroy] <<Hook>>
}

enum "PluginType" {
    SYSTEM
    FEATURE
}

enum "PluginStatus" {
    UNLOADED
    LOADED
    INITIALIZED
    DISABLED
    FAILED
}

[IPlugin] <|.. [IModulePlugin]
[IPlugin] <|.. [IObjectPlugin]
[IPlugin] --> [IPluginMetadata] : has
[IPlugin] --> [ILifecycleHooks] : implements
[IPlugin] --> [PluginType] : uses
[IPlugin] --> [PluginStatus] : has

[PluginRegistryService] o-- [IPlugin] : manages
[PluginRegistryService] --> [IPluginState] : tracks
[PluginLoaderService] --> [PluginRegistryService] : uses
[PluginLoaderService] --> [IPlugin] : loads/unloads

[IPlugin] --> [onApplicationBootstrap] : implements
[IPlugin] --> [onApplicationShutdown] : implements
[Plugin] --> [initialize] : implements
[Plugin] --> [destroy] : implements

[AuthPlugin] ..|> [IPlugin] : implements
[TenantPlugin] ..|> [IPlugin] : implements
[UserPlugin] ..|> [IPlugin] : implements
[AuditPlugin] ..|> [IPlugin] : implements
[OrganizationPlugin] ..|> [IPlugin] : implements
[RolePlugin] ..|> [IPlugin] : implements

[AnalyticsPlugin] ..|> [IPlugin] : implements
[ReportingPlugin] ..|> [IPlugin] : implements
[IntegrationPlugin] ..|> [IPlugin] : implements

note right of PluginRegistryService
  插件注册表：
  - 管理所有已注册的插件
  - 维护插件状态
  - 提供插件查询接口
  - 支持依赖管理
end note

note right of PluginLoaderService
  插件加载器：
  - 加载和初始化插件
  - 支持热拔插（启用/禁用）
  - 管理插件生命周期
  - 处理插件依赖
end note

note top of IPlugin
  插件接口定义：
  - 继承 ILifecycleHooks
  - 实现 IModulePlugin 或 IObjectPlugin
  - 包含 IPluginMetadata 元数据
end note

@enduml
```

## 插件加载流程

```plantuml
@startuml
participant "App Bootstrap" as app
participant "PluginLoaderService" as loader
participant "PluginRegistryService" as registry
participant "IPlugin" as plugin
participant "EntityManager" as em
database "PostgreSQL" as db

note right of loader
  插件配置示例：
  {
    systemPlugins: ["auth", "tenant", "user"],
    featurePlugins: {
      "analytics": { enabled: true, config: {...} },
      "reporting": { enabled: false }
    }
  }
end note

app -> loader: loadPlugins(config)
activate loader

loader -> registry: getAll()
activate registry
registry --> loader: IPlugin[]
deactivate registry

loop 加载系统插件
    loader -> plugin: load(systemPlugin)
    activate plugin
    plugin -> plugin: initialize()
    activate plugin
    plugin --> plugin: OK
    deactivate plugin

    plugin -> plugin: onApplicationBootstrap(moduleRef)
    activate plugin
    plugin --> plugin: OK
    deactivate plugin

    loader -> registry: updateStatus(plugin.name, INITIALIZED)
    activate registry
    registry --> loader: OK
    deactivate registry

    loader -> em: persist(pluginState)
    activate em
    em --> db: INSERT INTO plugin_states
    db --> em: OK
    deactivate em
    loader --> loader: 系统插件加载成功
end

loop 加载功能插件
    loader -> plugin: load(featurePlugin, config)
    activate plugin
    alt 插件已启用
        plugin -> plugin: initialize(config)
        activate plugin
        plugin --> plugin: OK
        deactivate plugin

        plugin -> plugin: onApplicationBootstrap(moduleRef)
        activate plugin
        plugin --> plugin: OK
        deactivate plugin

        loader -> registry: updateStatus(plugin.name, INITIALIZED)
        activate registry
        registry --> loader: OK
        deactivate registry

        loader -> em: persist(pluginState)
        activate em
        em --> db: INSERT INTO plugin_states
        db --> em: OK
        deactivate em
        loader --> loader: 功能插件加载成功
    else 插件已禁用
        loader -> registry: updateStatus(plugin.name, DISABLED)
        activate registry
        registry --> loader: OK
        deactivate registry
        loader --> loader: 功能插件已禁用
    end
    deactivate plugin
end

loader --> app: 插件加载完成
deactivate loader
app --> app: 应用启动
deactivate app

@enduml
```

## 插件热拔插流程

```plantuml
@startuml
actor "管理员" as admin
participant "PluginController" as controller
participant "PluginLoaderService" as loader
participant "PluginRegistryService" as registry
participant "IPlugin" as plugin

note right of loader
  热拔插能力：
  1. 启用插件：无需重启应用
  2. 禁用插件：动态卸载
  3. 支持依赖检查
  4. 支持冲突检测
end note

alt 启用插件
    admin -> controller: POST /api/plugins/:name/enable
    activate controller
    controller -> loader: enablePlugin(name, config)
    activate loader

    loader -> registry: get(name)
    activate registry
    registry --> loader: IPlugin
    deactivate registry

    loader -> registry: getStatus(name)
    activate registry
    registry --> loader: DISABLED
    deactivate registry

    loader -> plugin: initialize(config)
    activate plugin
    plugin --> plugin: OK
    deactivate plugin

    loader -> plugin: onApplicationBootstrap(moduleRef)
    activate plugin
    plugin --> plugin: OK
    deactivate plugin

    loader -> registry: updateStatus(name, INITIALIZED)
    activate registry
    registry --> loader: OK
    deactivate registry

    loader --> controller: OK
    deactivate loader
    controller --> admin: 插件已启用
    deactivate controller
else 禁用插件
    admin -> controller: POST /api/plugins/:name/disable
    activate controller
    controller -> loader: disablePlugin(name)
    activate loader

    loader -> registry: get(name)
    activate registry
    registry --> loader: IPlugin
    deactivate registry

    loader -> registry: getStatus(name)
    activate registry
    registry --> loader: INITIALIZED
    deactivate registry

    alt 插件支持禁用
        loader -> plugin: destroy()
        activate plugin
        plugin --> plugin: OK
        deactivate plugin

        loader -> registry: updateStatus(name, DISABLED)
        activate registry
        registry --> loader: OK
        deactivate registry
    else 插件受保护（系统插件）
        loader --> controller: throw Error("系统插件不能被禁用")
        deactivate loader
    end
    deactivate plugin
    loader --> controller: OK
    deactivate loader
    controller --> admin: 插件已禁用
    deactivate controller
end

@enduml
```

## 插件依赖管理

```plantuml
@startuml
participant "PluginLoaderService" as loader
participant "PluginRegistryService" as registry
participant "IPlugin" as plugin

note right of loader
  依赖管理功能：
  1. 自动检测依赖冲突
  2. 循环依赖检测
  3. 依赖版本检查
  4. 依赖加载顺序
end note

loader -> loader: checkConflicts()
activate loader

loader -> registry: getAll()
activate registry
registry --> loader: allPlugins[]
deactivate registry

loop 检查每个插件
    loader -> plugin: dependencies
    activate plugin
    plugin --> loader: dependencyNames[]
    deactivate plugin

    alt 依赖列表为空
        loader -> loader: 无冲突
    else 存在依赖
        loader -> registry: get(dependencyName)
        activate registry
        alt 依赖存在
            registry --> loader: dependentPlugin
            deactivate registry
            loader -> loader: 依赖满足
        else 依赖不存在
            loader -> loader: 记录缺失依赖
            deactivate loader
        end
        deactivate registry
    end
    deactivate plugin
end

loader -> loader: checkCircularDependencies()
activate loader

loader -> loader: DFS 遍历依赖图
activate loader
alt 发现循环
    loader -> loader: 抛出循环依赖错误
    deactivate loader
else 无循环
    loader -> loader: 依赖图合法
    deactivate loader
end

deactivate loader
loader --> loader: 返回冲突列表
deactivate loader

@enduml
```

## 插件元数据

```plantuml
@startuml
class "IPluginMetadata" {
  - name: string
  - displayName: string
  - version: string
  - description: string
  - author: AuthorInfo
  - type: PluginType
  - priority: PluginPriority
  - category: string
  - icon: string
  - screenshots: string[]
  - main: string
  - module: string
  - configSchema: any
  - defaultConfig: Record<string, any>
  - dependencies: string[]
  - api: ApiEndpoint[]
  - entities: string[]
  - subscribers: string[]
  - isProtected: boolean
  - isConfigurable: boolean
  - installable: boolean
  - uninstallable: boolean
  - updatable: boolean
  - minVersion: string
  - maxVersion: string
  - license: LicenseInfo
  - homepage: string
  - documentation: string
  - issues: string
  - downloadUrl: string
  - checksum: string
  - createdAt: string
  - updatedAt: string
}

class "AuthorInfo" {
  - name: string
  - email: string
  - url: string
}

class "ApiEndpoint" {
  - path: string
  - method: string
  - description: string
}

class "LicenseInfo" {
  - type: string
  - url: string
}

enum "PluginType" {
  SYSTEM
  FEATURE
}

enum "PluginPriority" {
  P0
  P1
  P2
  P3
}

"IPluginMetadata" --> "AuthorInfo" : 包含
"IPluginMetadata" --> "ApiEndpoint" : 包含
"IPluginMetadata" --> "PluginType" : 使用
"IPluginMetadata" --> "PluginPriority" : 使用
"IPluginMetadata" --> "LicenseInfo" : 包含

note right of IPluginMetadata
  插件元数据字段说明：

  **基本信息**:
  - name: 插件唯一标识
  - displayName: 插件显示名称
  - version: 遵循 Semantic Versioning

  **分类信息**:
  - type: SYSTEM（系统）或 FEATURE（功能）
  - priority: 系统插件的加载优先级
  - category: 功能插件分类

  **配置信息**:
  - configSchema: 配置结构（JSON Schema）
  - defaultConfig: 默认配置值
  - dependencies: 依赖的其他插件

  **功能特性**:
  - isConfigurable: 是否支持运行时配置
  - installable: 是否支持动态安装
  - uninstallable: 是否支持动态卸载
  - updatable: 是否支持动态更新

  **版本兼容性**:
  - minVersion: 最低兼容版本
  - maxVersion: 最高兼容版本

  **扩展信息**:
  - api: 插件提供的 API 端点
  - entities: 插件包含的数据库实体
  - subscribers: 插件包含的事件订阅者
end note

@enduml
```

## 插件系统特性

### 1. 插件类型

| 类型         | 说明               | 示例                 | 特点                    |
| ------------ | ------------------ | -------------------- | ----------------------- |
| **系统插件** | 系统必需，强制加载 | Auth, Tenant, User   | 不能禁用，优先加载      |
| **功能插件** | 可选功能，动态管理 | Analytics, Reporting | 可启用/禁用，支持热拔插 |

### 2. 插件生命周期

| 阶段     | 钩子方法                       | 说明             |
| -------- | ------------------------------ | ---------------- |
| **注册** | -                              | 插件注册到注册表 |
| **加载** | initialize(config)             | 初始化插件配置   |
| **启动** | onApplicationBootstrap(module) | 应用启动时调用   |
| **运行** | -                              | 插件正常运行     |
| **停止** | destroy()                      | 销毁插件资源     |
| **卸载** | -                              | 从注册表移除     |

### 3. 插件状态

| 状态            | 说明               | 转换条件   |
| --------------- | ------------------ | ---------- |
| **UNLOADED**    | 插件已注册但未加载 | 注册时     |
| **LOADED**      | 插件加载中         | 初始化前   |
| **INITIALIZED** | 插件已初始化       | 初始化成功 |
| **DISABLED**    | 插件已禁用         | 禁用操作   |
| **FAILED**      | 插件加载失败       | 初始化失败 |

### 4. 插件优先级

| 优先级 | 说明       | 加载顺序   | 使用场景     |
| ------ | ---------- | ---------- | ------------ |
| **P0** | 最高优先级 | 最先加载   | 核心系统插件 |
| **P1** | 高优先级   | 第二批加载 | 重要系统插件 |
| **P2** | 中等优先级 | 第三批加载 | 辅助系统插件 |
| **P3** | 低优先级   | 最后加载   | 可选系统插件 |

### 5. 插件管理 API

| 操作         | HTTP 方法 | 路径                         | 权限要求 |
| ------------ | --------- | ---------------------------- | -------- |
| 列出插件     | GET       | /api/plugins                 | 管理员   |
| 获取插件详情 | GET       | /api/plugins/:name           | 管理员   |
| 启用插件     | POST      | /api/plugins/:name/enable    | 管理员   |
| 禁用插件     | POST      | /api/plugins/:name/disable   | 管理员   |
| 重新加载插件 | POST      | /api/plugins/:name/reload    | 管理员   |
| 获取插件配置 | GET       | /api/plugins/:name/config    | 管理员   |
| 更新插件配置 | PUT       | /api/plugins/:name/config    | 管理员   |
| 检查插件冲突 | GET       | /api/plugins/check-conflicts | 管理员   |

### 6. 插件安全特性

1. **隔离性**:

    - 插件运行在独立的上下文中
    - 插件错误不影响主应用

2. **权限控制**:

    - 系统插件受保护，不能被禁用
    - 功能插件可由管理员管理

3. **依赖验证**:

    - 自动检查依赖是否存在
    - 检测循环依赖
    - 版本兼容性检查

4. **沙箱机制**:

    - 插件 API 受权限控制
    - 插件数据库访问受限
    - 插件无法访问其他插件内部

5. **审计追踪**:
    - 记录所有插件操作
    - 追踪插件加载/卸载
    - 监控插件运行状态
