#!/bin/bash
# ============================================================
# diagnose-gitee.sh - 诊断 Gitee Pages 部署问题
#
# 用法：
#   chmod +x scripts/diagnose-gitee.sh
#   ./scripts/diagnose-gitee.sh
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
echo -e "${CYAN}  Gitee Pages 部署问题诊断${NC}"
echo -e "${CYAN}========================================${NC}"

echo -e "${BLUE}[1] 检查 GitHub Secrets 配置...${NC}"
echo -e "${YELLOW}需要配置的 Secrets:${NC}"
echo "  - GITEE_TOKEN: Gitee 个人访问令牌"
echo "  - GITEE_USERNAME: 你的 Gitee 用户名"
echo "  - GITEE_REPO: Gitee 仓库名称（如 json-crypto）"
echo ""
echo -e "${YELLOW}检查方法:${NC}"
echo "  1. 访问 https://github.com/你的用户名/json-crypto/settings/secrets/actions"
echo "  2. 确保三个 secrets 都存在且值正确"
echo ""
echo -e "${RED}如果缺少任何 secret，部署会失败！${NC}"

echo -e "${BLUE}[2] 检查 Gitee Token 权限...${NC}"
echo -e "${YELLOW}Gitee Token 必须包含以下权限:${NC}"
echo "  ✅ projects（仓库权限） - 必选"
echo "  🔘 pull_requests（可选）"
echo "  🔘 issues（可选）"
echo ""
echo -e "${YELLOW}创建 Token 步骤:${NC}"
echo "  1. 登录 Gitee → 右上角头像 → 设置"
echo "  2. 左侧菜单 → 私人令牌"
echo "  3. 点击生成新令牌"
echo "  4. 令牌描述: GitHub Actions Deploy"
echo "  5. 权限: 必须勾选 projects"
echo "  6. 点击提交"
echo "  7. 复制生成的 Token（只显示一次）"

echo -e "${BLUE}[3] 检查 Gitee 仓库是否存在...${NC}"
echo -e "${YELLOW}请确认以下仓库存在:${NC}"
echo "  https://gitee.com/你的用户名/json-crypto"
echo ""
echo -e "${YELLOW}如果不存在，需要:${NC}"
echo "  1. 在 Gitee 创建同名仓库"
echo "  2. 仓库名称: json-crypto"
echo "  3. 公开仓库"

echo -e "${BLUE}[4] 检查 workflow 配置...${NC}"
echo -e "${YELLOW}当前 workflow 配置:${NC}"
echo "  - 使用分支: gh-pages"
echo "  - 构建命令: pnpm run build"
echo "  - 部署目录: dist"
echo ""
echo -e "${YELLOW}Gitee Pages 配置要求:${NC}"
echo "  - 部署分支: main（推荐）或 gh-pages"
echo "  - 部署目录: /（根目录）"
echo "  - 需要手动启用 Pages 服务"

echo -e "${BLUE}[5] 常见错误解决方案...${NC}"
echo ""
echo -e "${CYAN}错误 1: 缺少 GitHub Secrets${NC}"
echo "  解决方案: 在 GitHub 仓库 Settings → Secrets → Actions 中添加"
echo "  - GITEE_TOKEN: Gitee 个人访问令牌"
echo "  - GITEE_USERNAME: Gitee 用户名"
echo "  - GITEE_REPO: Gitee 仓库名称"
echo ""
echo -e "${CYAN}错误 2: Token 权限不足${NC}"
echo "  解决方案: 重新创建 Token，确保勾选 projects 权限"
echo ""
echo -e "${CYAN}错误 3: 仓库不存在${NC}"
echo "  解决方案: 在 Gitee 创建同名仓库"
echo ""
echo -e "${CYAN}错误 4: Gitee Pages 未启用或找不到配置页面${NC}"
echo "  解决方案:"
echo "  1. 访问 https://gitee.com/你的用户名/json-crypto"
echo ""
echo "  **方法 A：通过「服务」菜单**"
echo "  2. 点击顶部或侧边的「服务」菜单"
echo "  3. 在服务列表中找到「Gitee Pages」"
echo "  4. 如果看不到，可能需要先「开启服务」"
echo ""
echo "  **方法 B：通过「管理」页面**"
echo "  2. 点击右上角「管理」按钮"
echo "  3. 在左侧菜单中查找「Gitee Pages」"
echo ""
echo "  **方法 C：直接访问**"
echo "  2. 尝试访问: https://gitee.com/你的用户名/json-crypto/pages"
echo ""
echo "  5. 选择分支: main"
echo "  6. 部署目录: /"
echo "  7. 点击「启动」"
echo ""
echo -e "${CYAN}错误 5: 部署后访问 404${NC}"
echo "  解决方案:"
echo "  1. 在 Gitee Pages 页面点击 '更新'"
echo "  2. 等待 2-5 分钟"
echo "  3. 访问 https://你的用户名.gitee.io/json-crypto/"
echo "  4. 按 Ctrl+F5 强制刷新"

echo -e "${BLUE}[6] 手动测试部署...${NC}"
echo -e "${YELLOW}如果要手动测试:${NC}"
echo "1. 安装 wrangler（用于 Cloudflare）:"
echo "   npm install -g wrangler"
echo "2. 运行诊断脚本:"
echo "   ./scripts/diagnose-cloudflare.sh"
echo "3. 运行部署脚本:"
echo "   ./scripts/deploy-cloudflare.sh"
echo "4. 运行 Gitee 部署脚本:"
echo "   ./scripts/deploy-gitee.sh"

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  诊断完成${NC}"
echo -e "${CYAN}========================================${NC}"