# 文档目录

本目录包含 json-crypto 项目的详细技术文档，按功能分类，便于查找。

## 📚 核心文档

### 1. 项目概述
- **[../README.md](../README.md)** - 项目主文档，包含快速开始、功能说明、部署指南

### 2. 快速部署
- **[QUICK_SETUP.md](../QUICK_SETUP.md)** - 5分钟快速部署指南

### 3. 详细部署指南
- **[deployment.md](deployment.md)** - 完整的多平台部署指南
- **[docker.md](docker.md)** - Docker 容器化部署指南

### 4. 故障排查
- **[troubleshooting.md](troubleshooting.md)** - 常见问题解决方案

### 5. 测试文档
- **[testing.md](testing.md)** - 测试覆盖率分析和技术报告

## 🔧 按需查找指南

### 如果你是新手用户
1. **开始**：先看 **[README.md](../README.md)** 了解项目
2. **部署**：按照 **[QUICK_SETUP.md](../QUICK_SETUP.md)** 快速部署
3. **问题**：遇到问题查 **[troubleshooting.md](troubleshooting.md)**

### 如果你是开发者
1. **完整部署**：查看 **[deployment.md](deployment.md)** 了解完整流程
2. **容器部署**：参考 **[docker.md](docker.md)** 进行容器化部署
3. **代码质量**：查看 **[testing.md](testing.md)** 了解测试覆盖

### 如果你遇到部署问题
1. **快速解决**：先看 **[troubleshooting.md](troubleshooting.md)** 常见问题
2. **详细参考**：查看 **[deployment.md](deployment.md)** 中的故障排查

## 📁 文件说明

| 文件名 | 用途 | 适合读者 | 阅读时间 |
|--------|------|----------|----------|
| `../README.md` | 项目主文档，包含所有基本信息 | 所有用户 | 5-10分钟 |
| `../QUICK_SETUP.md` | 5分钟快速部署指南 | 新手用户 | 5分钟 |
| `deployment.md` | 完整的双平台部署指南 | 开发者、运维人员 | 15-20分钟 |
| `docker.md` | Docker 容器化部署指南 | 容器化部署用户 | 10-15分钟 |
| `troubleshooting.md` | 常见问题解决方案 | 遇到问题的用户 | 按需查找 |
| `testing.md` | 测试覆盖率分析和技术报告 | 开发者、测试人员 | 10-15分钟 |

## 🚀 快速链接

### 在线演示
- [GitHub Pages](https://你的用户名.github.io/json-crypto/)
- [Cloudflare Pages](https://json-crypto.pages.dev/)

### 项目仓库
- [GitHub 仓库](https://github.com/你的用户名/json-crypto)

### 诊断工具
```bash
# Cloudflare 诊断
./scripts/diagnose-cloudflare.sh

# 部署脚本
./scripts/deploy-cloudflare.sh
```

## 📞 支持

### 文档问题
如果文档无法解决你的问题：
1. 查看项目 Issues
2. 提交新的 Issue
3. 参考脚本目录中的诊断工具

### 部署问题
1. 运行对应的诊断脚本
2. 检查 GitHub Actions 日志
3. 参考故障排查文档

### 功能问题
1. 测试本地运行是否正常
2. 检查浏览器控制台错误
3. 查看测试覆盖率报告

## 📈 文档更新

### 版本历史
- **v1.0.0 (2026-03-26)**：文档结构重构，简化合并
- **v0.9.0**：初始文档创建

### 更新计划
- 🔄 添加视频教程链接
- 🔄 完善国际化支持
- 🔄 优化搜索功能

## 🎯 最佳实践

### 阅读顺序
1. 新手：README → QUICK_SETUP → 部署验证
2. 开发者：README → deployment.md → testing.md
3. 运维：deployment.md → docker.md → troubleshooting.md

### 问题解决
1. 先运行诊断脚本
2. 查看对应文档章节
3. 检查 GitHub Actions 状态
4. 提交 Issue 反馈

---

**提示**：文档会持续更新优化，建议定期查看最新版本。如有问题或建议，欢迎提交 Issue。