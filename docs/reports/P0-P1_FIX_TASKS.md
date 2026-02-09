# P0 和 P1 风险项修复任务清单

> 创建时间：2026-02-09
> 基于评估报告：docs/reports/ASSESSMENT_REPORT_2026-02-08.md
> 目标：完成所有 P0 和 P1 风险项修复，确保第一阶段基础稳固

---

## 任务概览

| 任务                                | 优先级 | 预计时间  | 状态     |
| ----------------------------------- | ------ | --------- | -------- |
| P0-3：统一 AuthGuard                | P0     | 2-3 小时  | ⏸ 待开始 |
| P0-2：多租户隔离闭环验收            | P0     | 4-6 小时  | ⏸ 待开始 |
| P0-1：插件热拔插语义闭环            | P0     | 6-8 小时  | ⏸ 待开始 |
| P1-1：处理 mcp-auth 的 TypeORM 残留 | P1     | 2-3 小时  | ⏸ 待开始 |
| P1-2：完善监控指标接线              | P1     | 2-3 小时  | ⏸ 待开始 |
| P1-3：补充测试覆盖率                | P1     | 8-10 小时 | ⏸ 待开始 |

**总计预计时间**：24-33 小时（3-4 个工作日）

---

## P0-3：统一 AuthGuard

### 任务描述

移除 `@oksai/common` 中的 AuthGuard，统一使用 `@oksai/core` 的 AuthGuard，确保所有模块引用一致的守卫实现。

### 问题分析

**当前情况**：

-   `@oksai/common` 的 AuthGuard（`libs/common/src/lib/guards/auth.guard.ts:64`）- 只设置 `request.user`
-   `@oksai/core` 的 AuthGuard（`libs/core/src/lib/guards/auth.guard.ts:53-58`）- 写入 `RequestContext`
-   AppModule 已使用 `@oksai/core` 版本（`apps/base-api/src/app.module.ts:11,65`）
-   存在混用风险，可能导致部分路由 tenantId 不可用

### 执行步骤

1. **全局搜索 AuthGuard 引用**

    ```bash
    grep -r "AuthGuard" libs/ --include="*.ts" --include="*.tsx"
    grep -r "AuthGuard" apps/ --include="*.ts" --include="*.tsx"
    ```

2. **识别哪些模块引用了 `@oksai/common` 的 AuthGuard**

    - 检查所有 `import { AuthGuard } from '@oksai/common'`
    - 检查所有 `import { AuthGuard } from '@oksai/core'`

3. **删除 `@oksai/common` 中的 AuthGuard**

    - 文件：`libs/common/src/lib/guards/auth.guard.ts`
    - 检查是否有其他文件依赖此文件
    - 从 `libs/common/src/index.ts` 移除导出

4. **更新所有引用为 `@oksai/core` 的 AuthGuard**

    - 替换所有 `import { AuthGuard } from '@oksai/common'` 为 `from '@oksai/core'`
    - 替换所有 `import { AuthGuard }` 为明确的 `from '@oksai/core'`

5. **运行类型检查和构建**

    ```bash
    pnpm run typecheck
    pnpm run build
    ```

6. **运行测试**
    ```bash
    pnpm run turbo:test
    ```

### 验收标准

-   ✅ `libs/common/src/lib/guards/auth.guard.ts` 已删除
-   ✅ `libs/common/src/index.ts` 已移除 AuthGuard 导出
-   ✅ 所有模块统一使用 `@oksai/core` 的 AuthGuard
-   ✅ 类型检查通过
-   ✅ 构建成功
-   ✅ 测试通过

### 预计时间

2-3 小时

---

## P0-2：多租户隔离闭环验收

### 任务描述

编写 E2E 测试验证跨租户隔离效果，确保所有数据访问层统一追加 tenantId 过滤，移除控制器层的 tenantId 兜底逻辑。

### 问题分析

**当前情况**：

-   基础设施已完成（RequestContext + AuthGuard + TenantGuard）
-   AppModule 已配置全局守卫（`apps/base-api/src/app.module.ts:62-72`）
-   AuthGuard 正确写入 RequestContext（`libs/core/src/lib/guards/auth.guard.ts:53-58`）
-   TenantGuard 正确使用 RequestContext（`libs/core/src/lib/guards/tenant.guard.ts:22`）
-   **缺少 E2E 验证**，未确认实际隔离效果

### 执行步骤

1. **检查所有服务层是否使用 RequestContext**

    - 检查所有 `UserService`、`TenantService`、`OrganizationService` 等
    - 确保都使用 `RequestContext.getCurrentTenantId()` 而不是从参数获取

2. **检查所有控制器层**

    - 移除所有 `@Req()` 装饰器
    - 移除所有 `currentTenantId` 参数
    - 确保所有控制器方法不直接处理租户上下文

3. **编写 E2E 测试**

    - 创建 `apps/base-api/tests/e2e/tenant-isolation.e2e-spec.ts`
    - 测试场景：
        - 创建两个租户（tenantA、tenantB）
        - 在 tenantA 下创建用户和资源
        - 使用 tenantA 的 token 访问 tenantB 的资源（应返回 403/404）
        - 尝试创建资源时传入 tenantId 参数（应被忽略）

4. **运行 E2E 测试**

    ```bash
    cd apps/base-api
    pnpm run test:e2e tenant-isolation.e2e-spec.ts
    ```

5. **修复发现的问题**
    - 根据测试结果修复跨租户访问漏洞
    - 补充缺失的 tenantId 过滤

### 验收标准

-   ✅ 所有服务层使用 `RequestContext.getCurrentTenantId()`
-   ✅ 所有控制器层移除 `@Req()` 和 `currentTenantId` 参数
-   ✅ E2E 测试覆盖跨租户读隔离（tenantA 无法读取 tenantB 数据）
-   ✅ E2E 测试覆盖跨租户写隔离（客户端无法覆盖服务端 tenantId）
-   ✅ E2E 测试通过

### 预计时间

4-6 小时

---

## P0-1：插件热拔插语义闭环

### 任务描述

实现动态模块注册机制，在 PluginLoaderService 中添加模块启用/禁用逻辑，为系统插件添加路由级保护，确保插件 disable/reload 真正使路由失效/生效。

### 问题分析

**当前情况**：

-   `apps/base-api/src/main.ts:36-44` 手工创建插件实例
-   `apps/base-api/src/app.module.ts:20-27` 静态导入所有业务模块
-   插件 disable/reload 不会真正使路由失效/生效
-   插件状态只影响"状态标记 + 生命周期回调"

### 执行步骤

1. **设计动态模块加载机制**

    - 研究如何动态注册 NestJS 模块
    - 设计插件模块注册表（PluginModuleRegistry）
    - 设计插件状态检查守卫（PluginStatusGuard）

2. **实现 PluginModuleRegistry**

    - 创建 `libs/plugin/src/services/plugin-module-registry.service.ts`
    - 提供 `registerModule()` 和 `unregisterModule()` 方法
    - 维护已注册模块的路由映射

3. **实现 PluginStatusGuard**

    - 创建 `libs/plugin/src/guards/plugin-status.guard.ts`
    - 检查插件状态，如果插件禁用则拒绝请求
    - 系统插件跳过状态检查

4. **修改 PluginLoaderService**

    - 添加 `enableModule()` 和 `disableModule()` 方法
    - 调用 PluginModuleRegistry 的注册/注销方法
    - 触发插件生命周期钩子

5. **在 AppModule 中应用 PluginStatusGuard**

    - 将 PluginStatusGuard 添加为全局守卫
    - 确保所有插件路由都经过状态检查

6. **修改 main.ts**

    - 移除手工创建插件实例
    - 改为通过 PluginLoaderService 加载插件

7. **编写 E2E 测试**

    - 创建 `apps/base-api/tests/e2e/plugin-hot-reload.e2e-spec.ts`
    - 测试场景：
        - 禁用业务插件后，插件路由应返回 403 或 404
        - 启用插件后，插件路由应恢复正常
        - 系统插件不能被禁用
        - 重载插件后，配置变更生效

8. **运行测试并修复问题**

### 验收标准

-   ✅ `POST /api/plugins/:name/disable` 后，插件路由失效（返回 403 或 404）
-   ✅ `POST /api/plugins/:name/enable` 后，插件路由恢复正常
-   ✅ `POST /api/plugins/:name/reload` 后，插件配置变更生效且无内存泄漏
-   ✅ 系统插件保持"受保护，不可禁用/卸载"
-   ✅ E2E 测试通过

### 预计时间

6-8 小时

---

## P1-1：处理 mcp-auth 的 TypeORM 残留

### 任务描述

将 `apps/mcp-auth` 从构建链路隔离，或迁移到 MikroORM。

### 问题分析

**当前情况**：

-   `apps/mcp-auth/package.json:36-37` 仍依赖 `@nestjs/typeorm` 和 `typeorm`
-   违反"仅使用 MikroORM"的目标
-   mcp-auth 可能是参考代码，不应进入生产构建

### 执行步骤（选择一种方案）

**方案 A：从构建链路隔离**

1. **修改根 package.json**

    - 将 `@oksai/mcp-auth` 从 workspaces 或 scripts 中移除
    - 确保构建和发布不包含此应用

2. **添加 README 说明**
    - 在 `apps/mcp-auth/README.md` 添加说明：
        - "此应用为参考代码，保留自 gauzy-backup"
        - "不参与生产构建，仅供参考和学习"
        - "请勿在生产环境使用"

**方案 B：迁移到 MikroORM**

1. **更新 package.json**

    - 移除 `@nestjs/typeorm` 和 `typeorm`
    - 添加 `@mikro-orm/nestjs` 和 `@mikro-orm/core`

2. **迁移实体**

    - 将 TypeORM 实体转换为 MikroORM 实体
    - 使用 MikroORM 装饰器

3. **更新配置**

    - 创建 `apps/mcp-auth/src/config/mikro-orm.config.ts`
    - 复用 base-api 的配置模式

4. **运行类型检查和构建**

### 验收标准

-   ✅ mcp-auth 不参与生产构建（方案 A）或已迁移到 MikroORM（方案 B）
-   ✅ TypeORM 依赖已移除或隔离
-   ✅ 构建成功

### 预计时间

2-3 小时（建议选择方案 A：从构建链路隔离）

---

## P1-2：完善监控指标接线

### 任务描述

在 CoreModule 导出 PrometheusController，确认 MetricsService 的 provider 绑定，添加 E2E 验证指标端点可访问。

### 问题分析

**当前情况**：

-   `libs/core/src/lib/controllers/prometheus.controller.ts` 已实现
-   `libs/core/src/lib/core.module.ts` 未导出 PrometheusController
-   `IMetricsService` 的注入缺少明确 provider 绑定
-   指标端点可用性未经验证

### 执行步骤

1. **检查 CoreModule**

    - 文件：`libs/core/src/lib/core.module.ts`
    - 确认是否已导入 PrometheusController
    - 确认是否已导出 PrometheusController

2. **检查 MetricsService provider**

    - 确认 MetricsService 是否已正确注册
    - 确认 `IMetricsService` 是否有明确的 provider 绑定

3. **更新 CoreModule**

    - 如果未导入，添加 PrometheusController 到 controllers
    - 如果未导出，添加 PrometheusController 到 exports
    - 确保 MetricsService 正确注册

4. **检查 AppModule**

    - 确认 CoreModule 已导入
    - 确认 PrometheusController 路由已注册

5. **编写 E2E 测试**

    - 创建 `apps/base-api/tests/e2e/metrics.e2e-spec.ts`
    - 测试场景：
        - 访问 Prometheus 指标端点
        - 验证返回 Prometheus 格式的指标数据
        - 验证指标包含预期的指标（如 http_requests_total）

6. **运行测试并修复问题**

### 验收标准

-   ✅ PrometheusController 已在 CoreModule 导出
-   ✅ MetricsService 的 provider 绑定正确
-   ✅ Prometheus 指标端点可访问
-   ✅ 返回 Prometheus 格式的指标数据
-   ✅ E2E 测试通过

### 预计时间

2-3 小时

---

## P1-3：补充测试覆盖率

### 任务描述

为核心业务逻辑编写单元测试，为关键流程编写 E2E 测试，目标：核心业务逻辑 80%+，关键路径 90%+。

### 问题分析

**当前情况**：

-   测试文件总数：212 个
-   测试代码总行数：6,911 行
-   核心业务逻辑测试覆盖率未达到 80% 目标
-   缺少 E2E 测试验证关键流程

### 执行步骤

1. **评估当前测试覆盖率**

    ```bash
    pnpm run test:cov
    ```

2. **补充单元测试**

    - **核心服务**：
        - AuthService（目标 90%+）
        - TenantService（目标 90%+）
        - UserService（目标 90%+）
        - RoleService（目标 90%+）
        - PermissionService（目标 80%+）
    - **核心守卫**：
        - AuthGuard（目标 100%）
        - TenantGuard（目标 100%）
        - PluginStatusGuard（目标 100%）
    - **插件系统**：
        - PluginRegistryService（目标 90%+）
        - PluginLoaderService（目标 90%+）

3. **编写 E2E 测试**

    - 认证流程（登录、注册、登出、刷新令牌）
    - 多租户隔离（跨租户读写）
    - 权限校验（无权限访问应返回 403）
    - 插件启停（disable/enable/reload）
    - 审计记录（关键写操作产生审计记录）
    - 监控端点（Prometheus 指标可访问）

4. **运行测试覆盖率检查**

    ```bash
    pnpm run test:cov
    ```

5. **修复未覆盖的分支**

### 验收标准

-   ✅ 核心业务逻辑测试覆盖率达到 80%+
-   ✅ 关键路径测试覆盖率达到 90%+
-   ✅ 所有公共 API 都有测试
-   ✅ 单元测试通过
-   ✅ E2E 测试通过

### 预计时间

8-10 小时

---

## 执行顺序建议

### 第 1 步：P0-3（2-3 小时）

**原因**：最简单，影响最直接，风险最低

**预期结果**：统一 AuthGuard，消除双实现风险

---

### 第 2 步：P0-2（4-6 小时）

**原因**：基础设施已完成，只需补充 E2E 验证

**预期结果**：多租户隔离闭环验收完成

---

### 第 3 步：P0-1（6-8 小时）

**原因**：最复杂，需要设计和实现新机制

**预期结果**：插件热拔插语义闭环完成

---

### 第 4 步：P1-1（2-3 小时）

**原因**：简单隔离或迁移，风险低

**预期结果**：mcp-auth TypeORM 残留问题解决

---

### 第 5 步：P1-2（2-3 小时）

**原因**：简单配置和导出，风险低

**预期结果**：监控指标接线完成

---

### 第 6 步：P1-3（8-10 小时）

**原因**：需要时间编写测试，但可以并行进行

**预期结果**：测试覆盖率达到目标

---

## 总计预计时间

| 阶段     | 任务                                | 预计时间                       |
| -------- | ----------------------------------- | ------------------------------ |
| 第 1 步  | P0-3：统一 AuthGuard                | 2-3 小时                       |
| 第 2 步  | P0-2：多租户隔离闭环验收            | 4-6 小时                       |
| 第 3 步  | P0-1：插件热拔插语义闭环            | 6-8 小时                       |
| 第 4 步  | P1-1：处理 mcp-auth 的 TypeORM 残留 | 2-3 小时                       |
| 第 5 步  | P1-2：完善监控指标接线              | 2-3 小时                       |
| 第 6 步  | P1-3：补充测试覆盖率                | 8-10 小时                      |
| **总计** | -                                   | **24-33 小时（3-4 个工作日）** |

---

## 风险与注意事项

1. **P0-1 可能需要重构**：插件热拔插语义闭环可能需要重构现有的插件系统架构
2. **P0-2 可能发现深层问题**：E2E 测试可能发现隐藏的跨租户访问漏洞
3. **P1-3 可能需要更多时间**：测试编写和覆盖率提升通常需要更多时间
4. **并行执行**：P1-3 可以与其他任务并行进行，节省总时间

---

## 成功标准

所有 P0 和 P1 风险项修复完成，达到以下标准：

-   ✅ P0-3：AuthGuard 统一使用 `@oksai/core` 版本
-   ✅ P0-2：多租户隔离 E2E 测试通过
-   ✅ P0-1：插件热拔插语义闭环完成，E2E 测试通过
-   ✅ P1-1：mcp-auth TypeORM 残留问题解决
-   ✅ P1-2：监控指标端点可访问，E2E 测试通过
-   ✅ P1-3：核心业务逻辑测试覆盖率 80%+，关键路径 90%+

---

**任务清单创建时间**：2026-02-09
**预计完成时间**：3-4 个工作日
**下次更新**：完成每个任务后更新状态
