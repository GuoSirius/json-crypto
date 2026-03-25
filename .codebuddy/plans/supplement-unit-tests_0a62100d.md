---
name: supplement-unit-tests
overview: 针对单元测试覆盖分析中发现的 4 个核心不足进行补充完善：1) 新增集成测试（完整用户流程：上传→加密→下载→解密）；2) 新增性能测试（加密、JSON 处理、Store 大数据量）；3) 补充缺失组件测试（ThemeToggle）；4) 增强错误处理覆盖（store 异常、加密异常、文件异常、store 大量文件）。同时补充 download 和 db 工具模块测试。
todos:
  - id: new-module-tests
    content: 新建 ThemeToggle.test.ts、download.test.ts、db.test.ts 三个缺失模块测试
    status: completed
  - id: boundary-tests
    content: 追加 crypto.test.ts 和 json.test.ts 边界与错误处理测试用例
    status: completed
  - id: store-theme-enhance
    content: 追加 jsonStore.test.ts 异常测试和 useTheme.test.ts 系统主题监听测试
    status: completed
  - id: integration-tests
    content: 新建 integration/crypto-workflow.test.ts 跨模块集成测试（真实加密逻辑）
    status: completed
  - id: performance-tests
    content: 新建 integration/performance.test.ts 性能基准测试
    status: completed
  - id: run-all-tests
    content: 运行全部测试并确认通过
    status: completed
    dependencies:
      - new-module-tests
      - boundary-tests
      - store-theme-enhance
      - integration-tests
      - performance-tests
---

## 产品概述

针对 json-crypto 项目单元测试覆盖分析报告发现的 4 个核心不足进行补充完善：缺少集成测试、缺少性能测试、少数组件未测试、错误处理覆盖不足。

## 核心需求

### 1. 缺少集成测试

- 现有 ProcessView/UploadView 测试中 crypto/json/download 等工具函数均被 mock，未测试真实加密逻辑
- 缺少跨模块联合工作流测试：store + crypto + json 的真实数据流
- 需要验证完整的用户操作链路

### 2. 缺少性能测试

- 无任何性能基准测试
- 加密操作（特别是大文本）、JSON 格式化/压缩、Store 大量文件筛选等场景未评估性能

### 3. 少数组件/模块未测试

- `ThemeToggle.vue`：主题切换按钮组件，无任何测试
- `download.ts`：文件下载工具（downloadFile/downloadAsZip），无任何测试
- `db.ts`：IndexedDB 封装（getDB/saveStoreData/loadStoreData/clearStoreData），无任何测试

### 4. 错误处理覆盖不足

- crypto.test.ts：缺少 emoji/组合字符等特殊 Unicode 加解密、错误密钥类型的友好错误消息验证
- json.test.ts：缺少深度嵌套 JSON、含控制字符的 JSON 边界情况
- jsonStore.test.ts：缺少 persist 失败不崩溃、loadStoreData 返回损坏数据容错、大量文件批量添加
- useTheme.test.ts：缺少 matchMedia addEventListener/removeEventListener 调用验证、dispose 清理监听器

## 技术栈

- 测试框架：vitest（已配置）
- Vue 组件测试：@vue/test-utils + mount
- Mock 模式：vi.mock / vi.fn / vi.spyOn
- 外部库 Mock：idb（openDB）、JSZip + file-saver、element-plus、lucide-vue-next

## 实现方案

### 策略一：新增测试文件（3 个模块级单元测试）

**ThemeToggle.test.ts**（组件测试）

- 使用 vi.mock('@/composables/useTheme') 隔离主题逻辑，返回可控的 mode/setMode
- Mock lucide-vue-next 图标（Monitor/Moon/Sun）为 span 组件
- 测试点：3 个按钮渲染、title 属性、点击调用 setMode、激活状态样式类差异

**download.test.ts**（工具模块测试）

- Mock JSZip：构造函数返回 { file: vi.fn(), generateAsync: vi.fn() }
- Mock file-saver：saveAs = vi.fn()
- 测试 downloadFile：验证 Blob 类型为 application/json、调用 saveAs
- 测试 downloadAsZip：验证 zip.file 每个文件名后缀生成（.json 替换 + suffix）、generateAsync 调用、空数组处理、自定义 suffix

**db.test.ts**（工具模块测试）

- Mock idb 的 openDB：返回含 put/get/delete 方法和 objectStoreNames 的 mock 对象
- 测试 getDB：upgrade 回调仅在 store 不存在时调用 createObjectStore
- 测试 saveStoreData：链式调用 getDB → db.put
- 测试 loadStoreData：getDB → db.get，返回 null 降级
- 测试 clearStoreData：getDB → db.delete

### 策略二：追加现有测试（4 个文件）

**crypto.test.ts** 追加边界+错误处理（约 15 个用例）

- 新增 describe('Boundary & Error Handling')：
- emoji 字符加解密往返（前后一致）
- Unicode 组合字符（e + combining acute）加解密
- 包含 \0 null 字符的数据加解密
- 超长密钥（1000 字符）加解密
- 错误密钥解密时验证友好错误消息（包含"密钥不正确"）
- 无效数据解密（非加密文本当密文解密）抛出错误
- Base64 空字符串/纯空格解密抛出错误
- 超长文本（100KB）加解密往返正确性

**json.test.ts** 追加边界测试（约 10 个用例）

- 新增 describe('Boundary Cases')：
- 深度嵌套 JSON（50 层）格式化和压缩
- 超大 JSON（含 1000 个键的对象）
- 含 Unicode 转义字符的 JSON（\u00e9 等）
- 含制表符/换行符的 JSON 字符串值
- 空对象 {} 和空数组 [] 的格式化/压缩
- 科学计数法数字（1e+100, 1.5e-10）
- BigInt/undefined 值（JSON.stringify 会丢弃，验证行为）

**jsonStore.test.ts** 追加异常和大量文件测试（约 8 个用例）

- 新增 describe('Error Handling & Bulk Operations')：
- persist 失败时 store 不崩溃（mock saveStoreData 拒绝）
- loadStoreData 返回损坏数据（缺少 files 字段）不崩溃
- loadStoreData 返回 null 降级到默认值
- 批量添加 20 个文件（不同内容）性能
- 大量文件（20 个）+ 搜索筛选性能
- readFileAsText 失败时文件标记为 error 状态（已存在但需加强验证）

**useTheme.test.ts** 追加系统主题监听（约 5 个用例）

- 新增 describe('Media Query Listener')：
- useTheme 调用 addEventListener 注册 change 监听
- setMode('system') 后 matchMedia change 事件触发 DOM 类名切换
- dispose 调用 removeEventListener 清理监听
- 多次 init/dispose 调用不重复注册/泄漏监听器

### 策略三：新增集成测试（1 个文件）

**integration/crypto-workflow.test.ts**

- 不 mock crypto 和 json 工具函数，仅 mock db 和 vue-router/element-plus
- 测试用例：
- Store + Crypto 集成：addFiles → detectAndSetCryptoMode 验证模式正确切换
- Store + Crypto 完整链路：添加文件 → 检测加密模式 → 对每个文件执行 processCrypto → 验证结果有效性
- 加密→解密往返：用真实 AES 加密文件内容 → 模拟切换模式 → 用同一密钥解密 → 验证与原文一致
- 格式化→压缩往返：用真实 formatJson/compressJson 验证双向一致性
- 批量加密流程：多个文件（混合明文/密文）→ getFilteredFiles → 逐一 processCrypto → 验证每个结果

### 策略四：新增性能测试（1 个文件）

**integration/performance.test.ts**

- 使用 vitest 的 describe + it，通过 performance.now() 测量耗时
- 测试用例：
- AES 加密 10KB 文本 < 500ms
- AES 加密 100KB 文本 < 2000ms
- Base64 编解码 100KB 文本 < 200ms
- formatJson 10KB JSON < 100ms
- compressJson 10KB JSON < 100ms
- calculateMD5 100KB 文本 < 100ms
- Store 添加 20 个文件 < 2000ms
- Store getFilteredFiles 20 个文件筛选 < 50ms

## 关键约束

- 追加测试使用 append 到现有文件末尾，不修改已有测试代码
- 集成测试中仅 mock 外部依赖（db/element-plus/vue-router），保留 crypto/json 真实逻辑
- 性能测试阈值设置宽松（CI 环境可能较慢），主要目的是建立基准和回归检测
- db.test.ts 中 mock idb 的 openDB 需确保 upgrade 回调在 objectStoreNames 不包含 store 时触发
- useTheme 是模块级单例，需复用现有 beforeEach 清理模式，注意 matchMedia mock 的 addEventListener/removeEventListener 需要正确实现
- download.test.ts 中 JSZip mock 的 generateAsync 需返回 Promise<Blob>

## 目录结构

```
src/__tests__/
├── components/
│   ├── ThemeToggle.test.ts          # [NEW] 主题切换组件测试（约 6 个用例）
│   └── ...existing 5 files...
├── utils/
│   ├── crypto.test.ts               # [APPEND] 边界+错误处理（约 15 个用例）
│   ├── json.test.ts                 # [APPEND] 边界测试（约 10 个用例）
│   ├── uuid.test.ts                 # [EXISTS] 不修改
│   ├── download.test.ts             # [NEW] 下载工具测试（约 6 个用例）
│   └── db.test.ts                   # [NEW] IndexedDB 封装测试（约 6 个用例）
├── composables/
│   └── useTheme.test.ts             # [APPEND] matchMedia 监听（约 5 个用例）
├── stores/
│   └── jsonStore.test.ts            # [APPEND] 异常+大量文件（约 8 个用例）
├── views/
│   ├── UploadView.test.ts           # [EXISTS] 不修改
│   └── ProcessView.test.ts          # [EXISTS] 不修改
└── integration/
    ├── crypto-workflow.test.ts      # [NEW] 跨模块集成测试（约 8 个用例）
    └── performance.test.ts          # [NEW] 性能基准测试（约 8 个用例）
```