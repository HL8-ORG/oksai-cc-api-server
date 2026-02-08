# UML 图渲染说明（PlantUML）

本目录下的 `*.md` 文档使用 PlantUML 代码块（例如 ` ```plantuml `）描述架构与流程图。
由于 GitHub Markdown **不会原生渲染 PlantUML**，因此建议在 Cursor/VS Code 中预览。

## 在 Cursor/VS Code 中渲染

- **安装扩展**：`PlantUML`（扩展 ID：`jebbs.plantuml`）
- **工作区默认配置**：仓库已在 `.vscode/settings.json` 中配置 `plantuml.server`，用于直接预览渲染结果。

## 安全注意事项（重要）

工作区默认使用公共 PlantUML Server 渲染，这意味着 UML 源码会被发送到 Server 端生成图片。
若你们的环境不允许外发源码，请使用 **本地渲染**。

## 切换为本地渲染（不外发源码）

你可以在本机准备 PlantUML jar（以及 Graphviz），并在个人设置或工作区设置中覆盖以下配置：

```json
{
	"plantuml.render": "Local",
	"plantuml.jar": "/绝对路径/plantuml.jar"
}
```

> 注意：不同系统下 Graphviz 安装方式不同；若本地渲染报错，请优先检查 `java` 与 `dot` 命令是否可用。

# OKSAI Platform - UML 文档索引

## 概述

本文档集合包含 OKSAI Platform 的完整 UML 架构设计文档，涵盖了系统的核心架构、模块关系、实体设计、业务流程、多租户架构、插件系统和部署方案。

## 文档列表

| 文档                               | 说明           | 主要内容                   |
| ---------------------------------- | -------------- | -------------------------- |
| **01-system-architecture.md**      | 系统架构图     | 整体架构、技术栈、模块层次 |
| **02-module-dependencies.md**      | 模块依赖关系图 | 模块间依赖、层次结构       |
| **03-entity-classes.md**           | 核心实体类图   | 实体关系、字段定义         |
| **04-authentication-flow.md**      | 认证流程序列图 | 登录、注册、登出、密码重置 |
| **05-multitenant-architecture.md** | 多租户架构图   | 租户隔离、识别、生命周期   |
| **06-plugin-architecture.md**      | 插件系统架构图 | 插件管理、加载流程、热拔插 |
| **07-deployment-architecture.md**  | 部署架构图     | 生产部署、监控体系、CI/CD  |

## 快速导航

### 🏗️ 架构设计

-   [系统架构](./01-system-architecture.md) - 了解系统的整体架构和技术栈
-   [模块依赖](./02-module-dependencies.md) - 理解模块间的依赖关系
-   [实体设计](./03-entity-classes.md) - 查看核心实体和关系

### 🔄 业务流程

-   [认证流程](./04-authentication-flow.md) - 了解用户认证和授权流程
-   [多租户架构](./05-multitenant-architecture.md) - 理解多租户隔离机制
-   [插件系统](./06-plugin-architecture.md) - 了解插件系统的设计

### 🚀 部署运维

-   [部署架构](./07-deployment-architecture.md) - 了解生产环境的部署方案

## 技术栈总览

| 层级         | 技术                 | 版本  | 用途               |
| ------------ | -------------------- | ----- | ------------------ |
| **应用框架** | NestJS               | 10.x  | 服务端框架         |
| **编程语言** | TypeScript           | 5.x   | 类型安全           |
| **ORM**      | MikroORM             | 6.x   | 数据库访问         |
| **数据库**   | PostgreSQL           | 14+   | 主数据库           |
| **缓存**     | Redis                | 6+    | 会话和缓存         |
| **搜索**     | OpenSearch           | 8.x   | 日志搜索           |
| **分析**     | Jitsu Analytics      | -     | 事件追踪           |
| **OLAP**     | Cube                 | -     | 数据分析           |
| **存储**     | MinIO                | -     | 对象存储           |
| **容器**     | Docker               | 20+   | 容器编排           |
| **编排**     | Docker Swarm         | -     | 服务编排           |
| **监控**     | Prometheus + Grafana | -     | 监控和可视化       |
| **负载均衡** | Nginx                | 1.24+ | 反向代理和负载均衡 |

## 系统特性

### 核心功能

| 功能               | 模块               | 状态      |
| ------------------ | ------------------ | --------- |
| **身份认证与授权** | AuthModule         | ✅ 已实现 |
| **多租户管理**     | TenantModule       | ✅ 已实现 |
| **用户管理**       | UserModule         | ✅ 已实现 |
| **角色与权限**     | RoleModule         | ✅ 已实现 |
| **组织管理**       | OrganizationModule | ✅ 已实现 |
| **审计跟踪**       | AuditModule        | ✅ 已实现 |
| **分析统计**       | AnalyticsModule    | ✅ 已实现 |
| **报告生成**       | ReportingModule    | ✅ 已实现 |
| **插件系统**       | PluginModule       | ✅ 已实现 |

### 技术特性

| 特性           | 说明                       | 状态 |
| -------------- | -------------------------- | ---- |
| **类型安全**   | 完整的 TypeScript 类型定义 | ✅   |
| **多租户隔离** | 租户级别的数据隔离         | ✅   |
| **插件热拔插** | 支持动态启用/禁用          | ✅   |
| **事件驱动**   | 基于订阅者的审计和分析     | ✅   |
| **请求追踪**   | 分布式追踪支持             | ✅   |
| **性能监控**   | Prometheus 指标收集        | ✅   |
| **错误追踪**   | 统一的错误处理和追踪       | ✅   |
| **数据库迁移** | MikroORM 自动迁移          | ✅   |
| **API 文档**   | Swagger/OpenAPI 自动生成   | ✅   |

## 开发指南

### 新手入门

1. 阅读 [系统架构](./01-system-architecture.md) 了解整体设计
2. 查看 [模块依赖](./02-module-dependencies.md) 理解模块关系
3. 运行 `pnpm install` 安装依赖
4. 启动 Docker 服务：`docker-compose -f docker-compose.infra.yml up -d`
5. 初始化数据库：`cd apps/base-api && pnpm run init-db`
6. 启动应用：`pnpm run start:dev`

### 开发工作流

1. **代码开发**：

    - 在相应的 `libs/` 包下创建功能
    - 遵循 AGENTS.md 中的代码规范
    - 添加完整的 TSDoc 注释
    - 编写对应的单元测试

2. **本地测试**：

    - 运行 `pnpm test` 执行测试
    - 确保测试覆盖率达到 80%+
    - 运行 `pnpm run typecheck` 检查类型

3. **代码提交**：
    - 使用英文描述提交信息
    - 确保 CI/CD 流程通过
    - 遵循语义化版本规范

### 模块开发

| 步骤        | 说明                          | 命令                      |
| ----------- | ----------------------------- | ------------------------- |
| 1. 创建包   | 在 `libs/` 下创建新包         | `mkdir -p libs/my-module` |
| 2. 初始化包 | 生成 package.json 和 tsconfig | `pnpm init`               |
| 3. 创建模块 | 创建实体、服务、控制器        | -                         |
| 4. 实现插件 | 如果是插件，实现 IPlugin 接口 | -                         |
| 5. 编写测试 | 创建单元测试和集成测试        | -                         |
| 6. 注册模块 | 在 app.module.ts 中导入       | -                         |
| 7. 配置插件 | 如果是插件，在 main.ts 中注册 | -                         |

## 运维指南

### 监控指标

| 指标类型       | 监控对象               | 告警阈值      |
| -------------- | ---------------------- | ------------- |
| **应用指标**   | QPS、响应时间、错误率  | QPS > 10000/s |
| **系统指标**   | CPU、内存、磁盘、网络  | CPU > 80%     |
| **数据库指标** | 连接数、慢查询、锁等待 | 连接数 > 80%  |
| **缓存指标**   | 命中率、内存使用率     | 命中率 > 5%   |

### 故障处理

| 故障类型       | 处理方法                   | 响应时间  |
| -------------- | -------------------------- | --------- |
| **应用错误**   | 查看日志、重启服务         | < 5 分钟  |
| **数据库故障** | 切换到备库、重启主库       | < 10 分钟 |
| **缓存故障**   | 重启 Redis 节点            | < 5 分钟  |
| **网络问题**   | 检查负载均衡器、检查防火墙 | < 15 分钟 |

### 备份策略

| 备份类型       | 频率       | 保留期 |
| -------------- | ---------- | ------ |
| **数据库备份** | 每日一次   | 30 天  |
| **文件备份**   | 每小时一次 | 7 天   |
| **配置备份**   | 每次部署   | 30 天  |
| **应用代码**   | 每次部署   | 永久   |

## 扩展指南

### 插件开发

参考 [插件系统架构](./06-plugin-architecture.md) 了解插件接口：

1. **实现 IPlugin 接口**：

    ```typescript
    export class MyPlugin implements IPlugin {
    	name = 'my-plugin';
    	type = PluginType.FEATURE;

    	async initialize(config: any): Promise<void> {
    		// 初始化逻辑
    	}

    	async destroy(): Promise<void> {
    		// 清理逻辑
    	}
    }
    ```

2. **注册插件**：

    ```typescript
    // 在 main.ts 中
    const plugin = new MyPlugin();
    registry.register(plugin);
    ```

3. **配置插件**：
    ```json
    {
    	"systemPlugins": ["auth", "tenant"],
    	"featurePlugins": {
    		"my-plugin": {
    			"enabled": true,
    			"config": {
    				"apiKey": "xxx"
    			}
    		}
    	}
    }
    ```

### API 集成

1. **查看 Swagger 文档**：

    - 开发环境：http://localhost:3000/api-docs
    - 生产环境：https://api.oksai.com/api-docs

2. **API 认证**：

    - 使用 JWT Bearer Token
    - Token 有效期：15 分钟
    - 使用 RefreshToken 刷新

3. **租户识别**：
    - 方式 1：子域名（tenant1.oksai.com）
    - 方式 2：请求头（X-Tenant-Id）
    - 方式 3：URL 路径（/api/tenant/:id/...）

## 最佳实践

### 代码规范

-   所有公共 API 必须有完整的 TSDoc 注释
-   所有错误消息必须使用中文
-   Git 提交信息必须使用英文描述
-   变量命名使用英文，但配有中文注释
-   遵循单一职责原则
-   避免循环依赖

### 测试规范

-   单元测试与被测文件同目录
-   测试文件命名：`{filename}.spec.ts`
-   核心业务逻辑测试覆盖率达 80%+
-   关键路径测试覆盖率达 90%+
-   所有公共 API 必须有测试用例

### 安全规范

-   所有用户密码必须加密存储
-   所有 API 接口必须进行身份验证
-   所有敏感操作必须记录审计日志
-   所有数据库查询必须自动添加租户过滤
-   禁止在代码中硬编码密钥

## 相关文档

-   [AGENTS.md](../../AGENTS.md) - 项目开发指南
-   [README.md](../../README.md) - 项目快速开始指南
-   [docker-compose.yml](../../docker-compose.yml) - Docker 服务配置
-   [docker-compose.infra.yml](../../docker-compose.infra.yml) - 基础设施服务配置

## 版本信息

-   **文档版本**: 1.0.0
-   **最后更新**: 2026-02-08
-   **系统版本**: 0.1.0
-   **框架版本**: NestJS 10.x, MikroORM 6.x

## 联系方式

-   **项目仓库**: https://github.com/your-org/oksai-api-server
-   **问题反馈**: 在 GitHub 提交 issue
-   **文档贡献**: 提交 PR 到仓库
