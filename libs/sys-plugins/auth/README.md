# @oksai/auth

## 认证插件（Auth Plugin - P0）

提供用户身份认证和权限管理功能，确保系统安全。

### 功能特性

-   用户登录和令牌管理
-   用户注册和邮箱验证
-   密码重置和邮箱验证
-   访问令牌刷新
-   用户资料管理
-   权限控制（基于角色的访问控制）

### API 端点

| 方法   | 路径                         | 描述         |
| ------ | ---------------------------- | ------------ |
| POST   | /api/auth/login              | 用户登录     |
| POST   | /api/auth/register           | 用户注册     |
| POST   | /api/auth/refresh-token      | 刷新访问令牌 |
| POST   | /api/auth/reset-password     | 请求密码重置 |
| POST   | /api/auth/verify-email       | 验证邮箱     |
| GET    | /api/auth/users              | 获取用户列表 |
| GET    | /api/auth/users/:id          | 获取用户详情 |
| PATCH  | /api/auth/users/:id          | 更新用户信息 |
| DELETE | /api/auth/users/:id          | 删除用户     |
| PATCH  | /api/auth/users/:id/password | 更新用户密码 |

### 数据模型

-   **User** - 用户实体
    -   id: 用户唯一标识
    -   email: 用户邮箱（唯一）
    -   password: 密码（加密存储）
    -   firstName: 名
    -   lastName: 姓
    -   role: 用户角色（ADMIN, USER, SUPER_ADMIN）
    -   tenantId: 租户 ID
    -   emailVerified: 邮箱是否已验证
    -   emailVerificationToken: 邮箱验证令牌
    -   passwordResetToken: 密码重置令牌
    -   avatar: 用户头像
    -   isActive: 用户是否激活
    -   lastLoginAt: 最后登录时间
    -   createdAt: 创建时间
    -   updatedAt: 更新时间

### 配置要求

在 `.env` 文件中添加以下环境变量：

```bash
# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 邮件配置（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@example.com

# 应用配置
APP_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

### 使用示例

#### 1. 用户登录

```typescript
import { AuthService } from '@oksai/auth';

const authService = new AuthService();

try {
	const loginDto = {
		email: 'user@example.com',
		password: 'password123'
	};

	const result = await authService.login(loginDto, 'tenant-123');

	console.log('登录成功', result);
} catch (error) {
	console.error('登录失败', error);
}
```

#### 2. 用户注册

```typescript
import { AuthService } from '@oksai/auth';

const authService = new AuthService();

try {
	const registerDto = {
		email: 'new@example.com',
		password: 'SecurePass123!',
		firstName: 'John',
		lastName: 'Doe',
		tenantId: 'tenant-123'
	};

	const result = await authService.register(registerDto, 'tenant-123');

	console.log('注册成功', result);
} catch (error) {
	console.error('注册失败', error);
}
```

#### 3. 刷新访问令牌

```typescript
import { AuthService } from '@oksai/auth';

const authService = new AuthService();

try {
	const refreshTokenDto = { refreshToken: 'refresh_token_abc123' };

	const result = await authService.refreshToken(refreshTokenDto);

	console.log('令牌刷新成功', result);
} catch (error) {
	console.error('令牌刷新失败', error);
}
```

#### 4. 密码重置

```typescript
import { AuthService } from '@oksai/auth';

const authService = new AuthService();

try {
	const resetPasswordDto = { email: 'user@example.com', token: 'reset_token_xyz789' };

	const result = await authService.resetPassword(resetPasswordDto);

	console.log('密码重置成功', result);
} catch (error) {
	console.error('密码重置失败', error);
}
```

#### 5. 验证邮箱

```typescript
import { AuthService } from '@oksai/auth';

const authService = new AuthService();

try {
	const verifyEmailDto = { token: 'verify_token_abc123' };

	const result = await authService.verifyEmail(verifyEmailDto);

	console.log('邮箱验证成功', result);
} catch (error) {
	console.error('邮箱验证失败', error);
}
```

### 测试

运行测试：

```bash
cd libs/auth
pnpm run test
```

查看测试覆盖率：

```bash
cd libs/auth
pnpm run test:cov
```

---

## 依赖项

```json
{
	"dependencies": {
		"@oksai/core": "workspace:*",
		"@nestjs/common": "catalog:",
		"@nestjs/core": "catalog:",
		"@mikro-orm/nestjs": "catalog:",
		"@mikro-orm/core": "catalog:",
		"class-validator": "catalog:"
	}
}
```

## 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](../../.github/CONTRIBUTING.md) 了解如何参与项目。

## 许可证

AGPL-3.0

## 联系方式

如有问题，请联系：

-   邮箱：team@oksai.io
-   网站：https://oksai.io
