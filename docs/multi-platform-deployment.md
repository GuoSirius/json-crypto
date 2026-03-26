# 多平台部署指南

本项目支持同时部署到 **GitHub Pages**、**Cloudflare Pages** 和 **Gitee Pages** 三个平台。

## 部署架构

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
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ GitHub Pages │ │Cloudflare│ │  Gitee Pages │
│   (全球)     │ │  Pages   │ │   (国内)     │
└──────────────┘ └──────────┘ └──────────────┘
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

4. **查看部署状态**
   - 访问仓库的 `Actions` 标签
   - 查看 `CI/CD` 工作流运行状态
   - 部署成功后，会显示页面 URL

5. **访问站点**
   ```
   https://<你的用户名>.github.io/json-crypto/
   ```

### 2. Cloudflare Pages 部署（推荐）

Cloudflare Pages 提供全球 CDN 加速，访问速度更快。

#### 配置步骤

1. **获取 Cloudflare API Token**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 点击右上角头像 → "My Profile"
   - 左侧菜单点击 "API Tokens"
   - 点击 "Create Custom Token"
   - 配置权限：
     - **Token name**：`GitHub Deploy`
     - **Permissions**：
       - Account → Cloudflare Pages → Edit
       - Zone → Cloudflare Pages → Edit
     - **Account Resources**：选择你的账户
   - 点击 "Create Token"
   - **重要**：复制生成的 Token（只显示一次）

2. **获取 Cloudflare Account ID**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 在首页右上角头像下方，找到你的账户名称
   - 点击 → 复制 "Account ID"

3. **添加到 GitHub Secrets**
   - 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - 添加两个 Secret：
     - `CLOUDFLARE_API_TOKEN`：粘贴刚才复制的 API Token
     - `CLOUDFLARE_ACCOUNT_ID`：粘贴账户 ID

4. **触发部署**
   ```bash
   git add .
   git commit -m "chore: enable Cloudflare Pages deployment"
   git push origin main
   ```

5. **查看部署状态**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
   - 点击 `json-crypto` 项目查看部署日志

### 3. Gitee Pages 部署（可选）

Gitee Pages 适合国内用户，国内访问速度快。

#### 配置步骤（方式一：手动部署）

1. **克隆 Gitee 仓库**
   ```bash
   git clone https://gitee.com/你的用户名/json-crypto.git
   cd json-crypto
   ```

2. **运行部署脚本**
   ```bash
   chmod +x scripts/deploy-gitee.sh
   ./scripts/deploy-gitee.sh
   ```
   脚本会自动构建并推送到 `gh-pages` 分支。

3. **启用 Gitee Pages**
   - 进入 Gitee 仓库页面
   - 点击「管理」
   - 在左侧菜单找到「Gitee Pages」
   - 选择分支：`gh-pages`
   - 点击「启动」
   - 等待部署完成

4. **获取访问地址**
   - 部署成功后，页面会显示访问地址
   - 格式：`https://你的用户名.gitee.io/json-crypto/`

#### 配置步骤（方式二：自动部署）

⚠️ **注意**：Gitee 不像 GitHub 和 Cloudflare 一样支持 GitHub Actions 直接部署。如果你需要自动部署到 Gitee，有两种方式：

**方式 A：使用 Gitee 的同步功能**

1. 在 Gitee 仓库中，点击「从 GitHub / GitLab 导入仓库」
2. 选择你的 GitHub 仓库
3. 设置自动同步（每天同步一次）
4. 配置 Gitee Pages 从 `gh-pages` 分支部署

**方式 B：使用 GitHub Actions 推送到 Gitee**

1. 在 Gitee 创建个人访问令牌（Personal Access Token）
   - 进入 Gitee → 设置 → 私人令牌
   - 创建新令牌，勾选 `projects` 权限
   - 复制令牌（只显示一次）

2. 在 GitHub 仓库添加 Secrets
   - 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
   - 添加以下 Secrets：
     - `GITEE_TOKEN`：Gitee 个人访问令牌
     - `GITEE_USERNAME`：你的 Gitee 用户名
     - `GITEE_REPO`：你的 Gitee 仓库名称（如 `json-crypto`）

3. **触发部署**
   ```bash
   git add .
   git commit -m "chore: enable Gitee Pages deployment"
   git push origin main
   ```

4. **手动刷新 Gitee Pages**
   - 进入 Gitee 仓库 → 管理 → Gitee Pages
   - 点击「更新」按钮
   - 等待部署完成

## 平台对比

| 特性 | GitHub Pages | Cloudflare Pages | Gitee Pages |
|------|-------------|------------------|-------------|
| **全球访问** | ✅ 优秀 | ✅ 优秀 | ⚠️ 一般 |
| **国内访问** | ⚠️ 较慢 | ⚠️ 较慢 | ✅ 快速 |
| **CDN 加速** | ✅ 有 | ✅ 有 | ✅ 有 |
| **免费额度** | ✅ 无限 | ✅ 无限 | ✅ 无限 |
| **自定义域名** | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| **HTTPS** | ✅ 自动 | ✅ 自动 | ✅ 自动 |
| **自动部署** | ✅ GitHub Actions | ✅ GitHub Actions | ⚠️ 需手动或云效 |
| **构建速度** | ✅ 快 | ✅ 快 | ⚠️ 一般 |
| **配置复杂度** | ⚠️ 中等 | ⚠️ 中等 | ✅ 简单 |

## 推荐部署策略

### 方案一：全球访问优先（推荐）

- **GitHub Pages** + **Cloudflare Pages**
- 优点：自动部署，配置简单，全球访问快速
- 缺点：国内访问较慢
- 适用场景：主要面向海外用户

### 方案二：国内访问优先

- **Gitee Pages** + **GitHub Pages**
- 优点：国内访问快速，自动部署到 GitHub
- 缺点：Gitee 需手动更新或配置同步
- 适用场景：主要面向国内用户

### 方案三：最佳体验（完全部署）

- **GitHub Pages** + **Cloudflare Pages** + **Gitee Pages**
- 优点：所有平台覆盖，用户自动访问最近的节点
- 缺点：配置较复杂，Gitee 需手动更新
- 适用场景：全球用户，追求最佳体验

## 故障排查

### GitHub Pages 部署失败

**问题**：Actions 显示 "Setup Pages" 错误

**解决方案**：
1. 检查仓库 Settings → Pages → Source 是否设置为 "GitHub Actions"
2. 确保 workflow 文件中包含 `permissions: pages: write`
3. 检查构建产物是否包含 `index.html` 和 `404.html`

### Cloudflare Pages 部署失败

**问题**：部署时 API Token 无效

**解决方案**：
1. 检查 API Token 权限是否包含 "Account → Cloudflare Pages → Edit"
2. 检查 Account ID 是否正确
3. 确认 Secrets 中没有多余的空格

### Gitee Pages 部署失败

**问题**：推送失败或 404

**解决方案**：
1. 检查 `gh-pages` 分支是否存在
2. 确认 Gitee Pages 配置的分支是否正确
3. 手动点击「更新」按钮触发部署

### 站点访问 404

**问题**：访问 URL 显示 404

**解决方案**：
1. GitHub Pages：检查 base 路径是否为 `/<repo>/`
2. Cloudflare Pages：检查 `_redirects` 文件是否正确
3. Gitee Pages：检查 `gh-pages` 分支根目录是否有 `index.html`

## CI/CD 工作流

```
开发者提交代码
  ↓
pre-commit hook: type-check + test
  ↓ (通过)
git push origin main
  ↓
GitHub Actions 触发
  ├─ CI Job
  │   ├─ pnpm install
  │   ├─ type-check
  │   └─ test
  │
  ├─ Deploy GitHub Pages
  │   ├─ pnpm install
  │   ├─ build (VITE_BASE=/<repo>/)
  │   └─ deploy
  │
  ├─ Deploy Cloudflare Pages
  │   ├─ pnpm install
  │   ├─ build (VITE_BASE=/)
  │   └─ wrangler deploy
  │
  └─ Deploy Gitee Pages
      ├─ pnpm install
      ├─ build (VITE_BASE=/<repo>/)
      ├─ clone gitee repo
      ├─ copy dist to gitee
      └─ push to gitee
```

## 高级配置

### 自定义域名

所有平台都支持自定义域名，配置方法类似：

1. **购买域名**（如 example.com）
2. **添加 DNS 记录**
   - GitHub Pages：`CNAME` 指向 `<username>.github.io`
   - Cloudflare Pages：`CNAME` 指向 Pages 项目
   - Gitee Pages：`CNAME` 指向 `<username>.gitee.io`
3. **在平台配置域名**
   - GitHub Pages：Settings → Pages → Custom domain
   - Cloudflare Pages：Custom domains → Add domain
   - Gitee Pages：Pages → 自定义域名

### 自动化 Gitee Pages 更新

使用 GitHub Actions 自动推送并触发 Gitee Pages 更新：

```yaml
# 在 deploy.yml 中添加以下步骤
- name: Push to Gitee
  run: |
    git clone https://${{ secrets.GITEE_TOKEN }}@gitee.com/${{ secrets.GITEE_USERNAME }}/${{ secrets.GITEE_REPO }}.git gitee-repo
    rm -rf gitee-repo/*
    cp -r dist/* gitee-repo/
    cd gitee-repo
    git add .
    git commit -m "Deploy to Gitee Pages"
    git push origin main
  env:
    GITEE_TOKEN: ${{ secrets.GITEE_TOKEN }}
    GITEE_USERNAME: ${{ secrets.GITEE_USERNAME }}
    GITEE_REPO: ${{ secrets.GITEE_REPO }}
```

### 多环境部署

如果需要部署到不同环境（开发、测试、生产），可以创建多个 workflow 文件：

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging
on:
  push:
    branches: [staging]
jobs:
  deploy:
    # ... 部署到 Cloudflare Pages 的 staging 环境
```

## 总结

1. **GitHub Pages**：最简单，适合全球访问，必须配置
2. **Cloudflare Pages**：速度快，推荐配合 GitHub Pages 使用
3. **Gitee Pages**：国内访问快，适合面向国内用户

根据你的用户群体选择合适的部署方案，建议至少配置 GitHub Pages，然后根据需要添加 Cloudflare Pages 和 Gitee Pages。
