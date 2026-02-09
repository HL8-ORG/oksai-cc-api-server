# E2E 测试基础设施优化指南

本文档说明如何优化 E2E 测试环境，确保测试能够快速、稳定地运行。

## 问题分析

当前 E2E 测试存在以下问题：

1. **数据库配置不一致**

    - E2E 测试使用 SQLite（内存数据库）
    - 应用使用 PostgreSQL (通过 Docker)
    - 导致测试失败，因为实体结构与实际数据库不匹配

2. **缺少测试环境设置**

    - 缺少 `test-setup.ts` 文件
    - Jest 配置引用了不存在的文件

3. **测试超时**

    - 某些测试运行超时或卡住

4. **依赖注入问题**
    - 某些服务在测试环境中无法正确注入

## 优化方案

### 1. 独立的测试数据库容器

创建了 `docker-compose.test.yml`，包含独立的测试数据库和 Redis：

```bash
# 启动测试容器
docker-compose -f docker-compose.test.yml up -d

# 停止测试容器
docker-compose -f docker-compose.test.yml down
```

**优势：**

-   与生产环境完全隔离
-   测试数据不会影响生产数据库
-   可以快速重建测试环境
-   端口避免冲突（PostgreSQL: 5433, Redis: 6380）

### 2. 测试环境配置文件

创建了 `apps/base-api/src/e2e/test-setup.ts`，用于配置测试环境变量：

```typescript
// 在测试前自动设置测试数据库连接
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5433';
process.env.DB_NAME = 'test_oksai';
process.env.DB_USER = 'postgres';
process.env.DB_PASS = 'test_password';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6380';
```

**优势：**

-   统一的环境变量配置
-   确保测试使用正确的数据库
-   避免硬编码环境配置

### 3. 优化的 Jest E2E 配置

**更新 `apps/base-api/jest-e2e.config.ts`：**

```typescript
export default {
	// 移除不存在的 setupFiles
	// setupFiles: ['<rootDir>/test-setup.ts'],

	// 增加测试超时时间（60 秒）
	testTimeout: 60000,

	// 优化测试性能
	maxWorkers: '50%',

	// 设置测试环境
	testEnvironment: 'node',

	// 覆盖率配置
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.test.ts'],
	coverageDirectory: '../coverage/e2e',
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 70,
			lines: 70,
			statements: 70
		}
	}
};
```

### 4. 测试运行脚本

创建了 `run-e2e-tests.sh` 脚本，提供便捷的测试运行命令：

```bash
# 检查测试容器状态
./run-e2e-tests.sh check

# 运行单个测试（test-helper）
./run-e2e-tests.sh start

# 运行所有 E2E 测试
./run-e2e-tests.sh all

# 查看帮助
./run-e2e-tests.sh help
```

**功能：**

-   ✅ Docker 容器检查
-   ✅ 快速测试运行
-   ✅ 所有测试运行
-   ✅ 彩色输出和错误报告
-   ✅ 自动超时控制（60 秒）

## 使用步骤

### 1. 启动测试数据库

```bash
# 启动测试容器
docker-compose -f docker-compose.test.yml up -d

# 等待容器就绪
docker-compose -f docker-compose.test.yml ps
```

### 2. 运行 E2E 测试

```bash
# 运行单个测试（快速反馈）
./run-e2e-tests.sh start

# 运行所有测试（完整覆盖）
./run-e2e-tests.sh all
```

### 3. 查看测试结果

脚本会自动显示测试结果：

-   ✅ 绿色 - 测试成功
-   ✗ 红色 - 测试失败
-   ⚠️ 黄色 - 警告信息

### 4. 调试失败的测试

如果某个测试失败，可以单独运行：

```bash
# 运行特定测试文件
cd apps/base-api
pnpm test:e2e src/e2e/auth/auth.e2e-spec.ts

# 使用详细输出
DEBUG=true pnpm test:e2e src/e2e/auth/auth.e2e-spec.ts
```

## 故障排除

### 测试容器连接问题

如果测试容器无法连接：

```bash
# 检查容器状态
docker-compose -f docker-compose.test.yml ps

# 查看日志
docker-compose -f docker-compose.test.yml logs test-db

# 重启容器
docker-compose -f docker-compose.test.yml restart test-db
```

### 测试超时问题

如果测试持续超时：

1. **增加测试超时**：在 `jest-e2e.config.ts` 中设置 `testTimeout: 60000`
2. **检查数据库连接**：确保测试数据库容器正在运行
3. **优化测试性能**：减少测试数据量，优化查询

### 常见问题

**Q: 测试仍然失败，显示 SQL 语法错误**

**A:** 这是 MikroORM 类型定义问题，可以：

1. 更新 MikroORM 版本
2. 添加类型声明文件
3. 修复实体定义中的装饰器类型

**Q: 如何测试单个实体？**

**A:** 创建专门的实体测试文件：

```typescript
// apps/base-api/src/e2e/entities/user-entity.spec.ts
describe('User Entity', () => {
	it('应该正确创建用户实体', () => {
		const user = new User();
		user.email = 'test@example.com';
		user.firstName = '测试';
		user.lastName = '用户';

		expect(user.email).toBe('test@example.com');
		expect(user.firstName).toBe('测试');
		expect(user.lastName).toBe('用户');
	});
});
```

## 下一步计划

1. ✅ 完成 E2E 测试基础设施优化
2. ⚠️ 修复 MikroORM 类型定义问题
3. ⚠️ 修复实体 Schema 问题
4. ⚠️ 提高测试覆盖率到 80%
5. ⚠️ 添加更多集成测试
