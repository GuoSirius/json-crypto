---
name: unit-test-coverage
overview: 为 json-crypto 项目搭建完整的单元测试体系，使用 Vitest + @vue/test-utils + happy-dom，覆盖工具函数、状态管理、Vue 组件、视图页面的所有操作场景，运行测试后分析问题并修复。
todos:
  - id: setup-test-infra
    content: 安装 vitest/@vue/test-utils/happy-dom 依赖并配置 vite.config.ts 和 package.json 脚本
    status: completed
  - id: write-pure-function-tests
    content: 编写 crypto/json/uuid 三个纯函数模块的单元测试（60+ 用例）并执行验证
    status: completed
    dependencies:
      - setup-test-infra
  - id: write-store-composable-tests
    content: 编写 jsonStore 和 useTheme 的测试（35+ 用例），含 db 模块 mock
    status: completed
    dependencies:
      - write-pure-function-tests
  - id: write-component-tests
    content: 编写 5 个组件的单元测试（ToolBar/BatchAction/CryptoConfig/FileList/JsonEditor）
    status: completed
    dependencies:
      - write-store-composable-tests
  - id: write-view-tests
    content: 编写 UploadView 和 ProcessView 两个视图的集成测试（35+ 用例）
    status: completed
    dependencies:
      - write-component-tests
  - id: analysis-fix-report
    content: 执行全部测试，编写问题分析报告并修复失败用例，确保全量通过
    status: completed
    dependencies:
      - write-view-tests
---

## 用户需求

为 json-crypto 项目从零搭建单元测试体系，要求：

1. **测试覆盖全面**：覆盖所有页面（UploadView、ProcessView）的每个操作，包括所有工具函数、状态管理、组件交互
2. **综合多种使用场景**：包括正常流程、边界条件、错误处理、特殊输入等各种情况
3. **问题分析与修复**：先执行测试发现失败用例，编写问题分析报告，定制修复计划，然后修复并确保全部通过

## 产品概述

json-crypto 是一个 Vue 3 + TypeScript 的 JSON 数据处理工具，支持 JSON 文件上传/粘贴、多种算法加密/解密（AES/DES/TripleDES/RC4/Rabbit/Base64）、JSON 格式化/压缩、批量处理、ZIP 下载等功能。

## 核心功能

- **加解密引擎**：6 种算法的加密与解密，支持密钥配置、引号包裹、自动检测加密状态
- **JSON 处理**：格式化（美化缩进）、压缩（去除空格）、有效性校验、引号包裹与去除
- **文件管理**：多文件上传、去重（文件名+MD5）、文件列表筛选/搜索、批量处理
- **数据持久化**：IndexedDB 自动存储恢复状态
- **主题系统**：暗黑/亮色/跟随系统三种模式切换

## 技术栈选择

| 类别 | 技术 | 说明 |
| --- | --- | --- |
| 测试框架 | Vitest | 与 Vite 原生集成，配置零成本，支持 TypeScript 开箱即用 |
| Vue 测试 | @vue/test-utils | Vue 官方组件测试库 |
| DOM 环境 | happy-dom | 比 jsdom 更快、更轻量的 Node.js DOM 实现 |
| 类型支持 | tsx (optional) | 用于测试中直接写 TSX，非必需 |


## 实现方案

### 整体策略

分四阶段推进：**基础设施搭建 → 纯函数单元测试 → 组件/Store 测试 → 视图集成测试 → 问题分析与修复**。

阶段 1 和 2 优先保证核心业务逻辑的正确性（纯函数，无外部依赖），阶段 3 验证状态管理和组件交互，阶段 4 验证完整页面流程。

### 阶段 1：测试基础设施

- 安装依赖：`vitest`、`@vue/test-utils`、`happy-dom`
- 配置 `vite.config.ts` 添加 `test` 字段（environment: 'happy-dom'，alias 映射 @/*）
- 在 `package.json` 添加 `"test": "vitest run"` 和 `"test:watch": "vitest"` 脚本
- 创建 `src/__tests__/setup.ts` 全局 setup 文件（mock IndexedDB、localStorage 等）

### 阶段 2：纯函数单元测试（最高优先级，无外部依赖）

**`src/__tests__/utils/crypto.test.ts`** — 加密核心模块（约 40+ 用例）：

- `calculateMD5`：确定输入输出一致性、空字符串、特殊字符、中文、长字符串
- `encrypt` / `decrypt`：6 种算法各自加密后解密能还原原文（对称性测试）、Base64 特殊处理
- `processCrypto`：mode 分支覆盖（encrypt/decrypt）
- `removeOuterQuotes`：双引号包裹、单引号包裹、无引号、只有一侧引号、空字符串、嵌套引号
- `detectEncrypted`：CryptoJS 特征（U2FsdGVkX1 开头）、Base64 格式、有效 JSON（对象/数组/null/数字/字符串/布尔值）、空数据、非加密非 JSON 混合文本、引号包裹的加密数据
- `cleanData`：有引号包裹、无引号、带空格的引号

**`src/__tests__/utils/json.test.ts`** — JSON 处理模块（约 15+ 用例）：

- `formatJson`：对象、数组、嵌套结构、已格式化数据重新格式化
- `compressJson`：同上场景压缩
- `isValidJson`：有效 JSON 各种类型、无效 JSON（语法错误、截断、undefined）、空字符串/纯空白

**`src/__tests__/utils/uuid.test.ts`** — UUID 生成（约 5 用例）：

- 格式校验（UUID v4 正则）、唯一性（多次生成不重复）、长度校验

### 阶段 3：组件与状态管理测试

**`src/__tests__/stores/jsonStore.test.ts`** — 状态管理（约 25+ 用例）：

- Mock `utils/db` 模块（IndexedDB 依赖）
- `addFiles`：正常添加、去重逻辑（同文件名同 MD5 跳过、同文件名不同 MD5 允许、不同文件名同 MD5 允许）、FileReader 错误处理
- `setPasteText`：引号清理
- `getFilteredFiles` / `getFilteredIndexes`：5 种过滤模式全覆盖、关键词搜索、组合筛选
- `hasData` / `isFileMode`：文件模式 vs 粘贴模式
- `detectAndSetCryptoMode`：加密内容自动切 decrypt、JSON 自动切 encrypt
- `reset` / `resetForNewUpload`：状态重置完整性
- `updateProcessed`：正常更新、越界索引安全
- `getCurrentSource` / `getCurrentProcessed`：文件模式 vs 粘贴模式

**`src/__tests__/composables/useTheme.test.ts`** — 主题切换（约 10 用例）：

- Mock localStorage 和 matchMedia
- 默认主题、切换 light/dark/system
- resolvedTheme 计算正确性
- localStorage 持久化
- dispose 清理监听器

**组件测试**（使用 `@vue/test-utils` + Element Plus mock）：

- `src/__tests__/components/ToolBar.test.ts`：按钮禁用逻辑（无有效 JSON 时禁用、有有效 JSON 时启用）
- `src/__tests__/components/BatchAction.test.ts`：复选框交互、批量处理按钮禁用条件（filteredCount=0/batchLoading）、ZIP 下载禁用条件
- `src/__tests__/components/CryptoConfig.test.ts`：算法选择、模式切换、密钥显示/隐藏
- `src/__tests__/components/FileList.test.ts`：文件筛选逻辑、搜索过滤、空状态显示
- `src/__tests__/components/JsonEditor.test.ts`：还原/加密/解密按钮条件渲染、下载/清空/复制交互

### 阶段 4：视图集成测试

**`src/__tests__/views/UploadView.test.ts`**（约 15+ 用例）：

- 初始化：mount 时 reset 和 init store
- Tab 切换：文件上传 / 文本粘贴
- 文件上传：拖拽区域存在性、文件去重提示
- 文本粘贴：空输入验证、无效 JSON 验证
- 下一步：无文件警告、无文本警告、成功跳转

**`src/__tests__/views/ProcessView.test.ts`**（约 20+ 用例）：

- 初始化：无数据时重定向到 upload
- 加密操作：选择算法 → 点击加密 → 结果显示
- 解密操作：自动检测模式 → 解密
- 格式化/压缩：有效 JSON 处理、无效 JSON 提示、引号包裹后格式化
- 批量处理：多文件批量、进度条、部分成功/全部失败
- 文件下载：单文件下载触发、ZIP 下载条件
- 文件列表交互：切换文件、筛选、搜索
- URL 参数：?file=按名称或索引打开指定文件

### 阶段 5：问题分析报告与修复

- 执行全部测试，收集失败用例
- 编写 `docs/test-analysis-report.md` 问题分析报告，包含：
- 测试覆盖率统计
- 失败用例清单及根因分析
- 修复优先级排序
- 修复计划
- 逐项修复代码问题
- 重新运行测试确保全部通过

## 实现注意事项

- **Mock 策略**：对 IndexedDB（`utils/db.ts`）、浏览器 API（`navigator.clipboard`、`Blob`、`saveAs`）进行模块级 mock；对 Element Plus 组件使用 shallow mount 避免深度渲染
- **状态隔离**：每个测试用例使用 `beforeEach` 重置 store 状态，防止测试间污染
- **UnoCSS**：测试环境下 UnoCSS 指令类名不生效是正常的，不测试样式相关断言
- **性能**：纯函数测试应毫秒级完成；组件测试使用 shallow mount 控制在合理范围
- **批量测试数据**：为批量处理测试预构造 3-5 个不同状态的 JsonFile 模拟数据

## 目录结构

```
d:\workspace\code\json-crypto\
├── package.json                     # [MODIFY] 添加 vitest, @vue/test-utils, happy-dom 依赖及 test 脚本
├── vite.config.ts                   # [MODIFY] 添加 test 配置 (environment, alias, setup)
├── src\
│   ├── __tests__\
│   │   ├── setup.ts                 # [NEW] 全局测试 setup：mock IndexedDB、localStorage、matchMedia
│   │   ├── utils\
│   │   │   ├── crypto.test.ts       # [NEW] 加密核心模块测试（40+ 用例）
│   │   │   ├── json.test.ts         # [NEW] JSON 处理模块测试（15+ 用例）
│   │   │   └── uuid.test.ts         # [NEW] UUID 生成测试（5 用例）
│   │   ├── stores\
│   │   │   └── jsonStore.test.ts    # [NEW] 状态管理测试（25+ 用例，mock db 模块）
│   │   ├── composables\
│   │   │   └── useTheme.test.ts     # [NEW] 主题切换测试（10 用例，mock localStorage/matchMedia）
│   │   ├── components\
│   │   │   ├── ToolBar.test.ts      # [NEW] 格式化工具栏测试（按钮禁用逻辑）
│   │   │   ├── BatchAction.test.ts  # [NEW] 批量操作栏测试（复选框/按钮禁用）
│   │   │   ├── CryptoConfig.test.ts # [NEW] 加密配置测试（算法/模式/密钥交互）
│   │   │   ├── FileList.test.ts     # [NEW] 文件列表测试（筛选/搜索/空状态）
│   │   │   └── JsonEditor.test.ts   # [NEW] JSON 编辑器测试（按钮条件渲染/交互）
│   │   └── views\
│   │       ├── UploadView.test.ts   # [NEW] 上传页面集成测试（15+ 用例）
│   │       └── ProcessView.test.ts  # [NEW] 处理页面集成测试（20+ 用例）
│   └── ... (existing files unchanged)
├── docs\
│   └── test-analysis-report.md      # [NEW] 测试问题分析报告（含覆盖率、失败分析、修复计划）
```

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 探索项目源码以精确定位测试目标函数的边界条件和调用链
- Expected outcome: 确保测试用例覆盖所有代码分支和边界场景