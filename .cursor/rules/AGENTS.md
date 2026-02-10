---
description: 项目宪章
globs:
alwaysApply: true
---
# oksai.api-server 项目宪章

本文档为在此代码库中工作的 AI 代理提供指南。

## 项目章程

### 注意

-   本项目用 MonoRepo 管理，在 `apps` 和 `libs` 目录下，包含了 `@oksai/platform` 项目当前已经开发完成的源代码，使用 `@oksai` 为作为包名前缀。
-   `qauzy-backup`目录下放置了参照项目`Gauzy`的完整代码，我们将参考这些代码和代码组织管理结构进行开发，重新构建一个多租户的 SAAS 服务端应用。对 `gauzy-backup` 目录下的旧项目代码进行简化，但是**不改动** `gauzy-backup` 目录的代码结构和代码内容（注释除外）
-   新开发的功能和代码使用 `@oksai` 作为包名前缀
-   `apps` 目录用于存放新开发的业务应用，对齐 `qauzy-backup/apps` 目录下的应用和代码管理结构
-   `libs` 目录用于存放新开发的依赖包，对齐 `qauzy-backup/packages` 目录下的包和代码管理结构

### 项目目标

#### 第一阶段

聚焦于 SAAS 服务端框架的构建以及 SAAS 平台的通用功能开发，包括：

-   对 `qauzy-backup` 目录下的旧项目代码进行简化，内容包括：

    -   删减不需要的第三方认证集成，包括：facebook、fiverr、keycloak、linkedin、twitter 等，保留 google、microsoft、github、auth0 等（已经完成）
    -   简化 ORM 层，只使用 MikroORM，不再使用 TypeORM，移除 ORM 抽象层，不需要支持多 ORM
    -   简化数据库模型，默认使用 PostgreSQL，后续增加 MongoDB
    -   保留插件系统，并增加插件分类管理功能：必备的系统插件和可选的业务插件，实现插件热拔插，用户可以根据自己的需求选择业务插件。
-   构建 SAAS 服务的通用功能，包括：
    -   身份认证与授权
	-   多租户管理
	-   权限管理
	-   审计跟踪
	-   系统配置
	-   系统监控
	-   系统日志
	-   API文档
    -   **注意**：新开发的代码组织结构应当保持与 `qauzy-backup` 目录下的旧项目代码组织结构一直，并优先使用可复用的旧代码，不要重复造轮子。

#### 第二阶段：构建 MCP 服务端框架

参考 `qauzy-backup` 目录下的旧项目代码，构建针对`@oksai/platform`项目的 MCP 服务端框架，包括：
	-	`qauzy-backup/apps/mcp`
	-	`qauzy-backup/apps/mcp-auth`
	-	`qauzy-backup/packages/mcp-server`

**注意**：本阶段的目标是构建框架，后续将渐进式开发完整的 MCP 服务端应用的业务功能。

#### 第三阶段：SAAS 服务端应用的业务功能开发

-   对齐 `qauzy-backup` 目录下的旧项目代码，构建一个多租户的 SAAS 服务端应用的构建（具体功能需求待定）

## 核心原则

### 中文优先原则

-   所有代码注释、技术文档、错误消息、日志输出及用户界面文案**必须使用中文**
-   Git 提交信息**必须使用英文描述**
-   代码变量命名**保持英文**，但必须配有中文注释说明业务语义

**理由**：统一中文语境提升团队沟通效率，确保业务认知一致，降低知识传递成本。

### 代码即文档原则

-   公共 API、类、方法、接口、枚举**必须编写完整 TSDoc 注释**
-   TSDoc 必须覆盖：功能描述、业务规则、使用场景、前置条件、后置条件、异常抛出及注意事项
-   代码变更时**必须同步更新注释**，保持实现与文档一致

**理由**：通过高质量注释让代码自身成为权威业务文档，缩短交接时间并减少额外文档维护负担。

### 项目技术栈约束原则

-   全仓统一采用 Node.js + TypeScript
-   使用 pnpm 管理依赖并通过 monorepo 组织代码

### 测试要求原则

-   单元测试与被测文件**同目录**（旁放），命名格式 `{filename}.spec.ts`
-   集成与端到端测试集中放置在 `tests/integration/` 与 `tests/e2e/`
-   采用分层测试策略：单元、集成、端到端各司其职，确保快速反馈与可维护性
-   核心业务逻辑测试覆盖率**须达到 80% 以上**，关键路径 90% 以上，所有公共 API 必须具备测试用例

**理由**：高标准测试体系保障关键功能可靠性，支持快速迭代并防止回归。

## 基本命令

### 构建命令

```bash
# 构建指定的 @oksai 包
pnpm run build --filter="@oksai/<package-name>"

# 构建所有 @oksai 包
pnpm run build --filter="@oksai/**"

# 构建所有包
pnpm run build

# 从 libs/ 目录构建单个包
cd libs/<package-name> && pnpm run build
```

### Lint 命令

```bash
# 检查所有包
pnpm run lint

# 检查指定包
cd libs/<package-name> && pnpm run lint
```

### 类型检查

```bash
# 检查所有包的类型
pnpm run typecheck

# 检查指定包的类型
cd libs/<package-name> && pnpm run typecheck
```

### 测试命令

```bash
# 运行所有测试
pnpm test

# 运行指定包的测试
cd libs/<package-name> && pnpm test

# 运行单个测试文件
cd libs/<package-name> && pnpm test user.service.spec.ts

# 以监听模式运行测试
cd libs/<package-name> && pnpm run test:watch

# 运行测试并生成覆盖率报告
cd libs/<package-name> && pnpm run test:cov
```

### 开发命令

```bash
# 启动 base-api 应用
cd apps/base-api && pnpm run start:dev

# 构建并启动 base-api
cd apps/base-api && pnpm run build && pnpm run start
```

## 代码风格指南

### 导入顺序和风格

导入应按以下特定顺序排列：

1.  **Node.js 内置模块** (path, crypto 等)
2.  **@nestjs/common** - 装饰器和异常
3.  **@nestjs/core** - 核心 NestJS 功能
4.  **@nestjs/xxx** - 其他 NestJS 模块 (config, platform-express 等)
5.  **@mikro-orm/xxx** - MikroORM 导入
6.  **内部包导入** (@oksai/\*)
7.  **本地导入** (相对路径导入)
8.  **仅类型导入** (type-only imports，如果需要)

```typescript
// ✅ 正确
import { randomUUID } from 'crypto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, wrap } from '@mikro-orm/core';
import { JwtPayload } from '@oksai/core';
import { LoginDto } from './dto';
import type { IUserRepository } from './interfaces';

// ❌ 错误
import { Injectable, InjectRepository } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
```

### 格式化规则

使用 Prettier 配置的设置（在 `.prettierrc` 中配置）：

-   打印宽度：120
-   单引号：true
-   分号：true
-   使用 Tab 缩进（tab 宽度：4）
-   无尾随逗号
-   引号属性：按需使用

```typescript
// ✅ 正确
@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>
	) {}
}

// ❌ 错误（尾随逗号）
@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User),
		private readonly userRepo: EntityRepository<User>,
	) {}
}
```

### TypeScript 类型定义

#### 类型定义

-   使用接口表示公共契约
-   使用类表示实现
-   使用类型别名表示复杂类型
-   始终使用严格类型（避免使用 `any`）

```typescript
// ✅ 正确 - DTO 接口
export interface CreateUserDto {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

// ✅ 正确 - 类型别名
export type UserId = string;

// ❌ 错误 - 使用 any
async findUser(id: any): Promise<any> {
	return await this.userRepo.findOne({ id });
}

// ✅ 正确 - 正确的类型
async findUser(id: string): Promise<User | null> {
	return await this.userRepo.findOne({ id });
}
```

#### 泛型类型

-   使用 `T` 表示泛型类型参数
-   使用 `K` 表示键类型
-   使用 `V` 表示值类型

```typescript
// ✅ 正确
interface Repository<T> {
	findOne(id: string): Promise<T | null>;
	findMany(filter: Filter<T>): Promise<T[]>;
}

// ❌ 错误
interface Repository {
	findOne(id: string): Promise<any>;
}
```

### 注释和文档规范

#### TSDoc 注释

公共 API、类、方法、接口、枚举**必须编写完整 TSDoc 注释**：

````typescript
// ✅ 正确 - 完整的 TSDoc 注释
/**
 * 认证服务
 *
 * 提供用户认证、JWT 令牌管理、密码重置等功能
 */
@Injectable()
export class AuthService {
	/**
	 * 用户登录
	 *
	 * 验证用户凭证并生成 JWT 访问令牌和刷新令牌
	 *
	 * @param credentials - 登录凭证（邮箱和密码）
	 * @returns 包含访问令牌、刷新令牌和用户信息的响应
	 * @throws UnauthorizedException 当凭证无效时
	 * @throws BadRequestException 当密码错误时
	 *
	 * @example
	 * ```typescript
	 * const result = await authService.login({
	 *   email: 'user@example.com',
	 *   password: 'password123'
	 * });
	 * ```
	 */
	async login(credentials: LoginDto): Promise<LoginResponse> {
		// 实现...
	}

	/**
	 * 根据邮箱查找用户
	 *
	 * @param email - 用户邮箱地址
	 * @returns 用户实体（如果找到），否则返回 null
	 */
	async findByEmail(email: string): Promise<User | null> {
		return await this.userRepo.findOne({ email });
	}
}

// ❌ 错误 - 缺少 TSDoc
@Injectable()
export class AuthService {
	async login(credentials: LoginDto): Promise<LoginResponse> {
		return await this.userRepo.findOne({ email: credentials.email });
	}
}
````

#### TSDoc 标签说明

-   `@param` - 参数说明（必须包含）
-   `@returns` - 返回值说明（必须包含）
-   `@throws` - 抛出的异常（如有）
-   `@example` - 使用示例（推荐添加）
-   `@see` - 相关文档链接（如有）

#### 业务语义注释

所有代码变量和业务逻辑必须配备中文注释说明：

```typescript
// ✅ 正确 - 配备中文业务语义注释
async createTenant(data: CreateTenantDto): Promise<Tenant> {
	// 检查租户标识是否已存在
	const existing = await this.tenantRepo.findOne({ slug: data.slug });
	if (existing) {
		throw new BadRequestException('租户标识已存在');
	}

	// 创建新租户并设置默认状态
	const tenant = this.tenantRepo.create({
		...data,
		status: TenantStatus.ACTIVE,
		type: TenantType.ORGANIZATION
	});

	await this.em.persistAndFlush(tenant);
	return tenant;
}

// ❌ 错误 - 缺少中文注释
async createTenant(data: CreateTenantDto): Promise<Tenant> {
	const existing = await this.tenantRepo.findOne({ slug: data.slug });
	if (existing) {
		throw new BadRequestException('Tenant slug already exists');
	}

	const tenant = this.tenantRepo.create({ ...data });
	await this.em.persistAndFlush(tenant);
	return tenant;
}
```

### 命名规范

#### 文件

-   `kebab-case.ts` - 普通文件
-   `kebab-case.spec.ts` - 测试文件（与被测文件同目录）
-   `kebab-case.dto.ts` - DTO 文件
-   `kebab-case.entity.ts` - 实体文件
-   `kebab-case.service.ts` - 服务文件
-   `kebab-case.controller.ts` - 控制器文件
-   `kebab-case.module.ts` - 模块文件

#### 类

-   `PascalCase` - 用于类、接口、类型
-   `camelCase` - 用于函数、变量、属性
-   `UPPER_SNAKE_CASE` - 用于常量

```typescript
// ✅ 正确
export class AuthService {
	private readonly userRepo: EntityRepository<User>;
	private static readonly MAX_RETRY_COUNT = 3;
	async login(): Promise<LoginResponse> {}
}

// ❌ 错误
export class authService {
	private readonly userRepo: EntityRepository<User>;
	private static readonly max_retry_count = 3;
	async Login(): Promise<login_response> {}
}
```

#### 包

-   使用 `@oksai/kebab-case` 表示包名
-   包名必须小写

```typescript
// ✅ 正确
import { JwtPayload } from '@oksai/core';
import { AuthService } from '@oksai/auth';
import { TenantService } from '@oksai/tenant';

// ❌ 错误
import { JwtPayload } from '@oksai/Core';
import { AuthService } from '@oksai/Auth';
```

### 错误处理

#### 使用 NestJS 异常

始终使用 `@nestjs/common` 中的 NestJS 内置异常：

-   `NotFoundException` - 404 Not Found
-   `BadRequestException` - 400 Bad Request
-   `UnauthorizedException` - 401 Unauthorized
-   `ForbiddenException` - 403 Forbidden
-   `ConflictException` - 409 Conflict
-   `InternalServerErrorException` - 500 Internal Server Error

#### 错误消息规范

**重要**：错误消息**必须使用中文**，并遵循以下规范：

-   使用清晰、用户友好的中文错误消息
-   包含相关详细信息（id、email、slug 等）
-   首字母大写、句末加标点

```typescript
// ✅ 正确 - 中文错误消息
async findById(id: string): Promise<User> {
	const user = await this.userRepo.findOne({ id });
	if (!user) {
		throw new NotFoundException(`未找到 ID 为 ${id} 的用户`);
	}
	return user;
}

async createByEmail(email: string): Promise<User> {
	const existing = await this.userRepo.findOne({ email });
	if (existing) {
		throw new BadRequestException('此邮箱已被使用');
	}
	return this.userRepo.create({ email, ...data });
}

// ❌ 错误 - 英文错误消息
async findById(id: string): Promise<User> {
	const user = await this.userRepo.findOne({ id });
	if (!user) {
		throw new NotFoundException('User not found');
	}
	return user;
}
```

### 依赖注入

使用构造函数注入并配合 `readonly` 修饰符：

```typescript
// ✅ 正确
@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>,
		private readonly jwtService: JwtService
	) {}
}

// ❌ 错误
@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private userRepo: EntityRepository<User>,
		private jwtService: JwtService
	) {}

	// 或者更糟：属性注入
	@InjectRepository(User)
	private userRepo: EntityRepository<User>;
}
```

### 服务层模式

#### 仓储模式

使用 `@InjectRepository` 装饰器和 `EntityRepository` 类型：

```typescript
// ✅ 正确
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>
	) {}
}

// ❌ 错误 - 手动注入
@Injectable()
export class UserService {
	constructor(private em: EntityManager) {
		this.userRepo = em.getRepository(User);
	}
}
```

#### EntityManager 访问

使用私有 getter 访问 EntityManager：

```typescript
// ✅ 正确
@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>
	) {}

	private get em(): EntityManager {
		return this.userRepo.getEntityManager();
	}

	async create(data: CreateUserDto): Promise<User> {
		const user = this.userRepo.create(data);
		this.em.persist(user);
		await this.em.flush();
		return user;
	}
}

// ❌ 错误
async create(data: CreateUserDto): Promise<User> {
	const user = this.userRepo.create(data);
	await this.em.persistAndFlush(user);
	return user;
}
```

### 控制器层模式

#### 装饰器顺序

控制器装饰器应按此顺序排列：

1.  `@Controller()`
2.  `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`
3.  `@Body()`, `@Param()`, `@Query()`, `@Headers()`, `@Req()`
4.  `@HttpCode()`, `@Header()`

```typescript
// ✅ 正确
@Post('login')
async login(@Body() credentials: LoginDto): Promise<LoginResponse> {
	return this.authService.login(credentials);
}

@Post('register')
@HttpCode(HttpStatus.CREATED)
async register(@Body() credentials: RegisterDto): Promise<LoginResponse> {
	return this.authService.register(credentials);
}

// ❌ 错误
@Post('login')
@Body()
async login(credentials: LoginDto): Promise<LoginResponse> {
	return this.authService.login(credentials);
}
```

#### 响应格式

始终返回类型化的响应：

```typescript
// ✅ 正确 - 使用接口
export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}

@Post('login')
async login(@Body() credentials: LoginDto): Promise<LoginResponse> {
	return this.authService.login(credentials);
}

// ❌ 错误 - 无类型
@Post('login')
async login(@Body() credentials: LoginDto) {
	return this.authService.login(credentials);
}
```

### 实体定义

#### 实体结构

```typescript
// ✅ 正确
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

@Entity()
export class User extends BaseEntity {
	@PrimaryKey()
	id: string = randomUUID();

	@Property({ unique: true, nullable: false })
	email!: string;

	@Property({ nullable: true })
	role?: UserRole;
}

// ❌ 错误 - 缺少装饰器
export class User {
	id: string;
	email: string;
	role: UserRole;
}
```

#### 实体字段类型

使用正确的 TypeScript 类型：

-   `string` - 用于文本
-   `number` - 用于数值
-   `boolean` - 用于标志
-   `Date` - 用于时间戳
-   `enum` - 用于枚举值

```typescript
// ✅ 正确
@Property({ nullable: true })
	createdAt?: Date;

@Property({ nullable: true })
	isActive?: boolean;

// ❌ 错误
@Property()
	createdAt: Date;

@Property()
	isActive: boolean;
```

### 模块定义

```typescript
// ✅ 正确
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';

@Module({
	imports: [MikroOrmModule.forFeature([User])],
	providers: [AuthService],
	controllers: [AuthController],
	exports: [AuthService]
})
export class AuthModule {}

// ❌ 错误 - 缺少 exports
@Module({
	imports: [MikroOrmModule.forFeature([User])],
	providers: [AuthService],
	controllers: [AuthController]
})
export class AuthModule {}
```

### 测试规范

#### 测试文件位置

-   单元测试与被测文件**同目录**，命名格式 `{filename}.spec.ts`
-   集成测试放置在 `tests/integration/`
-   端到端测试放置在 `tests/e2e/`

#### 测试覆盖率要求

-   核心业务逻辑测试覆盖率**须达到 80% 以上**
-   关键路径测试覆盖率**须达到 90% 以上**
-   所有公共 API **必须具备测试用例**

#### 测试文件示例

```typescript
// ✅ 正确 - user.service.spec.ts 与 user.service.ts 同目录
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
	let service: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UserService]
		}).compile();

		service = module.get<UserService>(UserService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create user with valid data', async () => {
			// 测试逻辑...
		});
	});
});
```

### 最佳实践

1.  **始终对数据库操作使用 async/await**
2.  **使用 DTO 进行输入验证**（配合 class-validator）
3.  **对多步骤操作使用事务**
4.  **处理边界情况** - null 检查、空数组等
5.  **使用 NestJS Logger 记录重要操作**，日志消息使用中文
6.  **绝不记录敏感数据** - 密码、令牌等
7.  **使用环境变量进行配置**
8.  **保持方法简洁专注** - 单一职责
9.  **使用有意义的变量名** - 避免单字母（循环除外），并添加中文注释说明业务语义
10. **为公共 API 添加完整的 TSDoc 注释**
11. **Git 提交信息使用英文描述**
12. **核心业务逻辑测试覆盖率达到 80% 以上**
13. **优先重用 `@oksai` 项目的代码，不要重复造轮子**

```typescript
// ✅ 正确 - 最佳实践示例
@Injectable()
export class UserService {
	constructor(
		private readonly logger: Logger,
		@InjectRepository(User)
		private readonly userRepo: EntityRepository<User>
	) {}

	/**
	 * 根据邮箱查找用户
	 *
	 * @param email - 用户邮箱地址
	 * @returns 用户（如果找到），否则返回 null
	 */
	async findByEmail(email: string): Promise<User | null> {
		this.logger.debug(`正在查找邮箱为 ${email} 的用户`);
		return await this.userRepo.findOne({ email });
	}

	/**
	 * 创建新用户
	 *
	 * @param userData - 用户创建数据
	 * @returns 已创建的用户
	 * @throws BadRequestException 如果邮箱已存在
	 */
	async create(userData: CreateUserDto): Promise<User> {
		const existing = await this.findByEmail(userData.email);
		if (existing) {
			this.logger.warn(`邮箱为 ${userData.email} 的用户已存在`);
			throw new BadRequestException('此邮箱已被使用');
		}

		const user = this.userRepo.create(userData);
		await this.em.persistAndFlush(user);
		this.logger.log(`已创建新用户：${user.id}`);
		return user;
	}
}

// ❌ 错误
@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private repo) {}

	async findByEmail(e) {
		return await this.repo.findOne({ e });
	}

	async create(data) {
		return await this.repo.create(data);
	}
}
```

## 项目结构说明

-   **libs/**/_ - 内部包（@oksai/_），新开发代码存放于此
-   **packages/**/_ - 外部包（@oksai/_），参考保留，不改动代码结构和内容（注释除外）
-   **apps/base-api** - 主 NestJS 应用
-   每个包都有自己的 `package.json`，包含 build/test/lint 脚本
-   所有包使用 `tsc -p tsconfig.lib.json` 进行构建
-   测试使用 Jest，配置在 `jest.config.js`
-   单元测试文件与被测文件同目录，命名为 `{filename}.spec.ts`

## 重要提示

-   绝不使用 `any` 类型 - 如果类型不确定，使用 `unknown`
-   始终对注入的依赖使用 `readonly`
-   始终对实体的非空属性使用 `!`
-   始终对可选属性使用 `?`
-   绝不提交 `.env` 文件
-   提交前始终运行类型检查
-   严格遵循导入顺序
-   所有注释、错误消息、日志输出使用中文
-   公共 API 必须编写完整 TSDoc 注释
-   Git 提交信息使用英文描述
-   核心业务逻辑测试覆盖率须达到 80% 以上
-   优先重用 `@oksai` 项目的代码，不要重复造轮子
