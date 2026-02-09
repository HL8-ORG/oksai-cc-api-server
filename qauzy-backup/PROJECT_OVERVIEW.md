# Qauzy-Backup 项目全貌文档

> 本文档记录了原 Gauzy 项目的完整架构、模块结构和技术栈，作为新项目（@oksai）开发的参考依据。

> 创建时间：2025-02-05
> 原项目名称：Ever Gauzy Platform
> 备份位置：`qauzy-backup/`

---

## 目录

-   [1. 项目概述](#1-项目概述)
-   [2. 整体架构](#2-整体架构)
-   [3. 应用程序清单](#3-应用程序清单)
-   [4. 核心包清单](#4-核心包清单)
-   [5. 插件系统](#5-插件系统)
-   [6. Core 模块详解](#6-core-模块详解)
-   [7. Bootstrap 模块](#7-bootstrap-模块)
-   [8. 技术栈](#8-技术栈)
-   [9. 与新项目对比](#9-与新项目对比)
-   [10. 迁移建议](#10-迁移建议)

---

## 1. 项目概述

### 1.1 项目信息

| 属性     | 值                                    |
| -------- | ------------------------------------- |
| 项目名称 | Ever Gauzy Platform                   |
| 许可证   | AGPL-3.0                              |
| 官网     | https://gauzy.co                      |
| GitHub   | https://github.com/ever-co/ever-gauzy |
| 作者     | Ever Co. LTD                          |
| 包前缀   | `@gauzy/*`                            |

### 1.2 项目定位

-   **开源企业管理平台**：提供人力资源、项目管理、工作流管理等功能
-   **多租户 SAAS**：支持多租户架构
-   **插件化架构**：支持丰富的插件扩展
-   **多应用部署**：API、桌面应用、Agent、MCP 等多种部署形态

---

## 2. 整体架构

### 2.1 Monorepo 结构

```
qauzy-backup/
├── apps/                    # 应用程序（12个）
└── packages/                # 可复用包（20个）
```

### 2.2 架构特点

-   **Monorepo**：使用 pnpm workspace 管理多个包
-   **插件化**：核心包 + 插件包的架构
-   **微服务就绪**：支持 API、Agent、MCP 等多种服务形态
-   **多端支持**：Web、桌面、移动端

---

## 3. 应用程序清单

| 应用           | 目录                 | 说明          | 主要依赖               |
| -------------- | -------------------- | ------------- | ---------------------- |
| **API 服务**   |                      |               |                        |
| api            | `apps/api`           | 主 API 服务   | @gauzy/core + 多个插件 |
| server         | `apps/server`        | 后端服务器    | @gauzy/core            |
| server-api     | `apps/server-api`    | 服务器 API    | @gauzy/core            |
| **MCP 服务**   |                      |               |                        |
| server-mcp     | `apps/server-mcp`    | MCP 服务器    | @gauzy/mcp-server      |
| mcp            | `apps/mcp`           | MCP 应用      | @gauzy/mcp-server      |
| mcp-auth       | `apps/mcp-auth`      | MCP 认证      | @gauzy/core            |
| **Agent 服务** |                      |               |                        |
| agent          | `apps/agent`         | AI Agent 应用 | @gauzy/core            |
| **桌面应用**   |                      |               |                        |
| desktop        | `apps/desktop`       | 桌面主应用    | @gauzy/desktop-\*      |
| desktop-api    | `apps/desktop-api`   | 桌面 API      | @gauzy/desktop-\*      |
| desktop-timer  | `apps/desktop-timer` | 桌面计时器    | @gauzy/desktop-\*      |
| **其他应用**   |                      |               |                        |
| gauzy          | `apps/gauzy`         | Gauzy 主应用  | @gauzy/core            |
| gauzy-e2e      | `apps/gauzy-e2e`     | E2E 测试      | @gauzy/core            |

---

## 4. 核心包清单

### 4.1 核心包列表

| 包               | 说明                 | 主要导出                        |
| ---------------- | -------------------- | ------------------------------- |
| **核心**         |                      |                                 |
| core             | 核心包（149 个模块） | Entities, Services, Controllers |
| plugin           | 插件系统基础         | IPlugin, PluginModule           |
| **基础设施**     |                      |                                 |
| config           | 配置管理             | ConfigService, environment      |
| common           | 公共工具             | Utils, Decorators, Guards       |
| constants        | 常量定义             | Constants, Enums                |
| contracts        | 合约/类型定义        | DTOs, Interfaces                |
| **认证**         |                      |                                 |
| auth             | 认证模块             | AuthService, Strategies         |
| **桌面**         |                      |                                 |
| desktop-core     | 桌面核心             | DesktopService                  |
| desktop-lib      | 桌面库               | DesktopUtils                    |
| desktop-ui-lib   | 桌面 UI 库           | DesktopComponents               |
| desktop-window   | 桌面窗口             | WindowManager                   |
| desktop-activity | 桌面活动追踪         | ActivityTracker                 |
| **UI**           |                      |                                 |
| ui-core          | UI 核心              | UIComponents, Theming           |
| ui-auth          | UI 认证              | AuthComponents                  |
| ui-config        | UI 配置              | ConfigComponents                |
| **MCP**          |                      |                                 |
| mcp-server       | MCP 服务器核心       | MCPService, Handlers            |
| **工具**         |                      |                                 |
| utils            | 工具库               | Utils, Helpers                  |

### 4.2 核心包结构示例

#### @gauzy/core 结构

```
packages/core/src/lib/
├── app/                      # 应用模块
├── bootstrap/                 # 启动器
├── common/                    # 公共模块
├── core/                     # 核心模块
├── database/                  # 数据库模块
├── tenant/                   # 租户模块
├── organization/              # 组织模块（15+子模块）
├── user/                     # 用户模块
├── auth/                     # 认证模块
├── role/                     # 角色模块
├── employee/                 # 员工模块（40+子模块）
├── candidate/                # 候选人模块（20+子模块）
├── ...（共149个模块）
└── index.ts                  # 主入口
```

---

## 5. 插件系统

### 5.1 插件分类

#### 5.1.1 作业相关插件（6 个）

| 插件            | 说明        | UI 插件         |
| --------------- | ----------- | --------------- |
| job-employee-ui | 员工作业 UI | -               |
| job-matching-ui | 工作匹配 UI | -               |
| job-proposal    | 工作提案    | job-proposal-ui |
| job-search      | 工作搜索    | job-search-ui   |

#### 5.1.2 集成插件（9 个）

| 插件                     | 说明              | UI 插件                     | 功能         |
| ------------------------ | ----------------- | --------------------------- | ------------ |
| integration-activepieces | ActivePieces 集成 | integration-activepieces-ui | 工作流自动化 |
| integration-ai           | AI 集成           | integration-ai-ui           | AI 功能      |
| integration-github       | GitHub 集成       | integration-github-ui       | 代码仓库集成 |
| integration-hubstaff     | Hubstaff 集成     | integration-hubstaff-ui     | 时间追踪     |
| integration-jira         | Jira 集成         | -                           | 项目管理     |
| integration-make-com     | Make.com 集成     | integration-make-com-ui     | 工作流自动化 |
| integration-upwork       | Upwork 集成       | -                           | 自由职业平台 |
| integration-zapier       | Zapier 集成       | integration-zapier-ui       | 工作流自动化 |
| integration-wakatime     | Wakatime 集成     | -                           | 时间追踪     |

#### 5.1.3 功能插件（7 个）

| 插件            | 说明     | UI 插件   | 功能     |
| --------------- | -------- | --------- | -------- |
| camshot         | 截屏插件 | -         | 截屏功能 |
| soundshot       | 录音插件 | -         | 录音功能 |
| videos          | 视频插件 | videos-ui | 视频管理 |
| changelog       | 变更日志 | -         | 版本管理 |
| knowledge-base  | 知识库   | -         | 知识管理 |
| product-reviews | 产品评论 | -         | 评价系统 |
| registry        | 注册表   | -         | 插件注册 |

#### 5.1.4 分析追踪插件（3 个）

| 插件            | 说明         | UI 插件    | 功能     |
| --------------- | ------------ | ---------- | -------- |
| jitsu-analytics | Jitsu 分析   | -          | 数据分析 |
| posthog         | PostHog 追踪 | posthog-ui | 事件追踪 |
| sentry-tracing  | Sentry 追踪  | -          | 错误追踪 |

#### 5.1.5 布局插件（4 个）

| 插件             | 说明        |
| ---------------- | ----------- |
| legal-ui         | 法律 UI     |
| maintenance-ui   | 维护 UI     |
| onboarding-ui    | 入职 UI     |
| public-layout-ui | 公共布局 UI |

### 5.2 插件系统特点

-   **热插拔**：支持运行时动态加载/卸载插件
-   **依赖管理**：插件之间可以声明依赖关系
-   **UI 集成**：核心插件 + UI 插件分离
-   **配置驱动**：通过配置启用/禁用插件

---

## 6. Core 模块详解

### 6.1 模块统计

| 分类       | 数量 | 说明                    |
| ---------- | ---- | ----------------------- |
| 总模块数   | 149  |                         |
| 实体数量   | 167  | `.entity.ts` 文件数     |
| 服务数量   | 140+ | `.service.ts` 文件数    |
| 控制器数量 | 140+ | `.controller.ts` 文件数 |

### 6.2 模块分类

#### 6.2.1 基础设施（5 个）

| 模块      | 说明       |
| --------- | ---------- |
| app       | 应用根模块 |
| bootstrap | 启动器模块 |
| database  | 数据库模块 |
| config    | 配置模块   |
| common    | 公共模块   |

#### 6.2.2 租户和组织（20+）

| 模块                              | 子模块                                   | 说明         |
| --------------------------------- | ---------------------------------------- | ------------ |
| tenant                            | tenant-api-key, tenant-setting           | 租户管理     |
| organization                      | organization-award, organization-contact | 组织管理     |
| organization-department           | -                                        | 部门管理     |
| organization-language             | -                                        | 语言管理     |
| organization-position             | -                                        | 职位管理     |
| organization-project              | organization-project-module              | 项目管理     |
| organization-sprint               | -                                        | 敏捷开发     |
| organization-strategic-initiative | -                                        | 战略计划     |
| organization-team                 | organization-team-employee               | 团队管理     |
| organization-vendor               | -                                        | 供应商管理   |
| user-organization                 | -                                        | 用户组织关系 |
| integration-tenant                | -                                        | 集成租户     |

#### 6.2.3 用户和认证（8 个）

| 模块               | 说明     |
| ------------------ | -------- |
| user               | 用户管理 |
| auth               | 认证管理 |
| role               | 角色管理 |
| role-permission    | 角色权限 |
| social-account     | 社交账户 |
| email-verification | 邮箱验证 |
| email-reset        | 密码重置 |
| password-reset     | 密码重置 |

#### 6.2.4 员工和候选人（60+）

**员工模块（40+）：**

-   employee, employee-appointment, employee-availability
-   employee-award, employee-level, employee-notification
-   employee-phone, employee-recent-visit
-   employee-recurring-expense, employee-setting
-   employee-statistics, employee-time-log
-   ... 等等

**候选人模块（20+）：**

-   candidate, candidate-criterions-rating
-   candidate-documents, candidate-education
-   candidate-experience, candidate-feedbacks
-   candidate-interview, candidate-interviewers
-   candidate-personal-qualities, candidate-skill
-   candidate-source, candidate-technologies
-   ... 等等

#### 6.2.5 工作管理（15+）

| 模块                  | 说明       |
| --------------------- | ---------- |
| deal                  | 交易管理   |
| appointment-employees | 预约管理   |
| availability-slots    | 可用时间段 |
| approval-policy       | 审批策略   |
| timesheet             | 时间表     |
| income                | 收入       |
| expense               | 支出       |
| invoice               | 发票       |

#### 6.2.6 通讯和协作（10+）

| 模块           | 说明         |
| -------------- | ------------ |
| comment        | 评论         |
| email-template | 邮件模板     |
| email-history  | 邮件历史     |
| email-send     | 邮件发送     |
| email-check    | 邮件检查     |
| email-reset    | 密码重置邮件 |
| contact        | 联系人       |
| sms-template   | 短信模板     |

#### 6.2.7 其他功能（20+）

| 模块                           | 说明         |
| ------------------------------ | ------------ |
| activity-log                   | 活动日志     |
| api-call-log                   | API 调用日志 |
| country                        | 国家/地区    |
| currency                       | 货币         |
| custom-smtp                    | 自定义 SMTP  |
| import-export                  | 导入导出     |
| report                         | 报表         |
| goal                           | 目标         |
| key-result                     | 关键结果     |
| pipeline                       | 流水线       |
| stage                          | 阶段         |
| request-approval               | 审批请求     |
| equipment-sharing              | 设备共享     |
| equipment                      | 设备         |
| inventory                      | 库存         |
| organization-contact           | 组织联系人   |
| deal-contact                   | 交易联系人   |
| candidate-documents            | 候选人文档   |
| candidate-education            | 候选人教育   |
| candidate-interview            | 候选人面试   |
| candidate-skill                | 候选人技能   |
| integration-map                | 集成映射     |
| integration-setting            | 集成设置     |
| invite                         | 邀请         |
| organization-languages         | 组织语言     |
| organization-position          | 组织职位     |
| organization-recurring-expense | 组织定期支出 |
| organization-sprint            | 组织冲刺     |
| organization-task-setting      | 组织任务设置 |
| organization-team              | 组织团队     |
| organization-team-employee     | 组织团队成员 |
| organization-team-join-request | 团队加入请求 |
| organization-vendor            | 组织供应商   |

### 6.3 核心模块结构示例

#### tenant 模块

```
packages/core/src/lib/tenant/
├── tenant.controller.ts      # 控制器
├── tenant.service.ts        # 服务
├── tenant.entity.ts        # 实体
├── tenant.module.ts        # 模块
├── tenant.seed.ts          # 种子数据
├── tenant.subscriber.ts    # 订阅者
├── dto/                   # 数据传输对象
├── commands/               # 命令
├── repository/             # 仓储
├── tenant-setting/         # 租户设置子模块
├── tenant-api-key/         # 租户 API 密钥子模块
└── default-tenants.ts      # 默认租户配置
```

#### auth 模块

```
packages/core/src/lib/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
├── email-confirmation.service.ts
├── email-verification.controller.ts
├── grant-type.ts
├── dto/
├── commands/
├── social-account/          # 社交账户
├── strategies/             # OAuth 策略
│   ├── facebook.ts
│   ├── google.ts
│   ├── github.ts
│   ├── linkedin.ts
│   ├── twitter.ts
│   ├── keycloak.ts
│   └── ... (多种策略)
└── ...
```

---

## 7. Bootstrap 模块

### 7.1 位置

`packages/core/src/lib/bootstrap/`

### 7.2 文件清单

| 文件                | 说明                       | 行数 |
| ------------------- | -------------------------- | ---- |
| index.ts            | 主入口，包含完整的启动逻辑 | ~500 |
| bootstrap.module.ts | Bootstrap 模块             | ~50  |
| redis-store.ts      | Redis 存储配置             | ~100 |
| swagger.ts          | Swagger 文档配置           | ~150 |
| tracer.ts           | OpenTelemetry 追踪配置     | ~260 |

### 7.3 Bootstrap 功能

#### 7.3.1 核心功能

```typescript
// 主要导出
export function bootstrap(pluginConfig?: ApplicationPluginConfig): Promise<INestApplication>;
export function registerPluginConfig(config: Partial<ApplicationPluginConfig>): Promise<ApplicationPluginConfig>;
export function preBootstrapRegisterEntities(config: Partial<ApplicationPluginConfig>): Promise<Array<Type<any>>>;
export function preBootstrapRegisterSubscribers(
	config: Partial<ApplicationPluginConfig>
): Promise<Array<Type<EntitySubscriberInterface>>>;
```

#### 7.3.2 启动流程

1. **预启动配置**

    - 加载环境配置
    - 注册插件实体
    - 注册插件订阅者
    - 应用插件配置函数

2. **创建应用**

    - 使用 `NestFactory.create` 创建应用
    - 配置日志和缓冲

3. **配置中间件**

    - CORS 配置
    - Helmet 安全头
    - 请求体解析
    - 静态文件服务

4. **数据库初始化**

    - MikroORM 连接
    - 运行迁移
    - 同步数据库结构
    - 填充种子数据

5. **插件加载**

    - 注册所有插件
    - 加载核心插件
    - 加载可选插件

6. **启动服务器**
    - 监听端口
    - 输出启动信息
    - 发送启动通知

#### 7.3.3 关闭流程

```typescript
async onApplicationShutdown(signal: string): Promise<void> {
  // 记录关闭信号
  Logger.log(`Received shutdown signal: ${signal}`);

  // 关闭 OTEL 追踪（如果启用）
  if (process.env.OTEL_ENABLED === 'true') {
    await tracer.shutdown();
  }

  // 执行自定义关闭逻辑
  if (signal === 'SIGTERM') {
    Logger.log('SIGTERM shutting down. Please wait...');
  }
}
```

### 7.4 特性

-   **多 ORM 支持**：同时支持 TypeORM 和 MikroORM
-   **迁移管理**：自动检测和运行迁移
-   **种子数据**：支持种子数据自动填充
-   **分布式追踪**：OpenTelemetry (OTEL) 集成
-   **Redis 会话**：支持 Redis 会话存储
-   **Swagger 文档**：自动生成 API 文档
-   **优雅关闭**：处理 SIGTERM 等关闭信号

---

## 8. 技术栈

### 8.1 核心技术

| 技术       | 版本   | 用途     |
| ---------- | ------ | -------- |
| Node.js    | >=22   | 运行时   |
| TypeScript | 5.8.0+ | 开发语言 |
| pnpm       | 9.0.0+ | 包管理器 |

### 8.2 框架和库

| 技术    | 版本    | 用途       |
| ------- | ------- | ---------- |
| NestJS  | 11.1.13 | 后端框架   |
| Express | 5.2.1   | Web 服务器 |
| RxJS    | 7.8.2   | 响应式编程 |

### 8.3 ORM

| ORM           | 版本    | 用途             |
| ------------- | ------- | ---------------- |
| TypeORM       | 0.3.28  | 主 ORM（已废弃） |
| MikroORM      | 6.6.5   | 主 ORM           |
| Better-SQLite | 11.10.0 | SQLite 驱动      |
| PostgreSQL    | 8.16.3  | PostgreSQL 驱动  |
| MySQL         | 3.16.0  | MySQL 驱动       |

### 8.4 数据库

| 数据库        | 用途        |
| ------------- | ----------- |
| PostgreSQL    | 主数据库    |
| MySQL         | 支持数据库  |
| SQLite        | 开发数据库  |
| Better-SQLite | SQLite 驱动 |

### 8.5 认证和授权

| 技术             | 版本   | 用途                 |
| ---------------- | ------ | -------------------- |
| Passport         | 10.0.3 | 认证框架             |
| @nestjs/passport | 10.0.3 | NestJS Passport 集成 |
| @nestjs/jwt      | 10.0.5 | JWT 认证             |
| JSONWebToken     | 9.0.0  | JWT 处理             |
| bcryptjs         | 3.0.2  | 密码哈希             |

**支持的 OAuth 提供商：**

-   Google
-   GitHub
-   Facebook
-   LinkedIn
-   Twitter
-   Auth0
-   Keycloak

### 8.6 验证和转换

| 技术              | 版本   | 用途     |
| ----------------- | ------ | -------- |
| class-validator   | 0.14.2 | DTO 验证 |
| class-transformer | 0.5.1  | 数据转换 |

### 8.7 队列和任务

| 技术           | 版本   | 用途               |
| -------------- | ------ | ------------------ |
| BullMQ         | 5.26.2 | 任务队列           |
| @nestjs/bullmq | 11.0.4 | NestJS BullMQ 集成 |

### 8.8 GraphQL

| 技术           | 版本    | 用途          |
| -------------- | ------- | ------------- |
| GraphQL        | 16.11.0 | GraphQL 引擎  |
| @apollo/server | 4.12.0  | Apollo Server |
| @apollo/client | 3.13.8  | Apollo Client |

### 8.9 实时通信

| 技术               | 版本   | 用途                  |
| ------------------ | ------ | --------------------- |
| Socket.io          | 4.7.8  | WebSocket             |
| @nestjs/websockets | 11.0.4 | NestJS WebSocket 集成 |

### 8.10 工具库

| 技术            | 版本   | 用途         |
| --------------- | ------ | ------------ |
| moment          | 2.30.1 | 日期时间     |
| moment-timezone | 0.6.0  | 时区处理     |
| chalk           | 4.1.0  | 终端着色     |
| handlebars      | 4.7.8  | 模板引擎     |
| axios           | 1.9.0  | HTTP 客户端  |
| yargs           | -      | CLI 参数解析 |
| dotenv          | -      | 环境变量     |

### 8.11 追踪和监控

| 技术              | 版本   | 用途               |
| ----------------- | ------ | ------------------ |
| @opentelemetry/\* | 多个   | OpenTelemetry 追踪 |
| @nestjs/terminus  | 11.0.0 | 健康检查           |
| Sentry            | -      | 错误追踪           |
| PostHog           | -      | 事件追踪           |
| Jitsu Analytics   | -      | 数据分析           |

### 8.12 测试

| 技术            | 版本    | 用途            |
| --------------- | ------- | --------------- |
| Jest            | 29.7.0  | 测试框架        |
| @nestjs/testing | 11.1.13 | NestJS 测试工具 |
| @types/jest     | 29.5.14 | Jest 类型定义   |
| supertest       | 6.3.4   | API 测试        |

### 8.13 开发工具

| 技术     | 版本   | 用途                 |
| -------- | ------ | -------------------- |
| ts-node  | 10.9.2 | TypeScript 运行      |
| nodemon  | -      | 文件监听             |
| ESLint   | -      | 代码检查             |
| Prettier | -      | 代码格式化           |
| ts-jest  | 29.4.6 | Jest TypeScript 支持 |
| Turbo    | -      | Monorepo 工具        |

---

## 9. 与新项目对比

### 9.1 架构对比

| 特性         | Qauzy-Backup            | 新项目               |
| ------------ | ----------------------- | -------------------- |
| **包前缀**   | `@gauzy/*`              | `@oksai/*`           |
| **包数量**   | 20+ 核心包 + 40+ 插件包 | 10+ 核心包           |
| **核心模块** | 149 个模块              | 逐步重构中           |
| **应用数量** | 12 个应用               | 1 个应用（base-api） |
| **架构类型** | Monorepo                | Monorepo（更精简）   |

### 9.2 技术栈对比

| 技术          | Qauzy-Backup              | 新项目                                     |
| ------------- | ------------------------- | ------------------------------------------ |
| **ORM**       | TypeORM + MikroORM        | 仅 MikroORM                                |
| **ORM 抽象**  | 有抽象层（支持多 ORM）    | 无抽象层                                   |
| **认证方式**  | 多种 OAuth（9+）          | 简化（Google, Microsoft, GitHub, Auth0）   |
| **数据库**    | PostgreSQL, MySQL, SQLite | PostgreSQL（主要）+ MongoDB, Better-SQLite |
| **GraphQL**   | 支持                      | 暂不支持                                   |
| **WebSocket** | 支持                      | 暂不支持                                   |
| **追踪**      | OpenTelemetry             | 暂不支持                                   |

### 9.3 代码复杂度对比

| 指标           | Qauzy-Backup | 新项目        |
| -------------- | ------------ | ------------- |
| **核心模块数** | 149          | ~10（已重构） |
| **实体数量**   | 167          | ~20（已重构） |
| **插件数量**   | 40+          | 6（核心插件） |
| **代码行数**   | ~100,000+    | ~10,000+      |

### 9.4 功能对比

| 功能      | Qauzy-Backup | 新项目 | 状态   |
| --------- | ------------ | ------ | ------ |
| 多租户    | ✅           | ✅     | 已完成 |
| 用户管理  | ✅           | ✅     | 已完成 |
| 组织管理  | ✅           | ✅     | 已完成 |
| 角色权限  | ✅           | ✅     | 已完成 |
| 审计日志  | ✅           | ✅     | 已完成 |
| 插件系统  | ✅           | ✅     | 已完成 |
| Bootstrap | ✅           | ✅     | 已完成 |
| 员工管理  | ✅           | ❌     | 待实现 |
| 候选人    | ✅           | ❌     | 待实现 |
| 面试管理  | ✅           | ❌     | 待实现 |
| 时间追踪  | ✅           | ❌     | 待实现 |
| 项目管理  | ✅           | ❌     | 待实现 |
| 工作流    | ✅           | ❌     | 待实现 |
| 报表      | ✅           | ❌     | 待实现 |

---

## 10. 迁移建议

### 10.1 优先级

#### P0 - 核心基础（已完成）

-   ✅ 插件系统
-   ✅ 多租户
-   ✅ 用户管理
-   ✅ 认证授权
-   ✅ 组织管理
-   ✅ 角色权限
-   ✅ 审计日志
-   ✅ Bootstrap

#### P1 - 基础功能（待实现）

-   ⏳ 员工管理
-   ⏳ 部门管理
-   ⏳ 职位管理
-   ⏳ 团队管理
-   ⏳ 通讯录
-   ⏳ 文档管理

#### P2 - 高级功能（待实现）

-   ⏳ 候选人管理
-   ⏳ 面试管理
-   ⏳ 时间追踪
-   ⏳ 项目管理
-   ⏳ 任务管理
-   ⏳ 报表

#### P3 - 集成和扩展（待实现）

-   ⏳ OAuth 集成
-   ⏳ WebSocket
-   ⏳ GraphQL
-   ⏳ 追踪系统
-   ⏳ 插件市场

### 10.2 迁移策略

#### 10.2.1 直接迁移（推荐）

对于简单的 CRUD 模块，可以直接参考 `qauzy-backup` 的实现：

1. 复制实体定义（适配 MikroORM）
2. 复制 DTO 结构
3. 复制服务层逻辑
4. 复制控制器层逻辑
5. 创建模块
6. 编写测试

#### 10.2.2 重构迁移（推荐）

对于复杂的模块，建议：

1. 分析业务需求
2. 设计新的数据模型
3. 实现核心功能
4. 参考 `qauzy-backup` 的实现细节
5. 逐步完善功能

#### 10.2.3 简化策略

对于 `qauzy-backup` 中过于复杂的部分：

1. 简化业务逻辑
2. 移除不必要的抽象层
3. 优化数据模型
4. 保留核心功能

### 10.3 代码复用

#### 10.3.1 可以直接复用的部分

-   **实体定义**：大部分实体可以直接参考
-   **DTO 结构**：验证规则和类型定义
-   **服务模式**：CRUD 操作的模式
-   **控制器模式**：REST API 的设计
-   **装饰器**：权限、缓存等装饰器

#### 10.3.2 需要适配的部分

-   **ORM 注解**：从 TypeORM 适配到 MikroORM
-   **依赖注入**：从旧式注入适配到新版
-   **配置管理**：从旧配置系统适配到新系统
-   **插件接口**：从旧插件接口适配到新接口

#### 10.3.3 不建议复用的部分

-   **多 ORM 抽象层**：新项目仅使用 MikroORM
-   **过时的认证策略**：Facebook, Twitter 等不再支持
-   **复杂的业务逻辑**：简化后再实现

### 10.4 测试策略

#### 10.4.1 测试覆盖

-   单元测试覆盖率：>= 80%
-   关键路径覆盖率：>= 90%
-   集成测试：覆盖主要业务流程
-   E2E 测试：覆盖关键用户路径

#### 10.4.2 测试文件位置

-   单元测试：与被测文件同目录
-   集成测试：`tests/integration/`
-   E2E 测试：`tests/e2e/`

### 10.5 文档要求

#### 10.5.1 代码注释

-   所有公共 API 必须有 TSDoc 注释
-   复杂业务逻辑必须有中文注释
-   关键算法必须有说明

#### 10.5.2 业务文档

-   每个模块必须有 README.md
-   重要功能必须有使用示例
-   复杂流程必须有流程图

---

## 附录

### A. 目录结构速查

```
qauzy-backup/
├── apps/                          # 应用程序
│   ├── api/                       # 主 API
│   ├── server/                    # 后端服务器
│   ├── server-api/                # 服务器 API
│   ├── server-mcp/                # MCP 服务器
│   ├── mcp/                       # MCP 应用
│   ├── mcp-auth/                  # MCP 认证
│   ├── agent/                     # AI Agent
│   ├── desktop/                   # 桌面应用
│   ├── desktop-api/                # 桌面 API
│   ├── desktop-timer/              # 桌面计时器
│   ├── gauzy/                     # Gauzy 主应用
│   └── gauzy-e2e/                # E2E 测试
│
└── packages/                       # 可复用包
    ├── core/                      # 核心包（149个模块）
    ├── plugin/                    # 插件系统
    ├── auth/                      # 认证模块
    ├── config/                    # 配置管理
    ├── common/                    # 公共工具
    ├── constants/                 # 常量定义
    ├── contracts/                 # 合约/类型
    ├── mcp-server/                # MCP 服务器核心
    ├── desktop-core/              # 桌面核心
    ├── desktop-lib/               # 桌面库
    ├── desktop-ui-lib/            # 桌面 UI 库
    ├── desktop-window/            # 桌面窗口
    ├── desktop-activity/          # 桌面活动追踪
    ├── ui-core/                  # UI 核心
    ├── ui-auth/                  # UI 认证
    ├── ui-config/                # UI 配置
    ├── utils/                    # 工具库
    └── plugins/                  # 插件包（40+）
        ├── camshot/
        ├── soundshot/
        ├── videos/
        ├── changelog/
        ├── knowledge-base/
        ├── product-reviews/
        ├── registry/
        ├── jitsu-analytics/
        ├── posthog/
        ├── sentry-tracing/
        ├── job-proposal/
        ├── job-search/
        ├── integration-activepieces/
        ├── integration-ai/
        ├── integration-github/
        ├── integration-hubstaff/
        ├── integration-jira/
        ├── integration-make-com/
        ├── integration-upwork/
        ├── integration-zapier/
        ├── integration-wakatime/
        ├── legal-ui/
        ├── maintenance-ui/
        ├── onboarding-ui/
        └── public-layout-ui/
```

### B. 关键文件索引

#### B.1 启动相关

| 文件           | 路径                                                  | 说明               |
| -------------- | ----------------------------------------------------- | ------------------ |
| Bootstrap 入口 | `packages/core/src/lib/bootstrap/index.ts`            | 应用启动主函数     |
| Bootstrap 模块 | `packages/core/src/lib/bootstrap/bootstrap.module.ts` | Bootstrap 模块定义 |
| Redis 存储     | `packages/core/src/lib/bootstrap/redis-store.ts`      | Redis 会话配置     |
| Swagger 配置   | `packages/core/src/lib/bootstrap/swagger.ts`          | Swagger 文档配置   |
| 追踪配置       | `packages/core/src/lib/bootstrap/tracer.ts`           | OpenTelemetry 配置 |

#### B.2 核心模块

| 模块         | 路径                                  | 说明     |
| ------------ | ------------------------------------- | -------- |
| Tenant       | `packages/core/src/lib/tenant/`       | 租户管理 |
| User         | `packages/core/src/lib/user/`         | 用户管理 |
| Auth         | `packages/core/src/lib/auth/`         | 认证管理 |
| Organization | `packages/core/src/lib/organization/` | 组织管理 |
| Role         | `packages/core/src/lib/role/`         | 角色管理 |
| App          | `packages/core/src/lib/app/`          | 应用模块 |

#### B.3 配置相关

| 文件     | 路径                                              | 说明                 |
| -------- | ------------------------------------------------- | -------------------- |
| 环境配置 | `packages/config/src/environments/`               | 环境变量             |
| 环境类型 | `packages/config/src/environments/environment.ts` | Environment 类型定义 |

#### B.4 类型定义

| 文件 | 路径                      | 说明           |
| ---- | ------------------------- | -------------- |
| 合约 | `packages/contracts/src/` | 类型定义和接口 |
| 常量 | `packages/constants/src/` | 常量定义       |

---

## 结语

本文档全面记录了 Qauzy-Backup 项目的架构、模块、技术栈等信息，为新项目（@oksai）的开发提供了完整的参考依据。

**使用建议：**

1. 在实现新功能时，先参考 `qauzy-backup` 的实现
2. 对比新项目的需求，进行适当的简化和优化
3. 遵循新项目的代码规范和最佳实践
4. 保持代码简洁、可维护

**维护说明：**

-   本文档应随新项目的开发进度同步更新
-   建议定期回顾和更新项目对比信息
-   如有重大架构变更，请及时更新本文档

---

_文档版本：1.0.0_
_创建日期：2025-02-05_
_最后更新：2025-02-05_
