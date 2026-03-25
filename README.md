# JSON Crypto - JSON 数据处理工具

基于 Vite + Vue3 + Element Plus + UnoCSS + CryptoJS 构建的 JSON 数据处理工具，支持文件上传/粘贴、格式化、压缩、加密解密、批量处理和导出下载。

## 功能特性

- **多种输入方式**：拖拽上传 JSON 文件或直接粘贴 JSON 文本
- **JSON 处理**：格式化、压缩、加密（AES/DES/TripleDES/RC4/Rabbit/Base64）、解密
- **文件管理**：左侧文件列表，支持 URL 传参指定文件（`?file=0` 或 `?file=xxx.json`）
- **一键复制**：原数据和处理后数据均可复制到剪贴板
- **批量处理**：一键批量加密/解密所有文件，带进度条显示
- **下载导出**：单文件下载 / 多文件 ZIP 打包下载
- **数据持久化**：IndexedDB 保存所有数据（含密钥和加密方式），页面刷新自动恢复
- **安全返回**：点击返回弹出二次确认，确认后清除所有数据回到上传页

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite 5
- **UI 组件库**：Element Plus
- **样式方案**：UnoCSS
- **加密库**：CryptoJS
- **路由管理**：Vue Router
- **状态管理**：Vue 3 Composition API
- **文件处理**：JSZip + FileSaver
- **数据持久化**：IndexedDB (idb)

## 项目结构

```
src/
├── main.ts                 # 入口，注册 Element Plus + UnoCSS + Router
├── App.vue                 # 根组件，启动时检查 IndexedDB 自动路由
├── style.css               # 全局深色主题样式
├── types/index.ts          # TS 类型定义
├── utils/
│   ├── db.ts               # IndexedDB 持久化（idb 库）
│   ├── crypto.ts           # CryptoJS 加密/解密封装
│   ├── json.ts             # JSON 格式化/压缩工具
│   └── download.ts         # 文件下载 + JSZip 打包
├── stores/jsonStore.ts     # 全局状态 composable + IndexedDB 自动持久化
├── router/index.ts         # 路由配置
├── views/
│   ├── UploadView.vue      # 上传页（文件拖拽 + 文本粘贴）
│   └── ProcessView.vue     # 处理页（集成所有子组件）
└── components/
    ├── FileList.vue        # 左侧文件列表
    ├── JsonEditor.vue      # JSON 编辑器（带复制按钮）
    ├── ToolBar.vue         # 格式化/压缩/加密/解密按钮
    ├── CryptoConfig.vue    # 算法选择 + 加密/解密模式 + 密钥输入
    └── BatchAction.vue     # 批量处理 + 下载 + ZIP 打包
```

## 快速开始

### 使用 pnpm（推荐）

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview
```

### 使用 npm

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 使用说明

### 1. 上传数据
- **文件上传**：拖拽 JSON 文件到上传区域，或点击选择文件
- **文本粘贴**：在文本框中直接粘贴 JSON 数据
- 点击"下一步"进入处理页面

### 2. 处理数据
- **选择文件**：左侧文件列表中选择要处理的文件
- **JSON 操作**：
  - 格式化：美化 JSON 格式
  - 压缩：去除空白字符
  - 加密：选择算法（AES/DES/TripleDES/RC4/Rabbit/Base64）并输入密钥
  - 解密：使用相同算法和密钥解密
- **复制结果**：点击复制按钮复制原数据或处理后数据

### 3. 批量操作
- **批量处理**：点击批量操作按钮，对所有文件执行相同操作
- **下载**：下载当前文件或打包所有文件为 ZIP

### 4. 数据持久化
- 进入处理页后，所有数据自动保存到 IndexedDB
- 页面刷新后自动恢复上次状态
- 点击返回按钮时，会提示确认并清除所有存储数据

## 开发指南

### 添加新的加密算法

1. 在 `src/utils/crypto.ts` 中添加新的算法实现
2. 在 `src/types/index.ts` 的 `CryptoAlgorithm` 类型中添加算法名称
3. 在 `src/components/CryptoConfig.vue` 的下拉选项中添加新算法

### 自定义样式

项目使用 UnoCSS，可以通过以下方式自定义样式：

- 修改 `uno.config.ts` 中的主题配置
- 在组件中使用 UnoCSS 原子类
- 在 `src/style.css` 中添加全局样式

## 部署

### 构建生产版本

```bash
pnpm run build
```

构建结果位于 `dist/` 目录，可直接部署到任何静态文件服务器。

### Docker 部署

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 许可证

MIT