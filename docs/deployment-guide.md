# 部署指南

本文档详细说明 json-crypto 项目的部署方案，包括自动部署（GitHub Actions）和手动部署两种方式。

## 目录

- [部署架构](#部署架构)
- [自动部署（推荐）](#自动部署推荐)
  - [GitHub Pages 配置](#github-pages-配置)
  - [Cloudflare Pages 配置](#cloudflare-pages-配置)
- [手动部署](#手动部署)
  - [本地构建预览](#本地构建预览)
  - [部署到 GitHub Pages](#部署到-github-pages)
  - [部署到 Cloudflare Pages](#部署到-cloudflare-pages)
- [构建配置说明](#构建配置说明)
- [SPA 路由回退](#spa-路由回退)
- [常见问题](#常见问题)

---

## 部署架构

```
开发者 git push origin main
         │
         ▼
┌─────────────────────────┐
│   GitHub Actions CI/CD   │
│  .github/workflows/      │
│  deploy.yml              │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │  CI: 测试阶段   │
    │  type-check    │
    │  vitest run    │
    └───────┬───────┘
            │ 通过
            ▼
    ┌───────────────┐     ┌──────────────────────┐
    │ Deploy Job    │────▶│  GitHub Pages        │
    │ (并行执行)     │────▶│  https://<user>.     │
    │               │     │  github.io/<repo>/    │
    └───────────────┘     └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │  Cloudflare Pages     │
    │  https://<repo>.     │
    │  pages.dev            │
    └──────────────────────┘
```

---

## 自动部署（推荐）

项目已配置 GitHub Actions 工作流（`.github/workflows/deploy.yml`），推送代码到 `main` 分支后会自动执行：

1. **CI 阶段**：安装依赖 → 类型检查 → 运行测试
2. **部署阶段**（CI 通过后并行执行）：
   - 部署到 GitHub Pages
   - 部署到 Cloudflare Pages

### GitHub Pages 配置

#### 首次设置

1. 进入 GitHub 仓库页面
2. **Settings** > **Pages**
3. **Source** 下拉框选择 **GitHub Actions**（不是 "Deploy from a branch"）
4. 保存

完成以上设置后，每次推送到 `main` 分支都会自动部署。

#### 访问地址

```
https://<你的用户名>.github.io/<仓库名>/
```

例如：`https://example.github.io/json-crypto/`

> **注意**：GitHub Pages 部署时自动设置 `VITE_BASE` 为 `/<仓库名>/`，无需手动配置。

### Cloudflare Pages 配置

#### 前置准备

1. 注册/登录 [Cloudflare](https://dash.cloudflare.com/)
2. 获取 **Account ID**：Cloudflare 仪表盘 > 任意域名 > 右侧栏即可看到
3. 创建 **API Token**：
   - 进入 [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - 点击 "Create Token"
   - 选择 "Custom token"
   - 配置权限：`Account` > `Cloudflare Pages` > `Edit`
   - 创建并复制 Token（仅显示一次）

#### 配置 GitHub Secrets

1. 进入 GitHub 仓库页面
2. **Settings** > **Secrets and variables** > **Actions**
3. 点击 **New repository secret**，添加以下两个：

| Name | 值 |
|------|------|
| `CLOUDFLARE_API_TOKEN` | 刚才创建的 API Token |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare Account ID |

#### 首次部署

配置完 Secrets 后，下次推送到 `main` 分支时会自动创建 Cloudflare Pages 项目并部署。

如果需要在 Cloudflare 控制台手动创建项目：
1. 进入 Cloudflare Dashboard > **Workers & Pages** > **Create**
2. 选择 **Pages** > **Connect to Git**
3. 连接你的 GitHub 仓库
4. 构建配置：
   - **Build command**: `pnpm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

#### 访问地址

```
https://<项目名>.pages.dev
```

默认项目名为 `json-crypto`，可在 Cloudflare Pages 设置中修改。

---

## 手动部署

### 本地构建预览

```bash
# 默认构建（base: /，适用于 Cloudflare Pages 或自定义服务器）
pnpm run build

# 预览构建结果
pnpm run preview

# 或使用脚本（支持两种模式）
./scripts/build-and-preview.sh           # 本地模式 (base: /)
./scripts/build-and-preview.sh github    # GitHub Pages 模式 (base: /<repo>/)
```

### 部署到 GitHub Pages

使用提供的脚本：

```bash
chmod +x scripts/deploy-github.sh
./scripts/deploy-github.sh
```

脚本会自动：
1. 从 `git remote origin` 获取仓库名
2. 设置 `VITE_BASE=/仓库名/`
3. 运行测试
4. 构建项目
5. 生成 `dist/` 目录

构建完成后，你需要手动将 `dist/` 部署到 GitHub Pages（推荐使用 gh-pages 分支或 GitHub Actions）。

#### 使用 gh-pages 分支（替代方案）

```bash
# 安装 gh-pages
pnpm add -D gh-pages

# 构建并部署
VITE_BASE=/$(basename -s .git $(git config --get remote.origin.url))/ pnpm run build
pnpm exec gh-pages -d dist
```

### 部署到 Cloudflare Pages

使用提供的脚本：

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 构建并部署
chmod +x scripts/deploy-cloudflare.sh
./scripts/deploy-cloudflare.sh [项目名]
```

默认项目名为 `json-crypto`，可指定自定义名称：

```bash
./scripts/deploy-cloudflare.sh my-custom-name
```

### 部署到 Gitee Pages

Gitee Pages 是国内访问速度快的静态页面托管服务，适合国内用户使用。

#### 方式一：使用部署脚本（推荐）

```bash
chmod +x scripts/deploy-gitee.sh
./scripts/deploy-gitee.sh
```

脚本会自动：
1. 安装依赖
2. 运行测试
3. 构建项目（base: /）
4. 创建 gh-pages 分支
5. 推送构建产物到 Gitee

#### 方式二：手动部署

```bash
# 1. 安装依赖并构建
pnpm install --frozen-lockfile
pnpm run build

# 2. 创建 gh-pages 分支
git checkout --orphan gh-pages

# 3. 删除不需要的文件
git rm -rf .

# 4. 复制构建产物
cp -r dist/* .

# 5. 提交并推送
git add .
git commit -m "deploy: Gitee Pages"
git push origin gh-pages --force

# 6. 切回 main 分支
git checkout main
```

#### Gitee Pages 首次配置（必做）

1. **进入仓库页面**
   - 访问你的 Gitee 仓库，如：`https://gitee.com/你的用户名/json-crypto`

2. **找到 Pages 设置**
   - 点击菜单「管理」

3. **启用 Gitee Pages**
   - 在左侧找到「Gitee Pages」
   - 选择分支：`gh-pages`
   - 点击「启动」
   - 等待部署完成

4. **获取访问地址**
   - 部署成功后，页面会显示访问地址
   - 格式：`https://你的用户名.gitee.io/仓库名/`

> **注意**：
> - 首次部署可能需要 1-5 分钟
> - 每次更新代码后，需要重新运行部署脚本
> - Gitee Pages 免费版需要手动刷新更新

#### 自动部署（Gitee + 阿里云云效）

如果你希望 Gitee 也能自动部署，可以使用阿里云云效：

1. 注册/登录 [云效](https://flow.aliyun.com/)
2. 创建新流水线 → 选择「构建静态网站」
3. 配置 Gitee 仓库和分支
4. 设置构建命令：`pnpm install && pnpm run build`
5. 设置部署分支：`gh-pages`
6. 启用流水线

---

## 构建配置说明

### 动态 Base 路径

`vite.config.ts` 中配置了动态 `base`：

```typescript
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  // ...
})
```

| 部署目标 | VITE_BASE | 说明 |
|----------|-----------|------|
| 本地开发 | `/` | 默认值，无需设置 |
| Cloudflare Pages | `/` | 根路径部署 |
| GitHub Pages | `/<repo-name>/` | 如 `json-crypto` → `/json-crypto/` |
| Gitee Pages | `/` | 根路径部署 |
| 自定义子路径 | `/<path>/` | 如 `/tools/json-crypto/` |

### 使用示例

```bash
# Cloudflare Pages（默认）
pnpm run build

# GitHub Pages
VITE_BASE=/json-crypto/ pnpm run build

# 自定义子路径
VITE_BASE=/tools/json-crypto/ pnpm run build
```

---

## SPA 路由回退

项目使用 Vue Router 的 HTML5 History 模式，需要配置服务器将所有路由请求重定向到 `index.html`。

### GitHub Pages（已配置）

使用 `public/404.html` 实现：
- 文件内容与 `index.html` 完全相同
- GitHub Pages 在找不到文件时返回 404.html
- 页面加载后 Vue Router 接管路由，显示正确的页面

### Cloudflare Pages（已配置）

使用 `public/_redirects` 实现：
```
/* /index.html 200
```
- 将所有请求重定向到 `index.html`
- 返回 200 状态码

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Vercel / Netlify

通常自动支持 SPA 回退，无需额外配置。如果需要，创建 `vercel.json`：

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 常见问题

### Q: GitHub Pages 部署后页面空白？

**A**: 检查以下几点：
1. 确认仓库 Settings > Pages > Source 设置为 "GitHub Actions"
2. 确认 `VITE_BASE` 是否设置为 `/<仓库名>/`
3. 打开浏览器开发者工具的 Network 面板，检查资源路径是否正确

### Q: Cloudflare Pages 部署失败？

**A**: 检查以下几点：
1. 确认 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` Secrets 已正确配置
2. 确认 API Token 有 Cloudflare Pages 编辑权限
3. 查看 GitHub Actions 运行日志获取详细错误信息

### Q: 刷新页面后出现 404？

**A**: 这是 SPA 路由回退未配置导致的。确保：
- GitHub Pages：`public/404.html` 存在
- Cloudflare Pages：`public/_redirects` 存在
- Nginx：已配置 `try_files`

### Q: 如何只部署到其中一个平台？

**A**: 编辑 `.github/workflows/deploy.yml`，注释掉或删除不需要的 deploy job。

### Q: pre-commit hook 太慢？

**A**: `type-check` + `test` 总计约 8-14 秒。如果需要跳过：
```bash
git commit --no-verify -m "your message"
```
> 不建议频繁跳过，这会降低代码质量保障。

### Q: 如何修改 Cloudflare Pages 项目名？

**A**: 修改 `deploy.yml` 中的 `--project-name` 参数：
```yaml
command: pages deploy dist --project-name=your-custom-name
```
