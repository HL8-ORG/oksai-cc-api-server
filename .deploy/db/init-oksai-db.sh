#!/bin/bash
set -e

echo "=========================================="
echo "初始化 OKSAI 数据库"
echo "=========================================="

# 环境变量
export DATABASE_TYPE=${DATABASE_TYPE:-postgresql}
export DATABASE_HOST=${DATABASE_HOST:-db}
export DATABASE_PORT=${DATABASE_PORT:-5432}
export DATABASE_NAME=${DATABASE_NAME:-oksai}
export DATABASE_USERNAME=${DATABASE_USERNAME:-postgres}
export DATABASE_PASSWORD=${DATABASE_PASSWORD:-oksai_password}

echo ""
echo "📊 数据库配置:"
echo "  类型: $DATABASE_TYPE"
echo "  主机: $DATABASE_HOST"
echo "  端口: $DATABASE_PORT"
echo "  名称: $DATABASE_NAME"
echo "  用户: $DATABASE_USERNAME"
echo ""

# 等待数据库就绪
echo "⏳ 等待数据库就绪..."
until PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USERNAME -d postgres -c '\l' 2>/dev/null; do
  echo "  等待 PostgreSQL 启动..."
  sleep 2
done
echo "✅ PostgreSQL 已就绪"
echo ""

# 创建数据库（如果不存在）
echo "🔍 检查数据库..."
PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USERNAME -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME'" | grep -q 1 || \
  echo "📊 创建数据库: $DATABASE_NAME" && \
  PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USERNAME -d postgres -v ON_ERROR_STOP=1 <<-EOSQL
    CREATE DATABASE $DATABASE_NAME;
  EOSQL
echo ""

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 5
echo ""

# 检查数据库连接
echo "🔍 检查数据库连接..."
PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USERNAME -d $DATABASE_NAME -c '\l' 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ 数据库连接成功"
else
  echo "❌ 数据库连接失败"
  exit 1
fi
echo ""

# 检查应用 API
echo "🔍 检查应用 API..."
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null; then
    HTTP_CODE=$(cat /dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
      echo "✅ 应用 API 已就绪 (HTTP $HTTP_CODE)"
      break
    fi
  fi
  sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "❌ 应用 API 启动超时"
  exit 1
fi
echo ""

# 显示总结
echo "=========================================="
echo "✅ 初始化完成"
echo "=========================================="
echo ""
echo "可用的 API 端点:"
echo "  基础 API: http://localhost:3000/api"
echo "  健康检查: http://localhost:3000/api/health"
echo "  Swagger 文档: http://localhost:3000/api-docs"
echo "  Scalar 文档: http://localhost:3000/docs"
echo ""
echo "Analytics API:"
echo "  事件跟踪: POST   /api/analytics/events"
echo "  指标查询: GET    /api/analytics/metrics"
echo "  仪表板数据: GET  /api/analytics/dashboard"
echo "  报表生成: POST   /api/analytics/reports"
echo ""
echo "Reporting API:"
echo "  报表生成: POST   /api/reporting/reports"
echo "  报表列表: GET    /api/reporting/reports"
echo "  报表详情: GET    /api/reporting/reports/:id"
echo ""
