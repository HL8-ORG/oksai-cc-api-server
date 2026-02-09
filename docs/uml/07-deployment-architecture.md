# OKSAI Platform - 部署架构图

## 生产环境部署架构

```plantuml
@startuml
skinparam nodeBackgroundColor #F5F5F5
skinparam databaseBackgroundColor #E8F5E9

' === 客户端层 ===
node "Web 应用" as web <<Frontend>>
node "移动应用" as mobile <<Mobile>>

' === 负载均衡层 ===
node "Nginx Ingress" as nginx <<Load Balancer>>

' === 应用层 ===
package "应用层（3 实例）" {
    node "base-api (Instance 1)" as app1 <<App>> {
        component [AuthModule] as auth1
        component [TenantModule] as tenant1
        component [UserModule] as user1
    }
    node "base-api (Instance 2)" as app2 <<App>> {
        component [AuthModule] as auth2
        component [TenantModule] as tenant2
        component [UserModule] as user2
    }
    node "base-api (Instance 3)" as app3 <<App>> {
        component [AuthModule] as auth3
        component [TenantModule] as tenant3
        component [UserModule] as user3
    }
}

' === 数据层 ===
package "数据层" {
    database "PostgreSQL (Primary)" as pg {
        component [Tenant Database] as pgTenant
        component [User Database] as pgUser
        component [Role Database] as pgRole
    }
    database "Redis Cluster" as redis {
        component [Redis Master] as redisMaster
        component [Redis Slave 1] as redisSlave1
        component [Redis Slave 2] as redisSlave2
    }
    database "OpenSearch Cluster" as opensearch {
        component [Node 1] as os1
        component [Node 2] as os2
        component [Node 3] as os3
    }
}

' === 分析层 ===
package "分析层" {
    node "Jitsu Analytics" as jitsu <<Analytics>>
    node "Cube OLAP" as cube <<OLAP>>
}

' === 存储层 ===
package "存储层" {
    storage "MinIO Gateway" as minio <<Storage>> {
        component [MinIO Server 1] as minio1
        component [MinIO Server 2] as minio2
    }
}

' === 监控层 ===
package "监控层" {
    node "Prometheus Server" as prometheus <<Monitoring>>
    node "Grafana Dashboard" as grafana <<Dashboard>>
}

' === 外部服务 ===
cloud "外部服务" {
    node "SMTP Server" as smtp <<Email>>
    node "CDN Service" as cdn <<CDN>>
}

' === 关系 ===
web --> nginx : HTTPS
mobile --> nginx : HTTPS

nginx --> app1 : 负载均衡
nginx --> app2 : 负载均衡
nginx --> app3 : 负载均衡

app1 --> pg : 数据访问
app2 --> pg : 数据访问
app3 --> pg : 数据访问

app1 --> redis : 缓存/会话
app2 --> redis : 缓存/会话
app3 --> redis : 缓存/会话

app1 --> opensearch : 日志搜索
app2 --> opensearch : 日志搜索
app3 --> opensearch : 日志搜索

app1 --> jitsu : 事件追踪
app2 --> jitsu : 事件追踪
app3 --> jitsu : 事件追踪

app1 --> cube : 数据分析
app2 --> cube : 数据分析
app3 --> cube : 数据分析

app1 --> minio : 文件存储
app2 --> minio : 文件存储
app3 --> minio : 文件存储

app1 --> smtp : 邮件发送
app2 --> smtp : 邮件发送
app3 --> smtp : 邮件发送

app1 --> prometheus : 指标暴露
app2 --> prometheus : 指标暴露
app3 --> prometheus : 指标暴露

prometheus --> grafana : 监控数据
minio --> cdn : 静态资源分发

note right of app1
  应用实例：
  - NestJS + Node.js
  - PM2 进程管理
  - 3 个实例（高可用）
  - 共享数据层
end note

note right of pg
  数据库配置：
  - PostgreSQL 14+
  - 主从复制（读写分离）
  - 连接池管理
  - 定期备份
end note

note right of redis
  缓存配置：
  - Redis 6+
  - 主从架构
  - Sentinel 哨兵
  - 数据持久化
end note

@enduml
```

## Docker 编排

```plantuml
@startuml
skinparam nodeBackgroundColor #F5F5F5

node "Docker Compose" as compose {
    package "应用网络 (App Network)" as appNet {
        node "Nginx" as nginx <<1 replica>>
        node "base-api" as api <<3 replicas>>
    }

    package "数据网络 (Database Network)" as dbNet {
        database "PostgreSQL" as pg <<1 primary + 2 replicas>>
        database "Redis" as redis <<1 master + 2 slaves>>
        database "OpenSearch" as os <<3 nodes>>
    }

    package "分析网络 (Analytics Network)" as analyticsNet {
        node "Jitsu" as jitsu <<1 instance>>
        node "Cube" as cube <<1 instance>>
    }

    package "存储网络 (Storage Network)" as storageNet {
        storage "MinIO" as minio <<4 servers>>
    }

    package "监控网络 (Monitoring Network)" as monNet {
        node "Prometheus" as prometheus <<1 instance>>
        node "Grafana" as grafana <<1 instance>>
    }
}

node "Docker Swarm" as swarm

' === 网络连接关系 ===
nginx --> api : 反向代理
api --> pg : 数据访问
api --> redis : 缓存/会话
api --> os : 日志搜索
api --> jitsu : 事件追踪
api --> cube : 数据分析
api --> minio : 文件存储
api --> prometheus : 指标暴露
prometheus --> grafana : 监控数据

' === Swarm 编排 ===
swarm --> api : 部署 (replicated)
swarm --> pg : 部署 (replicated)
swarm --> nginx : 部署 (global)
swarm --> prometheus : 部署 (global)

note bottom of compose
  服务容器：
  **应用服务**: base-api × 3, Nginx × 1
  **数据服务**: PostgreSQL (1+2), Redis (1+2), OpenSearch × 3
  **分析服务**: Jitsu × 1, Cube × 1
  **存储服务**: MinIO × 4
  **监控服务**: Prometheus × 1, Grafana × 1
end note

note bottom of swarm
  Docker Swarm 配置：
  **服务模式**: Replicated (base-api, PostgreSQL) / Global (Nginx, Prometheus)
  **网络**: Overlay (服务间通信) + Internal (数据库访问)
  **存储**: Volume mounts (数据持久化)
  **健康检查**: HTTP (base-api) / TCP (PostgreSQL, Redis) / CMD (OpenSearch)
end note

@enduml
```

## CI/CD 流程

```plantuml
@startuml
actor "开发者" as dev
participant "Git Repository" as git
participant "CI/CD Platform" as cicd
participant "Docker Registry" as registry
participant "Docker Swarm" as swarm
participant "Load Balancer" as lb
participant "Monitoring" as monitoring

note right of cicd
  CI/CD 流程：
  1. 代码提交到 Git
  2. 自动触发构建
  3. 运行测试
  4. 构建镜像
  5. 推送到镜像仓库
  6. 部署到 Swarm
  7. 更新负载均衡
  8. 监控部署状态
end note

dev -> git: git push
activate git
git --> cicd: push notification
deactivate git

cicd -> cicd: git clone
activate cicd
cicd --> cicd: repository cloned
deactivate cicd

cicd -> cicd: npm ci
activate cicd
cicd --> cicd: dependencies installed
deactivate cicd

cicd -> cicd: npm run lint
activate cicd
cicd --> cicd: lint passed
deactivate cicd

cicd -> cicd: npm run typecheck
activate cicd
cicd --> cicd: types passed
deactivate cicd

cicd -> cicd: npm test
activate cicd
cicd --> cicd: tests passed
deactivate cicd

cicd -> cicd: docker build
activate cicd
cicd --> cicd: image built
deactivate cicd

cicd -> cicd: docker tag
activate cicd
cicd --> cicd: image tagged
deactivate cicd

cicd -> registry: docker push
activate registry
registry --> cicd: image pushed
deactivate registry
deactivate cicd

alt 部署到生产环境
    cicd -> swarm: docker service update
    activate swarm
    swarm --> cicd: service updated
    deactivate swarm

    cicd -> lb: update backend
    activate lb
    lb --> cicd: traffic routed
    deactivate lb

    cicd -> monitoring: notify deployment
    activate monitoring
    monitoring --> cicd: metrics collected
    deactivate monitoring
else 部署失败
    cicd -> cicd: rollback
    cicd --> cicd: previous version deployed
    cicd -> monitoring: alert deployment failure
end

@enduml
```

## 监控体系

```plantuml
@startuml

package "监控数据采集" {
    component [MetricsService] as metrics <<Service>>
    component [ErrorTrackingService] as errorTracking <<Service>>
    component [RequestTracingService] as requestTracing <<Service>>
    component [PrometheusController] as promController <<Controller>>
}

package "应用层" {
    component [AuthModule] as authMod <<Module>>
    component [TenantModule] as tenantMod <<Module>>
    component [UserModule] as userMod <<Module>>
    component [BusinessModules] as bizMod <<Module>>
}

package "监控存储" {
    database [PrometheusTSDB] as tsdb <<Database>>
}

package "可视化层" {
    component [Grafana] as grafana <<Dashboard>>
    component [AlertManager] as alertMgr <<Alerting>>
}

metrics --> authMod : 收集指标
metrics --> tenantMod : 收集指标
metrics --> userMod : 收集指标
metrics --> bizMod : 收集指标

errorTracking --> authMod : 追踪错误
errorTracking --> tenantMod : 追踪错误
errorTracking --> userMod : 追踪错误
errorTracking --> bizMod : 追踪错误

requestTracing --> authMod : 追踪请求
requestTracing --> tenantMod : 追踪请求
requestTracing --> userMod : 追踪请求
requestTracing --> bizMod : 追踪请求

promController --> metrics : 拉取指标
promController --> errorTracking : 拉取错误
promController --> requestTracing : 拉取追踪

promController --> tsdb : 存储时间序列数据
tsdb --> grafana : 提供数据
tsdb --> alertMgr : 触发告警

note right of metrics
  指标收集内容：

  **请求指标**:
  - QPS (Queries Per Second)
  - 响应时间 (P50, P95, P99)
  - 错误率
  - 并发连接数

  **业务指标**:
  - 活跃租户数
  - 活跃用户数
  - API 调用次数

  **系统指标**:
  - CPU 使用率
  - 内存使用率
  - 磁盘 I/O
  - 网络流量
end note

note right of errorTracking
  错误追踪内容：

  **错误分类**:
  - 按错误类型分组
  - 按错误路径分组
  - 按用户分组

  **错误统计**:
  - 错误总数
  - 错误趋势
  - 错误分布
end note

note right of alertMgr
  告警规则：

  **应用告警**:
  - 错误率 > 5%
  - 响应时间 P95 > 1s
  - 活跃实例数 < 3

  **系统告警**:
  - CPU > 80%
  - 内存 > 85%
  - 磁盘 > 90%
  - 数据库连接 > 80%

  **告警渠道**:
  - 邮件通知
  - Slack 集成
  - 钉钉机器人
  - SMS 短信
end note

@enduml
```

## 部署配置说明

### 环境配置

| 环境           | 实例数 | 副本 | 请求量     | SLA   |
| -------------- | ------ | ---- | ---------- | ----- |
| **开发环境**   | 1      | 1    | ~100/s     | 99%   |
| **测试环境**   | 2      | 1    | ~1,000/s   | 99%   |
| **预生产环境** | 3      | 2    | ~10,000/s  | 99.5% |
| **生产环境**   | 3+     | 3+   | ~100,000/s | 99.9% |

### 容器资源配置

| 服务           | CPU     | 内存 | 存储  | 说明        |
| -------------- | ------- | ---- | ----- | ----------- |
| **base-api**   | 2 cores | 4GB  | 20GB  | 每个实例    |
| **PostgreSQL** | 4 cores | 8GB  | 100GB | 主节点      |
| **Redis**      | 1 core  | 2GB  | 5GB   | Master 节点 |
| **OpenSearch** | 4 cores | 8GB  | 50GB  | 每个节点    |
| **MinIO**      | 2 cores | 4GB  | 500GB | 每个服务器  |
| **Prometheus** | 2 cores | 4GB  | 50GB  | 监控数据    |
| **Grafana**    | 1 core  | 2GB  | 20GB  | 仪表板      |

### 安全措施

1. **网络安全**:

    - TLS/SSL 加密通信
    - VPN 内网隔离
    - 防火墙规则

2. **容器安全**:

    - 容器镜像扫描
    - 最小化基础镜像
    - 非 root 用户运行

3. **数据安全**:

    - 数据库连接加密
    - 密钥管理服务
    - 定期备份和加密

4. **访问控制**:

    - RBAC 权限管理
    - API 访问限流
    - 请求签名验证

5. **应急响应**:
    - 自动故障转移
    - 备份快速恢复
    - 灾难恢复计划
