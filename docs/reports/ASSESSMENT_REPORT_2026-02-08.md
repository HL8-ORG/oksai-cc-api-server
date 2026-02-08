# OKSAI API Server 项目评估报告

> 评估时间：2026-02-08
> 评估提交：`3f44261`
> 运行环境：Node `v22.16.0`，pnpm `10.11.0`

## 结论摘要（面向第一阶段目标）

- **自动化体检基线**：`lint / typecheck / build / test` 均已通过（以当前提交为准），可以作为后续演进的稳定基线。
- **认证集成删减**：已按目标保留 **Google / Microsoft / GitHub / Auth0**（证据：`libs/auth/package.json`）。
- **ORM 统一（仅 MikroORM）**：`@oksai/*` 主链路已使用 MikroORM；但仓库内仍存在 `@oksai/mcp-auth` 使用 TypeORM 的残留应用（证据：`apps/mcp-auth/package.json`）。
- **多租户隔离闭环**：核心基础设施（`RequestContext` + middleware）已具备；但在 `base-api` 的路由层面未形成“认证 → 写入上下文 → TenantGuard 校验 → 数据访问”闭环，存在 **P0 风险**（详见下文）。
- **插件热拔插语义**：已实现注册表、启停/重载 API 与生命周期钩子调用；但当前 `base-api` 同时静态导入各模块并在 `main.ts` 手工实例化“插件对象”，导致 **启停不等价于路由生效/失效**，热拔插语义尚未闭环（P0/P1）。
- **监控 / 日志 / 审计可验证性**：日志中间件已接入；指标/Prometheus 相关控制器存在但接线不完整；审计模块存在但需补“关键写操作产生审计记录”的可验证链路（P1）。

## 自动化体检结果

### 通过项

- **Lint**：`pnpm run turbo:lint`
- **类型检查**：`pnpm run typecheck`
- **构建**：`pnpm run build`
- **测试**：`pnpm run turbo:test`

> 说明：为避免非业务目录（如 `guides/**`、`qauzy-backup/**`）被误纳入编译范围，已对部分 `typecheck` 脚本与 tsconfig 的编译入口做了收敛；同时补齐了缺失的根测试脚本与若干单测的依赖注入/断言问题，从而确保全仓测试可稳定执行。

## 架构一致性评测（重点）

### 1) 认证删减与统一回调

- **结论**：依赖层面符合“保留 4 家 OAuth Provider”的目标；但需要继续用 E2E/回调链路验证统一回调服务的行为一致性（P0-3）。
- **证据**：
	- `libs/auth/package.json`：仅包含 `passport-google-oauth20`、`passport-microsoft`、`passport-github2`、`passport-auth0`。

### 2) ORM 统一（仅 MikroORM）

- **结论**：核心服务链路已使用 MikroORM；但 `apps/mcp-auth` 仍依赖 `@nestjs/typeorm` 与 `typeorm`，属于目标偏离项。
- **证据**：
	- `apps/mcp-auth/package.json`：存在 `@nestjs/typeorm`、`typeorm` 依赖。

### 3) 多租户隔离闭环（RequestContext / Guard / 数据过滤）

- **结论**：`RequestContextMiddleware` 已在 `CoreModule` 全局挂载；`Core` 版 `AuthGuard` 会把 JWT payload 写入 `RequestContext`。但 `base-api` 当前未看到全局 guard 挂载，且大多数业务控制器未显式 `@UseGuards(AuthGuard, TenantGuard)`，导致“租户上下文缺失 / 未授权访问”的风险仍然存在。
- **关键发现**：
	- `libs/core/src/lib/core.module.ts` 中 `consumer.apply(RequestContextMiddleware).forRoutes('*')` 已建立上下文初始化。
	- 存在两套 `AuthGuard`（`@oksai/common` 与 `@oksai/core`），其中 **`@oksai/common` 的 AuthGuard 仅写 `request.user`，不会写入 `RequestContext`**；而 **`@oksai/core` 的 AuthGuard 会 `RequestContext.setCurrentUser(...)`**。这会放大“不同模块引用不同 guard”导致的租户上下文不一致风险。
- **证据**：
	- `libs/core/src/lib/core.module.ts`
	- `libs/core/src/lib/guards/auth.guard.ts`
	- `libs/common/src/lib/guards/auth.guard.ts`
	- `libs/core/src/lib/guards/tenant.guard.ts`

### 4) 插件热拔插语义（模块/路由/资源释放）

- **结论**：插件的“加载/卸载/重载”生命周期与状态机已具备，但当前 `base-api` 仍静态导入各业务模块（`AuthModule/TenantModule/...`）且在 `main.ts` 手工创建插件实例并注册，这意味着 **disable/reload 很难做到路由真正失效/生效**。需要进一步把“插件对象”与“模块路由/Provider”统一到可控的动态装载机制，或至少在路由层实现“禁用即拒绝服务”的语义闭环。
- **证据**：
	- `libs/plugin/src/services/plugin-loader.service.ts`
	- `libs/plugin/src/controllers/plugin.controller.ts`
	- `apps/base-api/src/app.module.ts`（静态 imports 各模块）
	- `apps/base-api/src/main.ts`（手工 `new AuthPlugin()`…注册并加载）

### 5) 监控 / 日志 / 审计（可验证性）

- **结论**：
	- **日志**：`LoggerMiddleware` 已在 `base-api` 应用层挂载，具备 correlationId（header 或自生成）。
	- **CorrelationIdMiddleware（core）**：实现为“可配置的 module-style 中间件”，但未看到在 `CoreModule`/`AppModule` 里实际挂载（当前主要依赖 `LoggerMiddleware` 生成/透传 correlationId）。
	- **Prometheus/metrics**：`libs/core` 存在 `PrometheusController`，但 `CoreModule` 未导出 controller，且其依赖 `IMetricsService` 的注入在现状下缺少明确 provider 绑定，导致指标端点的可用性需要补接线与验收（P1）。
- **证据**：
	- `apps/base-api/src/app.module.ts`（挂载 `LoggerMiddleware`）
	- `libs/common/src/lib/middleware/logger.middleware.ts`
	- `libs/core/src/lib/middleware/correlation-id.middleware.ts`
	- `libs/core/src/lib/controllers/prometheus.controller.ts`

## 风险清单（按优先级）

### P0（必须优先修复）

- **多租户隔离闭环未验收**：`base-api` 路由层 guard/上下文写入未形成一致闭环，存在跨租户访问与“租户上下文缺失导致业务不可用”的双向风险。
- **AuthGuard 双实现导致语义分叉**：`@oksai/common` 与 `@oksai/core` 的 AuthGuard 行为不同，极易产生“部分路由 tenantId 不可用”的隐性故障。
- **插件 disable/reload 不等价于路由失效/生效**：当前更接近“状态标记 + 生命周期回调”，并未严格实现模块/路由级热拔插语义。

### P1（应尽快补齐）

- **mcp-auth 的 TypeORM 残留**：如果该应用仍需保留，应迁移到 MikroORM 或明确其归属/隔离策略（例如完全视为 `qauzy-backup` 参考物并从构建/发布链路隔离）。
- **监控指标接线与验收缺失**：Prometheus/metrics 相关 controller/service 的 DI 与路由暴露需要补齐，并增加 E2E 验收。
- **审计链路的可验证性**：关键写操作是否产生 `AuditLog` 需要补端到端验收与证据。

### P2（持续演进）

- **测试结构与配置优化**：部分包仍存在 `ts-jest` 配置 deprecated warning；建议统一 Jest 配置模板并逐步消除告警。
- **文档与实现同步机制**：继续将实体/插件/API 的变更同步到 `docs/spec-plan/03/04/05` 并在 `06/07` 留痕。

## 下一步建议（最短路径）

建议以 `docs/spec-plan/08-开发任务清单.md` 为权威任务表，优先推进：

1. **P0-1 多租户隔离闭环**：统一使用 `@oksai/core` 的 `AuthGuard` 并确保在应用层（全局或模块级）强制执行；补齐跨租户读写的 E2E 验收。
2. **P0-2 插件热拔插语义闭环**：明确“禁用后路由如何表现”（拒绝/404/返回禁用状态），并补齐冲突检测与资源释放验证。
3. **P0-3 OAuth 回调统一链路验证**：用 E2E 覆盖 4 家 provider 的成功/失败重定向一致性与敏感信息不落日志。
