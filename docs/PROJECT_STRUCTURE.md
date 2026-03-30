# 项目结构

本文档详细介绍 json-crypto 项目的目录结构和各模块功能。

## 整体目录结构

```
json-crypto/
├── .github/workflows/     # GitHub Actions 工作流
├── docs/                  # 项目文档
├── public/                # 静态资源
├── scripts/               # 构建和部署脚本
├── src/                   # 源代码
├── dist/                  # 构建产物
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
└── uno.config.ts          # UnoCSS 配置
```

## 源代码结构 (src/)

```
src/
├── __tests__/             # 测试文件
├── assets/                # 静态资源
├── components/            # Vue 组件
│   ├── AppSidebar.vue     # 侧边栏导航
│   ├── BatchAction.vue    # 批量操作
│   ├── CryptoConfig.vue   # 加密配置
│   ├── FileList.vue       # 文件列表
│   ├── JsonEditor.vue     # JSON 编辑器
│   ├── ThemeToggle.vue    # 主题切换
│   └── ToolBar.vue        # 工具栏
├── composables/           # 组合式函数
│   ├── useSidebar.ts      # 侧边栏状态
│   └── useTheme.ts        # 主题切换
├── router/                # 路由配置
├── stores/                # 状态管理
│   ├── jsonStore.ts       # JSON 状态
│   └── excelStore.ts      # Excel 状态
├── types/                 # 类型定义
├── utils/                 # 工具函数
│   ├── crypto.ts          # 加密/解密
│   ├── db.ts              # IndexedDB
│   ├── download.ts        # 文件下载
│   ├── excel.ts           # Excel 解析
│   ├── json.ts            # JSON 处理
│   └── uuid.ts            # UUID 生成
├── views/                 # 页面视图
│   ├── upload-view/       # JSON 上传
│   ├── process-view/      # JSON 处理
│   ├── excel-upload-view/ # Excel 上传
│   └── excel-process-view/ # Excel 处理
├── App.vue                # 根组件
├── main.ts                # 入口文件
└── style.css              # 全局样式
```

## 核心模块说明

### 状态管理
- **jsonStore**: JSON文件管理、加密状态、持久化
- **excelStore**: Excel文件管理、工作表操作

### 工具函数
- **crypto.ts**: 6种加密算法 (AES/DES/TripleDES/RC4/Rabbit/Base64)
- **excel.ts**: SheetJS 封装的 Excel 解析
- **download.ts**: 文件下载、ZIP 打包
- **db.ts**: IndexedDB 数据持久化

### 组件
- **JsonEditor**: 核心编辑器，支持格式化/压缩
- **BatchAction**: 批量加密/解密、ZIP 下载
- **FileList**: 文件筛选、搜索、状态管理

## 文档索引

- [快速开始](./QUICK_SETUP.md) - 5分钟部署指南
- [完整部署指南](./docs/deployment.md) - 多平台部署
- [Docker 部署](./docs/docker.md) - 容器化部署
- [测试文档](./docs/testing.md) - 测试覆盖率
- [故障排查](./docs/troubleshooting.md) - 常见问题
