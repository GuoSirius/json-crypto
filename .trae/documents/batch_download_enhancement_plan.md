# 批量下载功能增强计划

## 项目分析总结

### 技术栈
- **框架**: Vue 3 + TypeScript
- **UI库**: Element Plus
- **构建工具**: Vite
- **状态管理**: 自定义响应式Store (jsonStore.ts)
- **ZIP处理**: JSZip + file-saver
- **图标**: lucide-vue-next
- **样式**: UnoCSS
- **测试**: Vitest + @vue/test-utils

### 核心数据结构
```typescript
interface JsonFile {
  id: string
  name: string
  content: string      // 上传的原始内容
  md5: string
  processed: string    // 处理后内容
  status: 'pending' | 'done' | 'error'
}
```

### 数据流说明
- **原始内容**: 编辑框中的内容（sourceText），用户可能已修改，存储在 `sourceText` 响应式变量中
- **处理后内容**: 加密/解密后的结果（processedText），存储在 `file.processed` 中
- **编辑框**: [JsonEditor.vue](file:///d:/workspace/code/json-crypto/src/components/JsonEditor.vue) 组件，支持双向绑定

### 现有批量下载功能
- **位置**: [BatchAction.vue](file:///d:/workspace/code/json-crypto/src/components/BatchAction.vue) 组件
- **下载函数**: [downloadAsZip](file:///d:/workspace/code/json-crypto/src/utils/download.ts#L10-L19) 在 download.ts
- **当前逻辑**: 只下载 `file.processed`（处理后内容）
- **触发位置**: [ProcessView.vue](file:///d:/workspace/code/json-crypto/src/views/ProcessView.vue#L340-L349) 的 `handleDownloadZip` 方法

---

## 功能实现方案

### 需求分析

**当前功能：**
- 点击"打包下载 ZIP"按钮，直接下载"处理后的内容"

**新增需求：**
1. **默认行为保持不变**: 点击按钮直接下载处理后内容
2. **下拉选项**（通过下拉箭头触发）:
   - 下载原始内容（编辑框中的当前内容，可能已被用户修改）
   - 下载处理后内容（现有功能）
   - 同时下载原始内容和处理后的内容

### 技术方案

#### 1. 类型定义扩展
在 [types/index.ts](file:///d:/workspace/code/json-crypto/src/types/index.ts) 添加下载类型：
```typescript
export type DownloadMode = 'original' | 'processed' | 'both'
```

#### 2. download.ts 修改
扩展 `downloadAsZip` 函数，支持三种下载模式：
- `original`: 从编辑框获取当前内容（sourceText）下载
- `processed`: 下载 `file.processed`（默认，保持现有行为）
- `both`: 创建两个子文件夹 `original/` 和 `processed/`，分别存放对应内容

**注意**: 由于原始内容可能在编辑框中被修改，需要传入当前编辑框的内容，而不是 `file.content`

#### 3. BatchAction.vue 修改
- 使用 Element Plus 的 `el-dropdown` + `el-button-group` 实现分裂按钮
- **主按钮**: 点击直接下载处理后内容（保持现有行为）
- **下拉箭头**: 展开下拉菜单，显示三个选项
- 下拉选项：
  - 下载原始内容（使用编辑框当前内容）
  - 下载处理后内容
  - 同时下载两种内容

#### 4. ProcessView.vue 修改
- 修改 `handleDownloadZip` 方法，接收下载模式参数
- 当下载原始内容时，使用 `sourceText.value` 而不是 `file.content`
- 根据模式调用 `downloadAsZip`

### UI设计
使用 Element Plus 的 Split Button（分裂按钮）样式：
```
[ 打包下载 ZIP | ▼ ]
                   ├─ 下载原始内容
                   ├─ 下载处理后内容
                   └─ 同时下载两种内容
```

### ZIP文件结构

#### 原始内容 / 处理后内容模式
```
json-crypto-output.zip
├── file1_encrypt.json
├── file2_encrypt.json
└── ...
```

#### 同时下载模式
```
json-crypto-output.zip
├── original/
│   ├── file1.json
│   ├── file2.json
│   └── ...
└── processed/
    ├── file1_encrypt.json
    ├── file2_encrypt.json
    └── ...
```

---

## 实施步骤

### Phase 1: 分支准备
1. **创建 development 分支**
   ```bash
   git checkout -b development
   git push -u origin development
   ```

### Phase 2: 核心功能开发
2. **修改 types/index.ts** - 添加 DownloadMode 类型
3. **修改 utils/download.ts** - 扩展 downloadAsZip 函数支持三种模式
4. **修改 components/BatchAction.vue** - 添加分裂按钮和下拉菜单UI
5. **修改 views/ProcessView.vue** - 更新 handleDownloadZip 方法，支持传入编辑框内容

### Phase 3: 单元测试
6. **更新/添加单元测试**
   - 更新 `BatchAction.test.ts` - 测试新的下拉菜单和事件
   - 更新 `download.test.ts` - 测试三种下载模式
   - 如有必要，更新 `ProcessView.test.ts`

### Phase 4: 文档完善
7. **更新 README.md**
   - 添加目录结构说明
   - 更新功能说明（批量下载功能增强）
   - 添加变更日志（CHANGELOG）
8. **更新 docs/README.md** - 如有需要，添加更详细的功能文档

### Phase 5: 验证与合并
9. **运行测试** - `pnpm test`
10. **构建验证** - `pnpm build`
11. **类型检查** - `pnpm type-check`

---

## 代码变更预估

### 文件变更列表
| 文件 | 变更类型 | 说明 |
|------|----------|------|
| src/types/index.ts | 新增 | 添加 DownloadMode 类型 |
| src/utils/download.ts | 修改 | 扩展 downloadAsZip 函数 |
| src/components/BatchAction.vue | 修改 | 添加分裂按钮和下拉菜单 |
| src/views/ProcessView.vue | 修改 | 更新下载处理逻辑 |
| src/__tests__/components/BatchAction.test.ts | 修改 | 更新组件测试 |
| src/__tests__/utils/download.test.ts | 修改 | 更新下载工具测试 |
| README.md | 修改 | 添加功能说明和变更日志 |

---

## 详细代码设计

### 1. types/index.ts 新增
```typescript
export type DownloadMode = 'original' | 'processed' | 'both'
```

### 2. utils/download.ts 修改
```typescript
export async function downloadAsZip(
  files: JsonFile[], 
  sourceContents: string[],  // 编辑框中的当前内容
  mode: DownloadMode = 'processed',
  suffix = '_processed'
) {
  const zip = new JSZip()
  
  if (mode === 'both') {
    const originalFolder = zip.folder('original')
    const processedFolder = zip.folder('processed')
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const originalName = file.name
      const processedName = file.name.replace(/\.json$/i, '') + suffix + '.json'
      originalFolder?.file(originalName, sourceContents[i] || file.content)
      processedFolder?.file(processedName, file.processed)
    }
  } else {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const content = mode === 'original' 
        ? (sourceContents[i] || file.content)
        : file.processed
      const name = mode === 'original'
        ? file.name
        : file.name.replace(/\.json$/i, '') + suffix + '.json'
      zip.file(name, content)
    }
  }
  
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'json-crypto-output.zip')
}
```

### 3. BatchAction.vue 修改要点
- 使用 `el-button-group` + `el-dropdown` 实现分裂按钮
- 主按钮点击触发 `downloadZip` 事件（处理后内容）
- 下拉菜单项触发 `downloadZipWithMode` 事件，传入模式参数

### 4. ProcessView.vue 修改要点
- 修改 `handleDownloadZip` 接收 `mode` 参数
- 收集当前所有过滤后文件的 `sourceText` 内容
- 调用新的 `downloadAsZip` 函数

---

## 测试策略

### 单元测试覆盖点
1. **BatchAction 组件**
   - 主按钮点击触发下载事件
   - 下拉菜单显示三个选项
   - 下拉选项点击触发对应事件

2. **download 工具函数**
   - `downloadAsZip` 三种模式正确生成zip
   - `original` 模式使用传入的 sourceContents
   - `both` 模式创建两个文件夹

3. **ProcessView 组件**
   - `handleDownloadZip` 正确处理三种模式
   - 正确收集编辑框内容

---

*计划创建时间：2026-03-27*
*计划文件位置：.trae/documents/batch_download_enhancement_plan.md*
