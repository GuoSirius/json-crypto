#!/bin/bash
# ================================================
# Gitee Pages 部署脚本
# 用于手动部署到 Gitee Pages
# ================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Gitee Pages 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查环境
if ! command -v git &> /dev/null; then
    echo -e "${RED}错误: git 未安装${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}警告: pnpm 未安装，正在安装...${NC}"
    npm install -g pnpm
fi

# 获取仓库名（从 git remote 获取）
REPO_NAME=$(basename -s .git $(git config --get remote.origin.url) 2>/dev/null || echo "json-crypto")
echo -e "${GREEN}仓库名: $REPO_NAME${NC}"

# 设置 base 路径（Gitee Pages 使用根路径）
export VITE_BASE="/"
echo -e "${GREEN}VITE_BASE: $VITE_BASE${NC}"

# 安装依赖
echo -e "${GREEN}[1/4] 安装依赖...${NC}"
pnpm install --frozen-lockfile

# 运行测试
echo -e "${GREEN}[2/4] 运行测试...${NC}"
pnpm run test

# 构建项目
echo -e "${GREEN}[3/4] 构建项目...${NC}"
VITE_BASE=/ pnpm run build

# 部署到 gh-pages 分支
echo -e "${GREEN}[4/4] 部署到 Gitee Pages...${NC}"

# 检查 gh-pages 分支是否存在
if git rev-parse --verify gh-pages >/dev/null 2>&1; then
    echo "gh-pages 分支已存在，删除旧分支..."
    git branch -D gh-pages 2>/dev/null || true
fi

# 创建 gh-pages 分支
git checkout --orphan gh-pages

# 删除不需要的文件
git rm -rf .

# 复制构建产物
cp -r dist/* .

# 提交
git add .
git commit -m "deploy: Gitee Pages $(date '+%Y-%m-%d %H:%M:%S')"

# 推送
echo -e "${GREEN}推送到 gh-pages 分支...${NC}"
git push origin gh-pages --force

# 切回 main 分支
git checkout main

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "请在 Gitee 仓库中启用 Pages 服务："
echo -e "  1. 进入仓库页面 → 管理 → Gitee Pages"
echo -e "  2. 选择部署分支: gh-pages"
echo -e "  3. 点击启动"
echo ""
echo -e "访问地址: https://gitee.com/<你的用户名>/$REPO_NAME"
echo -e "${GREEN}========================================${NC}"
