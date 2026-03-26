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
#   ./scripts/deploy-cloudflare.sh [项目名称]
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
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

# 检查项目是否存在，如果不存在则创建
echo -e "${CYAN}[0/4] 检查 Cloudflare Pages 项目...${NC}"
if ! wrangler pages project list | grep -q "$PROJECT_NAME"; then
    echo -e "${YELLOW}项目 '${PROJECT_NAME}' 不存在，正在创建...${NC}"
    
    # 询问用户选择创建方式
    echo -e "${BLUE}请选择项目创建方式:${NC}"
    echo "  1) 通过 wrangler CLI 创建"
    echo "  2) 在 Cloudflare 控制台手动创建（推荐）"
    echo -n "选择 (1 或 2): "
    read -r choice
    
    case "$choice" in
        1)
            echo -e "${YELLOW}通过 wrangler CLI 创建项目...${NC}"
            if ! wrangler pages project create "$PROJECT_NAME" --production-branch main; then
            echo -e "${RED}创建项目失败，请在 Cloudflare 控制台手动创建:${NC}"
            echo ""
            echo -e "${CYAN}【新版界面（左侧导航栏）】${NC}"
            echo "  1. 访问 https://dash.cloudflare.com"
            echo "  2. 左侧导航 → Workers & Pages → Create application → Pages → Upload assets"
            echo "  3. 项目名称填写: $PROJECT_NAME"
            echo ""
            echo -e "${CYAN}【旧版界面（顶部导航栏）】${NC}"
            echo "  1. 访问 https://dash.cloudflare.com"
            echo "  2. 顶部导航 → Pages → Create a project → Direct Upload"
            echo "  3. 项目名称填写: $PROJECT_NAME"
            echo ""
            echo -e "${GREEN}【界面切换】${NC}"
            echo "  - 切换到新版：旧版右下角 'Try new dashboard'"
            echo "  - 切换到旧版：新版左下角 'Switch to classic dashboard'"
            exit 1
            fi
            echo -e "${GREEN}项目创建成功!${NC}"
            ;;
        2)
            echo -e "${YELLOW}请在 Cloudflare 控制台手动创建项目:${NC}"
            echo ""
            echo -e "${CYAN}【新版界面（左侧导航栏）】${NC}"
            echo "  1. 访问 https://dash.cloudflare.com"
            echo "  2. 左侧导航 → Workers & Pages → Create application → Pages → Upload assets"
            echo "  3. 项目名称填写: $PROJECT_NAME"
            echo ""
            echo -e "${CYAN}【旧版界面（顶部导航栏）】${NC}"
            echo "  1. 访问 https://dash.cloudflare.com"
            echo "  2. 顶部导航 → Pages → Create a project → Direct Upload"
            echo "  3. 项目名称填写: $PROJECT_NAME"
            echo ""
            echo -e "${GREEN}【界面切换】${NC}"
            echo "  - 切换到新版：旧版右下角 'Try new dashboard'"
            echo "  - 切换到旧版：新版左下角 'Switch to classic dashboard'"
            echo ""
            echo -e "${YELLOW}创建完成后按 Enter 继续...${NC}"
            read -r
            ;;
        *)
            echo -e "${RED}无效选择，退出脚本${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${GREEN}项目 '${PROJECT_NAME}' 已存在${NC}"
fi

# Step 1: 安装依赖
echo -e "${CYAN}[1/4] 安装依赖...${NC}"
pnpm install --frozen-lockfile

# Step 2: 运行测试
echo -e "${CYAN}[2/4] 运行测试...${NC}"
pnpm run type-check && pnpm run test

# Step 3: 构建
echo -e "${CYAN}[3/4] 构建应用...${NC}"
VITE_BASE=/ pnpm run build

# Step 4: 部署
echo -e "${CYAN}[4/4] 部署到 Cloudflare Pages...${NC}"
wrangler pages deploy dist --project-name="$PROJECT_NAME"

echo ""
echo -e "${GREEN}部署完成!${NC}"
echo -e "${YELLOW}访问地址: https://${PROJECT_NAME}.pages.dev${NC}"
echo -e "${YELLOW}部署日志: https://dash.cloudflare.com/?to=/:account/pages/view/${PROJECT_NAME}${NC}"
