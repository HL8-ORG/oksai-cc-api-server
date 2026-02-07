# OKSAI 插件系统优化方案

> **版本**: v1.0.0
> **创建日期**: 2026-02-07
> **基于评估版本**: 3.8/5 (良好但需要改进)

---

## 一、执行摘要

### 1.1 优化目标

将 OKSAI 插件系统从 **3.8/5 (良好)** 提升至 **4.5/5 (优秀)**，重点解决以下核心问题：

| 问题类别 | 当前状态              | 目标状态                | 优先级 |
| -------- | --------------------- | ----------------------- | ------ |
| 测试执行 | ⚠️ 0/17 Auth 测试通过 | ✅ 15/17+ 测试通过      | 🔴 高  |
| E2E 测试 | ❌ 无法运行           | ✅ 82 个测试用例执行    | 🔴 高  |
| 可观测性 | ⚠️ 内存存储指标       | ✅ Prometheus + Grafana | 🟡 中  |
| 权限控制 | ❌ 无 RBAC            | ✅ 完整的 RBAC 系统     | 🟡 中  |
| 缓存机制 | ❌ 无缓存             | ✅ Redis 缓存层         | 🟡 中  |
| 插件管理 | ❌ 无 UI              | ✅ 插件管理界面         | 🟠 低  |
| CI/CD    | ❌ 无自动化流水线     | ✅ 完整 CI/CD           | 🟡 中  |

### 1.2 预期收益

| 指标       | 当前值 | 目标值 | 提升幅度 |
| ---------- | ------ | ------ | -------- |
| 测试覆盖率 | 30%    | 80%+   | +50%     |
| 系统可靠性 | B 级   | A 级   | 提升     |
| 运维效率   | 低     | 高     | 显著提升 |
| 开发效率   | 中     | 高     | 显著提升 |

### 1.3 实施时间表

```
第 1 周: 🔴 测试修复 (高优先级)
第 2-4 周: 🟡 中优先级任务
第 5-8 周: 🟠 低优先级任务
第 9-12 周: 持续优化和文档完善
```

---

## 二、优化策略

### 2.1 分阶段实施策略

#### 阶段一：紧急修复 (第 1 周) 🔴

**目标**: 恢复测试系统正常运行

1. 修复 Jest 配置问题
2. 解决 Auth/Tenant/User 测试阻塞
3. 确保 E2E 测试可以运行

#### 阶段二：核心增强 (第 2-4 周) 🟡

**目标**: 提升系统核心能力

1. 集成 Prometheus + Grafana
2. 实现 RBAC 权限系统
3. 添加 Redis 缓存层
4. 建立 CI/CD 流水线

#### 阶段三：功能扩展 (第 5-8 周) 🟠

**目标**: 扩展系统能力

1. 实现插件热重载
2. 开发插件管理 UI
3. 实现插件市场基础
4. 添加审计日志系统

#### 阶段四：持续优化 (第 9-12 周)

**目标**: 长期稳定和持续改进

1. 性能优化
2. 文档完善
3. 安全加固
4. 用户体验改进

### 2.2 技术选型

| 需求   | 技术选型                      | 理由               |
| ------ | ----------------------------- | ------------------ |
| 监控   | Prometheus + Grafana          | 业界标准，生态丰富 |
| 缓存   | Redis                         | 高性能，广泛使用   |
| 权限   | CASL                          | 灵活的 RBAC 实现   |
| CI/CD  | GitHub Actions                | 与 GitHub 集成良好 |
| 测试   | Jest + Supertest              | 已有基础，无需更换 |
| 热重载 | Webpack HMR + NestJS 动态模块 | 支持运行时模块加载 |

---

## 三、详细优化计划

### 3.1 阶段一：紧急修复 (第 1 周) 🔴

#### 3.1.1 修复 Jest 配置问题

**当前问题**:

-   E2E 测试文件未被 Jest 识别
-   `testMatch` patterns 配置错误
-   测试文件路径映射不正确

**技术方案**:

1. **更新 Jest 配置** (`jest.config.js`):

```javascript
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/libs', '<rootDir>/apps/base-api'],
	testMatch: [
		'**/__tests__/**/*.spec.ts',
		'**/?(*.)+(spec|test).ts',
		'**/e2e/**/*.e2e-spec.ts' // 添加 E2E 测试匹配
	],
	moduleNameMapper: {
		'^@oksai/(.*)$': '<rootDir>/libs/$1/src',
		'^@app/(.*)$': '<rootDir>/apps/base-api/src/$1'
	},
	collectCoverageFrom: [
		'libs/**/*.ts',
		'apps/base-api/src/**/*.ts',
		'!**/*.spec.ts',
		'!**/*.e2e-spec.ts',
		'!**/node_modules/**',
		'!**/dist/**'
	],
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 75,
			lines: 75,
			statements: 75
		}
	}
};
```

2. **修复 E2E 测试目录结构**:

```bash
# 确保测试文件位于正确的位置
apps/base-api/test/
├── e2e/
│   ├── auth.e2e-spec.ts
│   ├── user.e2e-spec.ts
│   ├── tenant.e2e-spec.ts
│   ├── analytics.e2e-spec.ts
│   └── reporting.e2e-spec.ts
```

3. **更新测试脚本** (`package.json`):

```json
{
	"scripts": {
		"test": "jest",
		"test:e2e": "jest --config jest.e2e.config.js",
		"test:cov": "jest --coverage",
		"test:watch": "jest --watch"
	}
}
```

**验收标准**:

-   ✅ 所有 E2E 测试文件被 Jest 识别
-   ✅ `pnpm test` 可以运行所有单元测试
-   ✅ `pnpm run test:e2e` 可以运行所有 E2E 测试
-   ✅ 测试覆盖率报告可以生成

**时间估算**: 2-3 小时

**风险**: 低

-   Jest 配置调整是标准操作
-   已有测试文件，只需修复配置

---

#### 3.1.2 修复 Auth/Tenant/User 测试 Mock 配置

**当前问题**:

-   Auth Plugin 测试: 0/17 通过
-   Jest mock 配置复杂导致测试失败
-   依赖注入的 Repository Mock 不正确

**技术方案**:

1. **使用 `getRepositoryToken` 替换手动 Mock**:

创建统一的测试辅助工具 (`libs/common/src/testing/test-helpers.ts`):

```typescript
import { getRepositoryToken } from '@nestjs/mikro-orm';
import { EntityRepository } from '@mikro-orm/core';

export function createMockRepository<T = any>(partial: Partial<EntityRepository<T>> = {}): EntityRepository<T> {
	return {
		findOne: jest.fn(),
		find: jest.fn(),
		create: jest.fn(),
		persist: jest.fn(),
		flush: jest.fn(),
		persistAndFlush: jest.fn(),
		getEntityManager: jest.fn(),
		...partial
	} as any;
}

export const createMockUserRepository = () =>
	createMockRepository({
		findOne: jest.fn().mockResolvedValue(null),
		create: jest.fn().mockReturnValue({
			id: 'mock-id',
			email: 'test@example.com'
		})
	});
```

2. **修复 Auth Service 测试**:

更新 `libs/auth/src/auth.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '@oksai/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/mikro-orm';
import { createMockUserRepository } from '@oksai/common/testing/test-helpers';

describe('AuthService', () => {
	let service: AuthService;
	let userRepo: any;

	beforeEach(async () => {
		jest.clearAllMocks();

		// 创建 Mock Repository
		userRepo = createMockUserRepository();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: getRepositoryToken(User),
					useValue: userRepo
				}
			]
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	describe('login', () => {
		it('should return tokens for valid credentials', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
				password: 'hashed-password'
			};

			// Mock 查找用户
			userRepo.findOne.mockResolvedValue(mockUser);
			// Mock 密码验证
			jest.spyOn(service as any, 'verifyPassword').mockResolvedValue(true);

			const result = await service.login({
				email: 'test@example.com',
				password: 'password123'
			});

			expect(result).toHaveProperty('accessToken');
			expect(result).toHaveProperty('refreshToken');
			expect(result.user.email).toBe('test@example.com');
		});

		it('should throw UnauthorizedException for invalid credentials', async () => {
			userRepo.findOne.mockResolvedValue(null);

			await expect(
				service.login({
					email: 'nonexistent@example.com',
					password: 'password123'
				})
			).rejects.toThrow('用户名或密码错误');
		});
	});

	// ... 其他测试用例
});
```

3. **修复 Tenant Service 测试**:

更新 `libs/tenant/src/tenant.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { getRepositoryToken } from '@nestjs/mikro-orm';
import { createMockRepository } from '@oksai/common/testing/test-helpers';

describe('TenantService', () => {
	let service: TenantService;
	let tenantRepo: any;

	beforeEach(async () => {
		jest.clearAllMocks();

		tenantRepo = createMockRepository({
			findOne: jest.fn().mockResolvedValue(null),
			create: jest.fn().mockReturnValue({
				id: 'tenant-1',
				slug: 'test-tenant',
				name: 'Test Tenant'
			})
		});

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TenantService,
				{
					provide: getRepositoryToken(Tenant),
					useValue: tenantRepo
				}
			]
		}).compile();

		service = module.get<TenantService>(TenantService);
	});

	describe('createTenant', () => {
		it('should create tenant with valid data', async () => {
			const dto = {
				slug: 'test-tenant',
				name: 'Test Tenant',
				description: 'Test description'
			};

			const result = await service.createTenant(dto);

			expect(tenantRepo.create).toHaveBeenCalledWith({
				...dto,
				status: TenantStatus.ACTIVE,
				type: TenantType.ORGANIZATION
			});
			expect(result.slug).toBe('test-tenant');
		});

		it('should throw BadRequestException if slug already exists', async () => {
			const dto = {
				slug: 'existing-tenant',
				name: 'Test Tenant',
				description: 'Test description'
			};

			tenantRepo.findOne.mockResolvedValue({
				id: 'existing-id',
				slug: 'existing-tenant'
			});

			await expect(service.createTenant(dto)).rejects.toThrow('租户标识已存在');
		});
	});

	// ... 其他测试用例
});
```

4. **修复 User Service 测试**:

使用类似的方法更新 `libs/user/src/user.service.spec.ts`。

**验收标准**:

-   ✅ Auth Plugin 测试: 12+/17 通过
-   ✅ Tenant Plugin 测试: 8+/10 通过
-   ✅ User Plugin 测试: 10+/12 通过
-   ✅ 所有测试使用统一的 Mock 辅助工具
-   ✅ 测试报告清晰易读

**时间估算**: 4-6 小时

**风险**: 中

-   Mock 配置可能需要多次调整
-   部分测试可能依赖真实数据，需要重构

---

#### 3.1.3 确保 E2E 测试可以运行

**当前问题**:

-   E2E 测试文件未被识别
-   测试辅助工具可能需要调整
-   数据库配置可能不正确

**技术方案**:

1. **创建 E2E 测试配置** (`apps/base-api/jest.e2e.config.js`):

```javascript
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	testMatch: ['**/*.e2e-spec.ts'],
	moduleNameMapper: {
		'^@oksai/(.*)$': '<rootDir>/../../libs/$1/src',
		'^@app/(.*)$': '<rootDir>/src/$1'
	},
	setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
	testTimeout: 30000
};
```

2. **更新 TestHelper**:

```typescript
// apps/base-api/test/helpers/test-helper.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../src/app.module';

export class TestHelper {
	private static app: INestApplication;
	private static orm: MikroORM;

	static async setup(): Promise<INestApplication> {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		this.app = moduleFixture.createNestApplication();
		this.orm = this.app.get<MikroORM>(MikroORM);

		// 应用全局管道
		this.app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				transform: true
			})
		);

		// 刷新数据库
		await this.orm.getSchemaGenerator().refreshDatabase();

		await this.app.init();

		return this.app;
	}

	static async teardown(): Promise<void> {
		if (this.orm) {
			await this.orm.close();
		}
		if (this.app) {
			await this.app.close();
		}
	}

	static getApp(): INestApplication {
		return this.app;
	}

	static getOrm(): MikroORM {
		return this.orm;
	}

	static async insertTestData(): Promise<void> {
		const em = this.orm.em;
		// 插入测试数据
		// ...
	}

	static async clearDatabase(): Promise<void> {
		await this.orm.getSchemaGenerator().clearDatabase();
	}
}
```

3. **创建测试 setup 文件**:

```typescript
// apps/base-api/test/setup.ts
beforeAll(async () => {
	// 全局测试设置
});

afterAll(async () => {
	// 全局测试清理
});
```

4. **验证 E2E 测试可以运行**:

```bash
cd apps/base-api
pnpm run test:e2e
```

**验收标准**:

-   ✅ E2E 测试可以成功运行
-   ✅ 82 个测试用例可以执行
-   ✅ 测试报告清晰显示结果
-   ✅ 数据库自动 setup/teardown 正常工作

**时间估算**: 2-3 小时

**风险**: 低

-   主要是配置调整
-   已有测试框架，只需修复

---

### 3.2 阶段二：核心增强 (第 2-4 周) 🟡

#### 3.2.1 集成 Prometheus + Grafana

**目标**: 实现指标持久化和监控可视化

**当前状态**:

-   ✅ MetricsService 已实现 (内存存储)
-   ❌ 无外部监控系统
-   ❌ 重启后指标丢失

**技术方案**:

1. **安装 Prometheus 客户端**:

```bash
cd libs/common
pnpm add prom-client
pnpm add -D @types/prom-client
```

2. **创建 Prometheus 适配器**:

`libs/common/src/monitoring/prometheus.adapter.ts`:

```typescript
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus 监控适配器
 *
 * 提供指标收集和导出功能
 */
@Injectable()
export class PrometheusAdapter implements OnModuleDestroy {
	private readonly registry: Registry;
	private readonly httpRequestDuration: Histogram<string>;
	private readonly httpRequestCounter: Counter<string>;
	private readonly httpRequestErrors: Counter<string>;
	private readonly activeConnections: Gauge<string>;

	constructor() {
		// 创建自定义注册表
		this.registry = new Registry();

		// 收集默认指标（CPU, 内存等）
		collectDefaultMetrics({ register: this.registry });

		// 请求持续时间直方图
		this.httpRequestDuration = new Histogram({
			name: 'http_request_duration_seconds',
			help: 'HTTP 请求持续时间（秒）',
			labelNames: ['method', 'route', 'status_code'],
			buckets: [0.1, 0.5, 1, 2, 5, 10],
			registers: [this.registry]
		});

		// 请求总数计数器
		this.httpRequestCounter = new Counter({
			name: 'http_requests_total',
			help: 'HTTP 请求总数',
			labelNames: ['method', 'route', 'status_code'],
			registers: [this.registry]
		});

		// 请求错误计数器
		this.httpRequestErrors = new Counter({
			name: 'http_request_errors_total',
			help: 'HTTP 请求错误总数',
			labelNames: ['method', 'route', 'error_type'],
			registers: [this.registry]
		});

		// 活跃连接数
		this.activeConnections = new Gauge({
			name: 'active_connections',
			help: '当前活跃连接数',
			registers: [this.registry]
		});
	}

	/**
	 * 记录 HTTP 请求持续时间
	 *
	 * @param method - HTTP 方法
	 * @param route - 请求路由
	 * @param statusCode - 响应状态码
	 * @param duration - 持续时间（秒）
	 */
	recordRequestDuration(method: string, route: string, statusCode: number, duration: number): void {
		this.httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration);
	}

	/**
	 * 增加 HTTP 请求计数
	 *
	 * @param method - HTTP 方法
	 * @param route - 请求路由
	 * @param statusCode - 响应状态码
	 */
	incrementRequestCount(method: string, route: string, statusCode: number): void {
		this.httpRequestCounter.inc({
			method,
			route,
			status_code: statusCode.toString()
		});
	}

	/**
	 * 增加 HTTP 错误计数
	 *
	 * @param method - HTTP 方法
	 * @param route - 请求路由
	 * @param errorType - 错误类型
	 */
	incrementErrorCount(method: string, route: string, errorType: string): void {
		this.httpRequestErrors.inc({ method, route, error_type: errorType });
	}

	/**
	 * 设置活跃连接数
	 *
	 * @param count - 连接数
	 */
	setActiveConnections(count: number): void {
		this.activeConnections.set(count);
	}

	/**
	 * 获取 Prometheus 指标
	 *
	 * @returns 指标数据
	 */
	async getMetrics(): Promise<string> {
		return await this.registry.metrics();
	}

	/**
	 * 模块销毁时清理
	 */
	async onModuleDestroy(): Promise<void> {
		await this.registry.clear();
	}
}
```

3. **创建 Prometheus 端点控制器**:

`libs/common/src/monitoring/prometheus.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { PrometheusAdapter } from './prometheus.adapter';

/**
 * Prometheus 监控控制器
 *
 * 提供 Prometheus 指标导出端点
 */
@Controller('metrics')
export class PrometheusController {
	constructor(private readonly prometheusAdapter: PrometheusAdapter) {}

	/**
	 * 导出 Prometheus 指标
	 *
	 * @returns Prometheus 指标数据
	 */
	@Get()
	async getMetrics(): Promise<string> {
		return await this.prometheusAdapter.getMetrics();
	}
}
```

4. **创建 Prometheus 模块**:

`libs/common/src/monitoring/prometheus.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PrometheusAdapter } from './prometheus.adapter';
import { PrometheusController } from './prometheus.controller';

@Module({
	providers: [PrometheusAdapter],
	controllers: [PrometheusController],
	exports: [PrometheusAdapter]
})
export class PrometheusModule {}
```

5. **更新 MetricsService 集成 Prometheus**:

修改 `libs/common/src/middleware/metrics.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrometheusAdapter } from '../monitoring/prometheus.adapter';

@Injectable()
export class MetricsService {
	constructor(private readonly prometheusAdapter: PrometheusAdapter) {}

	/**
	 * 记录 HTTP 请求
	 *
	 * @param duration - 请求持续时间（毫秒）
	 * @param route - 请求路由
	 * @param statusCode - 响应状态码
	 * @param error - 错误对象（如果有）
	 */
	async trackRequest(duration: number, route: string, statusCode: number, error?: Error): Promise<void> {
		const durationInSeconds = duration / 1000;

		// 记录到 Prometheus
		this.prometheusAdapter.recordRequestDuration('GET', route, statusCode, durationInSeconds);
		this.prometheusAdapter.incrementRequestCount('GET', route, statusCode);

		if (error) {
			this.prometheusAdapter.incrementErrorCount('GET', route, error.constructor.name);
		}

		// ... 原有的内存存储逻辑（保留）
	}
}
```

6. **配置 Docker Compose**:

`docker-compose.yml`:

```yaml
version: '3.8'

services:
    app:
        build: .
        ports:
            - '3000:3000'
        environment:
            - NODE_ENV=production
            - DATABASE_URL=postgresql://user:password@postgres:5432/oksai
        depends_on:
            - postgres
            - redis
            - prometheus
            - grafana

    postgres:
        image: postgres:15
        environment:
            POSTGRES_USER: user
            POSTGRES_PASSWORD: password
            POSTGRES_DB: oksai
        ports:
            - '5432:5432'
        volumes:
            - postgres_data:/var/lib/postgresql/data

    redis:
        image: redis:7
        ports:
            - '6379:6379'
        volumes:
            - redis_data:/data

    prometheus:
        image: prom/prometheus:latest
        ports:
            - '9090:9090'
        volumes:
            - ./prometheus.yml:/etc/prometheus/prometheus.yml
            - prometheus_data:/prometheus
        command:
            - '--config.file=/etc/prometheus/prometheus.yml'
            - '--storage.tsdb.path=/prometheus'

    grafana:
        image: grafana/grafana:latest
        ports:
            - '3001:3000'
        environment:
            - GF_SECURITY_ADMIN_USER=admin
            - GF_SECURITY_ADMIN_PASSWORD=admin
        volumes:
            - grafana_data:/var/lib/grafana
        depends_on:
            - prometheus

volumes:
    postgres_data:
    redis_data:
    prometheus_data:
    grafana_data:
```

7. **配置 Prometheus**:

`prometheus.yml`:

```yaml
global:
    scrape_interval: 15s
    evaluation_interval: 15s

scrape_configs:
    - job_name: 'oksai-api'
      static_configs:
          - targets: ['app:3000']
      metrics_path: '/metrics'
```

8. **导入 Grafana 仪表板**:

创建 `grafana-dashboard.json` 并导入到 Grafana：

包含以下面板：

-   请求速率（requests/min）
-   平均响应时间
-   错误率
-   P95/P99 响应时间
-   活跃连接数
-   CPU/内存使用率

**验收标准**:

-   ✅ Prometheus 成功采集指标
-   ✅ Grafana 仪表板显示实时数据
-   ✅ HTTP 请求指标完整记录
-   ✅ 错误指标正确分类
-   ✅ 性能指标趋势可见

**时间估算**: 8-12 小时

**风险**: 低

-   Prometheus 和 Grafana 都是成熟工具
-   已有 MetricsService 基础

---

#### 3.2.2 实现 RBAC 权限系统

**目标**: 实现基于角色的访问控制

**当前状态**:

-   ❌ 无权限控制
-   ✅ OAuth 认证已完成
-   ⚠️ 插件有 `permissions` 字段但未使用

**技术方案**:

1. **安装 CASL**:

```bash
cd libs/auth
pnpm add @casl/ability
pnpm add -D @types/casl__ability
```

2. **创建权限实体**:

`libs/auth/src/entities/permission.entity.ts`:

```typescript
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';
import { Role } from './role.entity';

/**
 * 权限实体
 *
 * 定义系统中的具体权限
 */
@Entity()
export class Permission extends BaseEntity {
	@PrimaryKey()
	id: string = randomUUID();

	/**
	 * 权限代码
	 *
	 * 格式: resource:action
	 * 例如: users:read, users:write, tenants:delete
	 */
	@Property({ unique: true, nullable: false })
	code!: string;

	/**
	 * 权限名称
	 */
	@Property({ nullable: false })
	name!: string;

	/**
	 * 权限描述
	 */
	@Property({ nullable: true })
	description?: string;

	/**
	 * 所属角色
	 */
	@ManyToOne(() => Role)
	role!: Role;
}
```

3. **创建角色实体**:

`libs/auth/src/entities/role.entity.ts`:

```typescript
import { Entity, PrimaryKey, Property, ManyToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';
import { Permission } from './permission.entity';
import { User } from '@oksai/user/entities/user.entity';

/**
 * 角色实体
 *
 * 定义用户角色
 */
@Entity()
export class Role extends BaseEntity {
	@PrimaryKey()
	id: string = randomUUID();

	/**
	 * 角色代码
	 *
	 * 例如: admin, user, tenant_admin
	 */
	@Property({ unique: true, nullable: false })
	code!: string;

	/**
	 * 角色名称
	 */
	@Property({ nullable: false })
	name!: string;

	/**
	 * 角色描述
	 */
	@Property({ nullable: true })
	description?: string;

	/**
	 * 角色权限
	 */
	@ManyToMany(() => Permission)
	permissions = new Collection<Permission>(this);

	/**
	 * 角色用户
	 */
	@ManyToMany(() => User, (user) => user.roles)
	users = new Collection<User>(this);
}
```

4. **创建 Ability Factory**:

`libs/auth/src/abilities/ability.factory.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AbilityBuilder, Ability, AbilityClass, createMongoAbility } from '@casl/ability';
import { User } from '@oksai/user/entities/user.entity';
import { Permission } from '../entities/permission.entity';

/**
 * 动作类型
 */
export enum Action {
	MANAGE = 'manage',
	CREATE = 'create',
	READ = 'read',
	UPDATE = 'update',
	DELETE = 'delete'
}

/**
 * 主体类型
 */
export type Subjects = 'all' | 'User' | 'Tenant' | 'Plugin';

export type AppAbility = Ability<[Action, Subjects]>;

/**
 * 能力工厂
 *
 * 根据用户权限创建 Ability 对象
 */
@Injectable()
export class AbilityFactory {
	/**
	 * 为用户创建 Ability
	 *
	 * @param user - 用户对象
	 * @returns Ability 对象
	 */
	createForUser(user: User): AppAbility {
		const { can, cannot, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(createMongoAbility);

		// 超级管理员拥有所有权限
		if (user.roles?.some((role) => role.code === 'admin')) {
			can(Action.MANAGE, 'all');
			return build();
		}

		// 获取用户的所有权限
		const permissions = user.roles?.flatMap((role) => role.permissions.getItems().map((p) => p.code)) || [];

		// 根据权限授予权限
		permissions.forEach((permission) => {
			const [resource, action] = permission.split(':');

			switch (action) {
				case 'read':
					can(Action.READ, (resource.charAt(0).toUpperCase() + resource.slice(1)) as Subjects);
					break;
				case 'write':
					can(
						[Action.CREATE, Action.UPDATE],
						(resource.charAt(0).toUpperCase() + resource.slice(1)) as Subjects
					);
					break;
				case 'delete':
					can(Action.DELETE, (resource.charAt(0).toUpperCase() + resource.slice(1)) as Subjects);
					break;
				case 'manage':
					can(Action.MANAGE, (resource.charAt(0).toUpperCase() + resource.slice(1)) as Subjects);
					break;
			}
		});

		// 默认禁止
		cannot(Action.DELETE, 'User', { id: user.id });

		return build();
	}
}
```

5. **创建权限守卫**:

`libs/auth/src/guards/permissions.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory, Action, Subjects } from '../abilities/ability.factory';
import { PERMISSIONS_KEY, RequirePermissions } from '../decorators/permissions.decorator';

/**
 * 权限守卫
 *
 * 检查用户是否具有执行操作所需的所有权限
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private reflector: Reflector, private abilityFactory: AbilityFactory) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredPermissions = this.reflector.getAllAndOverride<RequirePermissions>(PERMISSIONS_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		if (!requiredPermissions) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest();

		if (!user) {
			throw new ForbiddenException('未登录用户无法访问此资源');
		}

		const ability = this.abilityFactory.createForUser(user);

		// 检查用户是否具有所有必需的权限
		for (const requiredPermission of requiredPermissions.permissions) {
			const [action, subject] = requiredPermission.split(':');

			if (!ability.can(action as Action, subject as Subjects)) {
				throw new ForbiddenException(`您没有执行 ${action} 操作的权限，需要权限: ${requiredPermission}`);
			}
		}

		return true;
	}
}
```

6. **创建权限装饰器**:

`libs/auth/src/decorators/permissions.decorator.ts`:

````typescript
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * 需要的权限接口
 */
export interface RequirePermissions {
	permissions: string[];
}

/**
 * 权限装饰器
 *
 * 用于标记需要特定权限的路由
 *
 * @example
 * ```typescript
 * @RequirePermissions({
 *   permissions: ['users:read', 'users:write']
 * })
 * @Get('users')
 * async getUsers() {
 *   return this.userService.findAll();
 * }
 * ```
 */
export const RequirePermissions = (permissions: string[]) => SetMetadata(PERMISSIONS_KEY, { permissions });
````

7. **创建权限服务**:

`libs/auth/src/permissions.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';

/**
 * 权限服务
 *
 * 管理系统权限和角色
 */
@Injectable()
export class PermissionsService {
	constructor(
		@InjectRepository(Permission)
		private readonly permissionRepo: EntityRepository<Permission>,
		@InjectRepository(Role)
		private readonly roleRepo: EntityRepository<Role>
	) {}

	/**
	 * 创建权限
	 *
	 * @param data - 权限创建数据
	 * @returns 已创建的权限
	 */
	async createPermission(data: CreatePermissionDto): Promise<Permission> {
		const existing = await this.permissionRepo.findOne({ code: data.code });
		if (existing) {
			throw new BadRequestException('权限代码已存在');
		}

		const permission = this.permissionRepo.create(data);
		await this.em.persistAndFlush(permission);
		return permission;
	}

	/**
	 * 创建角色
	 *
	 * @param data - 角色创建数据
	 * @returns 已创建的角色
	 */
	async createRole(data: CreateRoleDto): Promise<Role> {
		const existing = await this.roleRepo.findOne({ code: data.code });
		if (existing) {
			throw new BadRequestException('角色代码已存在');
		}

		const role = this.roleRepo.create({
			...data,
			permissions: data.permissionCodes
				? await this.permissionRepo.find({
						code: { $in: data.permissionCodes }
				  })
				: []
		});

		await this.em.persistAndFlush(role);
		return role;
	}

	/**
	 * 为角色添加权限
	 *
	 * @param roleId - 角色 ID
	 * @param permissionCode - 权限代码
	 * @returns 更新后的角色
	 */
	async addPermissionToRole(roleId: string, permissionCode: string): Promise<Role> {
		const role = await this.roleRepo.findOne({ id: roleId });
		if (!role) {
			throw new NotFoundException('未找到该角色');
		}

		const permission = await this.permissionRepo.findOne({ code: permissionCode });
		if (!permission) {
			throw new NotFoundException('未找到该权限');
		}

		if (role.permissions.contains(permission)) {
			throw new BadRequestException('该角色已拥有此权限');
		}

		role.permissions.add(permission);
		await this.em.persistAndFlush(role);
		return role;
	}

	/**
	 * 为用户分配角色
	 *
	 * @param userId - 用户 ID
	 * @param roleId - 角色 ID
	 * @returns 更新后的用户
	 */
	async assignRoleToUser(userId: string, roleId: string): Promise<User> {
		const user = await this.userRepo.findOne({ id: userId });
		if (!user) {
			throw new NotFoundException('未找到该用户');
		}

		const role = await this.roleRepo.findOne({ id: roleId });
		if (!role) {
			throw new NotFoundException('未找到该角色');
		}

		user.roles?.add(role);
		await this.em.persistAndFlush(user);
		return user;
	}

	/**
	 * 初始化默认角色和权限
	 */
	async initializeDefaultRolesAndPermissions(): Promise<void> {
		// 创建默认权限
		const defaultPermissions = [
			// 用户权限
			{ code: 'users:read', name: '读取用户' },
			{ code: 'users:write', name: '创建/更新用户' },
			{ code: 'users:delete', name: '删除用户' },
			// 租户权限
			{ code: 'tenants:read', name: '读取租户' },
			{ code: 'tenants:write', name: '创建/更新租户' },
			{ code: 'tenants:delete', name: '删除租户' },
			// 插件权限
			{ code: 'plugins:read', name: '读取插件' },
			{ code: 'plugins:write', name: '创建/更新插件' },
			{ code: 'plugins:delete', name: '删除插件' },
			// 分析权限
			{ code: 'analytics:read', name: '读取分析' },
			{ code: 'analytics:write', name: '创建/更新分析' },
			// 报告权限
			{ code: 'reports:read', name: '读取报告' },
			{ code: 'reports:write', name: '创建/更新报告' },
			{ code: 'reports:delete', name: '删除报告' }
		];

		for (const permissionData of defaultPermissions) {
			const existing = await this.permissionRepo.findOne({
				code: permissionData.code
			});
			if (!existing) {
				const permission = this.permissionRepo.create(permissionData);
				await this.em.persist(permission);
			}
		}
		await this.em.flush();

		// 创建默认角色
		const adminRole = await this.roleRepo.findOne({ code: 'admin' });
		if (!adminRole) {
			const adminPermissions = await this.permissionRepo.find();
			const admin = this.roleRepo.create({
				code: 'admin',
				name: '系统管理员',
				description: '拥有所有权限的超级管理员',
				permissions: adminPermissions
			});
			await this.em.persistAndFlush(admin);
		}

		const userRole = await this.roleRepo.findOne({ code: 'user' });
		if (!userRole) {
			const userPermissions = await this.permissionRepo.find({
				code: { $in: ['analytics:read', 'reports:read'] }
			});
			const user = this.roleRepo.create({
				code: 'user',
				name: '普通用户',
				description: '普通用户角色',
				permissions: userPermissions
			});
			await this.em.persistAndFlush(user);
		}

		const tenantAdminRole = await this.roleRepo.findOne({ code: 'tenant_admin' });
		if (!tenantAdminRole) {
			const tenantAdminPermissions = await this.permissionRepo.find({
				code: {
					$in: [
						'users:read',
						'users:write',
						'tenants:read',
						'analytics:read',
						'analytics:write',
						'reports:read',
						'reports:write'
					]
				}
			});
			const tenantAdmin = this.roleRepo.create({
				code: 'tenant_admin',
				name: '租户管理员',
				description: '租户管理员角色',
				permissions: tenantAdminPermissions
			});
			await this.em.persistAndFlush(tenantAdmin);
		}
	}

	private get em() {
		return this.permissionRepo.getEntityManager();
	}
}
```

8. **创建权限控制器**:

`libs/auth/src/permissions.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RequirePermissions } from './decorators/permissions.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * 权限管理控制器
 */
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
	constructor(private readonly permissionsService: PermissionsService) {}

	/**
	 * 创建权限
	 */
	@Post()
	@RequirePermissions(['permissions:write'])
	async createPermission(@Body() data: CreatePermissionDto) {
		return this.permissionsService.createPermission(data);
	}

	/**
	 * 创建角色
	 */
	@Post('roles')
	@RequirePermissions(['roles:write'])
	async createRole(@Body() data: CreateRoleDto) {
		return this.permissionsService.createRole(data);
	}

	/**
	 * 为角色添加权限
	 */
	@Post('roles/:roleId/permissions/:permissionCode')
	@RequirePermissions(['roles:write'])
	async addPermissionToRole(@Param('roleId') roleId: string, @Param('permissionCode') permissionCode: string) {
		return this.permissionsService.addPermissionToRole(roleId, permissionCode);
	}

	/**
	 * 初始化默认角色和权限
	 */
	@Post('initialize')
	@RequirePermissions(['roles:write'])
	async initialize() {
		await this.permissionsService.initializeDefaultRolesAndPermissions();
		return { message: '默认角色和权限初始化成功' };
	}
}
```

9. **在路由中使用权限守卫**:

示例：更新 User Controller

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
	@Get()
	@RequirePermissions(['users:read'])
	async findAll() {
		return this.userService.findAll();
	}

	@Post()
	@RequirePermissions(['users:write'])
	async create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	@Delete(':id')
	@RequirePermissions(['users:delete'])
	async remove(@Param('id') id: string) {
		return this.userService.remove(id);
	}
}
```

**验收标准**:

-   ✅ 用户可以拥有多个角色
-   ✅ 角色可以包含多个权限
-   ✅ 路由可以要求特定权限
-   ✅ 权限检查在守卫中生效
-   ✅ 默认角色和权限正确初始化
-   ✅ 单元测试覆盖率 80%+

**时间估算**: 12-16 小时

**风险**: 中

-   RBAC 系统需要仔细设计权限模型
-   需要更新多个控制器和路由

---

#### 3.2.3 添加 Redis 缓存层

**目标**: 实现分布式缓存，提升性能

**当前状态**:

-   ❌ 无缓存机制
-   ✅ 每次生成报告都重新处理
-   ✅ 已有 Redis 容器（用于队列）

**技术方案**:

1. **安装 Redis 依赖**:

```bash
cd libs/common
pnpm add @nestjs/cache-manager cache-manager
pnpm add cache-manager-redis-store
pnpm add -D @types/cache-manager
```

2. **创建 Redis 缓存配置**:

`libs/common/src/cache/redis-cache.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

/**
 * Redis 缓存模块
 */
@Module({
	imports: [
		CacheModule.register({
			store: redisStore,
			host: process.env.REDIS_HOST || 'localhost',
			port: parseInt(process.env.REDIS_PORT || '6379', 10),
			password: process.env.REDIS_PASSWORD,
			ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // 1小时
			max: parseInt(process.env.REDIS_MAX || '100', 10), // 最大缓存项数
			isGlobal: true // 全局可用
		})
	],
	exports: [CacheModule]
})
export class RedisCacheModule {}
```

3. **创建缓存装饰器**:

`libs/common/src/decorators/cache.decorator.ts`:

````typescript
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cacheKey';
export const CACHE_TTL_METADATA = 'cacheTTL';

/**
 * 缓存装饰器
 *
 * 用于缓存方法返回值
 *
 * @example
 * ```typescript
 * @Cache('user:profile', 300) // 缓存5分钟
 * async getUserProfile(userId: string) {
 *   return this.userService.findById(userId);
 * }
 * ```
 */
export const Cache = (key: string, ttl?: number) => SetMetadata(CACHE_KEY_METADATA, { key, ttl });

/**
 * 清除缓存装饰器
 *
 * 用于清除指定键的缓存
 *
 * @example
 * ```typescript
 * @ClearCache('user:profile')
 * async updateUser(userId: string, data: UpdateUserDto) {
 *   return this.userService.update(userId, data);
 * }
 * ```
 */
export const ClearCache = (key: string) => SetMetadata('clearCache', key);
````

4. **创建缓存拦截器**:

`libs/common/src/interceptors/cache.interceptor.ts`:

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_SERVICE } from '@nestjs/cache-manager';
import { CACHE_KEY_METADATA, CLEAR_CACHE_KEY } from '../decorators/cache.decorator';

/**
 * 缓存拦截器
 *
 * 自动缓存和清除方法结果
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
	private readonly logger = new Logger(CacheInterceptor.name);

	constructor(private readonly reflector: Reflector, @Inject(CACHE_SERVICE) private readonly cacheManager: Cache) {}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		// 获取缓存键
		const cacheMetadata = this.reflector.get<{ key: string; ttl?: number }>(
			CACHE_KEY_METADATA,
			context.getHandler()
		);

		// 获取清除缓存键
		const clearCacheKey = this.reflector.get<string>(CLEAR_CACHE_KEY, context.getHandler());

		// 清除缓存
		if (clearCacheKey) {
			this.logger.debug(`清除缓存: ${clearCacheKey}`);
			await this.cacheManager.del(clearCacheKey);
			return next.handle();
		}

		// 如果没有缓存配置，直接执行
		if (!cacheMetadata) {
			return next.handle();
		}

		const { key, ttl } = cacheMetadata;

		// 尝试从缓存获取
		try {
			const cachedValue = await this.cacheManager.get(key);
			if (cachedValue) {
				this.logger.debug(`缓存命中: ${key}`);
				return of(cachedValue);
			}
		} catch (error) {
			this.logger.warn(`缓存获取失败: ${error.message}`);
		}

		// 缓存未命中，执行方法
		return next.handle().pipe(
			tap(async (response) => {
				try {
					await this.cacheManager.set(key, response, { ttl });
					this.logger.debug(`缓存设置: ${key}, TTL: ${ttl}s`);
				} catch (error) {
					this.logger.warn(`缓存设置失败: ${error.message}`);
				}
			})
		);
	}
}
```

5. **更新 ReportingService 添加缓存**:

修改 `libs/reporting/src/reporting.service.ts`:

```typescript
import { Cache, ClearCache } from '@oksai/common/decorators/cache.decorator';

@Injectable()
export class ReportingService {
	/**
	 * 生成报告
	 *
	 * @param reportConfig - 报告配置
	 * @returns 生成的报告
	 */
	@Cache('report:{reportConfig.id}', 3600) // 缓存1小时
	async generateReport(reportConfig: GenerateReportDto): Promise<Report> {
		// ... 现有逻辑
	}

	/**
	 * 下载报告
	 *
	 * @param reportId - 报告 ID
	 * @returns 文件流和元数据
	 */
	@Cache('report:download:{reportId}', 7200) // 缓存2小时
	async downloadReport(reportId: string): Promise<{
		stream: Readable;
		contentType: string;
		fileName: string;
	}> {
		// ... 现有逻辑
	}

	/**
	 * 更新报告
	 *
	 * @param reportId - 报告 ID
	 * @param data - 更新数据
	 * @returns 更新后的报告
	 */
	@ClearCache('report:{reportId}')
	@ClearCache('report:download:{reportId}')
	async updateReport(reportId: string, data: UpdateReportDto): Promise<Report> {
		// ... 现有逻辑
	}

	/**
	 * 删除报告
	 *
	 * @param reportId - 报告 ID
	 */
	@ClearCache('report:{reportId}')
	@ClearCache('report:download:{reportId}')
	async deleteReport(reportId: string): Promise<void> {
		// ... 现有逻辑
	}
}
```

6. **创建缓存管理服务**:

`libs/common/src/cache/cache-management.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_SERVICE } from '@nestjs/cache-manager';

/**
 * 缓存管理服务
 *
 * 提供缓存操作工具方法
 */
@Injectable()
export class CacheManagementService {
	private readonly logger = new Logger(CacheManagementService.name);

	constructor(@Inject(CACHE_SERVICE) private readonly cacheManager: Cache) {}

	/**
	 * 获取缓存值
	 *
	 * @param key - 缓存键
	 * @returns 缓存值
	 */
	async get<T>(key: string): Promise<T | undefined> {
		try {
			return await this.cacheManager.get<T>(key);
		} catch (error) {
			this.logger.warn(`获取缓存失败: ${key}, 错误: ${error.message}`);
			return undefined;
		}
	}

	/**
	 * 设置缓存值
	 *
	 * @param key - 缓存键
	 * @param value - 缓存值
	 * @param ttl - 过期时间（秒）
	 */
	async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		try {
			await this.cacheManager.set(key, value, ttl);
			this.logger.debug(`设置缓存: ${key}, TTL: ${ttl}s`);
		} catch (error) {
			this.logger.warn(`设置缓存失败: ${key}, 错误: ${error.message}`);
		}
	}

	/**
	 * 删除缓存值
	 *
	 * @param key - 缓存键
	 */
	async del(key: string): Promise<void> {
		try {
			await this.cacheManager.del(key);
			this.logger.debug(`删除缓存: ${key}`);
		} catch (error) {
			this.logger.warn(`删除缓存失败: ${key}, 错误: ${error.message}`);
		}
	}

	/**
	 * 批量删除缓存
	 *
	 * @param pattern - 键模式（如 "user:*"）
	 */
	async delPattern(pattern: string): Promise<void> {
		try {
			const keys = await this.cacheManager.store.keys(pattern);
			if (keys.length > 0) {
				await this.cacheManager.del(...keys);
				this.logger.debug(`批量删除缓存: ${pattern}, 数量: ${keys.length}`);
			}
		} catch (error) {
			this.logger.warn(`批量删除缓存失败: ${pattern}, 错误: ${error.message}`);
		}
	}

	/**
	 * 清空所有缓存
	 */
	async flush(): Promise<void> {
		try {
			await this.cacheManager.reset();
			this.logger.debug('清空所有缓存');
		} catch (error) {
			this.logger.warn(`清空缓存失败: ${error.message}`);
		}
	}

	/**
	 * 获取缓存统计信息
	 *
	 * @returns 缓存统计
	 */
	async getStats(): Promise<{
		keys: string[];
		count: number;
	}> {
		try {
			const keys = await this.cacheManager.store.keys('*');
			return {
				keys,
				count: keys.length
			};
		} catch (error) {
			this.logger.warn(`获取缓存统计失败: ${error.message}`);
			return {
				keys: [],
				count: 0
			};
		}
	}
}
```

7. **添加缓存监控指标**:

更新 `libs/common/src/monitoring/prometheus.adapter.ts`:

```typescript
export class PrometheusAdapter {
	// 添加缓存指标
	private readonly cacheHits: Counter<string>;
	private readonly cacheMisses: Counter<string>;
	private readonly cacheErrors: Counter<string>;

	constructor() {
		// 缓存命中计数器
		this.cacheHits = new Counter({
			name: 'cache_hits_total',
			help: '缓存命中总数',
			labelNames: ['key'],
			registers: [this.registry]
		});

		// 缓存未命中计数器
		this.cacheMisses = new Counter({
			name: 'cache_misses_total',
			help: '缓存未命中总数',
			labelNames: ['key'],
			registers: [this.registry]
		});

		// 缓存错误计数器
		this.cacheErrors = new Counter({
			name: 'cache_errors_total',
			help: '缓存错误总数',
			labelNames: ['key', 'error_type'],
			registers: [this.registry]
		});
	}

	recordCacheHit(key: string): void {
		this.cacheHits.inc({ key });
	}

	recordCacheMiss(key: string): void {
		this.cacheMisses.inc({ key });
	}

	recordCacheError(key: string, errorType: string): void {
		this.cacheErrors.inc({ key, error_type: errorType });
	}
}
```

**验收标准**:

-   ✅ Redis 缓存正常工作
-   ✅ 缓存装饰器有效
-   ✅ 缓存拦截器正常工作
-   ✅ 缓存命中率可监控
-   ✅ 缓存失效机制正常
-   ✅ 单元测试覆盖率 80%+

**时间估算**: 8-10 小时

**风险**: 低

-   Redis 缓存是成熟方案
-   已有 Redis 容器

---

#### 3.2.4 建立 CI/CD 流水线

**目标**: 实现自动化测试、构建和部署

**当前状态**:

-   ❌ 无 CI/CD
-   ✅ 已有 GitHub 仓库

**技术方案**:

1. **创建 GitHub Actions 工作流**:

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    # 代码质量检查
    lint:
        name: Lint
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'
                  cache: 'pnpm'

            - name: Install pnpm
              uses: pnpm/action-setup@v2
              with:
                  version: 8

            - name: Install dependencies
              run: pnpm install --frozen-lockfile

            - name: Run ESLint
              run: pnpm run lint

    # 类型检查
    typecheck:
        name: Type Check
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'
                  cache: 'pnpm'

            - name: Install pnpm
              uses: pnpm/action-setup@v2
              with:
                  version: 8

            - name: Install dependencies
              run: pnpm install --frozen-lockfile

            - name: Type check
              run: pnpm run typecheck

    # 单元测试
    test:
        name: Unit Tests
        runs-on: ubuntu-latest
        needs: [lint, typecheck]
        services:
            postgres:
                image: postgres:15
                env:
                    POSTGRES_USER: test
                    POSTGRES_PASSWORD: test
                    POSTGRES_DB: oksai_test
                ports:
                    - 5432:5432
                options: >-
                    --health-cmd pg_isready
                    --health-interval 10s
                    --health-timeout 5s
                    --health-retries 5

        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'
                  cache: 'pnpm'

            - name: Install pnpm
              uses: pnpm/action-setup@v2
              with:
                  version: 8

            - name: Install dependencies
              run: pnpm install --frozen-lockfile

            - name: Run tests
              run: pnpm test
              env:
                  DATABASE_URL: postgresql://test:test@localhost:5432/oksai_test

            - name: Upload coverage
              uses: codecov/codecov-action@v3
              with:
                  files: ./coverage/lcov.info
                  flags: unittests
                  name: codecov-umbrella

    # E2E 测试
    e2e:
        name: E2E Tests
        runs-on: ubuntu-latest
        needs: [test]
        services:
            postgres:
                image: postgres:15
                env:
                    POSTGRES_USER: test
                    POSTGRES_PASSWORD: test
                    POSTGRES_DB: oksai_test
                ports:
                    - 5432:5432
                options: >-
                    --health-cmd pg_isready
                    --health-interval 10s
                    --health-timeout 5s
                    --health-retries 5

        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'
                  cache: 'pnpm'

            - name: Install pnpm
              uses: pnpm/action-setup@v2
              with:
                  version: 8

            - name: Install dependencies
              run: pnpm install --frozen-lockfile

            - name: Build
              run: pnpm run build

            - name: Run E2E tests
              run: pnpm run test:e2e
              working-directory: apps/base-api
              env:
                  DATABASE_URL: postgresql://test:test@localhost:5432/oksai_test

    # 构建
    build:
        name: Build
        runs-on: ubuntu-latest
        needs: [e2e]
        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'
                  cache: 'pnpm'

            - name: Install pnpm
              uses: pnpm/action-setup@v2
              with:
                  version: 8

            - name: Install dependencies
              run: pnpm install --frozen-lockfile

            - name: Build
              run: pnpm run build

            - name: Upload build artifacts
              uses: actions/upload-artifact@v3
              with:
                  name: build-artifacts
                  path: |
                      dist/
                      apps/*/dist/
                      libs/*/dist/
```

2. **创建部署工作流**:

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
    push:
        branches: [main]
        tags: ['v*']

jobs:
    # 部署到生产环境
    deploy-production:
        name: Deploy to Production
        runs-on: ubuntu-latest
        environment: production
        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'

            - name: Build Docker image
              run: |
                  docker build -t oksai-api:${{ github.sha }} .
                  docker tag oksai-api:${{ github.sha }} oksai-api:latest

            - name: Login to Docker Registry
              uses: docker/login-action@v2
              with:
                  registry: ${{ secrets.DOCKER_REGISTRY }}
                  username: ${{ secrets.DOCKER_USERNAME }}
                  password: ${{ secrets.DOCKER_PASSWORD }}

            - name: Push Docker image
              run: |
                  docker push oksai-api:${{ github.sha }}
                  docker push oksai-api:latest

            - name: Deploy to server
              uses: appleboy/ssh-action@v0.1.7
              with:
                  host: ${{ secrets.PRODUCTION_HOST }}
                  username: ${{ secrets.PRODUCTION_USER }}
                  key: ${{ secrets.PRODUCTION_SSH_KEY }}
                  script: |
                      cd /opt/oksai
                      docker-compose pull
                      docker-compose up -d
                      docker system prune -f

    # 部署到预发布环境
    deploy-staging:
        name: Deploy to Staging
        runs-on: ubuntu-latest
        environment: staging
        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'

            - name: Build Docker image
              run: |
                  docker build -t oksai-api:staging .

            - name: Login to Docker Registry
              uses: docker/login-action@v2
              with:
                  registry: ${{ secrets.DOCKER_REGISTRY }}
                  username: ${{ secrets.DOCKER_USERNAME }}
                  password: ${ { secrets.DOCKER_PASSWORD } }

            - name: Push Docker image
              run: docker push oksai-api:staging

            - name: Deploy to server
              uses: appleboy/ssh-action@v0.1.7
              with:
                  host: ${{ secrets.STAGING_HOST }}
                  username: ${{ secrets.STAGING_USER }}
                  key: ${{ secrets.STAGING_SSH_KEY }}
                  script: |
                      cd /opt/oksai-staging
                      docker-compose pull
                      docker-compose up -d
```

3. **配置 GitHub Secrets**:

需要在 GitHub 仓库中配置以下 Secrets：

**生产环境**:

-   `PRODUCTION_HOST`: 生产服务器地址
-   `PRODUCTION_USER`: 生产服务器用户名
-   `PRODUCTION_SSH_KEY`: 生产服务器 SSH 密钥
-   `DOCKER_REGISTRY`: Docker 镜像仓库地址
-   `DOCKER_USERNAME`: Docker 仓库用户名
-   `DOCKER_PASSWORD`: Docker 仓库密码

**预发布环境**:

-   `STAGING_HOST`: 预发布服务器地址
-   `STAGING_USER`: 预发布服务器用户名
-   `STAGING_SSH_KEY`: 预发布服务器 SSH 密钥

4. **创建质量门禁**:

`.github/workflows/quality-gate.yml`:

```yaml
name: Quality Gate

on:
    pull_request:
        branches: [main, develop]

jobs:
    quality-gate:
        name: Quality Gate
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'

            - name: Check test coverage
              run: |
                  COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
                  if (( $(echo "$COVERAGE < 80" | bc -l) )); then
                    echo "测试覆盖率不足 80%: $COVERAGE%"
                    exit 1
                  fi
                  echo "测试覆盖率通过: $COVERAGE%"

            - name: Check for TODO comments
              run: |
                  TODO_COUNT=$(grep -r "TODO" --include="*.ts" libs/ apps/ | wc -l)
                  if [ "$TODO_COUNT" -gt 10 ]; then
                    echo "代码中存在过多的 TODO 注释: $TODO_COUNT"
                    exit 1
                  fi

            - name: Check file sizes
              run: |
                  for file in $(find libs/ apps/ -name "*.ts" -type f); do
                    LINES=$(wc -l < "$file")
                    if [ "$LINES" -gt 500 ]; then
                      echo "文件 $file 过大 ($LINES 行)"
                      exit 1
                    fi
                  done
```

5. **创建 Dockerfile**:

`Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@8

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY libs/ libs/
COPY apps/ apps/

# 构建
RUN pnpm run build

# 生产镜像
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@8

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# 仅安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/base-api/dist ./apps/base-api/dist
COPY --from=builder /app/libs/*/dist ./libs/*/dist

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "apps/base-api/dist/main.js"]
```

6. **创建 Docker Compose 配置**:

更新 `docker-compose.yml`:

```yaml
version: '3.8'

services:
    app:
        build: .
        ports:
            - '3000:3000'
        environment:
            - NODE_ENV=production
            - DATABASE_URL=postgresql://user:password@postgres:5432/oksai
            - REDIS_URL=redis://redis:6379
        depends_on:
            postgres:
                condition: service_healthy
            redis:
                condition: service_healthy
        restart: unless-stopped
        healthcheck:
            test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
            interval: 30s
            timeout: 10s
            retries: 3

    postgres:
        image: postgres:15
        environment:
            POSTGRES_USER: user
            POSTGRES_PASSWORD: password
            POSTGRES_DB: oksai
        ports:
            - '5432:5432'
        volumes:
            - postgres_data:/var/lib/postgresql/data
        restart: unless-stopped
        healthcheck:
            test: ['CMD-SHELL', 'pg_isready -U user -d oksai']
            interval: 10s
            timeout: 5s
            retries: 5

    redis:
        image: redis:7
        ports:
            - '6379:6379'
        volumes:
            - redis_data:/data
        restart: unless-stopped
        healthcheck:
            test: ['CMD', 'redis-cli', 'ping']
            interval: 10s
            timeout: 5s
            retries: 5

    prometheus:
        image: prom/prometheus:latest
        ports:
            - '9090:9090'
        volumes:
            - ./prometheus.yml:/etc/prometheus/prometheus.yml
            - prometheus_data:/prometheus
        command:
            - '--config.file=/etc/prometheus/prometheus.yml'
            - '--storage.tsdb.path=/prometheus'
        restart: unless-stopped

    grafana:
        image: grafana/grafana:latest
        ports:
            - '3001:3000'
        environment:
            - GF_SECURITY_ADMIN_USER=admin
            - GF_SECURITY_ADMIN_PASSWORD=admin
        volumes:
            - grafana_data:/var/lib/grafana
            - ./grafana-dashboard.json:/etc/grafana/provisioning/dashboards/dashboard.json
        depends_on:
            - prometheus
        restart: unless-stopped

volumes:
    postgres_data:
    redis_data:
    prometheus_data:
    grafana_data:
```

**验收标准**:

-   ✅ CI 流水线正常工作
-   ✅ 代码提交自动运行测试
-   ✅ 代码质量门禁生效
-   ✅ 构建成功后自动部署
-   ✅ 部署成功后自动健康检查

**时间估算**: 6-8 小时

**风险**: 低

-   GitHub Actions 是成熟方案
-   已有 Docker 基础

---

### 3.3 阶段三：功能扩展 (第 5-8 周) 🟠

#### 3.3.1 实现插件热重载

**目标**: 运行时动态加载/卸载插件，无需重启应用

**当前状态**:

-   ❌ 插件只能在构建时注册
-   ❌ 无法动态加载/卸载

**技术方案**:

1. **创建动态模块加载器**:

`libs/plugin/src/dynamic/plugin-dynamic-loader.ts`:

```typescript
import { Injectable, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { IPlugin } from '../interfaces/plugin.interface';
import { PluginRegistryService } from './plugin-registry.service';

/**
 * 插件动态加载器
 *
 * 支持运行时动态加载和卸载插件
 */
@Injectable()
export class PluginDynamicLoader implements OnModuleDestroy {
	private readonly logger = new Logger(PluginDynamicLoader.name);
	private readonly loadedPlugins: Map<string, any> = new Map();
	private readonly appContext: INestApplicationContext;

	constructor(private readonly registry: PluginRegistryService, appContext: INestApplicationContext) {
		this.appContext = appContext;
	}

	/**
	 * 动态加载插件
	 *
	 * @param pluginModule - 插件模块类
	 * @returns 加载的插件实例
	 */
	async loadPlugin(pluginModule: any): Promise<IPlugin> {
		this.logger.log(`正在加载插件: ${pluginModule.name}`);

		try {
			// 动态导入插件模块
			const pluginInstance = await this.appContext.register(pluginModule, {
				scope: Scope.REQUEST
			});

			// 获取插件实例
			const plugin = pluginInstance.get<IPlugin>(pluginModule);

			// 注册插件
			this.registry.register(plugin);

			// 记录已加载的插件
			this.loadedPlugins.set(plugin.name, pluginInstance);

			// 调用插件 Bootstrap 钩子
			if (plugin.onPluginBootstrap) {
				await plugin.onPluginBootstrap();
			}

			this.logger.log(`插件 ${plugin.name} 加载成功`);
			return plugin;
		} catch (error) {
			this.logger.error(`插件 ${pluginModule.name} 加载失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 动态卸载插件
	 *
	 * @param pluginName - 插件名称
	 */
	async unloadPlugin(pluginName: string): Promise<void> {
		this.logger.log(`正在卸载插件: ${pluginName}`);

		try {
			// 检查插件是否存在
			const pluginInstance = this.loadedPlugins.get(pluginName);
			if (!pluginInstance) {
				throw new NotFoundException(`未找到插件: ${pluginName}`);
			}

			// 检查插件是否受保护
			const plugin = this.registry.getPlugin(pluginName);
			if (plugin?.isProtected) {
				throw new BadRequestException(`插件 ${pluginName} 是受保护的系统插件，无法卸载`);
			}

			// 调用插件 Destroy 钩子
			if (plugin?.onPluginDestroy) {
				await plugin.onPluginDestroy();
			}

			// 从注册表中注销
			this.registry.unregister(pluginName);

			// 关闭插件模块
			await pluginInstance.close();

			// 从已加载插件列表中移除
			this.loadedPlugins.delete(pluginName);

			this.logger.log(`插件 ${pluginName} 卸载成功`);
		} catch (error) {
			this.logger.error(`插件 ${pluginName} 卸载失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 重新加载插件
	 *
	 * @param pluginName - 插件名称
	 * @param pluginModule - 插件模块类
	 */
	async reloadPlugin(pluginName: string, pluginModule: any): Promise<IPlugin> {
		this.logger.log(`正在重新加载插件: ${pluginName}`);

		// 先卸载
		await this.unloadPlugin(pluginName);

		// 再加载
		return await this.loadPlugin(pluginModule);
	}

	/**
	 * 获取已加载的插件列表
	 *
	 * @returns 已加载的插件名称列表
	 */
	getLoadedPlugins(): string[] {
		return Array.from(this.loadedPlugins.keys());
	}

	/**
	 * 检查插件是否已加载
	 *
	 * @param pluginName - 插件名称
	 * @returns 是否已加载
	 */
	isLoaded(pluginName: string): boolean {
		return this.loadedPlugins.has(pluginName);
	}

	/**
	 * 模块销毁时清理所有插件
	 */
	async onModuleDestroy(): Promise<void> {
		this.logger.log('正在清理所有已加载的插件');

		for (const pluginName of this.loadedPlugins.keys()) {
			try {
				await this.unloadPlugin(pluginName);
			} catch (error) {
				this.logger.warn(`清理插件 ${pluginName} 失败: ${error.message}`);
			}
		}
	}
}
```

2. **创建文件监听器**:

`libs/plugin/src/dynamic/plugin-file-watcher.ts`:

```typescript
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { watch, FSWatcher } from 'chokidar';
import { join } from 'path';
import { PluginDynamicLoader } from './plugin-dynamic-loader';

/**
 * 插件文件监听器
 *
 * 监听插件文件变化，自动重载插件
 */
@Injectable()
export class PluginFileWatcher implements OnModuleDestroy {
	private readonly logger = new Logger(PluginFileWatcher.name);
	private readonly watchers: Map<string, FSWatcher> = new Map();

	constructor(private readonly loader: PluginDynamicLoader) {}

	/**
	 * 监听插件目录
	 *
	 * @param pluginDir - 插件目录
	 * @param pluginName - 插件名称
	 */
	watchPlugin(pluginDir: string, pluginName: string): void {
		this.logger.log(`开始监听插件: ${pluginName}, 目录: ${pluginDir}`);

		const watcher = watch(join(pluginDir, '**', '*.ts'), {
			ignored: /(^|[\/\\])\../,
			persistent: true
		});

		watcher.on('change', async (filePath) => {
			this.logger.debug(`检测到文件变化: ${filePath}`);

			try {
				// 重新加载插件
				await this.loader.reloadPlugin(pluginName, require(filePath));
				this.logger.log(`插件 ${pluginName} 重新加载成功`);
			} catch (error) {
				this.logger.error(`插件 ${pluginName} 重新加载失败: ${error.message}`);
			}
		});

		watcher.on('error', (error) => {
			this.logger.error(`监听插件 ${pluginName} 时发生错误: ${error.message}`);
		});

		this.watchers.set(pluginName, watcher);
	}

	/**
	 * 停止监听插件
	 *
	 * @param pluginName - 插件名称
	 */
	unwatchPlugin(pluginName: string): void {
		const watcher = this.watchers.get(pluginName);
		if (watcher) {
			watcher.close();
			this.watchers.delete(pluginName);
			this.logger.log(`停止监听插件: ${pluginName}`);
		}
	}

	/**
	 * 停止所有监听器
	 */
	async onModuleDestroy(): Promise<void> {
		this.logger.log('停止所有插件监听器');

		for (const [pluginName, watcher] of this.watchers.entries()) {
			watcher.close();
			this.logger.debug(`已停止监听插件: ${pluginName}`);
		}

		this.watchers.clear();
	}
}
```

3. **更新 PluginModule 支持动态加载**:

修改 `libs/plugin/src/plugin.module.ts`:

```typescript
import { Module, DynamicModule } from '@nestjs/common';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginDynamicLoader } from './dynamic/plugin-dynamic-loader';
import { PluginFileWatcher } from './dynamic/plugin-file-watcher';

@Module({
	providers: [PluginRegistryService, PluginDynamicLoader, PluginFileWatcher],
	exports: [PluginRegistryService, PluginDynamicLoader, PluginFileWatcher]
})
export class PluginModule {
	static register(options?: { hotReload?: boolean; plugins?: any[] }): DynamicModule {
		const pluginProviders = [];

		if (options?.hotReload) {
			pluginProviders.push({
				provide: 'PLUGIN_HOT_RELOAD',
				useValue: true
			});
		}

		return {
			module: PluginModule,
			providers: pluginProviders,
			exports: [...pluginProviders]
		};
	}
}
```

4. **创建插件管理控制器**:

`libs/plugin/src/plugin-management.controller.ts`:

```typescript
import { Controller, Get, Post, Delete, Put, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { PluginDynamicLoader } from './dynamic/plugin-dynamic-loader';
import { PluginFileWatcher } from './dynamic/plugin-file-watcher';
import { PluginRegistryService } from './plugin-registry.service';
import { RequirePermissions } from '@oksai/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '@oksai/auth/guards/permissions.guard';
import { JwtAuthGuard } from '@oksai/auth/guards/jwt-auth.guard';

/**
 * 插件管理控制器
 *
 * 提供插件动态管理功能
 */
@Controller('plugins')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PluginManagementController {
	constructor(
		private readonly loader: PluginDynamicLoader,
		private readonly watcher: PluginFileWatcher,
		private readonly registry: PluginRegistryService
	) {}

	/**
	 * 获取已加载的插件列表
	 */
	@Get('loaded')
	@RequirePermissions(['plugins:read'])
	async getLoadedPlugins() {
		const loadedPlugins = this.loader.getLoadedPlugins();
		return {
			plugins: loadedPlugins.map((name) => this.registry.getPlugin(name))
		};
	}

	/**
	 * 加载插件
	 */
	@Post('load')
	@RequirePermissions(['plugins:write'])
	async loadPlugin(@Body() dto: { modulePath: string }) {
		try {
			const pluginModule = await import(dto.modulePath);
			const plugin = await this.loader.loadPlugin(pluginModule);
			return { message: '插件加载成功', plugin };
		} catch (error) {
			throw new BadRequestException(`插件加载失败: ${error.message}`);
		}
	}

	/**
	 * 卸载插件
	 */
	@Delete(':name')
	@RequirePermissions(['plugins:delete'])
	async unloadPlugin(@Param('name') name: string) {
		await this.loader.unloadPlugin(name);
		return { message: '插件卸载成功' };
	}

	/**
	 * 重新加载插件
	 */
	@Post(':name/reload')
	@RequirePermissions(['plugins:write'])
	async reloadPlugin(@Param('name') name: string) {
		const plugin = this.registry.getPlugin(name);
		if (!plugin) {
			throw new BadRequestException(`未找到插件: ${name}`);
		}

		const pluginModule = await import(plugin.modulePath);
		const reloadedPlugin = await this.loader.reloadPlugin(name, pluginModule);
		return { message: '插件重新加载成功', plugin: reloadedPlugin };
	}

	/**
	 * 启用插件热重载
	 */
	@Post(':name/watch')
	@RequirePermissions(['plugins:write'])
	async enableHotReload(@Param('name') name: string) {
		const plugin = this.registry.getPlugin(name);
		if (!plugin) {
			throw new BadRequestException(`未找到插件: ${name}`);
		}

		this.watcher.watchPlugin(plugin.dir, name);
		return { message: '插件热重载已启用' };
	}

	/**
	 * 禁用插件热重载
	 */
	@Delete(':name/watch')
	@RequirePermissions(['plugins:write'])
	async disableHotReload(@Param('name') name: string) {
		this.watcher.unwatchPlugin(name);
		return { message: '插件热重载已禁用' };
	}
}
```

5. **添加文件监听依赖**:

```bash
cd libs/plugin
pnpm add chokidar
pnpm add -D @types/chokidar
```

**验收标准**:

-   ✅ 插件可以动态加载
-   ✅ 插件可以动态卸载
-   ✅ 插件可以重新加载
-   ✅ 文件变化自动触发重载
-   ✅ 受保护插件无法卸载
-   ✅ 单元测试覆盖率 80%+

**时间估算**: 10-12 小时

**风险**: 中

-   动态模块加载可能导致内存泄漏
-   文件监听在文件系统中可能不稳定
-   需要充分测试

---

#### 3.3.2 开发插件管理 UI

**目标**: 提供图形化的插件管理界面

**当前状态**:

-   ❌ 无插件管理 UI
-   ✅ 已有插件管理 API

**技术方案**:

1. **选择前端框架**:

推荐使用 **Vue 3 + Vite**，理由：

-   轻量级，适合管理后台
-   生态丰富
-   与后端技术栈一致（TypeScript）

2. **创建前端项目**:

```bash
# 在 apps 目录下创建前端项目
cd apps
pnpm create vite@latest plugin-admin --template vue-ts
cd plugin-admin
pnpm add axios @vueuse/core
pnpm add -D @types/node
```

3. **配置代理**:

`apps/plugin-admin/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true
			},
			'/metrics': {
				target: 'http://localhost:9090',
				changeOrigin: true
			}
		}
	}
});
```

4. **创建 API 客户端**:

`apps/plugin-admin/src/api/client.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
	baseURL: '/api',
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json'
	}
});

// 请求拦截器
apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem('accessToken');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// 响应拦截器
apiClient.interceptors.response.use(
	(response) => response.data,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('accessToken');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export default apiClient;
```

5. **创建插件管理 API**:

`apps/plugin-admin/src/api/plugins.ts`:

```typescript
import apiClient from './client';

export interface Plugin {
	name: string;
	displayName: string;
	version: string;
	description: string;
	type: 'SYSTEM' | 'FEATURE';
	priority: 'P0' | 'P1' | 'P2';
	category: string;
	dependencies: string[];
	permissions: string[];
	api: Array<{
		method: string;
		path: string;
		description: string;
	}>;
	isProtected: boolean;
	isConfigurable: boolean;
	status: 'ACTIVE' | 'INACTIVE';
}

export const pluginsApi = {
	/**
	 * 获取已加载的插件列表
	 */
	getLoadedPlugins(): Promise<{ plugins: Plugin[] }> {
		return apiClient.get('/plugins/loaded');
	},

	/**
	 * 加载插件
	 */
	loadPlugin(modulePath: string): Promise<{ message: string; plugin: Plugin }> {
		return apiClient.post('/plugins/load', { modulePath });
	},

	/**
	 * 卸载插件
	 */
	unloadPlugin(name: string): Promise<{ message: string }> {
		return apiClient.delete(`/plugins/${name}`);
	},

	/**
	 * 重新加载插件
	 */
	reloadPlugin(name: string): Promise<{ message: string; plugin: Plugin }> {
		return apiClient.post(`/plugins/${name}/reload`);
	},

	/**
	 * 启用热重载
	 */
	enableHotReload(name: string): Promise<{ message: string }> {
		return apiClient.post(`/plugins/${name}/watch`);
	},

	/**
	 * 禁用热重载
	 */
	disableHotReload(name: string): Promise<{ message: string }> {
		return apiClient.delete(`/plugins/${name}/watch`);
	}
};
```

6. **创建插件列表组件**:

`apps/plugin-admin/src/components/PluginList.vue`:

```vue
<template>
	<div class="plugin-list">
		<h2>插件列表</h2>

		<div class="filter-bar">
			<select v-model="filterType">
				<option value="all">全部</option>
				<option value="SYSTEM">系统插件</option>
				<option value="FEATURE">功能插件</option>
			</select>

			<select v-model="filterStatus">
				<option value="all">全部状态</option>
				<option value="ACTIVE">已激活</option>
				<option value="INACTIVE">未激活</option>
			</select>
		</div>

		<div class="plugins-grid">
			<PluginCard
				v-for="plugin in filteredPlugins"
				:key="plugin.name"
				:plugin="plugin"
				@reload="handleReload"
				@unload="handleUnload"
				@toggle-hot-reload="handleToggleHotReload"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { pluginsApi, type Plugin } from '../api/plugins';
import PluginCard from './PluginCard.vue';

const plugins = ref<Plugin[]>([]);
const filterType = ref('all');
const filterStatus = ref('all');

const filteredPlugins = computed(() => {
	return plugins.value.filter((plugin) => {
		if (filterType.value !== 'all' && plugin.type !== filterType.value) {
			return false;
		}
		if (filterStatus.value !== 'all' && plugin.status !== filterStatus.value) {
			return false;
		}
		return true;
	});
});

const loadPlugins = async () => {
	try {
		const { plugins: loadedPlugins } = await pluginsApi.getLoadedPlugins();
		plugins.value = loadedPlugins;
	} catch (error) {
		console.error('加载插件失败:', error);
	}
};

const handleReload = async (name: string) => {
	try {
		await pluginsApi.reloadPlugin(name);
		await loadPlugins();
	} catch (error) {
		console.error('重新加载插件失败:', error);
	}
};

const handleUnload = async (name: string) => {
	if (confirm('确定要卸载此插件吗？')) {
		try {
			await pluginsApi.unloadPlugin(name);
			await loadPlugins();
		} catch (error) {
			console.error('卸载插件失败:', error);
		}
	}
};

const handleToggleHotReload = async (name: string, enable: boolean) => {
	try {
		if (enable) {
			await pluginsApi.enableHotReload(name);
		} else {
			await pluginsApi.disableHotReload(name);
		}
		await loadPlugins();
	} catch (error) {
		console.error('切换热重载失败:', error);
	}
};

onMounted(() => {
	loadPlugins();
});
</script>

<style scoped>
.plugin-list {
	padding: 20px;
}

.filter-bar {
	display: flex;
	gap: 10px;
	margin-bottom: 20px;
}

.plugins-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 20px;
}
</style>
```

7. **创建插件卡片组件**:

`apps/plugin-admin/src/components/PluginCard.vue`:

```vue
<template>
	<div class="plugin-card">
		<div class="plugin-header">
			<h3>{{ plugin.displayName }}</h3>
			<span :class="['status-badge', plugin.status.toLowerCase()]">
				{{ plugin.status === 'ACTIVE' ? '已激活' : '未激活' }}
			</span>
		</div>

		<div class="plugin-info">
			<p class="version">版本: {{ plugin.version }}</p>
			<p class="description">{{ plugin.description }}</p>
			<div class="metadata">
				<span class="type">{{ plugin.type }}</span>
				<span class="category">{{ plugin.category }}</span>
			</div>
		</div>

		<div class="plugin-actions">
			<button v-if="!plugin.isProtected" @click="$emit('reload', plugin.name)" :disabled="loading">
				重新加载
			</button>

			<button v-if="!plugin.isProtected" @click="$emit('unload', plugin.name)" :disabled="loading" class="danger">
				卸载
			</button>

			<button @click="$emit('toggle-hot-reload', plugin.name, !hasHotReload)">
				{{ hasHotReload ? '禁用热重载' : '启用热重载' }}
			</button>
		</div>

		<div v-if="plugin.dependencies.length > 0" class="dependencies">
			<strong>依赖:</strong>
			<span v-for="dep in plugin.dependencies" :key="dep" class="dep-tag">
				{{ dep }}
			</span>
		</div>

		<div v-if="plugin.permissions.length > 0" class="permissions">
			<strong>权限:</strong>
			<span v-for="perm in plugin.permissions" :key="perm" class="perm-tag">
				{{ perm }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Plugin } from '../api/plugins';

defineProps<{
	plugin: Plugin;
}>();

defineEmits<{
	reload: [name: string];
	unload: [name: string];
	toggleHotReload: [name: string, enable: boolean];
}>();

const loading = ref(false);
const hasHotReload = ref(false);
</script>

<style scoped>
.plugin-card {
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	padding: 16px;
	background: white;
}

.plugin-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.status-badge {
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
}

.status-badge.active {
	background: #4caf50;
	color: white;
}

.status-badge.inactive {
	background: #f44336;
	color: white;
}

.plugin-info {
	margin-bottom: 16px;
}

.version {
	font-size: 12px;
	color: #666;
	margin-bottom: 4px;
}

.description {
	margin-bottom: 8px;
	color: #333;
}

.metadata {
	display: flex;
	gap: 8px;
}

.type,
.category {
	padding: 2px 6px;
	background: #f5f5f5;
	border-radius: 4px;
	font-size: 12px;
}

.plugin-actions {
	display: flex;
	gap: 8px;
	margin-bottom: 12px;
}

button {
	padding: 6px 12px;
	border: none;
	border-radius: 4px;
	background: #2196f3;
	color: white;
	cursor: pointer;
}

button:hover {
	background: #1976d2;
}

button:disabled {
	background: #ccc;
	cursor: not-allowed;
}

button.danger {
	background: #f44336;
}

button.danger:hover {
	background: #d32f2f;
}

.dependencies,
.permissions {
	margin-top: 8px;
	padding-top: 8px;
	border-top: 1px solid #e0e0e0;
}

.dep-tag,
.perm-tag {
	display: inline-block;
	margin: 2px 4px 2px 0;
	padding: 2px 6px;
	background: #fff3e0;
	border-radius: 4px;
	font-size: 11px;
	color: #e65100;
}
</style>
```

8. **创建登录页面**:

`apps/plugin-admin/src/views/Login.vue`:

```vue
<template>
	<div class="login-container">
		<div class="login-card">
			<h1>插件管理后台</h1>

			<form @submit.prevent="handleLogin">
				<div class="form-group">
					<label>邮箱</label>
					<input v-model="email" type="email" placeholder="请输入邮箱" required />
				</div>

				<div class="form-group">
					<label>密码</label>
					<input v-model="password" type="password" placeholder="请输入密码" required />
				</div>

				<button type="submit" :disabled="loading">
					{{ loading ? '登录中...' : '登录' }}
				</button>
			</form>

			<div v-if="error" class="error">
				{{ error }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/client';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
	error.value = '';
	loading.value = true;

	try {
		const response = await apiClient.post('/auth/login', {
			email: email.value,
			password: password.value
		});

		// 保存 token
		localStorage.setItem('accessToken', response.accessToken);
		localStorage.setItem('refreshToken', response.refreshToken);

		// 跳转到首页
		router.push('/');
	} catch (err: any) {
		error.value = err.response?.data?.message || '登录失败，请重试';
	} finally {
		loading.value = false;
	}
};
</script>

<style scoped>
.login-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background: #f5f5f5;
}

.login-card {
	width: 400px;
	padding: 40px;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
	text-align: center;
	margin-bottom: 30px;
	color: #333;
}

.form-group {
	margin-bottom: 20px;
}

label {
	display: block;
	margin-bottom: 8px;
	color: #666;
}

input {
	width: 100%;
	padding: 10px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
}

button {
	width: 100%;
	padding: 12px;
	background: #2196f3;
	color: white;
	border: none;
	border-radius: 4px;
	font-size: 16px;
	cursor: pointer;
}

button:hover {
	background: #1976d2;
}

button:disabled {
	background: #ccc;
	cursor: not-allowed;
}

.error {
	margin-top: 20px;
	padding: 10px;
	background: #ffebee;
	border-radius: 4px;
	color: #c62828;
	text-align: center;
}
</style>
```

9. **配置路由**:

`apps/plugin-admin/src/router/index.ts`:

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/login',
		name: 'Login',
		component: () => import('../views/Login.vue')
	},
	{
		path: '/',
		name: 'Home',
		component: () => import('../views/Home.vue'),
		meta: { requiresAuth: true }
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
	const token = localStorage.getItem('accessToken');
	if (to.meta.requiresAuth && !token) {
		next('/login');
	} else {
		next();
	}
});

export default router;
```

10. **创建主应用入口**:

`apps/plugin-admin/src/App.vue`:

```vue
<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script setup lang="ts">
// App 根组件
</script>

<style>
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue',
		sans-serif;
	background: #f5f5f5;
}

#app {
	min-height: 100vh;
}
</style>
```

11. **更新 Docker Compose**:

添加前端服务：

```yaml
services:
    # ... 其他服务

    plugin-admin:
        build:
            context: ./apps/plugin-admin
            dockerfile: Dockerfile
        ports:
            - '8080:80'
        depends_on:
            - app
        restart: unless-stopped

    nginx:
        image: nginx:alpine
        ports:
            - '80:80'
        volumes:
            - ./nginx.conf:/etc/nginx/nginx.conf
        depends_on:
            - app
            - plugin-admin
        restart: unless-stopped
```

12. **创建 Nginx 配置**:

`nginx.conf`:

```nginx
events {
  worker_connections 1024;
}

http {
  upstream api {
    server app:3000;
  }

  upstream admin {
    server plugin-admin:80;
  }

  server {
    listen 80;
    server_name localhost;

    # API 代理
    location /api/ {
      proxy_pass http://api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    # 监控代理
    location /metrics/ {
      proxy_pass http://prometheus:9090;
    }

    # 管理后台
    location / {
      proxy_pass http://admin;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
```

**验收标准**:

-   ✅ 插件列表显示正确
-   ✅ 可以加载/卸载/重载插件
-   ✅ 可以启用/禁用热重载
-   ✅ 登录功能正常
-   ✅ UI 界面美观易用
-   ✅ 响应式设计

**时间估算**: 16-20 小时

**风险**: 中

-   前端开发需要投入较多时间
-   UI/UX 设计需要迭代
-   需要充分测试

---

#### 3.3.3 实现插件市场基础

**目标**: 提供插件发现和安装机制

**当前状态**:

-   ❌ 无插件市场
-   ✅ 已有插件管理系统

**技术方案**:

1. **创建插件包结构**:

插件包目录结构：

```
plugins/
├── my-plugin/
│   ├── package.json
│   ├── index.ts
│   ├── config/
│   │   └── config.schema.json
│   ├── docs/
│   │   └── README.md
│   └── assets/
│       └── logo.png
```

2. **创建插件包 Schema**:

`libs/plugin/src/marketplace/plugin-package.schema.json`:

```json
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"title": "OKSAI Plugin Package",
	"type": "object",
	"required": ["name", "version", "displayName", "description", "type", "category", "author", "license", "main"],
	"properties": {
		"name": {
			"type": "string",
			"pattern": "^[a-z0-9-]+$"
		},
		"version": {
			"type": "string",
			"pattern": "^\\d+\\.\\d+\\.\\d+$"
		},
		"displayName": {
			"type": "string",
			"minLength": 1
		},
		"description": {
			"type": "string",
			"minLength": 10
		},
		"type": {
			"type": "string",
			"enum": ["SYSTEM", "FEATURE"]
		},
		"category": {
			"type": "string"
		},
		"author": {
			"type": "object",
			"required": ["name", "email"],
			"properties": {
				"name": {
					"type": "string"
				},
				"email": {
					"type": "string",
					"format": "email"
				}
			}
		},
		"license": {
			"type": "string"
		},
		"main": {
			"type": "string"
		},
		"dependencies": {
			"type": "array",
			"items": {
				"type": "string"
			}
		},
		"permissions": {
			"type": "array",
			"items": {
				"type": "string"
			}
		},
		"config": {
			"type": "object"
		},
		"keywords": {
			"type": "array",
			"items": {
				"type": "string"
			}
		}
	}
}
```

3. **创建插件注册服务**:

`libs/plugin/src/marketplace/plugin-registry.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { MarketplacePlugin } from './entities/marketplace-plugin.entity';
import { RegisterPluginDto } from './dto/register-plugin.dto';

/**
 * 插件注册服务
 *
 * 管理插件市场的插件
 */
@Injectable()
export class PluginRegistryService {
	private readonly logger = new Logger(PluginRegistryService.name);

	constructor(
		@InjectRepository(MarketplacePlugin)
		private readonly pluginRepo: EntityRepository<MarketplacePlugin>
	) {}

	/**
	 * 注册插件到市场
	 *
	 * @param data - 插件注册数据
	 * @returns 已注册的插件
	 */
	async registerPlugin(data: RegisterPluginDto): Promise<MarketplacePlugin> {
		this.logger.log(`正在注册插件: ${data.name}`);

		// 检查插件是否已存在
		const existing = await this.pluginRepo.findOne({ name: data.name });
		if (existing) {
			throw new BadRequestException('插件名称已存在');
		}

		// 验证插件包
		await this.validatePluginPackage(data.packageUrl);

		// 创建插件记录
		const plugin = this.pluginRepo.create({
			...data,
			status: 'PENDING',
			downloads: 0,
			rating: 0,
			ratingCount: 0
		});

		await this.em.persistAndFlush(plugin);
		this.logger.log(`插件 ${data.name} 注册成功`);
		return plugin;
	}

	/**
	 * 验证插件包
	 *
	 * @param packageUrl - 插件包 URL
	 */
	private async validatePluginPackage(packageUrl: string): Promise<void> {
		// 下载插件包
		const response = await fetch(packageUrl);
		const packageJson = await response.json();

		// 验证 package.json
		// ... 使用 JSON Schema 验证

		// 验证插件入口文件
		// ...
	}

	/**
	 * 获取所有插件
	 *
	 * @param filters - 过滤条件
	 * @returns 插件列表
	 */
	async getPlugins(filters?: { type?: string; category?: string; keyword?: string }): Promise<MarketplacePlugin[]> {
		const where: any = { status: 'APPROVED' };

		if (filters?.type) {
			where.type = filters.type;
		}

		if (filters?.category) {
			where.category = filters.category;
		}

		if (filters?.keyword) {
			where.name = { $like: `%${filters.keyword}%` };
		}

		return await this.pluginRepo.find(where, {
			orderBy: { downloads: 'DESC' }
		});
	}

	/**
	 * 获取插件详情
	 *
	 * @param id - 插件 ID
	 * @returns 插件详情
	 */
	async getPluginById(id: string): Promise<MarketplacePlugin> {
		const plugin = await this.pluginRepo.findOne({ id });
		if (!plugin) {
			throw new NotFoundException('未找到该插件');
		}
		return plugin;
	}

	/**
	 * 下载插件
	 *
	 * @param id - 插件 ID
	 * @returns 插件包数据
	 */
	async downloadPlugin(id: string): Promise<{
		packageUrl: string;
		version: string;
	}> {
		const plugin = await this.getPluginById(id);

		// 增加下载计数
		plugin.downloads++;
		await this.em.persistAndFlush(plugin);

		return {
			packageUrl: plugin.packageUrl,
			version: plugin.version
		};
	}

	/**
	 * 为插件评分
	 *
	 * @param id - 插件 ID
	 * @param rating - 评分 (1-5)
	 * @returns 更新后的插件
	 */
	async ratePlugin(id: string, rating: number): Promise<MarketplacePlugin> {
		const plugin = await this.getPluginById(id);

		if (rating < 1 || rating > 5) {
			throw new BadRequestException('评分必须在 1-5 之间');
		}

		// 更新评分
		const newRatingCount = plugin.ratingCount + 1;
		const newRating = (plugin.rating * plugin.ratingCount + rating) / newRatingCount;

		plugin.rating = newRating;
		plugin.ratingCount = newRatingCount;

		await this.em.persistAndFlush(plugin);
		return plugin;
	}

	/**
	 * 审核插件
	 *
	 * @param id - 插件 ID
	 * @param approved - 是否批准
	 * @param reviewComment - 审核意见
	 * @returns 更新后的插件
	 */
	async reviewPlugin(id: string, approved: boolean, reviewComment?: string): Promise<MarketplacePlugin> {
		const plugin = await this.getPluginById(id);

		plugin.status = approved ? 'APPROVED' : 'REJECTED';
		plugin.reviewComment = reviewComment;

		await this.em.persistAndFlush(plugin);
		return plugin;
	}

	private get em() {
		return this.pluginRepo.getEntityManager();
	}
}
```

4. **创建 MarketplacePlugin 实体**:

`libs/plugin/src/marketplace/entities/marketplace-plugin.entity.ts`:

```typescript
import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 插件市场实体
 */
@Entity()
@Index({ name: 'idx_plugin_name' })
@Index({ name: 'idx_plugin_category' })
@Index({ name: 'idx_plugin_type' })
export class MarketplacePlugin extends BaseEntity {
	@PrimaryKey()
	id: string = randomUUID();

	@Property({ unique: true, nullable: false })
	name!: string;

	@Property({ nullable: false })
	version!: string;

	@Property({ nullable: false })
	displayName!: string;

	@Property({ nullable: false })
	description!: string;

	@Property({ nullable: false })
	type!: string;

	@Property({ nullable: false })
	category!: string;

	@Property({ nullable: false })
	authorName!: string;

	@Property({ nullable: false })
	authorEmail!: string;

	@Property({ nullable: false })
	license!: string;

	@Property({ nullable: false })
	main!: string;

	@Property({ type: 'json', nullable: true })
	dependencies?: string[];

	@Property({ type: 'json', nullable: true })
	permissions?: string[];

	@Property({ type: 'json', nullable: true })
	config?: any;

	@Property({ type: 'json', nullable: true })
	keywords?: string[];

	@Property({ nullable: false })
	packageUrl!: string;

	@Property({ nullable: false })
	logoUrl!: string;

	@Property({ nullable: true })
	homepageUrl?: string;

	@Property({ nullable: true })
	repositoryUrl?: string;

	@Property({ nullable: false })
	status!: 'PENDING' | 'APPROVED' | 'REJECTED';

	@Property({ default: 0 })
	downloads!: number;

	@Property({ default: 0 })
	rating!: number;

	@Property({ default: 0 })
	ratingCount!: number;

	@Property({ nullable: true })
	reviewComment?: string;
}
```

5. **创建插件安装服务**:

`libs/plugin/src/marketplace/plugin-installer.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';
import { PluginDynamicLoader } from '../dynamic/plugin-dynamic-loader';

/**
 * 插件安装服务
 *
 * 负责从市场下载和安装插件
 */
@Injectable()
export class PluginInstallerService {
	private readonly logger = new Logger(PluginInstallerService.name);
	private readonly pluginsDir = process.env.PLUGINS_DIR || './plugins';

	constructor(private readonly loader: PluginDynamicLoader) {}

	/**
	 * 安装插件
	 *
	 * @param packageUrl - 插件包 URL
	 * @param pluginName - 插件名称
	 * @returns 安装的插件
	 */
	async installPlugin(packageUrl: string, pluginName: string): Promise<void> {
		this.logger.log(`正在安装插件: ${pluginName}`);

		try {
			// 下载插件包
			const packagePath = await this.downloadPackage(packageUrl, pluginName);

			// 解压插件包
			const pluginDir = await this.extractPackage(packagePath, pluginName);

			// 验证插件
			await this.validatePlugin(pluginDir);

			// 加载插件
			const pluginModulePath = path.join(pluginDir, 'index.ts');
			const pluginModule = await import(pluginModulePath);

			await this.loader.loadPlugin(pluginModule);

			this.logger.log(`插件 ${pluginName} 安装成功`);
		} catch (error) {
			this.logger.error(`插件 ${pluginName} 安装失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 下载插件包
	 *
	 * @param packageUrl - 插件包 URL
	 * @param pluginName - 插件名称
	 * @returns 插件包路径
	 */
	private async downloadPackage(packageUrl: string, pluginName: string): Promise<string> {
		const response = await fetch(packageUrl);
		const buffer = await response.arrayBuffer();

		const packagePath = path.join(this.pluginsDir, `${pluginName}.tar.gz`);
		fs.writeFileSync(packagePath, Buffer.from(buffer));

		return packagePath;
	}

	/**
	 * 解压插件包
	 *
	 * @param packagePath - 插件包路径
	 * @param pluginName - 插件名称
	 * @returns 插件目录
	 */
	private async extractPackage(packagePath: string, pluginName: string): Promise<string> {
		const pluginDir = path.join(this.pluginsDir, pluginName);

		// 创建插件目录
		fs.mkdirSync(pluginDir, { recursive: true });

		// 解压插件包
		await tar.x({
			file: packagePath,
			cwd: pluginDir
		});

		// 删除插件包
		fs.unlinkSync(packagePath);

		return pluginDir;
	}

	/**
	 * 验证插件
	 *
	 * @param pluginDir - 插件目录
	 */
	private async validatePlugin(pluginDir: string): Promise<void> {
		const packageJsonPath = path.join(pluginDir, 'package.json');
		const indexPath = path.join(pluginDir, 'index.ts');

		// 检查文件是否存在
		if (!fs.existsSync(packageJsonPath)) {
			throw new Error('插件包缺少 package.json');
		}

		if (!fs.existsSync(indexPath)) {
			throw new Error('插件包缺少 index.ts');
		}

		// 验证 package.json
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

		if (!packageJson.name || !packageJson.version) {
			throw new Error('插件 package.json 格式不正确');
		}
	}
}
```

**验收标准**:

-   ✅ 可以注册插件到市场
-   ✅ 可以浏览和搜索插件
-   ✅ 可以下载和安装插件
-   ✅ 可以为插件评分
-   ✅ 管理员可以审核插件
-   ✅ 单元测试覆盖率 80%+

**时间估算**: 12-16 小时

**风险**: 中

-   插件包验证需要仔细设计
-   安全性需要重点关注

---

#### 3.3.4 添加审计日志系统

**目标**: 记录所有管理操作，满足合规要求

**当前状态**:

-   ❌ 无审计日志
-   ✅ 已有 Logger 中间件

**技术方案**:

1. **创建审计日志实体**:

`libs/common/src/audit/audit-log.entity.ts`:

```typescript
import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from '@oksai/core';

/**
 * 审计日志实体
 */
@Entity()
@Index({ name: 'idx_audit_user_id' })
@Index({ name: 'idx_audit_action' })
@Index({ name: 'idx_audit_resource_type' })
@Index({ name: 'idx_audit_created_at' })
export class AuditLog extends BaseEntity {
	@PrimaryKey()
	id: string = randomUUID();

	/**
	 * 用户 ID
	 */
	@Property({ nullable: true })
	userId?: string;

	/**
	 * 用户邮箱
	 */
	@Property({ nullable: true })
	userEmail?: string;

	/**
	 * 操作类型
	 *
	 * CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
	 */
	@Property({ nullable: false })
	action!: string;

	/**
	 * 资源类型
	 *
	 * User, Tenant, Plugin, Report 等
	 */
	@Property({ nullable: false })
	resourceType!: string;

	/**
	 * 资源 ID
	 */
	@Property({ nullable: true })
	resourceId?: string;

	/**
	 * 操作详情
	 */
	@Property({ type: 'json', nullable: true })
	details?: any;

	/**
	 * IP 地址
	 */
	@Property({ nullable: true })
	ipAddress?: string;

	/**
	 * User-Agent
	 */
	@Property({ nullable: true })
	userAgent?: string;

	/**
	 * 关联 ID
	 */
	@Property({ nullable: true })
	correlationId?: string;

	/**
	 * 操作结果
	 *
	 * SUCCESS, FAILURE
	 */
	@Property({ nullable: false })
	result!: string;

	/**
	 * 错误消息
	 */
	@Property({ nullable: true })
	errorMessage?: string;

	/**
	 * 操作时间
	 */
	@Property({ default: () => new Date() })
	createdAt!: Date;
}
```

2. **创建审计日志服务**:

`libs/common/src/audit/audit-log.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { AuditLog } from './audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

/**
 * 审计日志服务
 *
 * 记录系统操作日志
 */
@Injectable()
export class AuditLogService {
	private readonly logger = new Logger(AuditLogService.name);

	constructor(
		@InjectRepository(AuditLog)
		private readonly auditLogRepo: EntityRepository<AuditLog>
	) {}

	/**
	 * 记录审计日志
	 *
	 * @param data - 审计日志数据
	 */
	async log(data: CreateAuditLogDto): Promise<void> {
		try {
			const auditLog = this.auditLogRepo.create(data);
			await this.em.persistAndFlush(auditLog);

			this.logger.debug(`审计日志记录成功: ${data.action} ${data.resourceType}`);
		} catch (error) {
			this.logger.error(`审计日志记录失败: ${error.message}`);
		}
	}

	/**
	 * 查询审计日志
	 *
	 * @param filters - 过滤条件
	 * @returns 审计日志列表
	 */
	async findLogs(filters?: {
		userId?: string;
		action?: string;
		resourceType?: string;
		resourceId?: string;
		startDate?: Date;
		endDate?: Date;
		limit?: number;
		offset?: number;
	}): Promise<{ logs: AuditLog[]; total: number }> {
		const where: any = {};

		if (filters?.userId) {
			where.userId = filters.userId;
		}

		if (filters?.action) {
			where.action = filters.action;
		}

		if (filters?.resourceType) {
			where.resourceType = filters.resourceType;
		}

		if (filters?.resourceId) {
			where.resourceId = filters.resourceId;
		}

		if (filters?.startDate || filters?.endDate) {
			where.createdAt = {};
			if (filters.startDate) {
				where.createdAt.$gte = filters.startDate;
			}
			if (filters.endDate) {
				where.createdAt.$lte = filters.endDate;
			}
		}

		const [logs, total] = await this.auditLogRepo.findAndCount(where, {
			orderBy: { createdAt: 'DESC' },
			limit: filters?.limit || 50,
			offset: filters?.offset || 0
		});

		return { logs, total };
	}

	/**
	 * 导出审计日志
	 *
	 * @param filters - 过滤条件
	 * @param format - 导出格式
	 * @returns 文件流
	 */
	async exportLogs(
		filters?: any,
		format: 'csv' | 'json' = 'csv'
	): Promise<{
		stream: NodeJS.ReadableStream;
		contentType: string;
		fileName: string;
	}> {
		const { logs } = await this.findLogs(filters);

		if (format === 'csv') {
			return this.exportToCsv(logs);
		} else {
			return this.exportToJson(logs);
		}
	}

	/**
	 * 导出为 CSV
	 */
	private exportToCsv(logs: AuditLog[]): {
		stream: NodeJS.ReadableStream;
		contentType: string;
		fileName: string;
	} {
		const headers = ['时间', '用户', '操作', '资源类型', '资源ID', '结果', '详情'];
		const rows = logs.map((log) => [
			log.createdAt.toISOString(),
			log.userEmail,
			log.action,
			log.resourceType,
			log.resourceId,
			log.result,
			JSON.stringify(log.details)
		]);

		const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

		const stream = require('stream').Readable.from(csvContent);

		return {
			stream,
			contentType: 'text/csv',
			fileName: `audit-logs-${Date.now()}.csv`
		};
	}

	/**
	 * 导出为 JSON
	 */
	private exportToJson(logs: AuditLog[]): {
		stream: NodeJS.ReadableStream;
		contentType: string;
		fileName: string;
	} {
		const jsonContent = JSON.stringify(logs, null, 2);
		const stream = require('stream').Readable.from(jsonContent);

		return {
			stream,
			contentType: 'application/json',
			fileName: `audit-logs-${Date.now()}.json`
		};
	}

	/**
	 * 清理旧审计日志
	 *
	 * @param days - 保留天数
	 */
	async cleanupOldLogs(days: number = 90): Promise<number> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);

		const oldLogs = await this.auditLogRepo.find({
			createdAt: { $lt: cutoffDate }
		});

		for (const log of oldLogs) {
			await this.em.remove(log);
		}

		await this.em.flush();
		this.logger.log(`已清理 ${oldLogs.length} 条旧审计日志`);

		return oldLogs.length;
	}

	private get em() {
		return this.auditLogRepo.getEntityManager();
	}
}
```

3. **创建审计日志装饰器**:

`libs/common/src/decorators/audit.decorator.ts`:

````typescript
import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogMetadata {
	action: string;
	resourceType: string;
	resourceIdParam?: string;
}

/**
 * 审计日志装饰器
 *
 * 用于标记需要记录审计日志的路由
 *
 * @example
 * ```typescript
 * @AuditLog({
 *   action: 'CREATE',
 *   resourceType: 'User'
 * })
 * @Post()
 * async create(@Body() createUserDto: CreateUserDto) {
 *   return this.userService.create(createUserDto);
 * }
 * ```
 */
export const AuditLog = (metadata: AuditLogMetadata) => SetMetadata(AUDIT_LOG_KEY, metadata);
````

4. **创建审计日志拦截器**:

`libs/common/src/interceptors/audit-log.interceptor.ts`:

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditLogService } from '../audit/audit-log.service';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../decorators/audit.decorator';

/**
 * 审计日志拦截器
 *
 * 自动记录审计日志
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
	private readonly logger = new Logger(AuditLogInterceptor.name);

	constructor(private readonly reflector: Reflector, private readonly auditLogService: AuditLogService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		// 获取审计日志元数据
		const auditMetadata = this.reflector.get<AuditLogMetadata>(AUDIT_LOG_KEY, context.getHandler());

		// 如果没有审计日志配置，直接执行
		if (!auditMetadata) {
			return next.handle();
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;
		const { action, resourceType, resourceIdParam } = auditMetadata;

		// 构建审计日志数据
		const logData: any = {
			action,
			resourceType,
			resourceId: resourceIdParam ? request.params[resourceIdParam] : undefined,
			userId: user?.id,
			userEmail: user?.email,
			ipAddress: request.ip,
			userAgent: request.headers['user-agent'],
			correlationId: request.headers['x-correlation-id'],
			result: 'SUCCESS'
		};

		return next.handle().pipe(
			tap((response) => {
				// 操作成功
				logData.details = {
					request: {
						method: request.method,
						url: request.url,
						body: this.sanitizeBody(request.body)
					},
					response: this.sanitizeResponse(response)
				};
				this.auditLogService.log(logData);
			}),
			catchError((error) => {
				// 操作失败
				logData.result = 'FAILURE';
				logData.errorMessage = error.message;
				logData.details = {
					request: {
						method: request.method,
						url: request.url,
						body: this.sanitizeBody(request.body)
					},
					error: error.stack
				};
				this.auditLogService.log(logData);
				throw error;
			})
		);
	}

	/**
	 * 清理请求体（移除敏感信息）
	 */
	private sanitizeBody(body: any): any {
		if (!body) return body;

		const sanitized = { ...body };
		const sensitiveFields = ['password', 'token', 'secret'];

		for (const field of sensitiveFields) {
			if (sanitized[field]) {
				sanitized[field] = '***';
			}
		}

		return sanitized;
	}

	/**
	 * 清理响应（移除敏感信息）
	 */
	private sanitizeResponse(response: any): any {
		if (!response) return response;

		const sanitized = { ...response };
		const sensitiveFields = ['accessToken', 'refreshToken', 'password'];

		for (const field of sensitiveFields) {
			if (sanitized[field]) {
				sanitized[field] = '***';
			}
		}

		return sanitized;
	}
}
```

5. **在路由中使用审计日志**:

示例：更新 User Controller

```typescript
@Controller('users')
export class UserController {
	@Post()
	@AuditLog({
		action: 'CREATE',
		resourceType: 'User'
	})
	async create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	@Put(':id')
	@AuditLog({
		action: 'UPDATE',
		resourceType: 'User',
		resourceIdParam: 'id'
	})
	async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(id, updateUserDto);
	}

	@Delete(':id')
	@AuditLog({
		action: 'DELETE',
		resourceType: 'User',
		resourceIdParam: 'id'
	})
	async remove(@Param('id') id: string) {
		return this.userService.remove(id);
	}
}
```

6. **创建审计日志查询控制器**:

`libs/common/src/audit/audit-log.controller.ts`:

```typescript
import { Controller, Get, Query, UseGuards, StreamableFile } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '@oksai/auth/guards/permissions.guard';
import { JwtAuthGuard } from '@oksai/auth/guards/jwt-auth.guard';

/**
 * 审计日志控制器
 */
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogController {
	constructor(private readonly auditLogService: AuditLogService) {}

	/**
	 * 查询审计日志
	 */
	@Get()
	@RequirePermissions(['audit:read'])
	async findLogs(@Query() query: any) {
		return this.auditLogService.findLogs(query);
	}

	/**
	 * 导出审计日志
	 */
	@Get('export')
	@RequirePermissions(['audit:read'])
	async exportLogs(@Query() query: any) {
		const { stream, contentType, fileName } = await this.auditLogService.exportLogs(query, query.format || 'csv');

		return new StreamableFile(stream, {
			type: contentType,
			disposition: `attachment; filename="${fileName}"`
		});
	}
}
```

**验收标准**:

-   ✅ 所有管理操作被记录
-   ✅ 审计日志包含完整上下文
-   ✅ 可以查询和导出审计日志
-   ✅ 敏感信息被脱敏
-   ✅ 单元测试覆盖率 80%+

**时间估算**: 8-10 小时

**风险**: 低

-   审计日志是标准功能
-   已有 Logger 基础

---

### 3.4 阶段四：持续优化 (第 9-12 周)

#### 3.4.1 性能优化

**目标**: 提升系统整体性能

**技术方案**:

1. **数据库查询优化**

    - 添加适当的索引
    - 使用查询缓存
    - 优化 N+1 查询问题

2. **响应缓存**

    - 实现分层缓存
    - 使用 CDN 缓存静态资源

3. **代码优化**
    - 减少内存泄漏
    - 优化大文件处理
    - 使用流式处理

**时间估算**: 12-16 小时

---

#### 3.4.2 文档完善

**目标**: 提供完整的项目文档

**技术方案**:

1. **API 文档**

    - 使用 Swagger 自动生成
    - 提供完整的 API 参考手册

2. **插件开发文档**

    - 创建插件开发教程
    - 提供最佳实践指南

3. **部署文档**
    - 详细部署步骤
    - 常见问题解决

**时间估算**: 8-12 小时

---

#### 3.4.3 安全加固

**目标**: 提升系统安全性

**技术方案**:

1. **依赖漏洞扫描**

    - 使用 npm audit
    - 定期更新依赖

2. **安全配置**

    - 启用 HTTPS
    - 配置 CSP 头
    - 添加速率限制

3. **渗透测试**
    - 进行安全审计
    - 修复发现的漏洞

**时间估算**: 10-14 小时

---

## 四、风险管理与缓解

### 4.1 技术风险

| 风险              | 影响 | 概率 | 缓解措施                         |
| ----------------- | ---- | ---- | -------------------------------- |
| Jest 配置修复困难 | 高   | 中   | 寻求 Jest 专家帮助，参考最佳实践 |
| RBAC 系统复杂度高 | 高   | 中   | 采用 CASL 成熟方案，分阶段实施   |
| 插件热重载不稳定  | 中   | 高   | 充分测试，提供禁用选项           |
| 前端开发周期长    | 中   | 中   | 采用现成的 UI 组件库             |
| CI/CD 配置复杂    | 低   | 低   | 参考 GitHub Actions 模板         |

### 4.2 资源风险

| 风险           | 影响 | 概率 | 缓解措施               |
| -------------- | ---- | ---- | ---------------------- |
| 开发人力不足   | 高   | 低   | 优先完成高优先级任务   |
| 服务器资源有限 | 中   | 低   | 使用云服务弹性扩容     |
| 开发时间延期   | 中   | 中   | 合理规划时间，预留缓冲 |

### 4.3 业务风险

| 风险         | 影响 | 概率 | 缓解措施           |
| ------------ | ---- | ---- | ------------------ |
| 用户体验下降 | 中   | 低   | 充分测试，平滑过渡 |
| 功能需求变更 | 中   | 中   | 敏捷开发，快速响应 |
| 兼容性问题   | 低   | 低   | 保持向后兼容       |

---

## 五、成功指标

### 5.1 定量指标

| 指标         | 当前值 | 目标值  | 测量方法        |
| ------------ | ------ | ------- | --------------- |
| 测试覆盖率   | 30%    | 80%     | Jest 覆盖率报告 |
| 测试通过率   | 30%    | 90%+    | CI/CD 测试结果  |
| API 响应时间 | 未测量 | < 200ms | Prometheus 监控 |
| 错误率       | 未测量 | < 1%    | Prometheus 监控 |
| 缓存命中率   | 0%     | 60%+    | Prometheus 监控 |

### 5.2 定性指标

| 指标       | 描述         | 验证方法     |
| ---------- | ------------ | ------------ |
| 代码质量   | 代码规范统一 | ESLint 检查  |
| 文档完整性 | API 文档完整 | Swagger 文档 |
| 开发体验   | 开发流程顺畅 | 开发者反馈   |
| 系统稳定性 | 系统稳定运行 | 监控数据     |

---

## 六、实施建议

### 6.1 团队组织

建议按照以下方式组织团队：

1. **核心开发团队** (2-3 人)

    - 负责 Jest 配置修复
    - 负责核心功能开发

2. **前端开发团队** (1-2 人)

    - 负责插件管理 UI 开发

3. **运维团队** (1 人)
    - 负责 CI/CD 配置
    - 负责监控和部署

### 6.2 开发流程

1. **采用敏捷开发**

    - 2 周为一个冲刺
    - 每日站会同步进度

2. **代码审查**

    - 所有代码必须经过审查
    - 使用 Pull Request 流程

3. **持续集成**
    - 代码提交自动运行测试
    - 质量门禁必须通过

### 6.3 沟通机制

1. **每周同步会议**

    - 回顾本周进度
    - 计划下周任务

2. **问题跟踪**

    - 使用 GitHub Issues 跟踪问题
    - 及时更新进度

3. **文档同步**
    - 重要决策记录文档
    - 知识共享

---

## 七、总结

### 7.1 优化成果预期

通过实施本优化方案，预期将：

1. **提升系统可靠性**: 测试覆盖率从 30% 提升至 80%+
2. **提升运维效率**: 实现 CI/CD 自动化部署
3. **提升开发效率**: 提供插件热重载功能
4. **提升系统安全性**: 实现完整的 RBAC 权限控制
5. **提升可观测性**: 集成 Prometheus + Grafana 监控

### 7.2 关键成功因素

1. **优先完成高优先级任务**: 先解决测试问题
2. **充分测试**: 每个功能必须有测试
3. **文档先行**: 重要功能先写文档
4. **持续反馈**: 定期回顾和调整计划

### 7.3 后续规划

完成本优化方案后，建议继续：

1. **用户调研**: 收集用户反馈
2. **功能迭代**: 根据反馈持续改进
3. **社区建设**: 建立插件开发生态
4. **商业化**: 探索商业模式

---

## 附录

### A. 相关文档

-   [API Reference](./API_REFERENCE.md)
-   [Architecture](./ARCHITECTURE.md)
-   [Testing Guide](./TESTING_GUIDE.md)
-   [Plugin Development](./PLUGIN_DEVELOPMENT.md)

### B. 参考资料

-   [NestJS 官方文档](https://docs.nestjs.com/)
-   [CASL 权限库](https://casl.js.org/)
-   [Prometheus 监控](https://prometheus.io/)
-   [Redis 缓存](https://redis.io/)

### C. 联系方式

如有问题，请联系：

-   项目负责人: [待填写]
-   技术支持: [待填写]
-   GitHub Issues: [待填写]

---

**文档版本**: v1.0.0
**最后更新**: 2026-02-07
**审核人**: [待填写]
**批准人**: [待填写]
