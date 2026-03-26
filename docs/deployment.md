# 完整部署指南

本文档提供 json-crypto 项目的完整部署指南，涵盖多平台部署、配置步骤和故障排查。

## 📋 快速导航
- [部署架构](#部署架构)
- [快速开始](#快速开始)
- [详细配置](#详细配置)
- [故障排查](#故障排查)
- [常见问题](#常见问题)

## 部署架构

本项目支持同时部署到两个平台：

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub 仓库                              │
│                     json-crypto                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ git push
                         │
                         ▼
              ┌────────────────────┐
              │  GitHub Actions    │
              └─────────┬──────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
┌──────────────┐      ┌──────────┐
│ GitHub Pages │      │Cloudflare │
│   (全球)     │      │  Pages   │
└──────────────┘      │ (全球CDN) │
                      └──────────┘
```

## 快速开始

### 1. GitHub Pages 部署（必需）

这是最简单的部署方式，适合全球访问。

#### 配置步骤
1. **打开仓库设置**
   - 进入 GitHub 仓库页面
   - 点击 `Settings` 标签

2. **配置 Pages**
   - 在左侧菜单中找到 `Pages`（在 Code and automation 下方）
   - 在 `Build and deployment` 部分：
     - **Source** 选择 `GitHub Actions`（⚠️ 不是 "Deploy from a branch"）
   - 保存设置

3. **触发部署**
   ```bash
   git add .
   git commit -m "chore: enable GitHub Pages deployment"
   git push origin main
   ```

4. **访问站点**
   ```
   https://<你的用户名>.github.io/json-crypto/
   ```

### 2. Cloudflare Pages 部署（推荐）

Cloudflare Pages 提供全球 CDN 加速，访问速度更快。

#### 配置步骤
1. **获取 Cloudflare API Token**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 点击右上角头像 → "My Profile"
   - 左侧菜单点击 **"API Tokens"**
   - 点击 "Create Custom Token"
   - 配置权限：
     - **Token name**: `GitHub Deploy`
     - **Permissions**: Account → Cloudflare Pages → Edit
     - **Account Resources**: 选择你的账户
   - 点击 "Create Token"
   - **重要**: 复制生成的 Token（只显示一次）

2. **获取 Account ID**
   - 登录 Cloudflare Dashboard
   - 在首页右上角找到 Account ID
   - 或访问：https://dash.cloudflare.com/?to=/:account/workers

3. **配置 GitHub Secrets**
   - 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
   - 添加两个独立的 Secret：
     - `CLOUDFLARE_API_TOKEN`: 上一步创建的 API Token
     - `CLOUDFLARE_ACCOUNT_ID`: 上一步获取的 Account ID

4. **创建 Cloudflare Pages 项目**
   - 登录 Cloudflare Dashboard
   - 进入 **Pages** → **Create a project**
   - 选择 **Direct Upload**
   - 项目名称填写：`json-crypto`
   - 点击 **Create project**

5. **触发部署**
   ```bash
   git add .
   git commit -m "chore: enable Cloudflare Pages deployment"
   git push origin main
   ```

6. **访问站点**
   ```
   https://json-crypto.pages.dev/
   ```

## 详细配置

### 构建配置说明

项目使用 Vite 构建，不同平台需要不同的 base 配置：

| 平台 | VITE_BASE 配置 | 说明 |
|------|---------------|------|
| GitHub Pages | `/<repo>/` | 需要子路径 |
| Cloudflare Pages | `/` | 根路径 |
| 本地开发 | `/` | 根路径 |

### SPA 路由回退

由于是单页应用，需要配置路由回退：

| 平台 | 回退方案 | 配置文件 |
|------|---------|----------|
| GitHub Pages | 404.html | `dist/404.html` |
| Cloudflare Pages | _redirects | `dist/_redirects` |
| Gitee Pages | 自动支持 | 无需配置 |
| Nginx | try_files | `nginx.conf` |

### 环境变量

项目支持以下环境变量：

```bash
# 构建时环境变量
VITE_BASE=/              # 基础路径，默认为 /
VITE_APP_TITLE=JSON Crypto # 应用标题

# 运行时环境变量（在 .env 文件中配置）
VITE_DEFAULT_KEY=your-default-key
```

## 故障排查

### GitHub Pages 部署失败

**问题**: Actions 显示 "Setup Pages" 错误

**解决方案**:
1. 检查仓库 Settings → Pages → Source 是否设置为 "GitHub Actions"
2. 确保 workflow 文件中包含 `permissions: pages: write`
3. 检查构建产物是否包含 `index.html` 和 `404.html`

### Cloudflare Pages 部署失败

**问题**: 部署时 API Token 无效

**解决方案**:
1. 检查 API Token 权限是否包含 "Account → Cloudflare Pages → Edit"
2. 检查 Account ID 是否正确
3. 确认 Secrets 中没有多余的空格
4. 确认创建了两个独立的 Secrets

**问题**: Project not found

**解决方案**:
1. 在 Cloudflare 控制台创建项目
2. 确保项目名称为 `json-crypto`
3. 或修改 workflow 中的项目名称

### 站点访问 404

**问题**: 访问 URL 显示 404

**解决方案**:
1. GitHub Pages: 检查 base 路径是否为 `/<repo>/`
2. Cloudflare Pages: 检查 `_redirects` 文件是否正确
3. 等待 2-5 分钟缓存更新
4. 按 Ctrl+F5 强制刷新

## 常见问题

### Q1: 需要部署所有平台吗？
**A**: 不需要。可以根据需求选择：
- 仅 GitHub Pages：最简单，全球访问
- GitHub + Cloudflare：最佳全球体验

### Q2: 部署需要多长时间？
**A**:
- 首次部署：5-10分钟（包括配置）
- 后续更新：2-3分钟
- 缓存生效：2-5分钟

### Q3: 如何验证部署成功？
**A**: 
1. 查看 GitHub Actions 状态
2. 访问对应平台的 URL
3. 测试 JSON 加密/解密功能

### Q4: 如何更新部署？
**A**: 
- 自动：推送代码到 `main` 分支
- 手动：运行部署脚本

### Q5: 如何自定义域名？
**A**: 
1. 在对应平台配置自定义域名
2. 更新 DNS 记录
3. 等待 DNS 生效

## 平台对比

| 特性 | GitHub Pages | Cloudflare Pages |
|------|-------------|------------------|
| **全球访问** | ✅ 优秀 | ✅ 优秀 |
| **CDN 加速** | ⚠️ 有限 | ✅ 全球 CDN |
| **自动部署** | ✅ 完全自动 | ✅ 完全自动 |
| **配置复杂度** | ⭐ 简单 | ⭐⭐ 中等 |
| **推荐程度** | ⭐⭐⭐ 必选 | ⭐⭐⭐ 推荐 |

## 相关资源

- [快速部署指南](../QUICK_SETUP.md) - 5分钟快速部署
- [Docker 部署指南](docker.md) - 容器化部署
- [故障排查指南](troubleshooting.md) - 详细问题解决
- [GitHub Actions 配置](../.github/workflows/deploy.yml) - 工作流文件