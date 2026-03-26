# 快速部署配置指南

本指南帮助你快速完成所有平台的部署配置，大约需要 **5-10 分钟**。

## 配置清单

- [ ] **GitHub Pages**（必需，1 分钟）
- [ ] **Cloudflare Pages**（推荐，3 分钟）

---

## 步骤 1：GitHub Pages 配置（必需）

⏱️ 预计时间：1 分钟

1. 进入 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**（在 Code and automation 下方）
4. 在 **Build and deployment** 部分：
   - **Source** 选择 **GitHub Actions**
5. 点击 **Save** 保存

✅ **完成**！现在可以跳到步骤 3 测试部署。

---

## 步骤 2：Cloudflare Pages 配置（推荐）

⏱️ 预计时间：3 分钟

### 2.1 获取 API Token（1 分钟）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击右上角头像 → **My Profile**
3. 左侧菜单点击 **API Tokens**
4. 点击 **Create Custom Token**
5. 配置：
   - **Token name**：`GitHub Deploy`
   - **Permissions**：
     - Account → Cloudflare Pages → Edit
     - Zone → Cloudflare Pages → Edit
   - **Account Resources**：选择你的账户
6. 点击 **Create Token**
7. **重要**：复制生成的 Token（只显示一次）

### 2.2 获取 Account ID（30 秒）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在首页右上角头像下方，找到你的账户名称
3. 点击 → 复制 **Account ID**

### 2.3 添加到 GitHub Secrets（1 分钟）

1. 进入 GitHub 仓库 → **Settings**
2. 左侧菜单点击 **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加第一个 Secret：
   - **Name**：`CLOUDFLARE_API_TOKEN`
   - **Value**：粘贴刚才复制的 API Token
   - 点击 **Add secret**
5. 点击 **New repository secret**，添加第二个 Secret：
   - **Name**：`CLOUDFLARE_ACCOUNT_ID`
   - **Value**：粘贴账户 ID
   - 点击 **Add secret**

✅ **完成**！Cloudflare Pages 现在会自动部署。

---

## 步骤 3：测试部署

⏱️ 预计时间：2 分钟

### 3.1 提交代码触发部署

```bash
git add .
git commit -m "chore: enable multi-platform deployment"
git push origin main
```

### 3.2 查看部署状态

1. 进入 GitHub 仓库 → **Actions** 标签
2. 点击最新的 `CI/CD` 工作流
3. 等待所有 job 完成（约 2-3 分钟）
4. 你应该看到三个成功的部署：
   - ✅ Type Check & Test
   - ✅ Deploy to GitHub Pages
   - ✅ Deploy to Cloudflare Pages

### 3.3 访问站点

- **GitHub Pages**：`https://<你的用户名>.github.io/json-crypto/`
- **Cloudflare Pages**：`https://json-crypto.pages.dev/`

---

## 常见问题

### Q1：GitHub Pages 部署失败，显示 "Setup Pages" 错误

**A**：检查仓库 Settings → Pages → Source 是否设置为 "GitHub Actions"

### Q2：Cloudflare Pages 部署失败

**A**：检查 API Token 和 Account ID 是否正确添加到 GitHub Secrets

### Q3：站点访问显示 404

**A**：等待 2-5 分钟，CDN 缓存可能需要时间

---

## 下一步

配置完成后，你就可以享受双平台部署的便利了：

1. **全球访问**：GitHub Pages + Cloudflare Pages
2. **自动部署**：每次推送代码，两个平台都会自动更新

详细配置说明请参阅：
- [多平台部署指南](docs/deployment.md)
- [README.md](README.md)

---

## 需要帮助？

如果遇到问题，请：

1. 查看 [GitHub Actions 日志](https://github.com/你的用户名/json-crypto/actions)
2. 检查 [多平台部署指南](docs/deployment.md) 中的故障排查部分
3. 查阅 [SOLVE_GITHUB_PAGES_ISSUE.md](SOLVE_GITHUB_PAGES_ISSUE.md)

---

**总时间**：5-10 分钟
**难度**：⭐⭐☆☆☆（简单到中等）
