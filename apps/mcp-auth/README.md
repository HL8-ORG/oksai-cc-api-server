# @oksai/mcp-auth

OAuth 2.0 授权服务器，为 MCP 服务端提供 JWT 令牌和 JWKS 支持。

## 概述

@oksai/mcp-auth 是一个基于 NestJS 的 OAuth 2.0 授权服务器，为 MCP（Model Context Protocol）服务端提供：

-   **JWT 签名和验证**：使用 `jose` 库进行安全的 JWT 操作
-   **JWKS 端点**：提供公钥集合供客户端验证令牌
-   **令牌内省**：验证令牌有效性并返回令牌信息
-   **健康检查**：监控服务器状态

## 功能特性

### 核心功能

-   ✅ JWT 令牌签名和验证
-   ✅ 访问令牌和刷新令牌生成
-   ✅ 令牌刷新机制
-   ✅ JWKS 公钥端点（RFC 7517）
-   ✅ 令牌内省端点（RFC 7662）
-   ✅ 支持多种签名算法（RS256、ES256、HS256 等）
-   ✅ 密钥轮换支持
-   ✅ 过期密钥自动清理

### 安全特性

-   使用 `jose` 库进行安全的加密操作
-   支持 RSA 和 EC 密钥
-   支持对称密钥（HMAC）
-   密钥轮换机制
-   令牌有效期管理

## 安装

```bash
pnpm install
```

## 配置

### 环境变量

创建 `.env` 文件并配置以下变量：

```bash
# 服务器配置
HOST=0.0.0.0
PORT=3003

# OAuth 配置
JWT_ISSUER=oksai-mcp-auth
JWT_AUDIENCE=oksai-mcp
JWT_ALGORITHM=RS256
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=86400

# JWT 密钥（生产环境必须设置）
JWT_PRIVATE_KEY=your-private-key.pem
JWT_PUBLIC_KEY=your-public-key.pem

# JWKS 配置
JWT_JWKS_ENABLED=true
JWT_JWKS_PATH=/.well-known/jwks.json
JWT_KEY_ID=default

# CORS 配置
CORS_ORIGIN=*
DEBUG=true
```

### 密钥生成

#### 生成 RSA 密钥对（推荐）

```bash
# 生成私钥
openssl genrsa -out private.pem 2048

# 生成公钥
openssl rsa -in private.pem -pubout -out public.pem

# 转换为 PKCS8 格式
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private.pem -out private-pkcs8.pem
```

#### 生成 EC 密钥对

```bash
# 生成私钥
openssl ecparam -name secp256r1 -genkey -noout -out private.pem

# 生成公钥
openssl ec -in private.pem -pubout -out public.pem

# 转换为 PKCS8 格式
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private.pem -out private-pkcs8.pem
```

### 配置密钥

#### 方式 1：环境变量（推荐）

```bash
export JWT_PRIVATE_KEY="$(cat private-pkcs8.pem)"
export JWT_PUBLIC_KEY="$(cat public.pem)"
```

#### 方式 2：配置文件

```typescript
// 配置文件中直接使用 PEM 内容
const privateKey = `-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----`;
```

## 使用

### 启动服务

#### 开发模式

```bash
pnpm start:dev
```

#### 生产模式

```bash
pnpm build
pnpm start:prod
```

### API 端点

#### JWKS 端点

获取公钥集合用于验证 JWT 令牌。

```
GET /.well-known/jwks.json
```

**响应示例：**

```json
{
	"keys": [
		{
			"kty": "RSA",
			"kid": "default",
			"use": "sig",
			"alg": "RS256",
			"n": "0vx7agoebGcQSuuPiLJXZptN9nndrQDkBkkuMPE4Qc72esrf...",
			"e": "AQAB",
			"x5t": "http://example.com"
		}
	]
}
```

#### 令牌内省端点

验证令牌的有效性并返回令牌信息。

```
GET /oauth/introspect?token=<access_token>
```

**响应示例：**

```json
{
	"active": true,
	"sub": "user-123",
	"exp": 1735689600,
	"iat": 1735686000,
	"iss": "oksai-mcp-auth",
	"aud": "oksai-mcp",
	"username": "user@example.com"
}
```

#### 健康检查端点

```
GET /health
```

**响应示例：**

```json
{
	"status": "ok",
	"service": "oauth-auth-server",
	"version": "0.1.0",
	"timestamp": "2026-02-10T02:30:00.000Z"
}
```

## 开发

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:cov

# 监听模式运行测试
pnpm test:watch
```

### 代码规范

```bash
# 检查代码规范
pnpm lint

# 自动修复代码规范问题
pnpm lint:fix

# 类型检查
pnpm typecheck
```

### 构建

```bash
# 构建项目
pnpm build
```

## 集成

### 与 MCP 服务端集成

在 MCP 服务端中使用 OAuth 授权服务器：

1. **配置环境变量**

```bash
# MCP 服务端配置
GAUZY_API_URL=http://localhost:3000
GAUZY_AUTH_ENABLED=true
GAUZY_AUTH_EMAIL=admin@example.com
GAUZY_AUTH_PASSWORD=admin123

# OAuth 服务器配置
OAUTH_SERVER_URL=http://localhost:3003
```

2. **验证令牌**

使用 JWKS 端点验证令牌：

```typescript
import { createLocalJWKSet } from 'jose';

const jwks = createLocalJWKSet();
await jwks.addKey(publicKeyPem);

const { payload, protectedHeader } = await jwtVerify(token, jwks);
console.log('Token payload:', payload);
```

3. **内省令牌**

```bash
curl "http://localhost:3003/oauth/introspect?token=<access_token>"
```

## 架构

```
@oksai/mcp-auth
├── src/
│   ├── main.ts              # 应用入口
│   ├── oauth/
│   │   └── oauth.controller.ts   # OAuth 控制器
│   ├── auth/
│   │   ├── jwt.service.ts        # JWT 服务
│   │   └── jwt.service.spec.ts   # JWT 服务测试
│   ├── jwks/
│   │   ├── jwks.service.ts       # JWKS 服务
│   │   └── jwks.service.spec.ts  # JWKS 服务测试
│   └── environments/
│       ├── environment.ts         # 开发环境配置
│       ├── environment.prod.ts    # 生产环境配置
│       └── index.ts
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── jest.config.ts
```

## 安全建议

### 生产环境

1. **使用强密钥**

    - 使用至少 2048 位的 RSA 密钥
    - 或使用 secp256r1 EC 密钥

2. **保护私钥**

    - 不要将私钥提交到版本控制
    - 使用密钥管理服务（如 AWS KMS、Vault）
    - 设置适当的文件权限

3. **启用 HTTPS**

    - 使用反向代理（Nginx、Caddy）终止 TLS
    - 配置信任代理设置

4. **令牌有效期**

    - 访问令牌：15-60 分钟
    - 刷新令牌：7-30 天

5. **密钥轮换**
    - 定期轮换密钥（如每 90 天）
    - 保留旧密钥直到所有令牌过期
    - 监控密钥使用情况

### 开发环境

1. **使用测试密钥**

    - 生成测试专用的密钥对
    - 不要在生产环境使用

2. **禁用 JWKS（可选）**
    - 开发环境可以禁用 JWKS 端点
    - 设置 `JWT_JWKS_ENABLED=false`

## 故障排查

### 常见问题

#### 1. 无法启动服务器

检查端口是否被占用：

```bash
lsof -i :3003
```

#### 2. JWT 签名失败

-   检查私钥格式是否正确
-   确认私钥是 PKCS8 格式
-   验证私钥与算法类型匹配

#### 3. JWKS 端点返回空

-   检查 `JWT_JWKS_ENABLED` 是否为 `true`
-   确认公钥是否正确配置
-   查看服务器日志获取详细错误信息

#### 4. 令牌验证失败

-   确认令牌未过期
-   检查发行者和受众是否匹配
-   验证密钥是否正确

## 贡献

欢迎贡献！请阅读项目贡献指南。

## 许可证

AGPL-3.0
