---
name: json-crypto-app
overview: 基于 Vite + Vue3 + Element Plus + UnoCSS + CryptoJS 构建 JSON 数据处理工具，支持文件上传/粘贴、格式化、压缩、加密解密、批量处理和导出下载。
design:
  architecture:
    framework: vue
  styleKeywords:
    - Dark Theme
    - Developer Tool
    - Clean Layout
    - Professional
  fontSystem:
    fontFamily: JetBrains Mono, Noto Sans SC
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 16px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#409EFF"
      - "#337ECC"
      - "#66B1FF"
    background:
      - "#1E1E2E"
      - "#2D2D3F"
      - "#363650"
    text:
      - "#E0E0E0"
      - "#A0A0B8"
    functional:
      - "#67C23A"
      - "#E6A23C"
      - "#F56C6C"
      - "#909399"
todos:
  - id: init-project
    content: 初始化 Vite + Vue3 + TypeScript 项目，安装依赖（element-plus, unocss, crypto-js, jszip, file-saver, vue-router）
    status: completed
  - id: configure-project
    content: 配置 vite.config.ts、uno.config.ts、tsconfig，集成 Element Plus、UnoCSS 和路由
    status: completed
    dependencies:
      - init-project
  - id: build-views-and-store
    content: 实现全局状态管理（jsonStore + jsonProcessor）、路由配置、类型定义和工具函数
    status: completed
    dependencies:
      - configure-project
  - id: build-upload-page
    content: 实现上传页 UploadView（文件拖拽上传 + 文本粘贴 + 下一步按钮）
    status: completed
    dependencies:
      - build-views-and-store
  - id: build-process-page
    content: 实现处理页 ProcessView（文件列表 + JSON 编辑器 + 工具栏 + 加密配置 + 批量操作）
    status: completed
    dependencies:
      - build-views-and-store
  - id: integrate-and-polish
    content: 集成所有组件，实现 URL 传参、批量下载 ZIP、页面刷新重置、错误提示等完整流程
    status: completed
    dependencies:
      - build-upload-page
      - build-process-page
---

## 产品概述

一个基于 Web 的 JSON 数据处理工具，支持 JSON 文件的上传、格式化、压缩、加密/解密，以及批量处理和导出下载。

## 核心功能

- **文件上传与文本输入**：支持上传一个或多个 JSON 文件，也支持直接复制粘贴 JSON 数据到文本框
- **JSON 处理**：格式化（美化）、压缩（最小化）、加密（AES/DES/TripleDES/RC4/Rabbit）、解密、一键复制原数据和处理后数据
- **文件列表管理**：文件上传后左侧展示文件列表，默认选中第一个文件，支持 URL 传参（`?file=index` 或 `?file=filename`）指定选中文件，选中文件内容填入原数据框
- **批量处理**：一键对所有文件执行相同的加密/解密/格式化/压缩操作，支持逐个下载或打包为 ZIP 下载
- **页面状态管理**：进入处理页后，所有数据通过 IndexedDB 持久化。页面刷新自动恢复到处理页保持上次数据不变，防止误操作数据丢失。返回上传页时二次确认后清除所有存储

## 技术栈

- 构建工具：Vite
- 前端框架：Vue 3（Composition API + `<script setup>`）
- UI 组件库：Element Plus
- CSS 引擎：UnoCSS
- 加密库：CryptoJS
- 打包下载：JSZip
- 文件下载：file-saver
- 路由：Vue Router 4
- 语言：TypeScript

## 实现方案

### 系统架构

采用单页应用（SPA）架构，基于 Vue Router 的两个主视图切换：

1. **UploadView（上传页）**：文件上传 + 文本粘贴输入
2. **ProcessView（处理页）**：文件列表 + JSON 编辑器 + 处理工具栏 + 批量操作

数据流：用户上传/粘贴 → 全局状态存储（reactive） → 路由跳转 → 处理页读取并展示 → 执行操作 → 导出下载

### 关键技术决策

- **状态管理**：使用 Vue 3 reactive 全局状态（composable），不引入 Pinia，避免过度设计。进入处理页后数据通过 IndexedDB 持久化，页面刷新后自动恢复
- **数据存储策略**：使用 IndexedDB（idb 库）存储文件内容、处理结果、当前选中文件索引、加密方式选择和密钥（支持大文件、无 5MB 限制），文本数据也一并存储。所有数据页面刷新后自动恢复
- **路由守卫**：App 启动时检查 IndexedDB 是否有有效数据，有则直接进入处理页并恢复状态；数据为空则重定向到上传页
- **返回行为**：处理页返回按钮触发 ElMessageBox 二次确认，确认后调用 IndexedDB 清除全部存储，再跳转上传页
- **加密方式**：CryptoJS 提供 AES、DES、TripleDES、RC4、Rabbit，用户可选择算法并输入密钥
- **批量导出**：使用 JSZip 将处理后的多文件打包为 zip，通过 file-saver 触发下载
- **URL 传参**：ProcessView 解析 `route.query.file`，支持按索引（数字）或文件名匹配
- **大文件处理**：使用 Web Worker 异步处理 JSON 格式化/加密，避免 UI 阻塞（文件 > 1MB 时启用）

### 数据流设计

```
用户操作（上传/粘贴）
  ↓
composable: useJsonStore() 存储文件列表和文本数据
  ↓
router.push('/process')
  ↓
ProcessView 读取 store 数据并渲染
  ↓
用户选择操作（格式化/压缩/加密/解密）
  ↓
composable: useJsonProcessor() 执行操作
  ↓
结果写入 store.processedData
  ↓
用户复制/下载/批量导出
```

## 目录结构

```
d:/workspace/code/json-crypto/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── uno.config.ts
├── src/
│   ├── main.ts                    # [NEW] 应用入口
│   ├── App.vue                    # [NEW] 根组件
│   ├── router/
│   │   └── index.ts               # [NEW] 路由配置，含导航守卫
│   ├── stores/
│   │   ├── jsonStore.ts           # [NEW] 全局状态：文件列表、文本数据、处理结果
│   │   └── jsonProcessor.ts       # [NEW] 处理逻辑：格式化/压缩/加密/解密
│   ├── views/
│   │   ├── UploadView.vue         # [NEW] 上传页：文件上传 + 文本粘贴
│   │   └── ProcessView.vue        # [NEW] 处理页：文件列表 + 编辑器 + 工具栏
│   ├── components/
│   │   ├── FileList.vue           # [NEW] 左侧文件列表面板
│   │   ├── JsonEditor.vue         # [NEW] JSON 编辑器（原数据/处理后数据）
│   │   ├── ToolBar.vue            # [NEW] 操作工具栏（格式化/压缩/加密/解密）
│   │   ├── CryptoConfig.vue       # [NEW] 加密配置面板（算法选择 + 密钥输入）
│   │   └── BatchAction.vue        # [NEW] 批量操作面板（批量处理 + 下载）
│   ├── types/
│   │   └── index.ts               # [NEW] TypeScript 类型定义
│   └── utils/
│       ├── crypto.ts              # [NEW] CryptoJS 加密/解密封装
│       └── download.ts            # [NEW] 文件下载与 ZIP 打包工具
├── public/
│   └── favicon.ico
└── .gitignore
```

## 实现注意事项

- **性能**：JSON 文件大于 1MB 时使用 Web Worker 进行格式化/加密操作，避免主线程阻塞
- **数据持久化与恢复**：进入处理页后，所有数据（文件内容、粘贴文本、处理结果、当前选中文件索引、加密配置）通过 IndexedDB 持久化。页面刷新后自动恢复到处理页并还原上次状态，防止用户误操作导致数据丢失。当数据为空时重定向到上传页
- **离开确认**：在处理页点击"返回"按钮时，弹出 ElMessageBox 二次确认对话框，提示用户"离开将清除所有数据，是否确认？"。确认后清除 IndexedDB 存储并跳转上传页
- **密钥持久化**：密钥和加密方式选择通过 IndexedDB 一并持久化，页面刷新后自动恢复，方便用户下次直接使用而无需重新选择和输入
- **错误处理**：JSON 解析失败、加密失败等场景需友好提示，不使用 alert，使用 ElMessage
- **向后兼容**：URL 传参同时支持数字索引和文件名，优先按文件名匹配，无匹配时按索引回退
- **批量处理**：批量操作时显示进度条（ElProgress），处理完成后再统一导出

## 设计风格

采用现代简约的科技工具风格，深色主题为主，搭配鲜明的功能色区分不同操作状态。整体布局清晰，左右分栏，工具栏居中，突出数据处理的核心操作流程。

## 页面规划

### 页面1：上传页（UploadView）

居中卡片式布局，包含两个输入区域：

- **文件上传区**：使用 el-upload 拖拽上传组件，支持多文件上传，显示已选文件列表
- **文本输入区**：el-input textarea，用于粘贴 JSON 数据
- 底部"下一步"按钮，点击后跳转处理页

### 页面2：处理页（ProcessView）

经典工具型三栏布局：

- **左侧面板（240px）**：文件列表（FileList 组件），显示文件名和状态标识，点击切换当前处理文件
- **中间区域**：上下双编辑器布局，上方为"原数据"（JsonEditor），下方为"处理后数据"（JsonEditor），各带复制按钮
- **右侧/顶部工具栏**：操作按钮组（格式化、压缩、加密、解密）+ 加密配置（CryptoConfig）+ 批量操作（BatchAction）

## Agent Extensions

- **code-explorer**
- Purpose: 项目搭建完成后验证项目结构和代码一致性
- Expected outcome: 确保所有文件正确创建且模块间依赖关系正确