# @oksai/constants

常量定义包

## 功能特性

提供应用程序的各类常量定义，包括：

-   **API 相关常量** - 端口、主机地址、基础 URL、GraphQL 路径
-   **AI 配置常量** - AI 服务配置令牌
-   **代码生成常量** - 验证码、魔法登录码等
-   **任务相关常量** - 任务通知周期、自动关闭周期、完成类型枚举
-   **GitHub 同步标签** - 同步源分类标签
-   **组织相关常量** - 时间格式、工作时间、奖金比例、邀请周期等
-   **反射元数据键** - 装饰器和安全功能元数据键

## 安装

```bash
pnpm install @oksai/constants
```

## 使用方法

```typescript
import {
	DEFAULT_API_PORT,
	DEFAULT_API_HOST,
	DEFAULT_API_BASE_URL,
	DEFAULT_GRAPHQL_API_PATH,
	TaskProofOfCompletionTypeEnum,
	PUBLIC_METHOD_METADATA
} from '@oksai/constants';

// 使用常量
console.log(DEFAULT_API_PORT); // 3000
console.log(DEFAULT_API_BASE_URL); // http://127.0.0.1:3000

// 使用枚举
const proofType = TaskProofOfCompletionTypeEnum.PRIVATE;
```

## 导出的常量和枚举

### API 常量

| 常量                       | 默认值                  | 说明             |
| -------------------------- | ----------------------- | ---------------- |
| `DEFAULT_API_PORT`         | 3000                    | API 服务端口     |
| `DEFAULT_API_HOST`         | '127.0.0.1'             | API 服务主机地址 |
| `DEFAULT_API_BASE_URL`     | 'http://127.0.0.1:3000' | API 基础 URL     |
| `DEFAULT_GRAPHQL_API_PATH` | 'graphql'               | GraphQL API 路径 |

### 代码生成常量

| 常量                            | 默认值   | 说明                 |
| ------------------------------- | -------- | -------------------- |
| `ALPHA_NUMERIC_CODE_LENGTH`     | 6        | 字母数字代码默认长度 |
| `DEMO_PASSWORD_LESS_MAGIC_CODE` | '123456' | 演示环境魔法登录码   |

### 任务相关枚举

| 枚举                                    | 值        | 说明         |
| --------------------------------------- | --------- | ------------ |
| `TaskProofOfCompletionTypeEnum.PUBLIC`  | 'PUBLIC'  | 公开完成证明 |
| `TaskProofOfCompletionTypeEnum.PRIVATE` | 'PRIVATE' | 私有完成证明 |

### 任务相关常量

| 常量                                | 默认值                                | 说明                   |
| ----------------------------------- | ------------------------------------- | ---------------------- |
| `DEFAULT_TASK_NOTIFY_PERIOD`        | 7                                     | 任务通知周期（天）     |
| `DEFAULT_AUTO_CLOSE_ISSUE_PERIOD`   | 7                                     | 问题自动关闭周期（天） |
| `DEFAULT_AUTO_ARCHIVE_ISSUE_PERIOD` | 7                                     | 问题自动归档周期（天） |
| `DEFAULT_PROOF_COMPLETION_TYPE`     | TaskProofOfCompletionTypeEnum.PRIVATE | 默认完成证明类型       |

### 反射元数据键

| 常量                     | 值                 | 说明             |
| ------------------------ | ------------------ | ---------------- |
| `PUBLIC_METHOD_METADATA` | '**public:route**' | 公共路由元数据键 |
| `ROLES_METADATA`         | '**roles**'        | 角色元数据键     |
| `PERMISSIONS_METADATA`   | '**permissions**'  | 权限元数据键     |
| `FEATURE_METADATA`       | '**feature**'      | 功能元数据键     |

## 迁移信息

此包从 `@oksai/constants` 迁移而来，并进行了以下优化：

-   ✅ 添加了完整的中文 TSDoc 注释
-   ✅ 保持了相同的代码组织结构
-   ✅ 使用 `@oksai` 前缀
-   ✅ 无任何外部依赖

## 开发

### 构建包

```bash
cd libs/constants
pnpm run build
```

### 运行类型检查

```bash
cd libs/constants
pnpm run typecheck
```

## 许可证

AGPL-3.0
