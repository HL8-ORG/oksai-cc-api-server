# @oksai/config

配置管理包 - 提供应用程序配置管理功能

## 功能特性

-   **配置加载和合并** - 支持默认配置与自定义配置的深度合并
-   **配置服务** - 提供 NestJS 依赖注入的配置服务
-   **环境变量管理** - 支持从环境变量中读取配置
-   **数据库配置** - 支持 TypeORM、MikroORM 和 Knex 数据库配置
-   **多环境支持** - 支持开发、生产等多环境配置

## 安装

```bash
pnpm install @oksai/config
```

## 依赖

此包依赖于以下包：

-   `@oksai/common` - 公共接口和类型定义
-   `@oksai/constants` - 常量定义
-   `@oksai/contracts` - 契约定义
-   `@oksai/utils` - 工具函数
-   `@nestjs/common` - NestJS 核心
-   `@nestjs/config` - NestJS 配置模块
-   `@nestjs/typeorm` - TypeORM 集成
-   `@mikro-orm/core` - MikroORM 核心
-   `@mikro-orm/nestjs` - MikroORM NestJS 集成
-   `dotenv` - 环境变量加载

## 使用方法

### 导入模块

```typescript
import { ConfigModule } from '@oksai/config';

@Module({
	imports: [ConfigModule]
	// ...
})
export class AppModule {}
```

### 注入配置服务

```typescript
import { ConfigService } from '@oksai/config';

@Injectable()
export class MyService {
	constructor(private readonly configService: ConfigService) {}

	myMethod() {
		// 获取 API 配置
		const apiConfig = this.configService.apiConfigOptions;

		// 获取数据库配置
		const dbConfig = this.configService.dbConnectionOptions;

		// 获取环境变量
		const jwtSecret = this.configService.get('JWT_SECRET');

		// 检查是否为生产环境
		const isProd = this.configService.isProd();
	}
}
```

### 使用配置加载器

```typescript
import { defineConfig, getConfig } from '@oksai/config';

// 定义配置
await defineConfig({
	apiConfigOptions: {
		port: 8080,
		host: '0.0.0.0'
	}
});

// 获取配置
const config = getConfig();
```

## 配置项

### 环境变量

所有配置项都支持通过环境变量覆盖：

| 环境变量         | 描述               | 默认值                  |
| ---------------- | ------------------ | ----------------------- |
| `API_PORT`       | API 服务端口       | `3000`                  |
| `API_HOST`       | API 服务主机       | `http://localhost`      |
| `API_BASE_URL`   | API 基础 URL       | `http://localhost:3000` |
| `JWT_SECRET`     | JWT 密钥           | `secretKey`             |
| `DB_HOST`        | 数据库主机         | `localhost`             |
| `DB_PORT`        | 数据库端口         | `5432`                  |
| `DB_NAME`        | 数据库名称         | `postgres`              |
| `DB_USER`        | 数据库用户         | `postgres`              |
| `DB_PASS`        | 数据库密码         | `root`                  |
| `DB_SYNCHRONIZE` | 是否同步数据库结构 | `false`                 |

### 配置接口

#### ApplicationPluginConfig

应用程序插件配置接口：

```typescript
interface ApplicationPluginConfig {
	apiConfigOptions: ApiServerConfigurationOptions;
	dbConnectionOptions: TypeOrmModuleOptions;
	dbMikroOrmConnectionOptions: MikroOrmModuleOptions;
	dbKnexConnectionOptions: KnexModuleOptions;
	plugins?: Array<DynamicModule | Type<any>>;
	logger?: AbstractLogger;
	customFields?: CustomEmbeddedFields;
	authOptions?: AuthConfigurationOptions;
	assetOptions?: AssetConfigurationOptions;
}
```

#### IEnvironment

环境配置接口：

```typescript
interface IEnvironment {
	port: number | string;
	host: string;
	baseUrl: string;
	clientBaseUrl: string;
	production: boolean;
	envName: string;
	JWT_SECRET?: string;
	JWT_TOKEN_EXPIRATION_TIME?: number;
	// ... 更多配置项
}
```

## 目录结构

```
libs/config/
├── src/
│   ├── lib/
│   │   ├── config/
│   │   │   ├── app.ts                    # 应用配置
│   │   │   └── index.ts                 # 配置模块索引
│   │   ├── environments/
│   │   │   ├── environment.ts           # 开发环境配置
│   │   │   ├── environment.helper.ts     # 环境工具函数
│   │   │   └── ienvironment.ts           # 环境接口
│   │   ├── config-loader.ts              # 配置加载器
│   │   ├── config.module.ts              # 配置模块
│   │   ├── config.service.ts             # 配置服务
│   │   └── default-config.ts             # 默认配置
│   └── index.ts                          # 包入口
├── package.json
├── tsconfig.lib.json
└── README.md
```

## 开发

### 构建包

```bash
cd libs/config
pnpm run build
```

### 运行类型检查

```bash
cd libs/config
pnpm run typecheck
```

### 运行测试

```bash
cd libs/config
pnpm test
```

## 与 @oksai/config 的差异

| 方面     | @oksai/config | @oksai/config |
| -------- | ------------- | ------------- |
| 包名前缀 | `@oksai`      | `@oksai`      |
| 代码注释 | 中文          | 英文          |
| 错误消息 | 中文          | 英文          |
| 代码组织 | 相同          | 相同          |
| 核心功能 | 完整          | 完整          |

## 迁移计划

从 `@oksai/config` 迁移到 `@oksai/config`：

1. ✅ **阶段 1** - 复制基础结构

    - [x] 创建目录结构
    - [x] 创建核心文件
    - [x] 添加中文注释

2. ⏳ **阶段 2** - 迁移核心功能

    - [ ] 迁移数据库配置
    - [ ] 迁移配置验证
    - [ ] 添加单元测试

3. ⏳ **阶段 3** - 迁移扩展功能
    - [ ] 迁移第三方集成配置
    - [ ] 迁移文件存储配置
    - [ ] 迁移邮件配置

## 许可证

AGPL-3.0

## 贡献

欢迎提交 Issue 和 Pull Request！
