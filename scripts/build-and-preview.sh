#!/bin/bash
# ============================================================
# build-and-preview.sh - 本地构建并预览
#
# 用法：
#   ./scripts/build-and-preview.sh              # 默认构建 (base: /)
#   ./scripts/build-and-preview.sh github       # 构建 GitHub Pages (base: /<repo>/)
# ============================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

MODE="${1:-local}"
REPO_NAME=$(basename -s .git "$(git config --get remote.origin.url 2>/dev/null || echo '')")

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  本地构建 & 预览${NC}"
echo -e "${CYAN}========================================${NC}"

# 确定构建模式
if [ "$MODE" = "github" ]; then
    if [ -z "$REPO_NAME" ]; then
        echo "错误: 无法获取仓库名称"
        exit 1
    fi
    VITE_BASE="/${REPO_NAME}/"
    echo -e "${YELLOW}模式: GitHub Pages (base: ${VITE_BASE})${NC}"
else
    VITE_BASE="/"
    echo -e "${YELLOW}模式: 本地预览 (base: /)${NC}"
fi
echo ""

# 安装依赖
echo -e "${CYAN}[1/3] 安装依赖...${NC}"
pnpm install --frozen-lockfile

# 构建
echo -e "${CYAN}[2/3] 构建...${NC}"
VITE_BASE="$VITE_BASE" pnpm run build

# 预览
echo -e "${CYAN}[3/3] 启动预览服务器...${NC}"
echo ""
echo -e "${GREEN}构建完成! 启动预览服务器 (Ctrl+C 停止)${NC}"
VITE_BASE="$VITE_BASE" pnpm run preview
