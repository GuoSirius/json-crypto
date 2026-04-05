# 修复 SPA 路由问题的脚本
# 在构建后运行此脚本，确保正确处理 SPA 路由

echo "修复 SPA 路由问题..."

# 部署目标 (github / cloudflare)
DEPLOY_TARGET=${DEPLOY_TARGET:-github}

if [ "$DEPLOY_TARGET" = "github" ]; then
    echo ">>> GitHub Pages 部署配置"
    
    # 复制 index.html 为 404.html
    # GitHub Pages 使用 404.html 作为所有路由的回退
    echo "复制 index.html 为 404.html..."
    cp dist/index.html dist/404.html
    
    # 确保静态资源路径正确（base 会在构建时设置）
    # 不需要 _redirects，GitHub Pages 使用 404.html 机制

elif [ "$DEPLOY_TARGET" = "cloudflare" ]; then
    echo ">>> Cloudflare Pages 部署配置"
    
    # Cloudflare Pages 使用 _redirects 文件处理 SPA 路由
    # 格式: /* /index.html 200
    echo "创建 _redirects 文件..."
    cat > dist/_redirects << 'EOF'
/*  /index.html  200
EOF

    # 删除 404.html（Cloudflare 不需要）
    [ -f dist/404.html ] && rm dist/404.html
fi

echo "SPA 路由修复完成！目标: $DEPLOY_TARGET"
