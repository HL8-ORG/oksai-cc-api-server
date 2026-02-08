# OKSAI Platform - 认证流程序列图

## 用户登录流程

```plantuml
@startuml
actor "用户" as user
participant "前端应用" as frontend
participant "AuthController" as controller
participant "AuthService" as service
participant "UserRepository" as userRepo
participant "JwtService" as jwt
participant "Redis" as cache
participant "TenantRepository" as tenantRepo

user -> frontend: 输入邮箱和密码
activate frontend
frontend -> controller: POST /api/auth/login
activate controller
controller -> service: login(credentials)
activate service

service -> userRepo: findByEmail(email)
activate userRepo
userRepo --> service: User
deactivate userRepo

service -> service: verifyPassword(password, hash)
service --> service: isValid

alt 密码正确
    service -> jwt: generateTokenPair(payload)
    jwt --> service: { accessToken, refreshToken }

    service -> cache: 存储会话
    activate cache
    cache --> service: OK
    deactivate cache

    service -> userRepo: updateLastLoginAt(userId)
    userRepo --> service: OK

    service --> controller: LoginResponse
else 密码错误
    service --> controller: throw UnauthorizedException("用户名或密码错误")
end

deactivate service
controller --> frontend: 响应结果
activate frontend
deactivate frontend
frontend -> user: 显示登录状态/令牌
deactivate frontend

@enduml
```

## 用户注册流程

```plantuml
@startuml
actor "用户" as user
participant "前端应用" as frontend
participant "AuthController" as controller
participant "AuthService" as service
participant "UserRepository" as userRepo
participant "TenantRepository" as tenantRepo
participant "JwtService" as jwt
participant "MailQueueService" as mail
participant "TemplateEngine" as template

user -> frontend: 输入注册信息
activate frontend
frontend -> controller: POST /api/auth/register
activate controller
controller -> service: register(credentials)
activate service

service -> userRepo: findByEmail(email)
activate userRepo
userRepo --> service: null (邮箱未使用）
deactivate userRepo

service -> service: validatePasswordStrength(password)
service --> service: valid (密码强度符合要求）

service -> service: hashPassword(password)
service --> service: hashedPassword

service -> tenantRepo: findOne(slug: "default")
activate tenantRepo
tenantRepo --> service: Tenant (默认租户）
deactivate tenantRepo

service -> userRepo: create(userData)
activate userRepo
userRepo --> service: User
deactivate userRepo

service -> jwt: generateTokenPair(payload)
jwt --> service: { accessToken, refreshToken }

service -> template: renderWelcomeEmail(userName, loginUrl)
activate template
template --> service: html (邮件内容）
deactivate template

service -> mail: add({ to, subject, html })
activate mail
mail --> service: OK (已加入队列）
deactivate mail

service --> controller: LoginResponse
deactivate service
controller --> frontend: 响应结果
activate frontend
deactivate frontend
frontend -> user: 显示注册成功/发送欢迎邮件
deactivate frontend

@enduml
```

## Token 刷新流程

```plantuml
@startuml
actor "前端应用" as frontend
participant "AuthController" as controller
participant "AuthService" as service
participant "JwtService" as jwt
participant "JwtBlacklistService" as blacklist
participant "UserRepository" as userRepo

frontend -> controller: POST /api/auth/refresh
activate controller
controller -> service: refreshToken(refreshToken)
activate service

service -> jwt: verifyRefreshToken(refreshToken)
activate jwt
jwt --> service: payload (用户信息）
deactivate jwt

service -> blacklist: isBlacklisted(refreshToken)
activate blacklist
blacklist --> service: false (未在黑名单中）
deactivate blacklist

service -> userRepo: findOne(id)
activate userRepo
userRepo --> service: User (用户存在）
deactivate userRepo

alt Token 有效
    service -> jwt: generateTokenPair(newPayload)
    activate jwt
    jwt --> service: { accessToken, refreshToken }
    deactivate jwt

    service --> controller: RefreshTokenResponse
else Token 无效或已过期
    service --> controller: throw UnauthorizedException("无效的刷新令牌")
end

deactivate service
controller --> frontend: 响应新令牌或错误
deactivate frontend

@enduml
```

## 用户登出流程

```plantuml
@startuml
actor "用户" as user
participant "前端应用" as frontend
participant "AuthController" as controller
participant "AuthService" as service
participant "JwtBlacklistService" as blacklist
participant "JwtService" as jwt

user -> frontend: 点击登出
activate frontend
frontend -> controller: POST /api/auth/logout
activate controller
controller -> service: logout(userId, accessToken)
activate service

service -> jwt: verifyAccessToken(accessToken)
activate jwt
jwt --> service: payload (令牌信息，包含过期时间）
deactivate jwt

service -> blacklist: isAvailable()
activate blacklist
blacklist --> service: true (黑名单服务可用）
deactivate blacklist

alt 令牌未过期
    service -> blacklist: add(token, expiresIn)
    activate blacklist
    blacklist --> service: OK (已加入黑名单）
    deactivate blacklist
else 令牌已过期
    service --> controller: OK (无需加入黑名单）
end

deactivate service
service --> controller: void (登出成功）
deactivate service
controller --> frontend: 响应成功
activate frontend
deactivate frontend
frontend -> user: 清除本地令牌，跳转到登录页
deactivate frontend

@enduml
```

## 密码重置流程

```plantuml
@startuml
actor "用户" as user
participant "前端应用" as frontend
participant "AuthController" as controller
participant "AuthService" as service
participant "UserRepository" as userRepo
participant "MailQueueService" as mail
participant "TemplateEngine" as template

group 忘记密码
    user -> frontend: 输入邮箱
    activate frontend
    frontend -> controller: POST /api/auth/forgot-password
    activate controller
    controller -> service: forgotPassword({ email })
    activate service

    service -> userRepo: findByEmail(email)
    activate userRepo
    userRepo --> service: User (用户存在）
    deactivate userRepo

    service -> service: generateResetToken()
    service --> service: { resetToken, resetTokenExpiresAt }

    service -> userRepo: update({ resetToken, resetTokenExpiresAt })
    activate userRepo
    userRepo --> service: OK
    deactivate userRepo

    service -> template: renderResetPasswordEmail(resetUrl, userName)
    activate template
    template --> service: html
    deactivate template

    service -> mail: add({ to, subject, html })
    activate mail
    mail --> service: OK
    deactivate mail

    service --> controller: void
    deactivate service
    controller --> frontend: 已发送重置邮件
    deactivate frontend
    frontend -> user: 显示邮件已发送提示
    deactivate frontend
end

group 重置密码
    user -> frontend: 点击邮件中的重置链接
    activate frontend
    frontend -> controller: POST /api/auth/reset-password
    activate controller
    controller -> service: resetPassword({ email, resetToken, newPassword })
    activate service

    service -> userRepo: findByEmail(email)
    activate userRepo
    userRepo --> service: User
    deactivate userRepo

    alt 验证重置令牌
        service -> service: verifyResetToken(token, expiresAt)
        service --> service: valid

        service -> service: validatePasswordStrength(newPassword)
        service --> service: valid

        service -> service: hashPassword(newPassword)
        service --> service: hashedPassword

        service -> userRepo: update({ password: hashedPassword, resetToken: null, resetTokenExpiresAt: null })
        activate userRepo
        userRepo --> service: OK
        deactivate userRepo

        service --> controller: void (密码重置成功）
    else 令牌无效或已过期
        service --> controller: throw BadRequestException("重置令牌无效或已过期")
    end

    deactivate service
    controller --> frontend: 响应结果
    deactivate frontend
    frontend -> user: 显示成功/错误信息
    deactivate frontend
end

@enduml
```

## 认证流程说明

### 安全特性

1. **密码哈希**: 使用 bcrypt 等安全哈希算法
2. **JWT 令牌**: 短期访问令牌 + 长期刷新令牌
3. **令牌黑名单**: 登出时将令牌加入黑名单
4. **密码强度**: 注册和重置时验证密码强度
5. **验证邮箱**: 支持邮箱验证（可选）

### 令牌机制

| 令牌类型     | 有效期  | 用途         |
| ------------ | ------- | ------------ |
| AccessToken  | 15 分钟 | API 访问     |
| RefreshToken | 7 天    | 刷新访问令牌 |
| ResetToken   | 1 小时  | 密码重置     |

### 错误处理

| 场景         | 响应状态码 | 错误消息           |
| ------------ | ---------- | ------------------ |
| 用户不存在   | 401        | 用户名或密码错误   |
| 密码错误     | 401        | 用户名或密码错误   |
| 密码强度不足 | 400        | 密码不符合安全要求 |
| 令牌无效     | 401        | 无效的刷新令牌     |
| 令牌已过期   | 401        | 刷新令牌已过期     |
| 邮箱已注册   | 409        | 此邮箱已被使用     |
| 重置令牌过期 | 400        | 重置令牌已过期     |
