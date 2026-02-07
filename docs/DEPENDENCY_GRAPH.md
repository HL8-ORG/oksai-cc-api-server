# @oksai 项目依赖关系图

本文档描述 `backup` 目录下 @oksai 包的依赖关系，用于指导新项目开发时的构建顺序和包设计。

## 一、依赖关系概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              @oksai/core                                     │
│                     (顶层核心包 - 依赖所有基础包)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
  ┌───────────────┐         ┌───────────────┐          ┌───────────────┐
  │  @oksai/auth  │         │ @oksai/plugin │          │    其他包      │
  │   (认证模块)   │         │  (插件框架)   │          │               │
  └───────────────┘         └───────────────┘          └───────────────┘
          │                          │
          │    ┌─────────────────────┤
          │    │                     │
          ▼    ▼                     ▼
  ┌───────────────┐         ┌───────────────┐
  │ @oksai/config │         │ @oksai/common │
  │  (配置模块)    │         │  (公共模块)   │
  └───────────────┘         └───────────────┘
          │                          │
          │    ┌─────────────────────┤
          │    │                     │
          ▼    ▼                     ▼
  ┌───────────────┐         ┌───────────────────┐
  │ @oksai/utils  │         │ @oksai/contracts  │
  │  (工具函数)   │         │   (接口契约)       │
  └───────────────┘         └───────────────────┘
          │                          │
          └──────────┬───────────────┘
                     │
                     ▼
          ┌───────────────────┐
          │ @oksai/constants  │
          │    (常量定义)      │
          │   (最基础的包)     │
          └───────────────────┘


  ┌───────────────────┐
  │ @oksai/mcp-server │  ← 独立包，无内部 @oksai 依赖
  │   (MCP服务器)      │
  └───────────────────┘
```

## 二、包层级结构

### 第一层：基础层（无内部依赖）

| 包名                | 描述               | 依赖的 @oksai 包 |
| ------------------- | ------------------ | ---------------- |
| `@oksai/constants`  | 常量定义           | 无               |
| `@oksai/mcp-server` | MCP 服务器（独立） | 无               |

### 第二层：基础契约层

| 包名               | 描述               | 依赖的 @oksai 包 |
| ------------------ | ------------------ | ---------------- |
| `@oksai/contracts` | 接口契约、类型定义 | `constants`      |
| `@oksai/utils`     | 工具函数           | `constants`      |

### 第三层：公共模块层

| 包名            | 描述     | 依赖的 @oksai 包         |
| --------------- | -------- | ------------------------ |
| `@oksai/common` | 公共模块 | `constants`, `contracts` |

### 第四层：配置层

| 包名            | 描述     | 依赖的 @oksai 包                            |
| --------------- | -------- | ------------------------------------------- |
| `@oksai/config` | 配置模块 | `common`, `constants`, `contracts`, `utils` |

### 第五层：功能模块层

| 包名            | 描述     | 依赖的 @oksai 包               |
| --------------- | -------- | ------------------------------ |
| `@oksai/auth`   | 认证模块 | `config`, `contracts`, `utils` |
| `@oksai/plugin` | 插件框架 | `common`, `config`, `utils`    |

### 第六层：核心层

| 包名          | 描述     | 依赖的 @oksai 包                                                        |
| ------------- | -------- | ----------------------------------------------------------------------- |
| `@oksai/core` | 核心模块 | `auth`, `common`, `config`, `constants`, `contracts`, `plugin`, `utils` |

## 三、详细依赖关系

### @oksai/constants

```
依赖: 无
被依赖: contracts, utils, common, config, core
```

### @oksai/contracts

```
依赖: constants
被依赖: common, config, auth, core, 所有插件
```

### @oksai/utils

```
依赖: constants
被依赖: config, auth, plugin, core, 部分插件
```

### @oksai/common

```
依赖: constants, contracts
被依赖: config, plugin, core
```

### @oksai/config

```
依赖: common, constants, contracts, utils
被依赖: auth, plugin, core, 所有插件
```

### @oksai/auth

```
依赖: config, contracts, utils
被依赖: core
```

### @oksai/plugin

```
依赖: common, config, utils
被依赖: core, 所有插件
```

### @oksai/core

```
依赖: auth, common, config, constants, contracts, plugin, utils
被依赖: 所有插件
```

### @oksai/mcp-server

```
依赖: 无（独立包）
被依赖: 无
```

## 四、插件依赖关系

所有插件都位于 `backup/plugins/` 目录下，它们通常依赖以下核心包：

```
┌─────────────────────────────────────────────────────────────────┐
│                         插件 (Plugins)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ plugin-sentry   │  │ plugin-github   │  │ plugin-registry │ │
│  │ plugin-posthog  │  │ plugin-jira     │  │ plugin-videos   │ │
│  │ plugin-kb       │  │ plugin-upwork   │  │     ...         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                   必须依赖的核心包
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
  ┌──────────┐         ┌──────────┐          ┌──────────┐
  │   core   │         │  plugin  │          │ contracts│
  └──────────┘         └──────────┘          └──────────┘
```

### 插件列表

| 插件包名                                 | 描述              | 核心依赖                                                      |
| ---------------------------------------- | ----------------- | ------------------------------------------------------------- |
| `@oksai/plugin-sentry`                   | Sentry 错误追踪   | `config`, `core`, `plugin`                                    |
| `@oksai/plugin-integration-github`       | GitHub 集成       | `config`, `constants`, `contracts`, `core`, `plugin`, `utils` |
| `@oksai/plugin-knowledge-base`           | 知识库            | `contracts`, `core`, `plugin`, `utils`                        |
| `@oksai/plugin-registry`                 | 插件注册表        | `contracts`, `core`, `plugin`                                 |
| `@oksai/plugin-posthog`                  | PostHog 分析      | -                                                             |
| `@oksai/plugin-jitsu-analytics`          | Jitsu 分析        | -                                                             |
| `@oksai/plugin-integration-ai`           | AI 集成           | -                                                             |
| `@oksai/plugin-integration-jira`         | Jira 集成         | -                                                             |
| `@oksai/plugin-integration-hubstaff`     | Hubstaff 集成     | -                                                             |
| `@oksai/plugin-integration-upwork`       | Upwork 集成       | -                                                             |
| `@oksai/plugin-integration-wakatime`     | Wakatime 集成     | -                                                             |
| `@oksai/plugin-integration-zapier`       | Zapier 集成       | -                                                             |
| `@oksai/plugin-integration-make-com`     | Make.com 集成     | -                                                             |
| `@oksai/plugin-integration-activepieces` | Activepieces 集成 | -                                                             |
| `@oksai/plugin-videos`                   | 视频管理          | -                                                             |
| `@oksai/plugin-camshot`                  | 摄像截图          | -                                                             |
| `@oksai/plugin-soundshot`                | 声音截图          | -                                                             |
| `@oksai/plugin-changelog`                | 变更日志          | -                                                             |
| `@oksai/plugin-job-proposal`             | 工作提案          | -                                                             |
| `@oksai/plugin-job-search`               | 工作搜索          | -                                                             |
| `@oksai/plugin-product-reviews`          | 产品评价          | -                                                             |

## 五、构建顺序

基于依赖关系，推荐的构建顺序为：

```bash
# 第一阶段：基础包
pnpm --filter @oksai/constants build
pnpm --filter @oksai/mcp-server build  # 独立，可并行

# 第二阶段：基础契约层
pnpm --filter @oksai/contracts build
pnpm --filter @oksai/utils build       # 可并行

# 第三阶段：公共模块层
pnpm --filter @oksai/common build

# 第四阶段：配置层
pnpm --filter @oksai/config build

# 第五阶段：功能模块层
pnpm --filter @oksai/auth build
pnpm --filter @oksai/plugin build      # 可并行

# 第六阶段：核心层
pnpm --filter @oksai/core build

# 第七阶段：插件（可并行构建）
pnpm --filter "@oksai/plugin-*" build
```

或者使用简化命令：

```bash
# 构建所有 @oksai 包（pnpm workspace 会自动处理依赖顺序）
pnpm --filter "@oksai/**" build
```

## 六、依赖关系矩阵

| 包 ↓ 依赖 → | constants | contracts | utils | common | config | auth | plugin | core |
| ----------- | :-------: | :-------: | :---: | :----: | :----: | :--: | :----: | :--: |
| constants   |     -     |           |       |        |        |      |        |      |
| contracts   |     ✓     |     -     |       |        |        |      |        |      |
| utils       |     ✓     |           |   -   |        |        |      |        |      |
| common      |     ✓     |     ✓     |       |   -    |        |      |        |      |
| config      |     ✓     |     ✓     |   ✓   |   ✓    |   -    |      |        |      |
| auth        |           |     ✓     |   ✓   |        |   ✓    |  -   |        |      |
| plugin      |           |           |   ✓   |   ✓    |   ✓    |      |   -    |      |
| core        |     ✓     |     ✓     |   ✓   |   ✓    |   ✓    |  ✓   |   ✓    |  -   |
| mcp-server  |           |           |       |        |        |      |        |      |

> ✓ 表示行包依赖列包

## 七、架构说明

### 分层设计理念

1. **基础层 (constants)**: 定义全局常量、枚举值，不依赖任何其他包
2. **契约层 (contracts)**: 定义接口、类型，仅依赖常量
3. **工具层 (utils)**: 提供通用工具函数，仅依赖常量
4. **公共层 (common)**: 提供跨模块共享的功能
5. **配置层 (config)**: 统一配置管理，整合多个基础包
6. **功能层 (auth, plugin)**: 特定功能模块
7. **核心层 (core)**: 整合所有模块，提供完整的平台能力

### 设计原则

-   **单向依赖**: 上层依赖下层，下层不依赖上层
-   **最小依赖**: 每个包只依赖必要的包
-   **接口隔离**: 通过 contracts 定义接口，降低耦合
-   **插件化**: 通过 plugin 包支持功能扩展

## 八、新项目开发建议

在 `libs/` 目录下开发新的 @oksai 包时，应遵循以下原则：

1. **保持相同的包结构**: 新包应与 backup 目录中的包保持相同的组织结构
2. **遵循依赖层级**: 不要创建循环依赖，遵循既定的层级关系
3. **优先复用**: 优先使用已有包的功能，不重复造轮子
4. **简化 ORM**: 新项目仅使用 MikroORM，移除 TypeORM 相关依赖
5. **简化认证**: 保留 google、microsoft、github、auth0 认证，移除其他第三方认证

---

> 本文档基于 `backup` 目录中的 `package.json` 文件分析生成。
> 更新时间: 2026-02-04
