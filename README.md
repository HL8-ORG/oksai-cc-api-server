# OKSAI Platform - 后端 API

欢迎使用 OKSAI Platform 后端 API 应用！

## 📋 前置条件

### 1. Docker 容器

确保以下 Docker 服务已启动：

```bash
cd /path/to/oksai-api-server
docker-compose -f docker-compose.infra.yml up -d
```

已启动的服务：

-   **db** - PostgreSQL 数据库（端口 5432）
-   **redis** - Redis 缓存（端口 6379）
-   **cube** - Cube OLAP（端口 4000）
-   **opensearch** - OpenSearch（端口 9200）
-   **jitsu** - Jitsu Analytics（端口 8000）
-   **minio** - MinIO 对象存储（端口 9000）

### 2. 环境配置

确保以下环境变量已配置（参考 `apps/base-api/.env.example`）：

```bash
# 数据库配置
DATABASE_TYPE=postgresql
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=oksai
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=oksai_password

# 应用配置
PORT=3000
NODE_ENV=development
```

## 📚 架构文档

详细的系统架构、模块设计、业务流程和部署方案请参考 UML 文档：

-   **[系统架构](docs/uml/01-system-architecture.md)** - 整体架构、技术栈、模块层次
-   **[模块依赖](docs/uml/02-module-dependencies.md)** - 模块间依赖关系、层次结构
-   **[实体设计](docs/uml/03-entity-classes.md)** - 核心实体和关系
-   **[认证流程](docs/uml/04-authentication-flow.md)** - 登录、注册、登出等认证流程
-   **[多租户架构](docs/uml/05-multitenant-architecture.md)** - 租户隔离、识别和生命周期
-   **[插件系统](docs/uml/06-plugin-architecture.md)** - 插件管理、加载和热拔插
-   **[部署架构](docs/uml/07-deployment-architecture.md)** - 生产部署、监控体系和 CI/CD

### 快速访问

| 架构层级 | 查看文档                                                                  |
| -------- | ------------------------------------------------------------------------- |
| 整体架构 | [01-system-architecture.md](docs/uml/01-system-architecture.md)           |
| 模块关系 | [02-module-dependencies.md](docs/uml/02-module-dependencies.md)           |
| 实体设计 | [03-entity-classes.md](docs/uml/03-entity-classes.md)                     |
| 业务流程 | [04-authentication-flow.md](docs/uml/04-authentication-flow.md)           |
| 租户架构 | [05-multitenant-architecture.md](docs/uml/05-multitenant-architecture.md) |
| 插件系统 | [06-plugin-architecture.md](docs/uml/06-plugin-architecture.md)           |
| 部署方案 | [07-deployment-architecture.md](docs/uml/07-deployment-architecture.md)   |

## 🚀 快速开始

### 选项 1：使用现有数据库

如果你的数据库已经包含数据（例如从之前运行的 Gauzy），直接运行应用：

```bash
cd apps/base-api
pnpm run start:dev
```

### 选项 2：全新数据库初始化

如果需要初始化全新数据库（例如首次部署）：

#### 步骤 1：运行数据库迁移

使用 MikroORM 同步所有实体表结构：

```bash
cd apps/base-api
pnpm run migrate
```

#### 步骤 2：验证数据库连接

运行迁移脚本后，检查数据库是否正常：

```bash
cd apps/base-api
pnpm run start:dev
```

#### 步骤 3：检查健康状态

验证应用和数据库连接：

```bash
curl http://localhost:3000/api/health
```

应返回类似以下响应：

```json
{
	"status": "ok",
	"timestamp": "2024-01-01T00:00:00.000Z",
	"uptime": 12345,
	"environment": "development",
	"database": {
		"status": "connected",
		"type": "postgresql"
	},
	"memory": {
		"used": 45,
		"total": 512,
		"unit": "MB"
	}
}
```

## 📊 数据库表

迁移脚本将创建以下表：

-   **User** - 用户表
-   **Tenant** - 租户表
-   **Organization** - 组织表
-   **Role** - 角色表
-   **Permission** - 权限表
-   **AuditLog** - 审计日志表
-   **AnalyticsEvent** - 分析事件表
-   **AnalyticsMetric** - 分析指标表
-   **AnalyticsReport** - 分析报告表
-   **Report** - 报告表
-   **ReportTemplate** - 报告模板表
-   **ReportSchedule** - 报告计划表

## 🌐 API 端点

应用启动后，可以访问以下端点：

### 基础端点

-   **健康检查**
    -   GET `/api/health` - 基本健康状态
    -   GET `/api/health/detailed` - 详细健康状态（含数据库）

### Analytics API

-   **事件跟踪**
    -   POST `/api/analytics/events` - 记录分析事件
    -   GET `/api/analytics/metrics` - 查询指标数据
    -   GET `/api/analytics/dashboard` - 获取仪表板数据
    -   POST `/api/analytics/reports` - 生成报表
    -   GET `/api/analytics/reports` - 获取所有报表
    -   GET `/api/analytics/reports/:id` - 获取报表详情
    -   DELETE `/api/analytics/reports/:id` - 删除报表

### Reporting API

-   **报表管理**
    -   POST `/api/reporting/reports` - 生成报表
    -   GET `/api/reporting/reports` - 获取所有报表
    -   GET `/api/reporting/reports/:id` - 获取报表详情
    -   GET `/api/reporting/reports/:id/data` - 获取报表数据
    -   DELETE `/api/reporting/reports/:id` - 删除报表

### 认证 API

-   POST `/api/auth/login` - 用户登录
-   POST `/api/auth/register` - 用户注册
-   POST `/api/auth/refresh` - 刷新令牌

### 租户管理

-   GET `/api/tenant` - 获取租户列表
-   POST `/api/tenant` - 创建租户
-   PUT `/api/tenant/:id` - 更新租户
-   DELETE `/api/tenant/:id` - 删除租户

### 其他 API

-   GET `/api/organization` - 获取组织列表
-   GET `/api/user` - 获取用户列表
-   GET `/api/role` - 获取角色列表

## 📚 API 文档

启动应用后，可以访问以下文档：

-   **Swagger UI**: http://localhost:3000/api-docs
-   **Scalar UI**: http://localhost:3000/docs

Swagger 文档包含所有 API 端点的详细说明和交互式测试功能。

## 🔍 故障排除

### 数据库连接问题

如果应用启动时遇到数据库连接错误：

1. 检查 Docker 容器状态：

    ```bash
    docker ps | grep -E "db|postgres"
    ```

2. 检查数据库是否运行：

    ```bash
    docker exec -it db psql -U postgres -d postgres -c "SELECT version();"
    ```

3. 检查网络连接：

    ```bash
    docker network ls
    docker network inspect overlay
    ```

4. 查看应用日志：
    ```bash
    cd apps/base-api
    pnpm run start:dev
    ```

### 端口占用问题

如果端口 3000 已被占用：

1. 查找占用进程：

    ```bash
    lsof -ti :3000
    ```

2. 停止占用进程：

    ```bash
    kill -9 $(lsof -ti :3000 | awk '{print $2}')
    ```

3. 修改 `.env` 文件中的 `PORT` 配置

## 📝 脚本说明

### 可用的脚本命令

| 命令                 | 说明                         |
| -------------------- | ---------------------------- |
| `pnpm run start:dev` | 启动开发服务器（带热重载）   |
| `pnpm run start`     | 启动生产服务器               |
| `pnpm run migrate`   | 同步数据库 Schema            |
| `pnpm run init-db`   | 初始化数据库（删除所有数据） |
| `pnpm run build`     | 构建应用                     |
| `pnpm test`          | 运行测试                     |
| `pnpm lint`          | 运行代码检查                 |
| `pnpm typecheck`     | 运行类型检查                 |

## 🛠️ 开发指南

### 添加新功能

1. 创建新的模块和插件
2. 在 `libs/` 目录下创建新包
3. 在 `apps/base-api/src/app.module.ts` 中注册新模块
4. 添加数据库实体到 `mikro-orm.config.ts`
5. 更新 `main.ts` 中的插件注册

### 测试

1. 在 `apps/base-api/src` 下创建对应的 `.spec.ts` 文件
2. 运行 `pnpm test` 进行测试
3. 确保测试覆盖率符合要求（核心功能 80%+）

### 代码规范

1. 所有公共 API 必须有完整的 TSDoc 注释
2. 所有错误消息必须使用中文
3. 所有变量和函数命名必须使用英文
4. 遵循项目代码风格（参见 AGENTS.md）

## 📞 更多信息

-   项目文档：`AGENTS.md`
-   问题反馈：在 GitHub 提交 issue
-   技术支持：联系 OKSAI 团队

---

**祝您开发顺利！** 🚀
