# 解决 GitHub Pages 部署失败问题

## 问题

GitHub Pages 部署时出现 "Setup Pages" 步骤错误。

## 解决方案

### 1. 检查 GitHub 仓库设置

1. 进入 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 确认 **Source** 设置为 **GitHub Actions**（不是 "Deploy from a branch"）
5. 保存设置

### 2. 验证构建产物

```bash
# 清理并重新安装依赖
rm -rf node_modules
pnpm install

# 类型检查
pnpm run type-check

# 测试构建（模拟 GitHub Pages 环境）
VITE_BASE="/json-crypto/" pnpm run build
```

### 3. 推送修复代码

```bash
git add .
git commit -m "fix: improve GitHub Pages deployment configuration"
git push origin main
```

### 4. 监控部署状态

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 查看最新的工作流运行
4. 监控部署 job 的状态

## 验证部署成功

部署成功后，访问以下地址：
```
https://<你的用户名>.github.io/json-crypto/
```