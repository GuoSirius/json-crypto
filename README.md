# JSON Crypto - 多功能文件处理工具

基于 Vite + Vue 3 + TypeScript + Element Plus + UnoCSS + CryptoJS 构建的多功能文件处理工具，支持 JSON 加密解密处理和 Excel 工作表解析导出。

## 环境要求

- **Node.js 24+**
- **pnpm 10.32.1+**

## 功能特性

### 数据处理
- 多种输入：文件上传、文本粘贴
- 6 种加密算法：AES、DES、TripleDES、RC4、Rabbit、Base64
- 智能模式检测：自动识别加密数据
- 批量加密/解密、ZIP 打包下载

### Excel 处理
- 支持 .xlsx/.xls 文件拖拽上传
- 工作表解析、格式转换 (JSON/CSV)
- 批量下载

### 用户体验
- 侧边栏导航（可折叠）
- 主题切换（亮色/暗黑/跟随系统）
- IndexedDB 数据持久化

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Vite 5 |
| UI | Element Plus + UnoCSS |
| 加密 | CryptoJS |
| Excel | SheetJS (xlsx) |
| 测试 | Vitest + Vue Test Utils |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 运行测试
pnpm run test

# 构建生产版本
pnpm run build
```

## 文档导航

| 文档 | 说明 |
|------|------|
| [QUICK_SETUP.md](QUICK_SETUP.md) | 5分钟快速部署 |
| [docs/deployment.md](docs/deployment.md) | 完整部署指南 |
| [docs/docker.md](docs/docker.md) | Docker 部署 |
| [docs/testing.md](docs/testing.md) | 测试覆盖率 |
| [docs/troubleshooting.md](docs/troubleshooting.md) | 故障排查 |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | 项目结构 |

## 许可证

MIT
