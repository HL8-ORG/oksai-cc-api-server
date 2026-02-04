# 常见问题

## 📑 目录

-   [项目相关](#项目相关)
-   [开发相关](#开发相关)
-   [部署相关](#部署相关)
-   [测试相关](#测试相关)
-   [性能相关](#性能相关)
-   [安全相关](#安全相关)
-   [插件开发相关](#插件开发相关)
-   [API 相关](#api-相关)
-   [数据库相关](#数据库相关)
-   [故障排查](#故障排查)

---

## 项目相关

### Q: OKSAI 平台是什么？

A: OKSAI 平台是一个基于 MonoRepo 架构的多租户 SAAS 服务端应用，提供 ERP/CRM/HRM/ATS/PM 等综合业务管理功能。

### Q: OKSAI 平台基于什么技术栈？

A: OKSAI 平台基于 Node.js + TypeScript + NestJS + MikroORM + PostgreSQL 技术栈。

### Q: OKSAI 平台与 Gauzy 的关系？

A: OKSAI 平台基于开源项目 [Ever Gauzy](https://github.com/ever-co/ever-gauzy) 进行重构和简化，移除了不必要的功能和集成。

### Q: 如何贡献代码？

A: 参考 [开发指南](./DEVELOPMENT_GUIDE.md#文档贡献指南) 了解如何贡献代码。

---

## 开发相关

### Q: 如何搭建开发环境？

A: 参考 [开发指南 - 环境搭建](./DEVELOPMENT_GUIDE.md#41-环境搭建) 了解如何搭建开发环境。

### Q: 如何创建新的 @oksai/ 包？

A: 参考 [开发指南 - 创建新模块指南](./DEVELOPMENT_GUIDE.md#45-创建新模块指南) 了解如何创建新模块。

### Q: 如何从 backup 复用代码？

A: 参考 [开发指南 - 从 backup 复用代码指南](./DEVELOPMENT_GUIDE.md#46-从-backup-复用代码指南) 了解如何复用代码。

### Q: 如何解决依赖冲突？

A: 运行 `pnpm install` 重新安装依赖，或运行 `pnpm dedupe` 解决依赖冲突。

### Q: 如何配置数据库？

A: 参考 [开发指南 - 开发配置](./DEVELOPMENT_GUIDE.md#47-开发配置) 了解如何配置数据库。

### Q: 如何配置 OAuth 认证？

A: 参考 [开发指南 - 开发配置](./DEVELOPMENT_GUIDE.md#47-开发配置) 了解如何配置 OAuth 认证。

---

## 部署相关

### Q: 如何构建生产版本？

A: 运行 `pnpm run build:prod` 构建生产版本。

### Q: 如何部署应用到生产环境？

A: 参考 [部署指南](./DEPLOYMENT_GUIDE.md) 了解如何部署应用。

### Q: 如何配置生产环境？

A: 参考 [部署指南 - 环境配置](./DEPLOYMENT_GUIDE.md#环境配置) 了解如何配置生产环境。

### Q: 如何进行数据库迁移？

A: 参考 [开发指南 - 数据库迁移命令](./DEVELOPMENT_GUIDE.md#44-数据库迁移命令) 了解如何进行数据库迁移。

### Q: 如何回滚数据库迁移？

A: 运行 `pnpm migration:revert` 回滚最后一次迁移。

### Q: 如何监控应用性能？

A: 参考 [部署指南 - 监控和日志](./DEPLOYMENT_GUIDE.md#监控和日志) 了解如何监控应用性能。

---

## 测试相关

### Q: 如何编写单元测试？

A: 参考 [测试指南 - 单元测试](./TESTING_GUIDE.md#单元测试) 了解如何编写单元测试。

### Q: 如何运行测试？

A: 参考 [测试指南 - 测试命令](./TESTING_GUIDE.md#测试命令) 了解如何运行测试。

### Q: 如何生成测试覆盖率报告？

A: 运行 `pnpm run test:cov` 生成测试覆盖率报告。

### Q: 如何提高测试覆盖率？

A: 参考 [测试指南 - 常见问题](./TESTING_GUIDE.md#覆盖率相关) 了解如何提高测试覆盖率。

### Q: 测试覆盖率要求是多少？

A: 核心业务逻辑测试覆盖率须达到 80% 以上，关键路径测试覆盖率须达到 90% 以上。

---

## 性能相关

### Q: 如何优化应用性能？

A: 参考 [部署指南 - 性能优化](./DEPLOYMENT_GUIDE.md#性能优化) 了解如何优化应用性能。

### Q: 如何优化数据库性能？

A: 参考 [数据库模型 - 数据库优化](./DATABASE_SCHEMA.md#数据库优化) 了解如何优化数据库性能。

### Q: 如何处理高并发？

A: 使用水平扩展和负载均衡：

```bash
kubectl scale deployment/oksai-api --replicas=10
```

### Q: 如何优化查询性能？

A: 参考 [数据库模型 - 索引设计](./DATABASE_SCHEMA.md#索引设计) 了解如何优化查询性能。

---

## 安全相关

### Q: 如何加强应用安全？

A: 参考 [部署指南 - 安全配置](./DEPLOYMENT_GUIDE.md#安全配置) 了解如何加强应用安全。

### Q: 如何处理安全漏洞？

A: 定期更新依赖，使用安全扫描工具：

```bash
npm audit fix
```

### Q: 如何配置 JWT 令牌？

A: 参考 [开发指南 - 开发配置](./DEVELOPMENT_GUIDE.md#47-开发配置) 了解如何配置 JWT 令牌。

### Q: 如何配置 OAuth 认证？

A: 参考 [开发指南 - 开发配置](./DEVELOPMENT_GUIDE.md#47-开发配置) 了解如何配置 OAuth 认证。

---

## 插件开发相关

### Q: 如何创建新的插件？

A: 参考 [插件开发指南 - 创建插件](./PLUGIN_DEVELOPMENT.md#创建插件) 了解如何创建新插件。

### Q: 如何调试插件？

A: 使用 VS Code 的调试功能，设置断点调试插件代码。

### Q: 如何在插件中使用数据库？

A: 使用 MikroORM 的 EntityManager 在插件中访问数据库。

### Q: 如何测试插件？

A: 参考 [插件开发指南 - 插件测试](./PLUGIN_DEVELOPMENT.md#插件测试) 了解如何测试插件。

---

## API 相关

### Q: 如何认证 API 请求？

A: 使用 JWT 令牌认证 API 请求：

```http
Authorization: Bearer <access_token>
```

### Q: 如何刷新令牌？

A: 使用刷新令牌获取新的访问令牌：

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```

### Q: 如何处理 API 错误？

A: 参考 [API 参考 - 错误码说明](./API_REFERENCE.md#错误码说明) 了解如何处理 API 错误。

### Q: API 的基础 URL 是什么？

A: API 的基础 URL 是 `http://localhost:3000/api/v1`。

---

## 数据库相关

### Q: 如何设计多租户数据库？

A: 使用租户 ID 字段区分不同租户的数据，在查询时过滤租户 ID。

### Q: 如何处理软删除？

A: 使用 deletedAt 字段标记删除的记录，在查询时过滤 deletedAt 为 null 的记录。

### Q: 如何创建数据库迁移？

A: 使用 MikroORM 的迁移工具创建迁移：

```bash
pnpm migration:generate
```

### Q: 如何回滚数据库迁移？

A: 使用 MikroORM 的回滚工具回滚迁移：

```bash
pnpm migration:revert
```

### Q: 如何优化数据库性能？

A: 参考 [数据库模型 - 数据库优化](./DATABASE_SCHEMA.md#数据库优化) 了解如何优化数据库性能。

---

## 故障排查

### Q: 数据库连接失败

**错误信息：** `Connection error: could not connect to database`

**解决方法：**

1. 检查 `.env` 文件中的数据库配置
2. 确保 PostgreSQL 服务已启动
3. 检查数据库用户名和密码是否正确
4. 检查防火墙设置

### Q: JWT 令牌验证失败

**错误信息：** `UnauthorizedException: 无效的令牌`

**解决方法：**

1. 检查 JWT 密钥配置
2. 检查令牌是否过期
3. 检查令牌格式是否正确

### Q: 依赖冲突

**错误信息：** `Error: Cannot find module 'xxx'`

**解决方法：**

1. 运行 `pnpm install` 重新安装依赖
2. 检查 `package.json` 中的依赖版本
3. 运行 `pnpm dedupe` 解决依赖冲突

### Q: 端口被占用

**错误信息：** `Error: listen EADDRINUSE: address already in use :::3000`

**解决方法：**

1. 找到占用端口的进程：`lsof -ti :3000`
2. 杀死进程：`kill -9 <pid>`
3. 或者修改端口号：`.env` 文件中修改 `PORT` 配置

### Q: 内存不足

**错误信息：** `JavaScript heap out of memory`

**解决方法：**

1. 增加 Node.js 内存限制：`NODE_OPTIONS=--max-old-space-size=8192`
2. 优化代码，减少内存使用
3. 增加服务器内存

### Q: 应用启动失败

**错误信息：** `Error: Cannot start application`

**解决方法：**

1. 检查日志输出，查看详细错误信息
2. 检查环境变量配置
3. 检查数据库连接
4. 检查依赖是否正确安装

### Q: 测试失败

**错误信息：** `Test failed`

**解决方法：**

1. 运行 `pnpm test --verbose` 查看详细错误信息
2. 检查测试代码是否有错误
3. 检查依赖是否正确配置
4. 更新测试用例

---

## 更多帮助

如果本 FAQ 没有解决您的问题，您可以通过以下方式寻求帮助：

-   **提交 Issue**：[GitHub Issues](https://github.com/oksais/platform/issues)
-   **加入讨论**：[GitHub Discussions](https://github.com/oksais/platform/discussions)
-   **查看项目 AGENTS.md**：[AGENTS.md](../AGENTS.md)
-   **查阅项目文档**：[项目文档](./)

---

## 版本信息

-   **文档版本：** 1.0.0
-   **最后更新：** 2026-02-04
-   **维护者：** OKSAI 平台团队
