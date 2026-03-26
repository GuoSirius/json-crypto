# ============================================================
# diagnose-cloudflare.ps1 - 诊断 Cloudflare Pages 部署问题 (PowerShell)
#
# 用法：
#   .\scripts\diagnose-cloudflare.ps1
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cloudflare Pages 部署问题诊断" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$PROJECT_NAME = "json-crypto"

Write-Host "`n[1] 检查 wrangler CLI 是否安装..." -ForegroundColor Blue
try {
    $wrangler = Get-Command wrangler -ErrorAction Stop
    Write-Host "✓ wrangler 已安装" -ForegroundColor Green
} catch {
    Write-Host "✗ wrangler 未安装" -ForegroundColor Red
    Write-Host "安装命令: npm install -g wrangler" -ForegroundColor Yellow
    Write-Host "登录命令: wrangler login" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[2] 检查 wrangler 登录状态..." -ForegroundColor Blue
try {
    $null = wrangler whoami
    Write-Host "✓ wrangler 已登录" -ForegroundColor Green
} catch {
    Write-Host "✗ wrangler 未登录" -ForegroundColor Red
    Write-Host "请运行: wrangler login" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[3] Cloudflare 界面风格识别..." -ForegroundColor Blue
Write-Host "请确认你看到的是哪种界面风格:" -ForegroundColor Yellow
Write-Host ""
Write-Host "【新版界面特征】" -ForegroundColor Cyan
Write-Host "  - 左侧有导航菜单: 'Overview', 'Workers & Pages', 'Account'"
Write-Host "  - 页面布局现代化，分区清晰"
Write-Host "  - 进入项目创建：左侧导航 → Workers & Pages → Create application → Pages → Upload assets"
Write-Host ""
Write-Host "【旧版界面特征】" -ForegroundColor Cyan
Write-Host "  - 顶部有导航标签页: 'Overview', 'Analytics', 'DNS', 'Pages'"
Write-Host "  - 右侧有侧边栏: 'Account Details', 'API Tokens' 等链接"
Write-Host "  - 进入项目创建：顶部导航 → Pages → Create a project → Direct Upload"
Write-Host ""
Write-Host "【快速切换】" -ForegroundColor Green
Write-Host "  - 切换到新版：旧版右下角 'Try new dashboard'"
Write-Host "  - 切换到旧版：新版左下角 'Switch to classic dashboard'"
Write-Host "  - 直接访问：https://dash.cloudflare.com/?to=/:account/pages"

Write-Host "`n[4] 列出所有 Cloudflare Pages 项目..." -ForegroundColor Blue
Write-Host "当前项目列表:" -ForegroundColor Yellow
wrangler pages project list

Write-Host "`n[4] 检查目标项目是否存在..." -ForegroundColor Blue
$projects = wrangler pages project list
if ($projects -match $PROJECT_NAME) {
    Write-Host "✓ 项目 '$PROJECT_NAME' 存在" -ForegroundColor Green
    
    Write-Host "`n项目详情:" -ForegroundColor Yellow
    wrangler pages project view $PROJECT_NAME
} else {
    Write-Host "✗ 项目 '$PROJECT_NAME' 不存在" -ForegroundColor Red
    Write-Host ""
    Write-Host "[解决方案]" -ForegroundColor Blue
    Write-Host "  1. 在 Cloudflare 控制台手动创建项目:"
    Write-Host "     a) 访问 https://dash.cloudflare.com"
    Write-Host "     b) 进入 Pages → Create a project"
    Write-Host "     c) 选择 Direct Upload"
    Write-Host "     d) 项目名称填写: $PROJECT_NAME"
    Write-Host "     e) 创建完成后重新运行部署"
    Write-Host ""
    Write-Host "  2. 使用 wrangler CLI 创建项目:"
    Write-Host "     wrangler pages project create $PROJECT_NAME --production-branch main"
    Write-Host ""
    Write-Host "  3. 修改项目名称（如果项目名被占用）:"
    Write-Host "     编辑 .github/workflows/deploy.yml:"
    Write-Host "     修改: --project-name=json-crypto"
    Write-Host "     为: --project-name=your-custom-name"
}

Write-Host "`n[5] 检查 GitHub Secrets 设置..." -ForegroundColor Blue
Write-Host "确保 GitHub Secrets 已正确设置:" -ForegroundColor Yellow
Write-Host "  - CLOUDFLARE_API_TOKEN: Cloudflare API Token"
Write-Host "  - CLOUDFLARE_ACCOUNT_ID: Cloudflare Account ID"
Write-Host ""
Write-Host "验证方法:" -ForegroundColor Yellow
Write-Host "  1. 访问 https://github.com/your-username/json-crypto/settings/secrets/actions"
Write-Host "  2. 确保两个 secrets 都存在且值正确"
Write-Host ""
Write-Host "获取 Account ID:" -ForegroundColor Yellow
Write-Host "  - 新版本控制台: Workers & Pages → 右侧 Account ID"
Write-Host "  - 旧版本控制台: 右下角 Account ID"
Write-Host "  - 或访问: https://dash.cloudflare.com/?to=/:account/workers"
Write-Host ""
Write-Host "创建 API Token:" -ForegroundColor Yellow
Write-Host "  - 访问: https://dash.cloudflare.com/profile/api-tokens"
Write-Host "  - 创建自定义令牌"
Write-Host "  - 权限: Account → Cloudflare Pages → Edit"
Write-Host "  - 账户资源: Include → All accounts"

Write-Host "`n[6] 测试部署命令..." -ForegroundColor Blue
Write-Host "如果要手动测试:" -ForegroundColor Yellow
Write-Host "1. 构建项目:"
Write-Host "   VITE_BASE=/ pnpm run build"
Write-Host "2. 部署:"
Write-Host "   wrangler pages deploy dist --project-name=$PROJECT_NAME"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  诊断完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan