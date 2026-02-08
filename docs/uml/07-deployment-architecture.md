# OKSAI Platform - 部署架构图

## 生产环境部署架构

```plantuml
@startuml
!define RECTANGLE class

package "客户端层" {
    [Web 应用] <<Frontend>>
    [移动应用] <<Mobile>>
}

package "负载均衡层" {
    [Nginx Ingress] <<Load Balancer>>
}

package "应用层" {
    [base-api\n(Instance 1)] <<App>> {
        [AuthModule]
        [TenantModule]
        [UserModule]
    }
    [base-api\n(Instance 2)] <<App>> {
        [AuthModule]
        [TenantModule]
        [UserModule]
    }
    [base-api\n(Instance 3)] <<App>> {
        [AuthModule]
        [TenantModule]
        [UserModule]
    }
}

package "数据层" {
    [PostgreSQL\n(Primary)] <<Database>> {
        [Tenant Database]
        [User Database]
        [Role Database]
    }
    [Redis Cluster] <<Cache>> {
        [Redis Master]
        [Redis Slave 1]
        [Redis Slave 2]
    }
    [OpenSearch Cluster] <<Search>> {
        [OpenSearch Node 1]
        [OpenSearch Node 2]
        [OpenSearch Node 3]
    }
}

package "分析层" {
    [Jitsu Analytics] <<Analytics>>
    [Cube OLAP] <<OLAP>>
}

package "存储层" {
    [MinIO Gateway] <<Storage>> {
        [MinIO Server 1]
        [MinIO Server 2]
    }
}

package "监控层" {
    [Prometheus Server] <<Monitoring>>
    [Grafana Dashboard] <<Dashboard>>
}

package "外部服务" {
    [SMTP Server] <<Email>>
    [CDN Service] <<CDN>>
}

[Web 应用] --> [Nginx Ingress] : HTTPS
[移动应用] --> [Nginx Ingress] : HTTPS

[Nginx Ingress] --> [base-api\n(Instance 1)] : 负载均衡
[Nginx Ingress] --> [base-api\n(Instance 2)] : 负载均衡
[Nginx Ingress] --> [base-api\n(Instance 3)] : 负载均衡

[base-api\n(Instance 1)] --> [PostgreSQL\n(Primary)] : 数据访问
[base-api\n(Instance 2)] --> [PostgreSQL\n(Primary)] : 数据访问
[base-api\n(Instance 3)] --> [PostgreSQL\n(Primary)] : 数据访问

[base-api\n(Instance 1)] --> [Redis Cluster] : 缓存/会话
[base-api\n(Instance 2)] --> [Redis Cluster] : 缓存/会话
[base-api\n(Instance 3)] --> [Redis Cluster] : 缓存/会话

[base-api\n(Instance 1)] --> [OpenSearch Cluster] : 日志搜索
[base-api\n(Instance 2)] --> [OpenSearch Cluster] : 日志搜索
[base-api\n(Instance 3)] --> [OpenSearch Cluster] : 日志搜索

[base-api\n(Instance 1)] --> [Jitsu Analytics] : 事件追踪
[base-api\n(Instance 2)] --> [Jitsu Analytics] : 事件追踪
[base-api\n(Instance 3)] --> [Jitsu Analytics] : 事件追踪

[base-api\n(Instance 1)] --> [Cube OLAP] : 数据分析
[base-api\n(Instance 2)] --> [Cube OLAP] : 数据分析
[base-api\n(Instance 3)] --> [Cube OLAP] : 数据分析

[base-api\n(Instance 1)] --> [MinIO Gateway] : 文件存储
[base-api\n(Instance 2)] --> [MinIO Gateway] : 文件存储
[base-api\n(Instance 3)] --> [MinIO Gateway] : 文件存储

[base-api\n(Instance 1)] --> [SMTP Server] : 邮件发送
[base-api\n(Instance 2)] --> [SMTP Server] : 邮件发送
[base-api\n(Instance 3)] --> [SMTP Server] : 邮件发送

[base-api\n(Instance 1)] --> [Prometheus Server] : 指标暴露
[base-api\n(Instance 2)] --> [Prometheus Server] : 指标暴露
[base-api\n(Instance 3)] --> [Prometheus Server] : 指标暴露

[Prometheus Server] --> [Grafana Dashboard] : 监控数据

[MinIO Gateway] --> [CDN Service] : 静态资源分发

note right of base-api\n(Instance 1)
  应用实例：
  - NestJS + Node.js
  - PM2 进程管理
  - 3 个实例（高可用）
  - 共享数据层
end note

note right of PostgreSQL\n(Primary)
  数据库配置：
  - PostgreSQL 14+
  - 主从复制（读写分离）
  - 连接池管理
  - 定期备份
end note

note right of Redis Cluster
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
database "Docker 网络" {
    network "overlay" {
        [base-api Network]
        [Database Network]
        [Monitoring Network]
    }
}

participant "Docker Compose" as compose
participant "Docker Swarm" as swarm

note right of compose
  服务容器：

  **应用服务**:
  - base-api: 3 replicas
  - Nginx: 1 replica

  **数据服务**:
  - PostgreSQL: 1 primary, 2 replicas
  - Redis: 1 master, 2 slaves
  - OpenSearch: 3 nodes

  **分析服务**:
  - Jitsu: 1 instance
  - Cube: 1 instance

  **存储服务**:
  - MinIO: 4 servers

  **监控服务**:
  - Prometheus: 1 instance
  - Grafana: 1 instance
end note

compose --> [base-api Network] : overlay
compose --> [Database Network] : overlay
compose --> [Monitoring Network] : overlay

[base-api Network] --> [base-api\n(Container)] : 连接
[Database Network] --> [PostgreSQL\n(Container)] : 连接
[Database Network] --> [Redis\n(Container)] : 连接

[Monitoring Network] --> [Prometheus\n(Container)] : 连接
[Monitoring Network] --> [Grafana\n(Container)] : 连接

swarm --> [base-api\n(Service)] : 部署
swarm --> [PostgreSQL\n(Service)] : 部署

note right of swarm
  Docker Swarm 配置：

  **服务模式**:
  - Replicated mode: base-api, PostgreSQL
  - Global mode: Nginx, Prometheus

  **网络**:
  - Overlay network for service communication
  - Internal network for database access

  **存储**:
  - Volume mounts for data persistence
  - Separate volumes for each service

  **健康检查**:
  - HTTP health check for base-api
  - TCP check for PostgreSQL, Redis
  - Command check for OpenSearch
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
!define RECTANGLE class

package "监控数据采集" {
    [MetricsService] <<Service>>
    [ErrorTrackingService] <<Service>>
    [RequestTracingService] <<Service>>
    [Prometheus Controller] <<Controller>>
}

package "应用层" {
    [AuthModule] <<Module>>
    [TenantModule] <<Module>>
    [UserModule] <<Module>>
    [Business Modules] <<Module>>
}

package "监控存储" {
    [Prometheus TSDB] <<Database>>
}

package "可视化层" {
    [Grafana] <<Dashboard>>
    [AlertManager] <<Alerting>>
}

[MetricsService] --> [AuthModule] : 收集指标
[MetricsService] --> [TenantModule] : 收集指标
[MetricsService] --> [UserModule] : 收集指标
[MetricsService] --> [Business Modules] : 收集指标

[ErrorTrackingService] --> [AuthModule] : 追踪错误
[ErrorTrackingService] --> [TenantModule] : 追踪错误
[ErrorTrackingService] --> [UserModule] : 追踪错误
[ErrorTrackingService] --> [Business Modules] : 追踪错误

[RequestTracingService] --> [AuthModule] : 追踪请求
[RequestTracingService] --> [TenantModule] : 追踪请求
[RequestTracingService] --> [UserModule] : 追踪请求
[RequestTracingService] --> [Business Modules] : 追踪请求

[Prometheus Controller] --> [MetricsService] : 拉取指标
[Prometheus Controller] --> [ErrorTrackingService] : 拉取错误
[Prometheus Controller] --> [RequestTracingService] : 拉取追踪

[Prometheus Controller] --> [Prometheus TSDB] : 存储时间序列数据
[Prometheus TSDB] --> [Grafana] : 提供数据
[Prometheus TSDB] --> [AlertManager] : 触发告警

note right of MetricsService
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

note right of ErrorTrackingService
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

note right of AlertManager
  告警规则：

  **应用告警**:
  - 错误率 > 5%
  - 响应时间 P95 > 1s
  - 活跃实例数 < 3

  **系统告警**：
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
