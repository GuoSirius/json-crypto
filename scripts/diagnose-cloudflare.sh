#!/bin/bash
# ============================================================
# diagnose-cloudflare.sh - 诊断 Cloudflare Pages 部署问题
#
# 用法：
#   chmod +x scripts/diagnose-cloudflare.sh
#   ./scripts/diagnose-cloudflare.sh
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
echo -e "${CYAN}  Cloudflare Pages 部署问题诊断${NC}"
echo -e "${CYAN}========================================${NC}"

PROJECT_NAME="json-crypto"

echo -e "${BLUE}[1] 检查 wrangler CLI 是否安装...${NC}"
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}✗ wrangler 未安装${NC}"
    echo -e "${YELLOW}安装命令: npm install -g wrangler${NC}"
    echo -e "${YELLOW}登录命令: wrangler login${NC}"
    exit 1
else
    echo -e "${GREEN}✓ wrangler 已安装${NC}"
fi

echo -e "${BLUE}[2] 检查 wrangler 登录状态...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}✗ wrangler 未登录${NC}"
    echo -e "${YELLOW}请运行: wrangler login${NC}"
    exit 1
else
    echo -e "${GREEN}✓ wrangler 已登录${NC}"
fi

echo -e "${BLUE}[3] Cloudflare 界面风格识别...${NC}"
echo -e "${YELLOW}请确认你看到的是哪种界面风格:${NC}"
echo ""
echo -e "${CYAN}【新版界面特征】${NC}"
echo "  - 左侧有导航菜单: 'Overview', 'Workers & Pages', 'Account'"
echo "  - 页面布局现代化，分区清晰"
echo "  - 进入项目创建：左侧导航 → Workers & Pages → Create application → Pages → Upload assets"
echo ""
echo -e "${CYAN}【旧版界面特征】${NC}"
echo "  - 顶部有导航标签页: 'Overview', 'Analytics', 'DNS', 'Pages'"
echo "  - 右侧有侧边栏: 'Account Details', 'API Tokens' 等链接"
echo "  - 进入项目创建：顶部导航 → Pages → Create a project → Direct Upload"
echo ""
echo -e "${GREEN}【快速切换】${NC}"
echo "  - 切换到新版：旧版右下角 'Try new dashboard'"
echo "  - 切换到旧版：新版左下角 'Switch to classic dashboard'"
echo "  - 直接访问：https://dash.cloudflare.com/?to=/:account/pages"

echo -e "${BLUE}[4] 列出所有 Cloudflare Pages 项目...${NC}"
echo -e "${YELLOW}当前项目列表:${NC}"
wrangler pages project list

echo -e "${BLUE}[4] 检查目标项目是否存在...${NC}"
if wrangler pages project list | grep -q "$PROJECT_NAME"; then
    echo -e "${GREEN}✓ 项目 '$PROJECT_NAME' 存在${NC}"
    
    # 获取项目详情
    echo -e "${YELLOW}项目详情:${NC}"
    wrangler pages project view "$PROJECT_NAME"
else
    echo -e "${RED}✗ 项目 '$PROJECT_NAME' 不存在${NC}"
    echo ""
    echo -e "${BLUE}[解决方案]${NC}"
    echo "  1. 在 Cloudflare 控制台手动创建项目:"
    echo "     a) 访问 https://dash.cloudflare.com"
    echo "     b) 进入 Pages → Create a project"
    echo "     c) 选择 Direct Upload"
    echo "     d) 项目名称填写: $PROJECT_NAME"
    echo "     e) 创建完成后重新运行部署"
    echo ""
    echo "  2. 使用 wrangler CLI 创建项目:"
    echo "     wrangler pages project create $PROJECT_NAME --production-branch main"
    echo ""
    echo "  3. 修改项目名称（如果项目名被占用）:"
    echo "     编辑 .github/workflows/deploy.yml:"
    echo "     修改: --project-name=json-crypto"
    echo "     为: --project-name=your-custom-name"
fi

echo -e "${BLUE}[5] 检查 GitHub Secrets 设置...${NC}"
echo -e "${YELLOW}确保 GitHub Secrets 已正确设置:${NC}"
echo "  - CLOUDFLARE_API_TOKEN: Cloudflare API Token"
echo "  - CLOUDFLARE_ACCOUNT_ID: Cloudflare Account ID"
echo ""
echo -e "${YELLOW}验证方法:${NC}"
echo "  1. 访问 https://github.com/your-username/json-crypto/settings/secrets/actions"
echo "  2. 确保两个 secrets 都存在且值正确"
echo ""
echo -e "${YELLOW}获取 Account ID:${NC}"
echo "  - 新版本控制台: Workers & Pages → 右侧 Account ID"
echo "  - 旧版本控制台: 右下角 Account ID"
echo "  - 或访问: https://dash.cloudflare.com/?to=/:account/workers"
echo ""
echo -e "${YELLOW}创建 API Token:${NC}"
echo "  - 访问: https://dash.cloudflare.com/profile/api-tokens"
echo "  - 创建自定义令牌"
echo "  - 权限: Account → Cloudflare Pages → Edit"
echo "  - 账户资源: Include → All accounts"

echo -e "${BLUE}[6] 测试部署命令...${NC}"
echo -e "${YELLOW}测试命令:${NC}"
echo "wrangler pages deploy dist --project-name=$PROJECT_NAME --dry-run"
echo ""
echo -e "${YELLOW}如果要手动测试:${NC}"
echo "1. 构建项目:"
echo "   VITE_BASE=/ pnpm run build"
echo "2. 部署:"
echo "   wrangler pages deploy dist --project-name=$PROJECT_NAME"

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  诊断完成${NC}"
echo -e "${CYAN}========================================${NC}"