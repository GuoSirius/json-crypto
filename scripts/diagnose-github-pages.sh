#!/bin/bash
# diagnose-github-pages.sh - GitHub Pages 部署问题诊断脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  GitHub Pages 部署问题诊断脚本${NC}"
echo -e "${CYAN}========================================${NC}"

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/7] 检查项目基本信息...${NC}"
REPO_NAME=$(basename $(pwd))
echo "项目名称: $REPO_NAME"
echo "当前目录: $(pwd)"

echo -e "${YELLOW}[2/7] 检查 package.json 配置...${NC}"
if grep -q '"build": "vite build"' package.json; then
    echo -e "${GREEN}✓ build 脚本配置正确${NC}"
else
    echo -e "${RED}✗ build 脚本配置不正确${NC}"
fi

echo -e "${YELLOW}[3/7] 检查 vite.config.ts 配置...${NC}"
if [ -f "vite.config.ts" ]; then
    if grep -q "base:.*process.env.VITE_BASE" vite.config.ts; then
        echo -e "${GREEN}✓ Vite base 配置正确（支持动态 base）${NC}"
    else
        echo -e "${RED}✗ Vite base 配置不正确${NC}"
    fi
else
    echo -e "${RED}✗ vite.config.ts 文件不存在${NC}"
fi

echo -e "${YELLOW}[4/7] 检查部署配置文件...${NC}"
if [ -f ".github/workflows/deploy.yml" ]; then
    echo -e "${GREEN}✓ GitHub Actions 工作流文件存在${NC}"
    
    # 检查权限配置
    if grep -q "pages: write" .github/workflows/deploy.yml; then
        echo -e "${GREEN}✓ pages: write 权限已配置${NC}"
    else
        echo -e "${RED}✗ pages: write 权限未配置${NC}"
    fi
else
    echo -e "${RED}✗ .github/workflows/deploy.yml 文件不存在${NC}"
fi

echo -e "${YELLOW}[5/7] 检查 SPA 路由回退文件...${NC}"
if [ -f "public/404.html" ]; then
    echo -e "${GREEN}✓ public/404.html 文件存在（GitHub Pages SPA 回退）${NC}"
else
    echo -e "${RED}✗ public/404.html 文件不存在${NC}"
fi

if [ -f "public/_redirects" ]; then
    echo -e "${GREEN}✓ public/_redirects 文件存在（Cloudflare Pages SPA 回退）${NC}"
else
    echo -e "${RED}✗ public/_redirects 文件不存在${NC}"
fi

echo -e "${YELLOW}[6/7] 检查依赖安装状态...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules 目录存在${NC}"
else
    echo -e "${YELLOW}⚠ node_modules 目录不存在，需要运行 pnpm install${NC}"
fi

echo -e "${YELLOW}[7/7] 尝试本地构建测试...${NC}"
echo "测试构建 (VITE_BASE=/$REPO_NAME/)..."

# 尝试构建
if VITE_BASE="/$REPO_NAME/" pnpm run build 2>/dev/null; then
    echo -e "${GREEN}✓ 本地构建成功${NC}"
    
    # 检查构建产物
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✓ dist/index.html 文件存在${NC}"
    else
        echo -e "${RED}✗ dist/index.html 文件不存在${NC}"
    fi
    
    if [ -f "dist/404.html" ]; then
        echo -e "${GREEN}✓ dist/404.html 文件存在${NC}"
    else
        echo -e "${RED}✗ dist/404.html 文件不存在${NC}"
    fi
else
    echo -e "${RED}✗ 本地构建失败${NC}"
    echo -e "${YELLOW}建议：${NC}"
    echo "  1. 运行: pnpm install"
    echo "  2. 运行: pnpm run type-check"
    echo "  3. 检查构建错误信息"
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  诊断完成${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}后续步骤：${NC}"
echo "1. 如果所有检查都通过 ✓，问题可能在 GitHub 配置"
echo "2. 请检查 GitHub 仓库 Settings → Pages → Source 设置为 GitHub Actions"
echo "3. 查看 GitHub Actions 日志获取详细错误信息"
echo "4. 确保仓库有正确的 GitHub Secrets（如需多平台部署）"
echo ""
echo -e "${YELLOW}快速修复：${NC}"
echo "1. 清理并重新安装依赖："
echo "   rm -rf node_modules && pnpm install"
echo "2. 本地验证构建："
echo "   VITE_BASE=/$REPO_NAME/ pnpm run build"
echo "3. 推送到 GitHub："
echo "   git add . && git commit -m 'fix: build' && git push"
echo "4. 检查 GitHub Actions 运行状态"
echo ""
echo -e "${GREEN}详细文档：${NC}"
echo "docs/github-pages-debug-guide.md"
echo "docs/deployment-guide.md"