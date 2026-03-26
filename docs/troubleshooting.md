# 故障排查指南

本文档提供 json-crypto 项目部署和使用过程中的常见问题解决方案。

## 📋 快速导航
- [部署问题](#部署问题)
- [构建问题](#构建问题)
- [访问问题](#访问问题)
- [平台特定问题](#平台特定问题)
- [诊断工具](#诊断工具)

## 部署问题

### GitHub Actions 失败

#### 错误：Node.js 版本警告
**症状**: Workflow 显示 Node.js 版本不匹配警告

**解决方案**:
1. 检查 `.github/workflows/deploy.yml` 中的 `node-version`
2. 确保使用 `'24'`（字符串格式）
3. 检查 `package.json` 中的 `engines` 字段
4. 检查 `.nvmrc` 文件是否存在

#### 错误：缺少权限
**症状**: Workflow 显示权限错误

**解决方案**:
1. 检查 workflow 中的 `permissions` 配置：
   ```yaml
   permissions:
     contents: write
     pages: write
     id-token: write
     deployments: write
   ```
2. 确保 GitHub Pages 设置为 "GitHub Actions" 源

#### 错误：构建失败
**症状**: 构建步骤失败

**解决方案**:
1. 检查 `pnpm install` 是否成功
2. 检查 `pnpm run build` 是否成功
3. 查看构建日志中的具体错误信息

### Cloudflare Pages 部署失败

#### 错误：Project not found
**症状**: `Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`

**解决方案**:
1. **手动创建项目**：
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 进入 **Pages** → **Create a project**
   - 选择 **Direct Upload**
   - 项目名称填写：`json-crypto`
   - 点击 **Create project**

2. **使用诊断脚本**：
   ```bash
   ./scripts/diagnose-cloudflare.sh
   ```

3. **修改项目名称**：
   - 编辑 `.github/workflows/deploy.yml`
   - 修改 `--project-name=json-crypto`
   - 改为 `--project-name=your-custom-name`

#### 错误：API Token 无效
**症状**: Authentication failed

**解决方案**:
1. 重新创建 API Token：
   - 权限：Account → Cloudflare Pages → Edit
   - 账户资源：Include → All accounts

2. 更新 GitHub Secrets：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

3. 确保两个 Secrets 分别创建

#### 错误：找不到 Account ID
**解决方案**:
1. **新版界面**：Workers & Pages → 右侧 Account ID
2. **旧版界面**：右下角 Account ID
3. **直接访问**：https://dash.cloudflare.com/?to=/:account/workers

### Gitee Pages 部署失败

#### 错误：找不到 Gitee Pages 配置页面
**症状**: 在 Gitee 仓库中找不到 Pages 配置

**解决方案**:
1. **通过「服务」菜单进入**：
   - 访问仓库：`https://gitee.com/你的用户名/json-crypto`
   - 点击「服务」菜单（顶部或侧边）
   - 在服务列表中找到「Gitee Pages」
   - 如果看不到，点击「开启服务」

2. **直接访问链接**：
   ```
   https://gitee.com/你的用户名/json-crypto/pages
   ```

3. **检查服务状态**：
   - 访问：`https://gitee.com/你的用户名/json-crypto/settings`
   - 查找「服务管理」或「已开启服务」

#### 错误：Token 权限不足
**症状**: Authentication failed

**解决方案**:
1. 重新创建 Gitee Token：
   - 必须勾选 `projects` 权限
   - 可选勾选 `pull_requests`, `issues`

2. 更新 GitHub Secrets：
   - `GITEE_TOKEN`
   - `GITEE_USERNAME`
   - `GITEE_REPO`

#### 错误：仓库不存在
**症状**: Repository not found

**解决方案**:
1. 在 Gitee 创建同名仓库：`json-crypto`
2. 确保仓库为公开仓库
3. 更新 `GITEE_REPO` Secret

## 构建问题

### 错误：TypeScript 类型检查失败
**症状**: `pnpm run type-check` 失败

**解决方案**:
1. 检查 `tsconfig.json` 配置
2. 检查 `src` 目录中的 TypeScript 文件
3. 运行 `pnpm run type-check --verbose` 查看详细错误

### 错误：Vite 构建失败
**症状**: `pnpm run build` 失败

**解决方案**:
1. 检查 `vite.config.ts` 配置
2. 检查环境变量配置
3. 检查依赖包版本
4. 运行 `pnpm run build --debug` 查看详细错误

### 错误：依赖安装失败
**症状**: `pnpm install` 失败

**解决方案**:
1. 检查 `pnpm-lock.yaml` 文件
2. 删除 `node_modules` 重新安装
3. 使用 `pnpm install --frozen-lockfile`
4. 检查 Node.js 版本兼容性

## 访问问题

### 错误：404 页面
**症状**: 访问部署站点显示 404

**解决方案**:

#### GitHub Pages
1. 检查 `VITE_BASE` 配置：`/<repo>/`
2. 检查 `dist/404.html` 文件是否存在
3. 等待 2-5 分钟缓存更新
4. 按 Ctrl+F5 强制刷新

#### Cloudflare Pages
1. 检查 `VITE_BASE` 配置：`/`
2. 检查 `dist/_redirects` 文件
3. 等待 2-5 分钟缓存更新
4. 按 Ctrl+F5 强制刷新

#### Gitee Pages
1. 检查 `VITE_BASE` 配置：`/`
2. 在 Gitee Pages 页面点击「更新」
3. 等待 2-5 分钟缓存更新
4. 按 Ctrl+F5 强制刷新

### 错误：路由失效
**症状**: 点击页面链接后显示 404

**解决方案**:
1. 确保 SPA 路由回退配置正确
2. 检查对应平台的回退文件：
   - GitHub Pages: `404.html`
   - Cloudflare Pages: `_redirects`
   - Gitee Pages: 自动支持

### 错误：样式丢失
**症状**: 页面样式不正确

**解决方案**:
1. 检查 UnoCSS 配置
2. 检查 `vite.config.ts` 中的 CSS 配置
3. 检查构建产物中的 CSS 文件

## 平台特定问题

### GitHub Pages 特定问题

#### 错误：GitHub Actions 超时
**解决方案**:
1. 检查 workflow 中的 timeout 设置
2. 优化构建步骤
3. 减少不必要的测试

#### 错误：部署分支冲突
**解决方案**:
1. 检查 `gh-pages` 分支状态
2. 清理旧的部署分支
3. 重新触发部署

### Cloudflare Pages 特定问题

#### 错误：界面版本差异
**症状**: 找不到配置选项

**解决方案**:
1. **新版界面**：
   - 左侧导航 → Workers & Pages → Create application → Pages → Upload assets

2. **旧版界面**：
   - 顶部导航 → Pages → Create a project → Direct Upload

3. **界面切换**：
   - 切换到新版：旧版右下角 "Try new dashboard"
   - 切换到旧版：新版左下角 "Switch to classic dashboard"

#### 错误：缓存问题
**解决方案**:
1. 在 Cloudflare Dashboard 中清除缓存
2. 等待 5-10 分钟
3. 重新部署

### Gitee Pages 特定问题

#### 错误：手动更新需求
**症状**: 每次部署后需要手动点击「更新」

**解决方案**:
1. 这是 Gitee Pages 免费版的限制
2. 每次部署后手动点击「更新」按钮
3. 等待 2-5 分钟

#### 错误：国内访问限制
**症状**: 国外访问速度慢

**解决方案**:
1. 使用 GitHub Pages 或 Cloudflare Pages 作为主站点
2. Gitee Pages 作为国内备用站点

## 诊断工具

项目提供了多个诊断脚本帮助排查问题：

### Cloudflare 诊断
```bash
# Bash/Linux/Mac
./scripts/diagnose-cloudflare.sh

# Windows PowerShell
.\scripts\diagnose-cloudflare.ps1
```

### Gitee 诊断
```bash
./scripts/diagnose-gitee.sh
```

### 通用诊断
```bash
# 检查 Node.js 版本
node --version

# 检查 pnpm 版本
pnpm --version

# 检查构建产物
ls -la dist/

# 检查环境变量
echo $VITE_BASE
```

## 紧急解决方案

如果问题无法解决：

### 方案1：使用单一平台
- 仅使用 GitHub Pages（最简单）
- 仅使用 Cloudflare Pages（性能最好）

### 方案2：手动部署
```bash
# GitHub Pages
./scripts/deploy-github.sh

# Cloudflare Pages
./scripts/deploy-cloudflare.sh

# Gitee Pages
./scripts/deploy-gitee.sh
```

### 方案3：联系支持
- GitHub: https://github.com/contact
- Cloudflare: https://support.cloudflare.com
- Gitee: https://gitee.com/help

## 预防措施

### 定期检查
1. 每月检查 Secrets 有效期
2. 定期更新依赖包
3. 测试所有部署平台

### 备份配置
1. 备份 GitHub Secrets
2. 备份 workflow 文件
3. 备份部署脚本

### 监控部署
1. 设置部署状态监控
2. 定期访问所有平台
3. 记录部署日志

---

**提示**: 如果问题持续存在，请查看 [部署指南](deployment.md) 或提交 Issue。