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

**⚠️ 重要提示**：Cloudflare 目前有新版本和旧版本两种界面，布局不同但功能相同。如果某个步骤在当前位置找不到，请尝试：
1. 切换界面版本（通常页面右下角有切换链接）
2. 使用提供的直接访问链接
3. 参考故障排查部分的其他方法

#### 配置步骤

1. **获取 Cloudflare API Token**

#### **界面版本说明**
Cloudflare 目前有两个版本的界面，功能相同但布局不同：

#### **新版界面**（默认）
- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
- 点击右上角头像 → "My Profile"
- 左侧菜单点击 **"API Tokens"**
- 点击 "Create Custom Token"
- 配置权限：
  - **Token name**：`GitHub Deploy`
  - **Permissions**：
    - Account → Cloudflare Pages → Edit
  - **Account Resources**：选择你的账户（不是登录邮箱，是 Cloudflare 账户名称）
- 点击 "Create Token"
- **重要**：复制生成的 Token（只显示一次）

#### **旧版界面**
- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
- 点击页面右上角的 **"My Profile"**
- 选择 **"API Tokens"** 标签
- 点击 "Create Token"
- 配置权限：
  - **Permissions**：选择 "Account" → "Cloudflare Pages" → "Edit"
  - **Account Resources**：选择你的账户
- 点击 "Create Token"
- 复制生成的 Token

#### **界面切换方法**
- **新版界面特征**：
  - 左侧导航栏有 "Account"、"Overview"、"Workers & Pages" 等分类
  - 右上角头像旁边有 "Account" 按钮
  - 通常有 "Try new Cloudflare dashboard" 提示
- **旧版界面特征**：
  - 右侧边栏有 "Account Details"、"API Tokens" 等链接
  - 页面右下角有 "Switch to old dashboard" 链接
  - 布局较为传统，信息集中在右侧
- **切换方法**：
  - 新版 → 旧版：页面右下角点击 "Switch to old dashboard"
  - 旧版 → 新版：页面右上角点击 "Try new Cloudflare dashboard"
- **直接访问链接**：
  - 新版 API Tokens：https://dash.cloudflare.com/profile/api-tokens
  - 旧版 API Tokens：https://dash.cloudflare.com/profile/tokens
  - 新版 Account Details：https://dash.cloudflare.com/profile/account
  - 旧版 Account Details：https://dash.cloudflare.com/profile/account/details

2. **获取 Cloudflare Account ID**

Cloudflare 有两个版本的界面（新版和旧版），请根据你的界面版本选择对应方法：

#### **新版界面**（推荐）
- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
- 在顶部导航栏点击 **"Account"**（头像旁边）
- 在左侧菜单选择 **"Account Details"**
- 复制 **"Account ID"** 字段的值

#### **旧版界面**
- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
- 点击页面右侧边栏的 **"Account Details"**（通常在 "Overview" 页面右侧）
- 复制 **"Account ID"** 字段的值

#### **通用查找方法**
如果以上方法都找不到，可以：
1. 在任何页面按 **Ctrl+F** 搜索 "Account ID"
2. 或者在浏览器地址栏查看 URL 中是否包含你的 ID（如果看到类似 `https://dash.cloudflare.com/209cb0018ea019bf3fec8b8483ab5342/`，中间的部分就是 Account ID）

#### **重要提示**
- Account ID 是 **32位十六进制字符串**（如：`209cb0018ea019bf3fec8b8483ab5342`）
- **不要使用浏览器地址栏中的 Zone ID**（通常是域名页面中的 ID）
- **不要使用 API 返回的其他 ID**
- 如果 Account details 页面中没有显示，你可能需要：
  1. 切换界面版本（通常在页面右下角有切换按钮）
  2. 或者使用 CLI 命令：`curl -X GET "https://api.cloudflare.com/client/v4/accounts" -H "Authorization: Bearer <你的Token>"`

3. **添加到 GitHub Secrets**
   - 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
   - **创建第一个 Secret**：
     - 点击 "New repository secret"
     - Name: `CLOUDFLARE_API_TOKEN`
     - Secret: 粘贴刚才复制的 API Token
     - 点击 "Add secret"
   - **创建第二个 Secret**：
     - 再次点击 "New repository secret"
     - Name: `CLOUDFLARE_ACCOUNT_ID`
     - Secret: 粘贴 Account ID
     - 点击 "Add secret"
   - ⚠️ **注意**：需要分别创建两个独立的 Secret，不能合并到一个 Secret 中

4. **触发部署**
   ```bash
   git add .
   git commit -m "chore: enable Cloudflare Pages deployment"
   git push origin main
   ```

5. **查看部署状态**
  - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
  - 点击 `json-crypto` 项目查看部署日志

#### 创建 Cloudflare Pages 项目（重要！）

**部署前必须创建项目**：Cloudflare Pages 部署需要一个已存在的项目。如果部署失败显示 "Project not found"，请按以下步骤创建：

**方法一：手动创建（推荐）**

由于 Cloudflare 存在新旧两种界面风格，请根据你看到的界面选择对应的步骤：

##### 新版界面（默认，左侧导航栏风格）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在左侧导航栏找到并点击 **"Workers & Pages"**
3. 点击页面右上角的 **"Create application"** 按钮
4. 在弹出的选项中选择 **"Pages"** 标签
5. 点击 **"Upload assets"**（直接上传方式）
6. 项目名称填写：`json-crypto`（必须与 workflow 中的名称一致）
7. 点击 **"Create project"**

> **新版界面特征**：左侧有 "Overview"、"Workers & Pages"、"Account" 等导航菜单

##### 旧版界面（右侧边栏风格）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在页面顶部导航栏点击 **"Pages"**
3. 点击 **"Create a project"** 按钮
4. 选择 **"Direct Upload"**
5. 项目名称填写：`json-crypto`（必须与 workflow 中的名称一致）
6. 点击 **"Create project"**

> **旧版界面特征**：页面右侧有 "Account Details"、"API Tokens" 等链接，顶部有 "Overview"、"Analytics"、"DNS"、"Pages" 等标签页

##### 界面切换方法

如果你找不到上述入口，可能是界面版本问题：
- **切换到新版**：旧版页面右下角通常有 "Try new dashboard" 或 "Switch to new dashboard" 链接
- **切换到旧版**：新版页面左下角或右下角可能有 "Switch to classic dashboard" 链接
- **直接访问**：https://dash.cloudflare.com/?to=/:account/pages

**方法二：使用 wrangler CLI 创建**
```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建项目
wrangler pages project create json-crypto --production-branch main
```

> **注意**：如果项目已存在，请确保项目名称与 `.github/workflows/deploy.yml` 中的 `--project-name=json-crypto` 完全一致。

#### 解决部署错误 "Project not found"

**错误信息**：`Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`

**解决方案**：
1. **确认项目是否存在**：
   ```bash
   wrangler pages project list
   ```

2. **如果项目不存在**，按照上述步骤创建项目

3. **如果项目名称不匹配**，修改 workflow 中的项目名称：
   - 编辑 `.github/workflows/deploy.yml`
   - 修改第 147 行：`--project-name=json-crypto`
   - 改为：`--project-name=your-custom-name`

4. **使用诊断脚本检查**：
   ```bash
   # Bash/Linux/Mac
   ./scripts/diagnose-cloudflare.sh
   
   # Windows PowerShell
   .\scripts\diagnose-cloudflare.ps1
   ```

5. **使用增强版部署脚本**（自动检查和创建项目）：
   ```bash
   ./scripts/deploy-cloudflare.sh
   ```

#### 关于 Cloudflare 账户结构
- **登录邮箱/用户名**：你登录 Cloudflare 时使用的凭据
- **账户名称 (Account Name)**：你在 Cloudflare 上创建的账户的名称，可以自定义
- **账户 ID (Account ID)**：Cloudflare 自动生成的32位十六进制唯一标识符，用于 API 调用
- **Zone**：对应一个域名（如 example.com）的配置区域

对于 Cloudflare Pages 部署，你只需要：
1. API Token：具有 `Account → Cloudflare Pages → Edit` 权限
2. Account ID：从 Account details 区域获取

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
2. 检查 Account ID 是否正确（必须使用 Account details 中的 Account ID，不是 Zone ID）
3. 确认 Secrets 中没有多余的空格
4. 确认创建了两个独立的 Secrets：`CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`

**问题**：找不到 Account ID

**解决方案**：
1. **切换界面版本**：如果当前是新版界面，尝试切换到旧版界面
2. **使用直接链接**：访问 https://dash.cloudflare.com/profile/account（新版）或 https://dash.cloudflare.com/profile/account/details（旧版）
3. **使用 API 获取**：
   ```bash
   # 使用 curl 获取账户信息
   curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json"
   ```
   返回结果中的 `"id"` 字段就是 Account ID
4. **查看账户概览**：登录后直接访问 https://dash.cloudflare.com/，在页面最上方或 URL 中查找 Account ID
5. **检查邮件**：查找 Cloudflare 发送的欢迎邮件或通知邮件，通常包含 Account ID

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
