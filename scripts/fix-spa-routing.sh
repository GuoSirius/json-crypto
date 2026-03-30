#!/bin/bash
# 修复 SPA 路由问题的脚本
# 在构建后运行此脚本，确保正确处理 SPA 路由

echo "修复 SPA 路由问题..."

# 复制 index.html 为 404.html（如果不存在）
if [ ! -f "dist/404.html" ]; then
    echo "复制 index.html 为 404.html..."
    cp dist/index.html dist/404.html
fi

# 为 GitHub Pages 创建 _redirects 文件
echo "创建 _redirects 文件..."
echo "/*  /index.html  200" > dist/_redirects

# 为 Netlify 创建 _redirects 文件
echo "/* /index.html 200" > dist/_redirects

# 为 Cloudflare Pages 创建 _redirects 文件
echo "/*  /index.html  200" > dist/_redirects

echo "SPA 路由修复完成！"
echo ""
echo "部署说明："
echo "1. GitHub Pages: 确保使用 SPA 模式，所有路由重定向到 index.html"
echo "2. Cloudflare Pages: 会自动处理 _redirects 文件"
echo "3. Netlify: 会自动处理 _redirects 文件"