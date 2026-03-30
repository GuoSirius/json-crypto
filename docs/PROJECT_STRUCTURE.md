# 项目结构详解

## 项目概述
json-crypto 是一个基于 Vue 3 和 TypeScript 构建的多功能文件处理工具，支持 JSON 加密解密处理和 Excel 工作表解析导出。

## 目录结构详解

### 根目录文件
```
├── .github/workflows/          # GitHub Actions 工作流配置
│   └── deploy.yml              # CI/CD 工作流（测试 + GitHub Pages + Cloudflare Pages 部署）
├── scripts/                    # 构建和部署脚本
│   ├── build-and-preview.sh    # 本地构建 + 预览
│   ├── deploy-cloudflare.sh    # 手动部署 Cloudflare Pages
│   ├── diagnose-cloudflare.sh  # Cloudflare Pages 部署问题诊断
│   └── fix-spa-routing.sh      # SPA 路由修复脚本
├── public/                     # 静态资源
│   ├── 404.html                # GitHub Pages SPA 回退页面
│   ├── _redirects              # Cloudflare Pages SPA 路由规则
│   └── favicon.svg             # 网站图标
├── src/                        # 源代码目录
├── docs/                       # 项目文档
├── dist/                       # 构建产物目录
├── build_check.txt             # 构建检查文件
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile                  # Docker 镜像构建
├── index.html                  # HTML 入口文件
├── nginx.conf                  # Nginx 配置
├── package.json                # 项目依赖和脚本
├── pnpm-lock.yaml              # pnpm 锁文件
├── QUICK_SETUP.md              # 快速开始指南
├── README.md                   # 项目说明
├── SOLVE_GITHUB_PAGES_ISSUE.md # GitHub Pages 问题解决方案
├── tsconfig.app.json           # 应用 TypeScript 配置
├── tsconfig.json               # TypeScript 配置
├── tsconfig.node.json          # Node 环境 TypeScript 配置
├── uno.config.ts               # UnoCSS 配置
└── vite.config.ts              # Vite 配置（动态 base）
```

### src/ 源代码目录结构

#### __tests__/ 测试目录
```
├── components/                 # 组件测试
│   ├── BatchAction.test.ts     # 批量操作组件测试
│   ├── CryptoConfig.test.ts    # 加密配置组件测试
│   ├── FileList.test.ts        # 文件列表组件测试
│   ├── JsonEditor.test.ts      # JSON编辑器组件测试
│   ├── ThemeToggle.test.ts     # 主题切换组件测试
│   └── ToolBar.test.ts         # 工具栏组件测试
├── composables/                # Composable 测试
│   └── useTheme.test.ts        # 主题切换测试
├── integration/                # 集成测试
│   ├── crypto-workflow.test.ts # 加密工作流测试
│   └── performance.test.ts     # 性能测试
├── stores/                     # 状态管理测试
│   ├── excelStore.test.ts      # Excel 状态管理测试
│   └── jsonStore.test.ts       # JSON 状态管理测试
├── utils/                      # 工具函数测试
│   ├── crypto.test.ts          # 加密工具测试
│   ├── db.test.ts              # 数据库工具测试
│   ├── download.test.ts        # 下载工具测试
│   ├── excel.test.ts           # Excel 工具测试
│   ├── json.test.ts            # JSON 工具测试
│   └── uuid.test.ts            # UUID 工具测试
├── views/                      # 视图测试
│   ├── ProcessView.test.ts     # 处理视图测试
│   └── UploadView.test.ts      # 上传视图测试
└── setup.ts                    # 测试全局设置
```

#### assets/ 静态资源目录
```
├── ico/                        # 图标资源
└── images/                     # 图片资源
```

#### components/ 组件目录
```
├── AppSidebar.vue              # 全局侧边栏导航组件
├── BatchAction.vue             # 批量处理组件
├── CryptoConfig.vue            # 加密配置组件
├── FileList.vue                # 文件列表组件
├── JsonEditor.vue              # JSON 编辑器组件
├── ThemeToggle.vue             # 主题切换组件
└── ToolBar.vue                 # 工具栏组件
```

#### composables/ Composable 目录
```
├── useSidebar.ts               # 侧边栏状态管理
└── useTheme.ts                 # 主题切换 composable
```

#### router/ 路由目录
```
└── index.ts                    # Vue Router 配置
```

#### stores/ 状态管理目录
```
├── excelStore.ts               # Excel 状态管理
└── jsonStore.ts                # JSON 状态管理
```

#### types/ 类型定义目录
```
└── index.ts                    # TypeScript 类型定义
```

#### utils/ 工具函数目录
```
├── crypto.ts                   # 加密/解密封装（6 种算法）
├── db.ts                       # IndexedDB 持久化工具
├── download.ts                 # 文件下载 + ZIP 打包 + 工作表下载
├── excel.ts                    # Excel 解析工具
├── json.ts                     # JSON 格式化/压缩/验证工具
└── uuid.ts                     # UUID v4 生成工具
```

#### views/ 视图目录
```
├── excel-process-view/         # Excel 处理视图
│   └── ExcelProcessView.vue    # Excel 处理页面
├── excel-upload-view/          # Excel 上传视图
│   └── ExcelUploadView.vue     # Excel 上传页面
├── process-view/               # JSON 处理视图
│   └── ProcessView.vue         # JSON 处理页面
└── upload-view/                # JSON 上传视图
│   └── UploadView.vue          # JSON 上传页面
```

#### 根级文件
```
├── App.vue                     # 根组件（侧边栏 + 内容区布局）
├── main.ts                     # 应用入口
├── style.css                   # 全局主题样式（亮色/暗黑）
└── vite-env.d.ts               # Vite 类型声明
```

## 核心模块说明

### 1. 状态管理模块 (stores/)
- **jsonStore.ts**: 管理 JSON 文件的上传、处理、筛选和持久化
  - 支持文件去重（基于文件名 + MD5）
  - 支持加密/解密状态跟踪
  - 自动持久化到 IndexedDB
  - 支持批量操作

- **excelStore.ts**: 管理 Excel 文件的上传、解析和工作表管理
  - 支持工作表名称自定义
  - 支持批量工作表选择
  - 支持格式转换（JSON/CSV）

### 2. 加密处理模块 (utils/crypto.ts)
- 支持 6 种加密算法：AES、DES、TripleDES、RC4、Rabbit、Base64
- 智能模式检测：自动识别加密数据
- 错误处理：无效密钥、格式错误的处理

### 3. 文件处理模块 (utils/)
- **download.ts**: 文件下载和 ZIP 打包
  - 支持多种下载模式：原始内容、处理后内容、两者同时
  - 支持按目录或平铺模式打包
- **excel.ts**: Excel 解析和转换
  - 基于 SheetJS (xlsx) 库
  - 支持多工作表解析
  - 支持 JSON/CSV 格式转换
- **json.ts**: JSON 格式化和验证
  - 美化 JSON 格式
  - 压缩 JSON 数据
  - 验证 JSON 有效性

### 4. 数据持久化模块 (utils/db.ts)
- 基于 IndexedDB 实现
- 自动保存所有数据（含密钥和加密方式）
- 页面刷新后自动恢复状态
- 支持批量数据清理

### 5. 组件模块 (components/)
- **JsonEditor.vue**: 核心编辑器组件
  - 支持 JSON 编辑和格式化
  - 支持复制和下载
  - 提供清空和还原功能
- **BatchAction.vue**: 批量操作组件
  - 批量加密/解密
  - ZIP 打包下载
  - 进度条显示
- **FileList.vue**: 文件管理组件
  - 文件筛选和搜索
  - 状态指示器
  - 文件操作

### 6. 路由配置 (router/index.ts)
- 支持两种主要功能模块：
  - JSON 处理：上传 → 处理 → 下载
  - Excel 处理：上传 → 解析 → 下载
- HTML5 History 模式路由
- 路由守卫：处理页面刷新和状态恢复

### 7. 主题系统 (style.css, useTheme.ts)
- 支持三种主题：亮色、暗黑、跟随系统
- 主题防闪烁技术
- 全局 CSS 变量管理

## 测试架构

### 测试层次
1. **单元测试**：工具函数、状态管理逻辑
2. **组件测试**：Vue 组件交互和渲染
3. **集成测试**：跨模块工作流测试
4. **性能测试**：大文件处理和批量操作性能

### 测试覆盖率
- **总体覆盖率**: ~98%
- **测试用例数**: 412+
- **测试文件**: 19 个
- **测试执行时间**: 4-6 秒

### 测试策略
- **Mock 策略**：外部依赖（IndexedDB、文件系统、剪贴板）
- **边界测试**：空数据、大文件、特殊字符
- **错误处理**：异常输入、网络错误、存储失败
- **性能测试**：并发处理、内存使用

## 构建和部署

### 构建配置 (vite.config.ts)
- 支持动态 base URL（适配不同部署平台）
- UnoCSS 集成（原子化 CSS）
- TypeScript 支持
- 测试环境配置

### 部署配置
- **GitHub Pages**: 子目录部署（base: /<repo>/），使用 404.html 回退
- **Cloudflare Pages**: 根目录部署（base: /），使用 _redirects 回退
- **Docker**: Nginx 容器化部署
- **本地预览**: 开发服务器和构建预览

### CI/CD 流程
1. 代码提交触发 pre-commit hook
2. 运行类型检查和单元测试
3. 推送主分支触发 GitHub Actions
4. 并行部署到 GitHub Pages 和 Cloudflare Pages

## 开发指南

### 添加新功能
1. **类型安全**: 先在 `types/index.ts` 中定义类型
2. **状态管理**: 在对应 store 中实现状态逻辑
3. **工具函数**: 在 utils 目录中实现
4. **组件开发**: 在 components 目录中创建 Vue 组件
5. **测试覆盖**: 创建对应的测试文件
6. **文档更新**: 更新 README 和相关文档

### 代码质量
- **TypeScript**: 严格类型检查
- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **Husky**: Git 钩子自动检查
- **测试覆盖率**: 要求 95%+ 覆盖率

### 性能优化
- **懒加载**: 路由级懒加载
- **代码分割**: 按需加载组件
- **缓存策略**: IndexedDB 数据缓存
- **资源优化**: 图片压缩、字体优化

## 技术栈依赖关系

```
Vue 3 + TypeScript
    ├── Vue Router (路由管理)
    ├── Element Plus (UI 组件库)
    ├── UnoCSS (样式方案)
    ├── CryptoJS (加密库)
    ├── SheetJS (Excel 解析)
    ├── JSZip + FileSaver (文件处理)
    └── IndexedDB (数据持久化)

测试框架
    ├── Vitest (测试框架)
    ├── @vue/test-utils (组件测试)
    └── happy-dom (DOM 模拟)

构建工具
    ├── Vite (构建工具)
    └── Vue-TSC (类型检查)
```

## 维护和扩展

### 维护任务
1. **依赖更新**: 定期更新依赖版本
2. **安全扫描**: 检查依赖安全漏洞
3. **测试维护**: 保持测试通过率
4. **文档更新**: 同步功能变更

### 扩展方向
1. **新算法支持**: 扩展加密算法库
2. **文件格式支持**: 支持更多文件格式（CSV、XML、YAML）
3. **云存储集成**: 集成云存储服务
4. **协作功能**: 实时协作处理
5. **API 服务**: 提供 RESTful API 接口

---

## 文件清单

### 关键配置文件
- `vite.config.ts`: 构建和测试配置
- `uno.config.ts`: UnoCSS 配置
- `tsconfig.json`: TypeScript 配置
- `package.json`: 依赖和脚本

### 部署文件
- `.github/workflows/deploy.yml`: GitHub Actions 工作流
- `Dockerfile`: Docker 镜像构建
- `docker-compose.yml`: Docker Compose 配置
- `nginx.conf`: Nginx 服务器配置

### 文档文件
- `README.md`: 项目主文档
- `docs/`: 详细技术文档
- `QUICK_SETUP.md`: 快速开始指南
- `DEPLOYMENT_GUIDE.md`: 部署指南

### 脚本文件
- `scripts/`: 构建、部署和诊断脚本
- `build_check.txt`: 构建验证文件