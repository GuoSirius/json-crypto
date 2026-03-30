# 部署指南

本文档提供 JSON Crypto 应用在不同平台上的部署说明。

## 问题修复

### 1. SPA 路由问题（刷新页面空白）
**问题描述**：在 GitHub Pages 或 Cloudflare Pages 上部署后，刷新页面或直接访问非根路由时出现空白页面。

**解决方案**：
- 已添加 `404.html` 文件作为 SPA 回退页面
- 已添加 `_redirects` 文件处理路由重定向
- 已配置构建脚本自动处理 SPA 路由

### 2. 处理后数据可编辑问题
**问题描述**：处理后数据无法编辑，下载时无法使用编辑后的内容。

**解决方案**：
- 处理后数据编辑器现在可编辑
- 用户编辑后的处理后数据会自动保存
- 下载功能会优先使用编辑后的内容
- 添加了"还原"按钮，可以还原到原始的处理后数据

## 部署步骤

### GitHub Pages
1. 运行构建命令：
   ```bash
   npm run build:gh-pages
   # 或
   pnpm build:gh-pages
   ```

2. 构建产物位于 `dist/` 目录
3. 将 `dist/` 目录内容部署到 GitHub Pages
4. 确保 GitHub Pages 配置为从 `dist` 目录部署

### Cloudflare Pages
1. 运行构建命令：
   ```bash
   npm run build:cloudflare
   # 或
   pnpm build:cloudflare
   ```

2. 构建命令会自动设置正确的 base URL
3. 通过 Cloudflare Pages 控制台部署 `dist/` 目录
4. 构建命令：`pnpm build:cloudflare`
5. 输出目录：`dist`

### 本地预览
```bash
npm run build
npm run preview
```

## 构建后处理

构建完成后会自动运行 `scripts/fix-spa-routing.sh` 脚本：
- 确保 `404.html` 存在（SPA 回退页面）
- 创建 `_redirects` 文件处理路由重定向
- 适用于 GitHub Pages、Cloudflare Pages、Netlify 等平台

## 技术细节

### SPA 路由处理
- Vue Router 使用 History 模式
- `404.html` 作为 SPA 回退页面
- `_redirects` 文件将所有路由重定向到 `index.html`
- `vite.config.ts` 配置了正确的构建选项

### 数据编辑功能
- 原数据编辑器：始终可编辑，自动保存到 `editedContent`
- 处理后数据编辑器：现在可编辑，自动保存到 `editedProcessed`
- 下载功能：优先使用编辑后的内容
- 还原功能：可以还原到原始数据或原始处理后数据

### 构建配置
- 针对不同平台使用不同的 base URL
- GitHub Pages: `/$npm_package_name/`
- Cloudflare Pages: `/`
- 自动处理 chunk 大小警告

## 故障排除

### 刷新页面空白
1. 检查 `dist/` 目录是否有 `404.html` 文件
2. 检查 `dist/` 目录是否有 `_redirects` 文件
3. 确保服务器配置了正确的 SPA 重定向规则

### 编辑后数据未保存
1. 检查浏览器控制台是否有错误
2. 确保 IndexedDB 正常工作
3. 检查 `editedProcessed` 字段是否正确保存

### 下载内容不正确
1. 确保下载时优先使用编辑后的内容
2. 检查 `downloadAsZip` 函数是否正确处理 `editedProcessed` 字段
3. 验证文件名和后缀是否正确

## 更新日志

### v1.0.1
- 修复 SPA 路由问题（刷新页面空白）
- 添加处理后数据编辑功能
- 优化下载逻辑，优先使用编辑后的内容
- 添加构建后处理脚本
- 添加部署指南文档