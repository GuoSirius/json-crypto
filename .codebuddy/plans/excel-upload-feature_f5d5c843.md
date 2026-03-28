---
name: excel-upload-feature
overview: 为 json-crypto 新增 Excel 上传处理功能，包括左侧可折叠侧边栏导航菜单、Excel 文件上传与管理、工作表解析/编辑/下载，以及批量下载和工程化配套更新。
design:
  architecture:
    framework: vue
  fontSystem:
    fontFamily: JetBrains Mono, Noto Sans SC, sans-serif
    heading:
      size: 18px
      weight: 700
    subheading:
      size: 14px
      weight: 600
    body:
      size: 13px
      weight: 400
  colorSystem:
    primary:
      - "#2563EB"
      - "#10B981"
      - "#8B5CF6"
    background:
      - "#1A1A24"
      - "#252535"
    text:
      - "#FFFFFF"
      - "#B8B8C8"
      - "#6B7280"
    functional:
      - "#EF4444"
      - "#10B981"
      - "#F59E0B"
todos:
  - id: refactor-global-layout
    content: 安装 xlsx 依赖，创建 AppSidebar 全局侧边栏组件和 useSidebar composable，重构 App.vue 为侧边栏+内容区布局，更新路由为 /json/* 和 /excel/*
    status: completed
  - id: adapt-json-views
    content: 适配现有 UploadView 和 ProcessView 到新布局，移除自动跳转逻辑、顶部 header 品牌区域和 ThemeToggle，将 ThemeToggle 移至侧边栏
    status: completed
    dependencies:
      - refactor-global-layout
  - id: excel-infra
    content: 创建 Excel 类型定义、excelStore（含 IndexedDB 持久化）、db.ts 新增 excelStore objectStore、excel.ts 工具函数
    status: completed
    dependencies:
      - refactor-global-layout
  - id: excel-views
    content: 实现 ExcelUploadView 上传页面和 ExcelProcessView 处理页面（三栏布局：文件列表+工作表列表+数据编辑区+批量下载）
    status: completed
    dependencies:
      - excel-infra
  - id: excel-download
    content: 实现工作表单独下载和跨 Excel 批量下载功能（按目录/平铺两种模式），扩展 download.ts
    status: completed
    dependencies:
      - excel-views
  - id: docs-tests
    content: 新增 Excel 相关测试用例（utils/excel、stores/excelStore、components/AppSidebar），更新 README、docs 文档和 CHANGELOG
    status: completed
    dependencies:
      - excel-views
---

## 用户需求

在现有 JSON Crypto 工具基础上，新增 Excel 文件上传处理功能，并引入全局导航菜单。

## 产品概述

将项目从单一功能的 JSON 加密工具，扩展为支持多种文件处理的多功能工具平台。通过左侧侧边栏导航统一管理所有功能模块。

## 核心功能

### 1. 全局侧边栏导航菜单

- 左侧垂直侧边栏，默认显示纯图标，鼠标悬停/点击时展开显示图标+文字
- 包含：JSON Crypto（含上传+处理两个入口）、Excel 工具入口
- 底部放置 ThemeToggle 主题切换
- 现有 JSON 功能的自动跳转逻辑（App.vue 中的 hasData 判断）取消，统一通过菜单导航

### 2. Excel 上传与文件管理

- 支持上传 .xlsx / .xls 格式文件
- 基于文件名+内容哈希进行去重
- 显示上传的 Excel 文件列表，支持通过输入文件名过滤筛选
- 数据通过 IndexedDB 持久化

### 3. 工作表解析与编辑

- 选中一个 Excel 文件后，解析出所有工作表（Sheet）名称并在列表中展示
- 每个工作表名称可编辑修改（默认显示原始工作表名称）
- 下拉选择该工作表数据的解析格式：JSON 或 CSV（默认 JSON）
- 一键填入 Excel 文件名作为工作表名称、一键还原为原始工作表名称
- 解析后数据以可编辑的文本区域展示
- 解析失败时显示失败原因，以及未解析的源数据

### 4. 工作表下载

- 单独下载每个工作表（使用编辑后的工作表名称作为下载文件名）
- 跨多个 Excel 文件通过复选框选择多个工作表进行批量下载
- 每个 Excel 展示的工作表列表支持逐个选择、全选和反选
- 批量下载时可选择两种目录模式：按 Excel 文件名分目录 / 平铺不分区（重名时加 Excel 文件名前缀）

### 5. 多主题适配

- 新增页面和组件必须适配现有 dark/light/system 主题切换
- 使用已有的 CSS 变量（--app-bg, --app-card, --app-border 等）和 UnoCSS 颜色类

### 6. 工程化

- 更新 README.md 及 docs 目录文档
- 新增测试用例
- 更新 CHANGELOG

## 技术栈

| 类别 | 技术 | 说明 |
| --- | --- | --- |
| Excel 解析 | SheetJS (xlsx) | 前端解析 .xlsx/.xls 文件，零依赖 |
| 现有技术栈 | Vue 3 + TS + Element Plus + UnoCSS + Lucide + JSZip + FileSaver | 保持一致 |


## 实现方案

### 架构重构：全局侧边栏导航

当前 App.vue 仅包含 `<router-view>`，无全局布局。改造为：

1. **App.vue** 变为侧边栏 + 主内容区的全局布局容器
2. **路由守卫移除** App.vue 中的 hasData 自动跳转逻辑，路由仅做菜单导航
3. **原有 UploadView** 简化为仅上传 JSON 文件（保留拖拽上传+粘贴两种方式），上传完成后跳转 ProcessView
4. **原有 ProcessView** 移除顶部 header 中的"返回"按钮和品牌标识（已移至侧边栏），移除现有侧边栏中的 FileList（保留但移入 ProcessView 内部，作为功能的一部分）

### Excel 功能模块

- **独立 Store**：`excelStore.ts` 管理所有 Excel 相关状态（文件列表、选中文件、工作表列表、选中工作表、格式选择、批量选择状态等），通过 IndexedDB 独立持久化
- **独立 DB Store**：在 `db.ts` 中新增 `excelStore` objectStore
- **Excel 解析工具**：`utils/excel.ts` 封装 SheetJS 的读取、工作表遍历、JSON/CSV 转换
- **下载工具扩展**：`utils/download.ts` 新增 Excel 工作表的单个/批量下载方法

### 数据流设计

```
用户上传 .xlsx → FileReader 读取 ArrayBuffer → SheetJS 解析 → 
提取工作表列表(含原始名称) → 用户选择工作表 → 
根据格式(JSON/CSV)转换数据 → 用户编辑 → 
使用编辑后的工作表名下载
```

### 性能考量

- Excel 文件（ArrayBuffer）不持久化到 IndexedDB（过大），仅持久化解析后的工作表数据
- 大文件解析时显示 loading 状态
- 工作表数据编辑采用防抖持久化（复用现有 watch + persist 模式）

## 实现注意事项

- **向后兼容**：现有的 jsonStore 的 IndexedDB 数据结构不变，新增独立的 excelStore objectStore
- **主题适配**：所有新组件使用 `bg-app-card`, `border-app-border`, `text-app-text-primary` 等现有 CSS 变量类
- **图标一致性**：继续使用 lucide-vue-next 图标库
- **样式一致性**：复用现有渐变、圆角、阴影模式（`bg-gradient-to-br`, `rounded-xl`, `shadow-lg` 等）
- **侧边栏收起状态持久化**：通过 localStorage 保存用户偏好

## 架构设计

```mermaid
graph TB
    subgraph AppLayout[App.vue - 全局布局]
        Sidebar[AppSidebar.vue<br/>侧边栏导航]
        Main[router-view<br/>主内容区]
    end
    
    subgraph Routes[路由]
        R1[/json/upload → UploadView]
        R2[/json/process → ProcessView]
        R3[/excel/upload → ExcelUploadView]
        R4[/excel/process → ExcelProcessView]
    end
    
    subgraph JSON_Module[JSON 模块]
        JS[jsonStore.ts]
        JE[JsonEditor, FileList, ToolBar, CryptoConfig, BatchAction]
    end
    
    subgraph Excel_Module[Excel 模块]
        ES[excelStore.ts]
        EE[ExcelFileList, SheetList, SheetEditor, SheetActions]
        EU[excel.ts - SheetJS 封装]
    end
    
    Main --> Routes
    R1 --> JSON_Module
    R2 --> JSON_Module
    R3 --> Excel_Module
    R4 --> Excel_Module
    Sidebar --> Routes
```

## 目录结构

```
json-crypto/
├── index.html                           # [MODIFY] 更新 title 为通用名称
├── package.json                         # [MODIFY] 新增 xlsx 依赖
├── src/
│   ├── App.vue                          # [MODIFY] 改为侧边栏+router-view 全局布局
│   ├── main.ts                          # 无修改
│   ├── style.css                        # 无修改
│   ├── router/
│   │   └── index.ts                     # [MODIFY] 新增 /json/*, /excel/* 路由，更新守卫
│   ├── stores/
│   │   ├── jsonStore.ts                 # [MODIFY] 移除 hasData 相关跳转逻辑
│   │   └── excelStore.ts                # [NEW] Excel 文件/工作表状态管理+持久化
│   ├── types/
│   │   └── index.ts                     # [MODIFY] 新增 Excel 相关类型定义
│   ├── utils/
│   │   ├── db.ts                        # [MODIFY] 新增 excelStore objectStore
│   │   ├── download.ts                  # [MODIFY] 新增工作表下载+批量ZIP方法
│   │   └── excel.ts                     # [NEW] SheetJS 封装(读取/解析/格式转换)
│   ├── composables/
│   │   ├── useTheme.ts                  # 无修改
│   │   └── useSidebar.ts                # [NEW] 侧边栏展开/收起状态管理
│   ├── components/
│   │   ├── ThemeToggle.vue              # [MODIFY] 从 ProcessView 顶部移至侧边栏底部
│   │   ├── AppSidebar.vue               # [NEW] 全局侧边栏导航组件
│   │   ├── BatchAction.vue              # 无修改
│   │   ├── CryptoConfig.vue             # 无修改
│   │   ├── FileList.vue                 # 无修改
│   │   ├── JsonEditor.vue               # 无修改
│   │   └── ToolBar.vue                  # 无修改
│   ├── views/
│   │   ├── upload-view/
│   │   │   └── UploadView.vue           # [MODIFY] 移除主题切换(移至侧边栏)，移除品牌header
│   │   ├── process-view/
│   │   │   └── ProcessView.vue          # [MODIFY] 移除顶部header+返回按钮+品牌，移除ThemeToggle，适配侧边栏布局
│   │   ├── excel-upload-view/
│   │   │   └── ExcelUploadView.vue      # [NEW] Excel 上传页面(拖拽上传+文件列表+搜索)
│   │   └── excel-process-view/
│   │       └── ExcelProcessView.vue     # [NEW] Excel 处理页面(文件列表+工作表列表+数据编辑)
│   └── __tests__/
│       ├── utils/
│       │   └── excel.test.ts            # [NEW] Excel 解析工具测试
│       ├── stores/
│       │   └── excelStore.test.ts       # [NEW] Excel Store 测试
│       ├── components/
│       │   └── AppSidebar.test.ts       # [NEW] 侧边栏组件测试
│       └── setup.ts                     # [MODIFY] 新增 xlsx mock
├── docs/
│   └── README.md                        # [MODIFY] 更新文档
├── README.md                            # [MODIFY] 更新功能说明、项目结构、技术栈
├── CHANGELOG.md                         # [NEW] 版本变更记录
└── QUICK_SETUP.md                       # [MODIFY] 如有需要更新
```

## 关键代码结构

### Excel 核心类型

```typescript
// 工作表解析格式
export type SheetFormat = 'json' | 'csv'

// 单个工作表数据
export interface SheetData {
  id: string                    // UUID
  originalName: string          // 工作表原始名称
  displayName: string           // 用户编辑后的显示/下载名称
  format: SheetFormat           // 解析格式，默认 'json'
  rawData: string               // 原始数据(解析失败时展示)
  parsedData: string            // 解析后可编辑数据
  parseError: string | null     // 解析失败原因
  selected: boolean             // 批量选择状态
}

// Excel 文件
export interface ExcelFile {
  id: string                    // UUID
  name: string                  // 文件名
  contentHash: string           // 内容 MD5 哈希(用于去重)
  sheets: SheetData[]           // 工作表列表
  activeSheetIndex: number      // 当前选中工作表索引
}

// Excel Store 数据
export interface ExcelStoreData {
  files: ExcelFile[]
  activeFileIndex: number
  searchKeyword: string
}
```

## 设计风格

采用与现有项目一致的科技感设计风格，基于现有的 CSS 变量体系和渐变模式。侧边栏使用 Glassmorphism 风格，与主内容区形成层次感。

## 页面规划

### 页面 1：全局侧边栏（AppSidebar.vue）

- 垂直固定在左侧，高度 100vh
- 默认宽度 60px（纯图标），展开后 180px（图标+文字），transition 动画平滑过渡
- 顶部：应用 Logo（复用现有 FileJson 图标 + "JSON Crypto" 文字）
- 中部：菜单项列表，每项包含图标+文字，激活态使用渐变背景高亮
- JSON 加密（分两个子项：上传 / 处理，或合并为一个跳转）
- Excel 工具（分两个子项：上传 / 处理，或合并为一个跳转）
- 底部：ThemeToggle 主题切换组件 + 折叠/展开按钮
- 悬停展开：默认折叠状态，鼠标移入侧边栏区域自动展开，移出自动收起
- 使用 backdrop-filter 实现毛玻璃效果

### 页面 2：Excel 上传页面（ExcelUploadView.vue）

- 主内容区布局，顶部标题栏 "Excel 工具 - 文件上传"
- 中央大卡片：拖拽上传区域（accept=.xlsx,.xls），复用现有 UploadView 的拖拽样式（绿色渐变主题）
- 上传后显示文件列表卡片：文件名、大小、上传时间
- 搜索输入框：按文件名过滤
- 底部 "下一步" 按钮，进入处理页面
- 全部使用现有 CSS 变量类（bg-app-card, border-app-border 等）

### 页面 3：Excel 处理页面（ExcelProcessView.vue）

- 三栏布局：左侧 Excel 文件列表 / 中间工作表列表 / 右侧数据编辑区
- **左栏（Excel 文件列表）**：类似现有 FileList 组件，显示已上传的 Excel 文件，支持搜索过滤、添加更多文件
- **中栏（工作表列表）**：显示当前选中 Excel 的所有工作表
- 每行：复选框 + 工作表名称（可编辑 input） + 格式下拉（JSON/CSV）
- 操作按钮：一键填入 Excel 文件名、还原原始名称、单独下载
- 列表底部：全选/反选按钮
- **右栏（数据编辑区）**：
- 顶部：当前工作表名称显示
- 主体：大文本区域展示解析后数据（可编辑）
- 若解析失败：红色错误提示区域 + 原始数据展示
- 底部：批量下载操作区（按目录/平铺选择 + 下载按钮）

## Agent Extensions

### Skill

- **xlsx**
- Purpose: 在 Excel 处理功能中，提供 SheetJS 的最佳实践指导，确保 Excel 文件的读取、解析、格式转换（JSON/CSV）的实现质量和正确性
- Expected outcome: 产出高质量的 `src/utils/excel.ts` 工具函数，覆盖 .xlsx/.xls 读取、工作表遍历、数据转换等核心逻辑