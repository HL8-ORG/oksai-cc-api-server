#!/bin/bash

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}E2E 测试运行脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查 Docker 容器是否运行
check_docker() {
    if docker ps | grep -q "test-db"; then
        echo -e "${GREEN}✓${NC} Docker 测试容器运行中"
    else
        echo -e "${YELLOW}⚠${NC}  Docker 测试容器未运行"
        echo -e "${YELLOW}提示：${NC} 请运行 'docker-compose -f docker-compose.test.yml up -d' 启动测试容器"
        return 1
    fi
}

# 启动 E2E 测试
start_test() {
    echo -e "${GREEN}启动 E2E 测试...${NC}"
    
    # 检查 Docker 容器
    if ! check_docker; then
        exit 1
    fi

    # 运行 E2E 测试
    cd apps/base-api
    pnpm test:e2e --testPathPattern="test-helper.ts" --testTimeout=60000
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✓${NC} E2E 测试成功"
    else
        echo -e "${RED}✗${NC} E2E 测试失败，退出码：$exit_code"
    fi

    return $exit_code
}

# 运行所有 E2E 测试
run_all_tests() {
    echo -e "${GREEN}运行所有 E2E 测试...${NC}"
    
    if ! check_docker; then
        exit 1
    fi

    cd apps/base-api
    pnpm test:e2e --testTimeout=60000
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✓${NC} 所有 E2E 测试成功"
    else
        echo -e "${RED}✗${NC} 部分测试失败，退出码：$exit_code"
    fi

    return $exit_code
}

# 显示帮助
show_help() {
    cat << EOF
${GREEN}用法:${NC}
    $0 [选项]

${GREEN}选项:${NC}
    ${GREEN}  check${NC}       - 检查 Docker 测试容器状态
    ${GREEN} start${NC}        - 启动 test-helper.ts 测试
    ${GREEN} all${NC}         - 运行所有 E2E 测试
    ${GREEN} help${NC}        - 显示此帮助信息

${YELLOW}示例:${NC}
    $0 check              # 检查 Docker 容器
    $0 all               # 运行所有 E2E 测试

${YELLOW}环境变量:${NC}
    可通过 .env 文件或命令行参数配置
EOF
}

# 主函数
case "$1" in
    check)
        check_docker
        ;;
    start)
        start_test
        ;;
    all)
        run_all_tests
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "${RED}未知选项: $1${NC}"
        echo -e "使用 '$0 help' 查看可用选项"
        exit 1
        ;;
esac
