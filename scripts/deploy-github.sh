#!/bin/bash
# ============================================================
# deploy-github.sh - 手动构建并部署到 GitHub Pages
#
# 前置条件：
#   1. 已安装 pnpm
#   2. 当前目录在项目根目录
#   3. 已配置 git remote origin 指向 GitHub 仓库
#   4. 仓库 Settings > Pages > Source 设置为 GitHub Actions
#
# 用法：
#   chmod +x scripts/deploy-github.sh
#   ./scripts/deploy-github.sh
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  GitHub Pages 手动部署脚本${NC}"
echo -e "${CYAN}========================================${NC}"

# 获取仓库名称（从 git remote origin）
REPO_NAME=$(basename -s .git "$(git config --get remote.origin.url 2>/dev/null || echo '')")

if [ -z "$REPO_NAME" ]; then
    echo -e "${RED}错误: 无法获取仓库名称，请确认 git remote origin 已配置${NC}"
    exit 1
fi

echo -e "${YELLOW}仓库名: ${REPO_NAME}${NC}"
echo -e "${YELLOW}Base 路径: /${REPO_NAME}/${NC}"
echo ""

# Step 1: 安装依赖
echo -e "${CYAN}[1/4] 安装依赖...${NC}"
pnpm install --frozen-lockfile

# Step 2: 运行测试
echo -e "${CYAN}[2/4] 运行测试...${NC}"
pnpm run type-check && pnpm run test

# Step 3: 构建（设置 VITE_BASE 为仓库名）
echo -e "${CYAN}[3/4] 构建 (VITE_BASE=/${REPO_NAME}/)...${NC}"
VITE_BASE="/${REPO_NAME}/" pnpm run build

# Step 4: 提示
echo -e "${CYAN}[4/4] 构建完成!${NC}"
echo ""
echo -e "${GREEN}构建产物位于 dist/ 目录${NC}"
echo -e "${YELLOW}请通过以下方式部署:${NC}"
echo -e "  1. 推送到 main 分支，GitHub Actions 会自动部署"
echo -e "  2. 在 GitHub 仓库 Settings > Pages > Source 中选择 GitHub Actions"
echo ""
echo -e "${YELLOW}本地预览:${NC}"
echo -e "  VITE_BASE=/${REPO_NAME}/ pnpm run preview"
