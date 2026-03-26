# 快速部署配置指南

本指南帮助你快速完成所有平台的部署配置，大约需要 **10-15 分钟**。

## 配置清单

- [ ] **GitHub Pages**（必需，1 分钟）
- [ ] **Cloudflare Pages**（推荐，3 分钟）
- [ ] **Gitee Pages**（可选，5 分钟）

---

## 步骤 1：GitHub Pages 配置（必需）

⏱️ 预计时间：1 分钟

1. 进入 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**（在 Code and automation 下方）
4. 在 **Build and deployment** 部分：
   - **Source** 选择 **GitHub Actions**
5. 点击 **Save** 保存

✅ **完成**！现在可以跳到步骤 4 测试部署。

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

## 步骤 3：Gitee Pages 配置（可选）

⏱️ 预计时间：5 分钟

### 方式一：自动部署（推荐）

#### 3.1 获取 Gitee Token（2 分钟）

1. 登录 [Gitee](https://gitee.com)
2. 点击右上角头像 → **设置**
3. 左侧菜单点击 **私人令牌**
4. 点击 **生成新令牌**
5. 配置：
   - **令牌描述**：`GitHub Actions Deploy`
   - **权限**：
     - ✅ **必须勾选**：`projects`（仓库权限）
     - 🔘 **可选勾选**：`pull_requests`, `issues` 等
   - **重要**：至少要勾选 `projects` 权限才能进行仓库操作
6. 点击 **提交**
7. **重要**：复制生成的 Token（只显示一次）

#### 3.2 添加到 GitHub Secrets（2 分钟）

1. 进入 GitHub 仓库 → **Settings**
2. 左侧菜单点击 **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，添加三个 Secret：

   第一个：
   - **Name**：`GITEE_TOKEN`
   - **Value**：粘贴 Gitee Token
   - 点击 **Add secret**

   第二个：
   - **Name**：`GITEE_USERNAME`
   - **Value**：你的 Gitee 用户名
   - 点击 **Add secret**

   第三个：
   - **Name**：`GITEE_REPO`
   - **Value**：你的 Gitee 仓库名称（如 `json-crypto`）
   - 点击 **Add secret**

#### 3.3 启用 Gitee Pages（1 分钟）

1. 进入 Gitee 仓库页面
2. 点击 **管理**
3. 在左侧菜单找到 **Gitee Pages**
4. 选择分支：`main`
5. 点击 **启动**
6. 等待部署完成

✅ **完成**！Gitee Pages 现在会自动部署。

### 方式二：手动部署（简单）

如果不想配置自动部署，可以使用手动部署：

```bash
# 1. 克隆 Gitee 仓库
git clone https://gitee.com/你的用户名/json-crypto.git
cd json-crypto

# 2. 运行部署脚本
chmod +x scripts/deploy-gitee.sh
./scripts/deploy-gitee.sh

# 3. 在 Gitee 仓库启用 Pages 服务

## 详细步骤：

### 步骤 1：进入 Gitee Pages 配置页面

**推荐方法：通过「服务」菜单**
1. 访问你的 Gitee 仓库：`https://gitee.com/你的用户名/json-crypto`
2. 在页面顶部或侧边找到「**服务**」菜单并点击
3. 在服务列表中查找「**Gitee Pages**」
4. 如果看不到，可能需要先点击「**开启服务**」

**备选方法：通过「管理」页面**
1. 访问你的 Gitee 仓库：`https://gitee.com/你的用户名/json-crypto`
2. 点击右上角的「**管理**」按钮
3. 在左侧菜单栏中查找「**Gitee Pages**」
4. 如果找不到，可能在「**服务**」或「**更多设置**」下面

**直接访问方法**：
尝试直接访问：`https://gitee.com/你的用户名/json-crypto/pages`

> **关键提示**：很多用户反馈找不到左侧菜单的「Gitee Pages」，这是因为：
> 1. 服务可能还未开启
> 2. 界面版本可能更新了
> 3. 可能需要先「开启服务」才能看到配置选项

### 步骤 3：配置 Pages 设置
1. **部署分支**：选择 `main` 分支
2. **部署目录**：选择 `/`（根目录）
3. **HTTP Header**：保持默认

### 步骤 4：启用服务
1. 点击「**启动**」按钮
2. 等待系统提示「服务已启动」
3. 页面会显示访问地址：`https://你的用户名.gitee.io/json-crypto/`

### 步骤 5：手动更新（首次和后续）
1. 在 Gitee Pages 页面，点击「**更新**」按钮
2. 等待部署完成（通常需要 1-5 分钟）

> **注意**：Gitee Pages 免费版每次更新后需要手动点击「更新」按钮。
```

---

## 步骤 4：测试部署

⏱️ 预计时间：2 分钟

### 4.1 提交代码触发部署

```bash
git add .
git commit -m "chore: enable multi-platform deployment"
git push origin main
```

### 4.2 查看部署状态

1. 进入 GitHub 仓库 → **Actions** 标签
2. 点击最新的 `CI/CD` 工作流
3. 等待所有 job 完成（约 2-3 分钟）
4. 你应该看到三个成功的部署：
   - ✅ Type Check & Test
   - ✅ Deploy to GitHub Pages
   - ✅ Deploy to Cloudflare Pages
   - ✅ Deploy to Gitee Pages（如果配置了）

### 4.3 访问站点

- **GitHub Pages**：`https://<你的用户名>.github.io/json-crypto/`
- **Cloudflare Pages**：`https://json-crypto.pages.dev/`
- **Gitee Pages**：`https://<你的用户名>.gitee.io/json-crypto/`

---

## 常见问题

### Q1：GitHub Pages 部署失败，显示 "Setup Pages" 错误

**A**：检查仓库 Settings → Pages → Source 是否设置为 "GitHub Actions"

### Q2：Cloudflare Pages 部署失败

**A**：检查 API Token 和 Account ID 是否正确添加到 GitHub Secrets

### Q3：Gitee Pages 部署失败

**A**：检查 Gitee Token 权限是否包含 `projects`，以及仓库名称是否正确

### Q4：站点访问显示 404

**A**：等待 2-5 分钟，CDN 缓存可能需要时间

---

## 下一步

配置完成后，你就可以享受多平台部署的便利了：

1. **全球访问**：GitHub Pages + Cloudflare Pages
2. **国内访问**：Gitee Pages
3. **自动部署**：每次推送代码，三个平台都会自动更新

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

**总时间**：10-15 分钟
**难度**：⭐⭐☆☆☆（简单到中等）
