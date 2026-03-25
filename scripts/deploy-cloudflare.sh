#!/bin/bash
# ============================================================
# deploy-cloudflare.sh - 手动构建并部署到 Cloudflare Pages
#
# 前置条件：
#   1. 已安装 pnpm
#   2. 已安装 wrangler CLI (npm install -g wrangler)
#   3. 已通过 wrangler login 登录 Cloudflare 账号
#
# 用法：
#   chmod +x scripts/deploy-cloudflare.sh
#   ./scripts/deploy-cloudflare.sh
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Cloudflare Pages 手动部署脚本${NC}"
echo -e "${CYAN}========================================${NC}"

PROJECT_NAME="${1:-json-crypto}"
echo -e "${YELLOW}项目名称: ${PROJECT_NAME}${NC}"
echo ""

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}错误: wrangler 未安装${NC}"
    echo -e "${YELLOW}请运行: npm install -g wrangler${NC}"
    echo -e "${YELLOW}然后运行: wrangler login${NC}"
    exit 1
fi

# Step 1: 安装依赖
echo -e "${CYAN}[1/3] 安装依赖...${NC}"
pnpm install --frozen-lockfile

# Step 2: 运行测试
echo -e "${CYAN}[2/3] 运行测试...${NC}"
pnpm run type-check && pnpm run test

# Step 3: 构建并部署
echo -e "${CYAN}[3/3] 构建并部署...${NC}"
pnpm run build
wrangler pages deploy dist --project-name="$PROJECT_NAME"

echo ""
echo -e "${GREEN}部署完成!${NC}"
echo -e "${YELLOW}访问地址: https://${PROJECT_NAME}.pages.dev${NC}"
