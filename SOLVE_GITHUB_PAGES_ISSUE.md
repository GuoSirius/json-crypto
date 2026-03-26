# GitHub Pages 部署问题解决

## 问题

GitHub Actions 在部署到 GitHub Pages 时失败，错误信息为 "Setup Pages" 步骤错误。

## 原因

1. YAML 文件中存在重复的 `id-token: write` 定义
2. 仓库的 Pages 设置未配置为使用 GitHub Actions

## 解决方案

### 1. 修复 workflow 文件

已修复 `.github/workflows/deploy.yml` 中的 YAML 语法错误：
- 删除了重复的 `id-token: write` 定义
- 优化了权限配置

### 2. 配置 GitHub Pages 设置

请按照以下步骤配置：

1. 进入 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**（在 Code and automation 下方）
4. 在 **Build and deployment** 部分：
   - **Source** 选择 **GitHub Actions**（⚠️ 不是 "Deploy from a branch"）
5. 保存设置

### 3. 触发部署

```bash
git add .
git commit -m "fix: enable GitHub Pages deployment"
git push origin main
```

### 4. 验证部署

1. 访问仓库的 **Actions** 标签
2. 查看最新的 `CI/CD` 工作流运行状态
3. 部署成功后，会显示页面 URL

部署完成后，访问地址为：
```
https://<你的用户名>.github.io/json-crypto/
```

## 多平台部署

现在项目支持同时部署到三个平台：

- **GitHub Pages**：全球访问，已配置
- **Cloudflare Pages**：全球 CDN 加速（需配置 API Token）
- **Gitee Pages**：国内访问快速（需手动或自动同步）

详细配置方法请参阅 [docs/deployment.md](docs/deployment.md)

## 故障排查

### 问题：部署失败，显示 "Setup Pages" 错误

**解决方案**：
- 检查仓库 Settings → Pages → Source 是否设置为 "GitHub Actions"
- 确保 workflow 文件中包含 `permissions: pages: write`

### 问题：页面访问 404

**解决方案**：
- 确认构建产物包含 `index.html` 和 `404.html`
- 检查 base 路径配置是否正确（应为 `/<repo>/`）

### 问题：静态资源加载失败

**解决方案**：
- 检查 Vite 配置中的 base 路径
- 确认 GitHub Actions 构建时设置了正确的 `VITE_BASE` 环境变量
