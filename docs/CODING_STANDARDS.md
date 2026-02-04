# 代码规范

## 📑 目录

-   [核心原则](#核心原则)
    -   [中文优先原则](#中文优先原则)
    -   [代码即文档原则](#代码即文档原则)
    -   [项目技术栈约束原则](#代码即文档原则)
    -   [测试要求原则](#测试要求原则)
-   [导入顺序和风格](#导入顺序和风格)
-   [格式化规则](#格式化规则)
-   [TypeScript 类型定义](#typescript-类型定义)
    -   [类型定义](#类型定义)
    -   [泛型类型](#泛型类型)
-   [注释和文档规范](#注释和文档规范)
    -   [TSDoc 注释规范](#tsdoc-注释规范)
    -   [TSDoc 标签说明](#tsdoc-标签说明)
    -   [业务语义注释规范](#业务语义注释规范)
-   [命名规范](#命名规范)
    -   [文件命名](#文件命名)
    -   [类命名](#类命名)
    -   [包命名](#包命名)
-   [错误处理](#错误处理)
    -   [使用 NestJS 异常](#使用-nestjs-异常)
    -   [错误消息规范](#错误消息规范)
-   [依赖注入](#依赖注入)
-   [服务层模式](#服务层模式)
    -   [仓储模式](#仓储模式)
    -   [EntityManager 访问](#entitymanager-访问)
-   [控制器层模式](#控制器层模式)
    -   [装饰器顺序](#装饰器顺序)
    -   [响应格式](#响应格式)
-   [实体定义](#实体定义)
    -   [实体结构](#实体结构)
    -   [实体字段类型](#实体字段类型)
-   [模块定义](#模块定义)
-   [测试规范](#测试规范)
    -   [测试文件位置](#测试文件位置)
    -   [测试覆盖率要求](#测试覆盖率要求)
    -   [测试文件示例](#测试文件示例)
-   [最佳实践](#最佳实践)

---

## 核心原则

### 中文优先原则

**适用范围：** 所有代码注释、技术文档、错误消息、日志输出及用户界面文案

**具体要求：**

-   所有代码注释必须使用中文
-   所有技术文档必须使用中文
-   所有错误消息必须使用中文
-   所有日志输出必须使用中文
-   所有用户界面文案必须使用中文
-   Git 提交信息必须使用英文描述
-   代码变量命名保持英文，但必须配有中文注释说明业务语义

**理由：** 统一中文语境提升团队沟通效率，确保业务认知一致，降低知识传递成本。

**示例：**

```typescript
// ✅ 正确 - 中文注释和错误消息
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

// ❌ 错误 - 英文注释和错误消息
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

---

### 代码即文档原则

**适用范围：** 公共 API、类、方法、接口、枚举

**具体要求：**

-   公共 API、类、方法、接口、枚举必须编写完整 TSDoc 注释
-   TSDoc 必须覆盖：功能描述、业务规则、使用场景、前置条件、后置条件、异常抛出及注意事项
-   代码变更时必须同步更新注释，保持实现与文档一致

**理由：** 通过高质量注释让代码自身成为权威业务文档，缩短交接时间并减少额外文档维护负担。

---

### 项目技术栈约束原则

**具体要求：**

-   全仓统一采用 Node.js + TypeScript
-   使用 pnpm 管理依赖并通过 monorepo 组织代码

---

### 测试要求原则

**具体要求：**

-   单元测试与被测文件同目录（旁放），命名格式 `{filename}.spec.ts`
-   集成与端到端测试集中放置在 `tests/integration/` 与 `tests/e2e/`
-   采用分层测试策略：单元、集成、端到端各司其职，确保快速反馈与可维护性
-   核心业务逻辑测试覆盖率须达到 80% 以上
-   关键路径测试覆盖率须达到 90% 以上
-   所有公共 API 必须具备测试用例

**理由：** 高标准测试体系保障关键功能可靠性，支持快速迭代并防止回归。

---

## 导入顺序和风格

导入应按以下特定顺序排列：

1. **Node.js 内置模块**（path、crypto 等）
2. **@nestjs/common** - 装饰器和异常
3. **@nestjs/core** - 核心 NestJS 功能
4. **@nestjs/xxx** - 其他 NestJS 模块（config、platform-express 等）
5. **@mikro-orm/xxx** - MikroORM 导入
6. **内部包导入**（@oksai/\*）
7. **本地导入**（相对路径导入）
8. **仅类型导入**（type-only imports，如果需要）

**示例：**

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

---

## 格式化规则

使用 Prettier 配置的设置（在 `.prettierrc` 中配置）：

-   **打印宽度：** 120
-   **单引号：** true
-   **分号：** true
-   **使用 Tab 缩进（tab 宽度：4）**
-   **无尾随逗号**
-   **引号属性：** 按需使用

**示例：**

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

---

## TypeScript 类型定义

### 类型定义

-   使用接口表示公共契约
-   使用类表示实现
-   使用类型别名表示复杂类型
-   始终使用严格类型（避免使用 `any`）

**示例：**

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

### 泛型类型

-   使用 `T` 表示泛型类型参数
-   使用 `K` 表示键类型
-   使用 `V` 表示值类型

**示例：**

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

---

## 注释和文档规范

### TSDoc 注释规范

公共 API、类、方法、接口、枚举必须编写完整 TSDoc 注释。

**示例：**

````typescript
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

### TSDoc 标签说明

-   `@param` - 参数说明（必须包含）
-   `@returns` - 返回值说明（必须包含）
-   `@throws` - 抛出的异常（如有）
-   `@example` - 使用示例（推荐添加）
-   `@see` - 相关文档链接（如有）

### 业务语义注释规范

所有代码变量和业务逻辑必须配备中文注释说明。

**示例：**

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

---

## 命名规范

### 文件命名

-   `kebab-case.ts` - 普通文件
-   `kebab-case.spec.ts` - 测试文件（与被测文件同目录）
-   `kebab-case.dto.ts` - DTO 文件
-   `kebab-case.entity.ts` - 实体文件
-   `kebab-case.service.ts` - 服务文件
-   `kebab-case.controller.ts` - 控制器文件
-   `kebab-case.module.ts` - 模块文件

### 类命名

-   `PascalCase` - 用于类、接口、类型
-   `camelCase` - 用于函数、变量、属性
-   `UPPER_SNAKE_CASE` - 用于常量

**示例：**

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

### 包命名

-   使用 `@oksai/kebab-case` 表示包名
-   包名必须小写

**示例：**

```typescript
// ✅ 正确
import { JwtPayload } from '@oksai/core';
import { AuthService } from '@oksai/auth';
import { TenantService } from '@oksai/tenant';

// ❌ 错误
import { JwtPayload } from '@oksai/Core';
import { AuthService } from '@oksai/Auth';
```

---

## 错误处理

### 使用 NestJS 异常

始终使用 `@nestjs/common` 中的 NestJS 内置异常：

-   `NotFoundException` - 404 Not Found
-   `BadRequestException` - 400 Bad Request
-   `UnauthorizedException` - 401 Unauthorized
-   `ForbiddenException` - 403 Forbidden
-   `ConflictException` - 409 Conflict
-   `InternalServerErrorException` - 500 Internal Server Error

### 错误消息规范

**重要：** 错误消息必须使用中文，并遵循以下规范：

-   使用清晰、用户友好的中文错误消息
-   包含相关详细信息（id、email、slug 等）
-   首字母大写、句末加标点

**示例：**

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

---

## 依赖注入

使用构造函数注入并配合 `readonly` 修饰符。

**示例：**

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

---

## 服务层模式

### 仓储模式

使用 `@InjectRepository` 装饰器和 `EntityRepository` 类型。

**示例：**

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

### EntityManager 访问

使用私有 getter 访问 EntityManager。

**示例：**

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

---

## 控制器层模式

### 装饰器顺序

控制器装饰器应按此顺序排列：

1. `@Controller()`
2. `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`
3. `@Body()`, `@Param()`, `@Query()`, `@Headers()`, `@Req()`
4. `@HttpCode()`, `@Header()`

**示例：**

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

### 响应格式

始终返回类型化的响应。

**示例：**

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

---

## 实体定义

### 实体结构

**示例：**

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

### 实体字段类型

使用正确的 TypeScript 类型：

-   `string` - 用于文本
-   `number` - 用于数值
-   `boolean` - 用于标志
-   `Date` - 用于时间戳
-   `enum` - 用于枚举值

**示例：**

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

---

## 模块定义

**示例：**

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

---

## 测试规范

### 测试文件位置

-   单元测试与被测文件同目录，命名格式 `{filename}.spec.ts`
-   集成测试放置在 `tests/integration/`
-   端到端测试放置在 `tests/e2e/`

### 测试覆盖率要求

-   核心业务逻辑测试覆盖率须达到 80% 以上
-   关键路径测试覆盖率须达到 90% 以上
-   所有公共 API 必须具备测试用例

### 测试文件示例

**示例：**

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

---

## 最佳实践

1. **始终对数据库操作使用 async/await**
2. **使用 DTO 进行输入验证**（配合 class-validator）
3. **对多步骤操作使用事务**
4. **处理边界情况** - null 检查、空数组等
5. **使用 NestJS Logger 记录重要操作**，日志消息使用中文
6. **绝不记录敏感数据** - 密码、令牌等
7. **使用环境变量进行配置**
8. **保持方法简洁专注** - 单一职责
9. **使用有意义的变量名** - 避免单字母（循环除外），并添加中文注释说明业务语义
10. **为公共 API 添加完整的 TSDoc 注释**
11. **Git 提交信息使用英文描述**
12. **核心业务逻辑测试覆盖率达到 80% 以上**
13. **优先重用 `@oksai` 项目的代码，不要重复造轮子**

**示例：**

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

---

## 版本信息

-   **文档版本：** 1.0.0
-   **最后更新：** 2026-02-04
-   **维护者：** OKSAI 平台团队
