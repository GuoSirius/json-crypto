---
name: supplement-unit-tests
overview: 针对单元测试覆盖分析中发现的缺失测试进行补充，包括：新增 ThemeToggle 组件测试、download 工具模块测试、加密/解密边界测试、JSON 处理边界测试、store 错误恢复测试、useTheme 媒体查询监听测试，以及完整的用户流程集成测试。
todos:
  - id: theme-toggle-test
    content: 新建 ThemeToggle.test.ts 组件测试
    status: pending
  - id: download-db-test
    content: 新建 download.test.ts 和 db.test.ts 工具测试
    status: pending
  - id: crypto-boundary
    content: 补充 crypto.test.ts 边界和异常测试用例
    status: pending
  - id: json-boundary
    content: 补充 json.test.ts 边界测试用例
    status: pending
  - id: store-theme-enhance
    content: 补充 jsonStore.test.ts 异常测试和 useTheme.test.ts 系统主题监听测试
    status: pending
  - id: run-tests
    content: 运行全部测试确认通过
    status: pending
    dependencies:
      - theme-toggle-test
      - download-db-test
      - crypto-boundary
      - json-boundary
      - store-theme-enhance
---

## 产品概述

针对 json-crypto 项目单元测试覆盖分析报告中发现的问题，补充完善测试代码，使模块覆盖率达到 100%，并增强边界条件和异常场景的测试深度。

## 核心需求

- 补充 3 个完全缺失的测试文件：ThemeToggle 组件、download 工具模块、db 工具模块
- 增强 3 个现有测试文件的边界/异常覆盖：crypto.test.ts、json.test.ts、jsonStore.test.ts
- 增强 useTheme.test.ts 的系统主题变更监听测试
- 所有新测试必须遵循现有项目的测试模式（vitest + @vue/test-utils + vi.mock）
- 最终全部测试通过，预计新增约 60-80 个测试用例

## 技术栈

- 测试框架：vitest
- Vue 组件测试：@vue/test-utils + mount
- Mock 模式：vi.mock / vi.fn / vi.spyOn
- 图标 Mock：lucide-vue-next 替换为 span 组件
- 外部库 Mock：idb、JSZip、file-saver、element-plus

## 实现方案

### 1. ThemeToggle 组件测试（新建）

- Mock lucide-vue-next 图标（Monitor/Moon/Sun）和 useTheme composable
- 测试 3 个按钮渲染、title 属性、setMode 调用、激活状态样式差异
- 使用 vi.mock('@/composables/useTheme') 隔离主题逻辑

### 2. download 工具测试（新建）

- Mock JSZip（构造函数、file 方法、generateAsync）和 file-saver（saveAs）
- 测试 downloadFile 创建正确 Blob 并调用 saveAs
- 测试 downloadAsZip 文件名后缀生成逻辑（.json 替换 + suffix）
- 测试空文件数组边界和自定义 suffix 参数

### 3. db 工具测试（新建）

- Mock idb 的 openDB，避免真实 IndexedDB 依赖
- 测试 getDB 的 upgrade 回调逻辑（createObjectStore）
- 测试 saveStoreData / loadStoreData / clearStoreData 的链式调用

### 4. crypto 边界测试补充（追加）

- 在现有文件末尾新增 describe 块，不改动已有代码
- 补充：emoji 字符加解密往返、超长密钥、含 null 字符数据加密、连续特殊 Unicode、大文本加密性能

### 5. json 边界测试补充（追加）

- 补充：深度嵌套 JSON（50 层）、含 Unicode 转义字符的 JSON、含控制字符的 JSON、空对象/空数组、scientific notation 数字

### 6. jsonStore 异常测试补充（追加）

- 补充：loadStoreData 返回损坏数据时的容错处理、persist 失败不崩溃、大量文件（50 个）批量添加性能、sanitizeContent 对 null 字符的处理

### 7. useTheme 系统主题监听补充（追加）

- 补充：matchMedia addEventListener/removeEventListener 调用验证、dispose 正确清理监听器

## 关键约束

- db.ts 依赖 idb 库的 openDB，必须在测试中完全 mock
- download.ts 依赖 JSZip 和 file-saver，需要 mock 构造函数和静态方法
- useTheme 是模块级单例，测试间存在状态污染风险，复用现有的 beforeEach 清理模式
- crypto 边界测试中加密性能测试使用小数据量验证正确性，不作为性能基准
- 追加测试使用 append 到现有文件末尾的方式，避免修改已有代码

## 目录结构

```
src/__tests__/
├── components/
│   ├── ThemeToggle.test.ts          # [NEW] 主题切换组件测试
│   └── ...existing...
├── utils/
│   ├── crypto.test.ts               # [MODIFY] 追加边界测试
│   ├── json.test.ts                 # [MODIFY] 追加边界测试
│   ├── download.test.ts             # [NEW] 下载工具测试
│   ├── db.test.ts                   # [NEW] IndexedDB 封装测试
│   └── ...existing...
├── composables/
│   └── useTheme.test.ts             # [MODIFY] 追加系统主题监听测试
├── stores/
│   └── jsonStore.test.ts            # [MODIFY] 追加异常/大量文件测试
└── ...existing...
```