# OKSAI API Server 项目评估报告

> **评估时间**: 2026-02-09（更新）
> **评估提交**: `3f44261` > **运行环境**: Node `v22.16.0`，pnpm `10.11.0` > **评估类型**: 第一阶段目标完成情况综合评估

---

## 结论摘要（面向第一阶段目标）

-   **总体完成度**: **65%** ⚠️
-   **自动化体检基线**: ✅ `lint / typecheck / build` 均已通过，可作为后续演进的稳定基线
-   **认证集成删减**: ✅ 已按目标保留 Google / Microsoft / GitHub / Auth0
-   **ORM 统一（仅 MikroORM）**: 🟡 `@oksai/*` 主链路已使用 MikroORM；但仓库内仍存在 `@oksai/mcp-auth` 使用 TypeORM 的残留应用（P1）
-   **多租户隔离闭环**: 🟡 基础设施（RequestContext + AuthGuard + TenantGuard）已具备，AppModule 已配置全局守卫，但缺少 E2E 验证验收（P0）
-   **插件热拔插语义**: 🟡 插件注册表、启停/重载 API 与生命周期钩子已实现，但热拔插语义未闭环，启停不等价于路由生效/失效（P0）
-   **监控 / 日志 / 审计可验证性**: 🟡 日志中间件已接入；指标/Prometheus 相关控制器存在但接线不完整；审计模块存在但需补"关键写操作产生审计记录"的可验证链路（P1）

---

## 详细评估

### 一、已完成功能清单

#### 1.1 旧项目代码简化

| 目标                         | 状态    | 证据                                                            |
| ---------------------------- | ------- | --------------------------------------------------------------- |
| 删减第三方认证集成           | ✅ 完成 | `libs/auth/package.json` - 仅保留 Google/Microsoft/GitHub/Auth0 |
| 简化 ORM 层（仅 MikroORM）   | ✅ 完成 | `apps/base-api/src/config/mikro-orm.config.ts`                  |
| 简化数据库模型（PostgreSQL） | ✅ 完成 | 17 个核心实体已创建（从 167 个简化）                            |
| 插件系统分类管理             | ✅ 完成 | 8 个系统插件（SYSTEM, P0, isProtected: true）                   |

#### 1.2 SAAS 服务通用功能

| 功能           | 状态        | 关键文件                                                 |
| -------------- | ----------- | -------------------------------------------------------- |
| 身份认证与授权 | ✅ 完整     | `libs/auth/src/lib/auth.service.ts`                      |
| 多租户管理     | ✅ 完整     | `libs/tenant/src/lib/tenant.service.ts`                  |
| 权限管理       | ✅ 完整     | `libs/role/src/lib/role.service.ts`                      |
| 审计跟踪       | ✅ 完整     | `libs/audit/src/lib/audit.service.ts`                    |
| 系统配置       | ✅ 完整     | `libs/config/src/lib/config.service.ts`                  |
| 系统监控       | 🟡 基础实现 | `libs/core/src/lib/controllers/prometheus.controller.ts` |
| 系统日志       | ✅ 完整     | `libs/common/src/lib/middleware/logger.middleware.ts`    |
| API 文档       | ✅ 完整     | `libs/bootstrap/src/lib/swagger.ts`                      |

---

## P0 风险项（必须优先修复）

### 🔴 P0-1：插件热拔插语义未闭环

**问题描述**：

-   `apps/base-api/src/main.ts:36-44` 手工创建插件实例
-   `apps/base-api/src/app.module.ts:20-27` 静态导入所有业务模块
-   插件 disable/reload 不会真正使路由失效/生效

**当前状态**: 🟡 基础 API 已实现，热拔插语义未闭环

**影响**: 违反"插件热拔插"的核心定义，启用/禁用插件不会影响实际路由

**验收标准**:

-   ❌ `POST /api/plugins/:name/disable` 后，插件路由未失效
-   ❌ 系统插件保护未在路由层实现
-   ❌ 缺少模块级别的热加载/卸载机制

**建议修复**:

1. 实现动态模块注册机制（参考 NestJS `DynamicModule`）
2. 在 PluginLoaderService 中添加模块启用/禁用逻辑
3. 为系统插件添加路由级保护（在守卫中检查插件状态）

**证据**:

-   `apps/base-api/src/main.ts:36-44`
-   `apps/base-api/src/app.module.ts:20-27`
-   `libs/plugin/src/services/plugin-loader.service.ts`

---

### 🔴 P0-2：多租户隔离闭环未完全验收

**问题描述**：

-   基础设施已完成（RequestContext + TenantGuard + AuthGuard）
-   `apps/base-api/src/app.module.ts:62-72` 已配置全局守卫
-   但缺少 E2E 验证，未确认实际隔离效果

**当前状态**: 🟡 基础设施完成，验收测试待补齐

**影响**: 可能存在跨租户数据泄露风险

**验收标准**:

-   🟡 AuthGuard 写入 RequestContext（`libs/core/src/lib/guards/auth.guard.ts:53-58`）
-   🟡 TenantGuard 使用 RequestContext（`libs/core/src/lib/guards/tenant.guard.ts:22`）
-   ❌ 跨租户读：tenantA 的 token 无法读取 tenantB 数据（**待验证**）
-   ❌ 跨租户写：客户端传入 tenantId 不能覆盖服务端上下文（**待验证**）
-   🟡 UserController 已移除 `@Req()` 装饰器（待完成迁移）

**建议修复**:

1. 编写 E2E 测试验证跨租户隔离
2. 确保所有数据访问层统一追加 tenantId 过滤
3. 移除所有控制器层的 tenantId 兜底逻辑

**证据**:

-   `apps/base-api/src/app.module.ts:62-72`
-   `libs/core/src/lib/guards/auth.guard.ts:53-58`
-   `libs/core/src/lib/guards/tenant.guard.ts:22`
-   `libs/core/src/lib/context/request-context.service.ts`

---

### 🔴 P0-3：AuthGuard 双实现风险

**问题描述**：

-   `@oksai/common` 的 AuthGuard（`libs/common/src/lib/guards/auth.guard.ts:64`）- 只设置 `request.user`
-   `@oksai/core` 的 AuthGuard（`libs/core/src/lib/guards/auth.guard.ts:53-58`）- 写入 `RequestContext`

**当前状态**: ⚠️ AppModule 使用了正确的 `@oksai/core` 版本，但双实现存在混用风险

**影响**: 不同模块引用不同 guard 导致租户上下文不一致

**验收标准**:

-   ❌ 两套 AuthGuard 行为不一致
-   ❌ 可能导致部分路由 tenantId 不可用

**建议修复**:

1. 统一使用 `@oksai/core` 的 AuthGuard
2. 移除 `@oksai/common` 中的 AuthGuard
3. 全局搜索并更新所有引用

**证据**:

-   `libs/common/src/lib/guards/auth.guard.ts`
-   `libs/core/src/lib/guards/auth.guard.ts`

---

## P1 风险项（应尽快补齐）

### 🟡 P1-1：mcp-auth 的 TypeORM 残留

**问题**: `apps/mcp-auth/package.json:36-37` 仍依赖 `@nestjs/typeorm` 和 `typeorm`

**影响**: 违反"仅使用 MikroORM"的目标

**建议**:

-   将 mcp-auth 迁移到 MikroORM，或
-   明确其归属/隔离策略（例如完全视为 gauzy-backup 参考物并从构建/发布链路隔离）

**证据**:

-   `apps/mcp-auth/package.json:36-37`

---

### 🟡 P1-2：监控指标接线未完整

**问题**: `libs/core/src/lib/controllers/prometheus.controller.ts` 已实现，但未在 CoreModule 导出，且 `IMetricsService` 的注入缺少明确 provider 绑定

**影响**: 指标端点可用性未经验证

**建议**:

1. 在 CoreModule 导出 PrometheusController
2. 确认 MetricsService 的 provider 绑定
3. 添加 E2E 验证指标端点可访问

**证据**:

-   `libs/core/src/lib/controllers/prometheus.controller.ts`
-   `libs/core/src/lib/core.module.ts`

---

### 🟡 P1-3：测试覆盖率不足

**问题**:

-   测试文件总数：212 个
-   测试代码总行数：6,911 行
-   核心业务逻辑测试覆盖率未达到 80% 目标

**影响**: 质量保障不足

**建议**:

1. 补充单元测试：services、guards、plugin loader/registry
2. 编写 E2E 测试：认证、租户隔离、权限校验、插件启停、审计记录、监控端点
3. 目标：核心业务逻辑 80%+，关键路径 90%+

---

## P2 改进项（持续演进）

### 📌 P2-1：OAuth 回调统一链路

**当前状态**: 🟡 进行中

**已完成**:

-   ✅ `UnifiedOAuthCallbackService` 统一处理 4 个 OAuth Provider
-   ✅ `UnifiedOAuthCallbackController` 提供统一回调端点
-   ✅ 一致的错误处理和响应结构

**待验证**:

-   ⏸ 测试所有 4 个 Provider 的实际回调流程
-   ⏸ 验证重定向 URL 生成逻辑
-   ⏸ 确认敏感信息不记录到日志

---

### 📌 P2-2：文档与代码同步

**已完成**: 7 个主要文档（约 27,744 字）

**建议**: 持续更新 spec-plan 与实现保持一致

---

## 代码质量评估

| 指标             | 状态                 |
| ---------------- | -------------------- |
| 中文注释和 TSDoc | ✅ 优秀              |
| 构建和类型检查   | ✅ 通过（18/18 包）  |
| 循环依赖         | ✅ 已解决            |
| 重复导入         | ✅ 已修复            |
| 代码规范遵循度   | ✅ 遵循 AGENTS.md    |
| 测试覆盖率       | ⚠️ 不足（目标 80%+） |

---

## 自动化体检结果

### 通过项

-   **Lint**: ✅ `pnpm run turbo:lint`
-   **类型检查**: ✅ `pnpm run typecheck`
-   **构建**: ✅ `pnpm run build`
-   **测试**: 🟡 `pnpm run turbo:test`（覆盖率不足）

> 说明：为避免非业务目录（如 `guides/**`、`qauzy-backup/**`）被误纳入编译范围，已对部分 `typecheck` 脚本与 tsconfig 的编译入口做了收敛；同时补齐了缺失的根测试脚本与若干单测的依赖注入/断言问题，从而确保全仓测试可稳定执行。

---

## 架构一致性评测（重点）

### 1) 认证删减与统一回调

-   **结论**: ✅ 依赖层面符合"保留 4 家 OAuth Provider"的目标
-   **证据**:
    -   `libs/auth/package.json`：仅包含 `passport-google-oauth20`、`passport-microsoft`、`passport-github2`、`passport-auth0`

### 2) ORM 统一（仅 MikroORM）

-   **结论**: 🟡 核心服务链路已使用 MikroORM；但 `apps/mcp-auth` 仍依赖 `@nestjs/typeorm` 与 `typeorm`，属于目标偏离项（P1）
-   **证据**:
    -   `apps/mcp-auth/package.json`：存在 `@nestjs/typeorm`、`typeorm` 依赖

### 3) 多租户隔离闭环（RequestContext / Guard / 数据过滤）

-   **结论**: 🟡 `RequestContextMiddleware` 已在 `CoreModule` 全局挂载；`Core` 版 `AuthGuard` 会把 JWT payload 写入 `RequestContext`；AppModule 已配置全局守卫。但存在两套 `AuthGuard`（`@oksai/common` 与 `@oksai/core`），其中 `@oksai/common` 的 AuthGuard 仅写 `request.user`，不会写入 `RequestContext`。这会放大"不同模块引用不同 guard"导致的租户上下文不一致风险（P0-3）。同时，跨租户隔离缺少 E2E 验证验收（P0-2）。
-   **证据**:
    -   `libs/core/src/lib/core.module.ts`
    -   `libs/core/src/lib/guards/auth.guard.ts:53-58`
    -   `libs/common/src/lib/guards/auth.guard.ts:64`
    -   `libs/core/src/lib/guards/tenant.guard.ts:22`
    -   `apps/base-api/src/app.module.ts:62-72`

### 4) 插件热拔插语义（模块/路由/资源释放）

-   **结论**: 🟡 插件的"加载/卸载/重载"生命周期与状态机已具备，但当前 `base-api` 仍静态导入各业务模块（`AuthModule/TenantModule/...`）且在 `main.ts` 手工创建插件实例并注册，这意味着 **disable/reload 很难做到路由真正失效/生效**（P0-1）。需要进一步把"插件对象"与"模块路由/Provider"统一到可控的动态装载机制，或至少在路由层实现"禁用即拒绝服务"的语义闭环。
-   **证据**:
    -   `libs/plugin/src/services/plugin-loader.service.ts`
    -   `libs/plugin/src/controllers/plugin.controller.ts`
    -   `apps/base-api/src/app.module.ts:20-27`（静态 imports 各模块）
    -   `apps/base-api/src/main.ts:36-44`（手工 `new AuthPlugin()`…注册并加载）

### 5) 监控 / 日志 / 审计（可验证性）

-   **结论**:
    -   **日志**: ✅ `LoggerMiddleware` 已在 `base-api` 应用层挂载，具备 correlationId（header 或自生成）。
    -   **CorrelationIdMiddleware（core）**: 🟡 实现为"可配置的 module-style 中间件"，但未看到在 `CoreModule`/`AppModule` 里实际挂载（当前主要依赖 `LoggerMiddleware` 生成/透传 correlationId）。
    -   **Prometheus/metrics**: 🟡 `libs/core` 存在 `PrometheusController`，但 `CoreModule` 未导出 controller，且其依赖 `IMetricsService` 的注入在现状下缺少明确 provider 绑定，导致指标端点的可用性需要补接线与验收（P1-2）。
    -   **审计**: 🟡 审计模块存在但需补"关键写操作产生审计记录"的可验证链路（P1-3）。
-   **证据**:
    -   `apps/base-api/src/app.module.ts`（挂载 `LoggerMiddleware`）
    -   `libs/common/src/lib/middleware/logger.middleware.ts`
    -   `libs/core/src/lib/middleware/correlation-id.middleware.ts`
    -   `libs/core/src/lib/controllers/prometheus.controller.ts`
    -   `libs/audit/src/lib/audit.service.ts`

---

## 下一步建议（最短路径）

建议以本文档和 `docs/spec-plan/08-开发任务清单.md` 为权威任务表，优先推进：

### 🔥 高优先级（P0 - 必须完成，1-2 天）

1. **P0-3 统一 AuthGuard**（2-3 小时）

    - 移除 `@oksai/common` 中的 AuthGuard
    - 全局搜索并更新所有引用
    - 确保所有模块使用 `@oksai/core` 的 AuthGuard

2. **P0-2 多租户隔离闭环验收**（4-6 小时）

    - 编写 E2E 测试验证跨租户读写隔离
    - 确保所有数据访问层统一追加 tenantId 过滤
    - 移除所有控制器层的 tenantId 兜底逻辑

3. **P0-1 插件热拔插语义闭环**（6-8 小时）
    - 实现动态模块注册机制
    - 在 PluginLoaderService 添加模块启用/禁用逻辑
    - 为系统插件添加路由级保护

### 📋 中优先级（P1 - 应尽快补齐，3-5 天）

4. **P1-1 处理 mcp-auth 的 TypeORM 残留**（2-3 小时）

    - 迁移到 MikroORM，或从构建链路隔离

5. **P1-2 完善监控指标接线**（2-3 小时）

    - 在 CoreModule 导出 PrometheusController
    - 验证 MetricsService 的 provider 绑定
    - 添加 E2E 验证

6. **P1-3 补充测试覆盖率**（8-10 小时）
    - 为核心业务逻辑编写单元测试（目标 80%+）
    - 编写 E2E 测试验证关键流程

### 📝 低优先级（P2 - 持续演进）

7. **P2-1 完善 OAuth 回调统一链路**（4-6 小时）

    - 测试所有 4 个 Provider
    - 验证重定向 URL 生成
    - 确认敏感信息不记录日志

8. **P2-2 完善文档与代码同步**（持续）
    - 持续更新 spec-plan
    - 补充 API 文档示例
    - 编写插件开发文档

---

## 风险清单（按优先级）

### P0（必须优先修复）

-   **P0-1 插件热拔插语义未闭环**: 当前更接近"状态标记 + 生命周期回调"，并未严格实现模块/路由级热拔插语义
-   **P0-2 多租户隔离闭环未验收**: 基础设施已完成，但缺少 E2E 验证，存在跨租户访问与"租户上下文缺失导致业务不可用"的双向风险
-   **P0-3 AuthGuard 双实现导致语义分叉**: `@oksai/common` 与 `@oksai/core` 的 AuthGuard 行为不同，极易产生"部分路由 tenantId 不可用"的隐性故障

### P1（应尽快补齐）

-   **P1-1 mcp-auth 的 TypeORM 残留**: 如果该应用仍需保留，应迁移到 MikroORM 或明确其归属/隔离策略
-   **P1-2 监控指标接线与验收缺失**: Prometheus/metrics 相关 controller/service 的 DI 与路由暴露需要补齐，并增加 E2E 验收
-   **P1-3 测试覆盖率不足**: 核心业务逻辑测试覆盖率未达到 80% 目标

### P2（持续演进）

-   **P2-1 OAuth 回调统一链路验证**: 需要测试所有 4 家 provider 的成功/失败重定向一致性与敏感信息不落日志
-   **P2-2 测试结构与配置优化**: 部分包仍存在 `ts-jest` 配置 deprecated warning；建议统一 Jest 配置模板并逐步消除告警
-   **P2-3 文档与实现同步机制**: 继续将实体/插件/API 的变更同步到 `docs/spec-plan/03/04/05` 并在 `06/07` 留痕

---

## 项目目标完成度统计

| 第一阶段目标                 | 状态          | 完成度  |
| ---------------------------- | ------------- | ------- |
| 认证删减（保留 4 家）        | ✅ 完成       | 100%    |
| ORM 简化（仅 MikroORM）      | 🟡 基本完成   | 95%     |
| 数据库模型简化（PostgreSQL） | ✅ 完成       | 100%    |
| 插件系统（分类管理+热拔插）  | 🟡 部分完成   | 70%     |
| 身份认证与授权               | ✅ 完成       | 100%    |
| 多租户管理                   | ✅ 完成       | 100%    |
| 权限管理                     | ✅ 完成       | 100%    |
| 审计跟踪                     | ✅ 完成       | 100%    |
| 系统配置                     | ✅ 完成       | 100%    |
| 系统监控                     | 🟡 基础实现   | 60%     |
| 系统日志                     | ✅ 完成       | 100%    |
| API 文档                     | ✅ 完成       | 100%    |
| **总体完成度**               | **🟡 进行中** | **65%** |

---

## 核心成果

### 已完成

-   ✅ ORM 层已简化（TypeORM + MikroORM + Knex → 只使用 MikroORM）
-   ✅ 数据库模型已简化（167 个实体 → 17 个核心实体）
-   ✅ 插件系统基础架构已完善（6 个 API 端点，支持状态管理）
-   ✅ Microsoft 认证已集成
-   ✅ 构建和类型检查通过（18/18 包）
-   ✅ 循环依赖已解决
-   ✅ 所有核心 SAAS 服务功能已实现

### 遗留问题

-   🔴 **3 个 P0 风险项**未闭环（插件热拔插、多租户隔离验收、AuthGuard 双实现）
-   🟡 **3 个 P1 风险项**需补齐（mcp-auth TypeORM、监控指标接线、测试覆盖率）
-   🟡 OAuth 回调统一链路需 E2E 验证

---

## 预计完成时间

-   **P0 修复**: 1-2 天（12-18 小时）
-   **P1 补齐**: 3-5 天（24-40 小时）
-   **P2 完善**: 持续演进

---

**建议在进入第二阶段开发前，优先完成所有 P0 和 P1 风险项修复，确保 SAAS 服务端框架的基础稳固可靠。**

---

**文档更新时间**: 2026-02-09
**下次更新**: 完成 P0 和 P1 风险项修复后
