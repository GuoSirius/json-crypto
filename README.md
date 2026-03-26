# JSON Crypto - JSON 数据处理工具

基于 Vite + Vue 3 + TypeScript + Element Plus + UnoCSS + CryptoJS 构建的 JSON 数据处理工具，支持文件上传/粘贴、格式化、压缩、加密解密、批量处理和导出下载。

## 📋 环境要求

- **Node.js 24+** (必须使用 24 或更高版本)
- **pnpm 10.32.1+** (推荐使用 10.32.1)
- **重要**：项目已配置为仅支持 Node.js 24 及以上版本

## 功能特性

### 数据处理

- **多种输入方式**：拖拽上传 JSON 文件或直接粘贴 JSON 文本
- **JSON 格式化**：美化 JSON 格式，支持带引号输出
- **JSON 压缩**：去除空白字符，减小文件体积
- **6 种加密算法**：AES、DES、TripleDES、RC4、Rabbit、Base64
- **智能模式检测**：自动识别加密数据，切换加密/解密模式
- **加引号选项**：支持为加密结果添加外层引号

### 文件管理

- **多文件支持**：同时上传和处理多个 JSON 文件
- **文件去重**：基于文件名 + MD5 哈希自动去重
- **文件筛选**：全部 / 待加密 / 待解密 / 未加密 / 未解密
- **关键词搜索**：按文件名快速搜索定位
- **URL 传参**：通过 `?file=0` 或 `?file=xxx.json` 直接打开指定文件
- **处理页添加文件**：在处理页面支持继续添加更多文件

### 批量操作
- **批量加密/解密**：一键对所有筛选文件执行操作，自动检测每个文件的加密状态
- **进度条显示**：批量处理时实时显示进度
- **ZIP 打包下载**：将所有处理后文件打包为 ZIP 下载

### 用户体验
- **主题切换**：亮色 / 暗黑 / 跟随系统三种模式
- **主题防闪烁**：页面加载前立即应用主题，避免白屏闪烁
- **一键复制**：原数据和处理后数据均可复制到剪贴板
- **数据持久化**：IndexedDB 保存所有数据（含密钥和加密方式），页面刷新自动恢复
- **安全返回**：点击返回弹出二次确认，确认后清除所有数据
- **视图切换动画**：页面和 Tab 切换带有平滑过渡效果

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript |
| 构建工具 | Vite 5 |
| UI 组件库 | Element Plus |
| 样式方案 | UnoCSS (preset-uno + preset-attributify) |
| 加密库 | CryptoJS |
| 路由管理 | Vue Router (HTML5 History 模式) |
| 状态管理 | Vue 3 Composition API (reactive) |
| 数据持久化 | IndexedDB (idb) |
| 文件处理 | JSZip + FileSaver |
| 图标库 | Lucide Vue Next |
| 测试框架 | Vitest + @vue/test-utils + happy-dom |
| Git Hooks | husky |

## 项目结构

```bash
json-crypto/
├── .github/workflows/
│   └── deploy.yml              # CI/CD 工作流（测试 + GitHub Pages + Cloudflare Pages 部署）
├── scripts/
│   ├── build-and-preview.sh    # 本地构建 + 预览
│   ├── deploy-cloudflare.sh    # 手动部署 Cloudflare Pages
│   └── diagnose-cloudflare.sh  # Cloudflare Pages 部署问题诊断
├── public/
│   ├── 404.html                # GitHub Pages SPA 回退
│   ├── _redirects              # Cloudflare Pages SPA 回退
│   └── favicon.svg             # 网站图标
├── src/
│   ├── __tests__/              # 测试文件（18 个文件，366 个用例）
│   ├── assets/                 # 静态资源
│   ├── components/             # Vue 组件
│   │   ├── BatchAction.vue     # 批量处理 + ZIP 下载
│   │   ├── CryptoConfig.vue    # 算法选择 + 模式切换 + 密钥输入
│   │   ├── FileList.vue        # 文件列表（筛选 + 搜索）
│   │   ├── JsonEditor.vue      # JSON 编辑器（复制/下载/加密/解密）
│   │   ├── ThemeToggle.vue     # 主题切换按钮
│   │   └── ToolBar.vue         # 格式化/压缩按钮
│   ├── composables/
│   │   └── useTheme.ts         # 主题切换 composable
│   ├── router/
│   │   └── index.ts            # 路由配置 + 导航守卫
│   ├── stores/
│   │   └── jsonStore.ts        # 全局状态管理 + 自动持久化
│   ├── types/
│   │   └── index.ts            # TypeScript 类型定义
│   ├── utils/
│   │   ├── crypto.ts           # 加密/解密封装（6 种算法）
│   │   ├── db.ts               # IndexedDB 持久化
│   │   ├── download.ts         # 文件下载 + ZIP 打包
│   │   ├── json.ts             # JSON 格式化/压缩/验证
│   │   └── uuid.ts             # UUID v4 生成
│   ├── views/
│   │   ├── ProcessView.vue     # 处理页（集成所有功能）
│   │   └── UploadView.vue      # 上传页（文件拖拽 + 文本粘贴）
│   ├── App.vue                 # 根组件
│   ├── main.ts                 # 应用入口
│   ├── style.css               # 全局主题样式（亮色/暗黑）
│   └── vite-env.d.ts           # Vite 类型声明
├── docs/
│   ├── README.md               # 文档首页
│   ├── deployment.md           # 完整的多平台部署指南
│   ├── docker.md               # Docker 容器化部署指南
│   ├── testing.md              # 测试覆盖率分析和技术报告
│   └── troubleshooting.md      # 常见问题解决方案
├── dist/                       # 构建产物目录
├── build_check.txt             # 构建检查文件
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile                  # Docker 镜像构建
├── index.html                  # HTML 入口
├── nginx.conf                  # Nginx 配置
├── package.json                # 项目依赖和脚本
│   ├── pnpm-lock.yaml          # pnpm 锁文件
│   ├── QUICK_SETUP.md          # 快速开始指南
│   ├── README.md               # 项目说明
│   ├── SOLVE_GITHUB_PAGES_ISSUE.md  # GitHub Pages 问题解决方案
│   ├── tsconfig.app.json       # 应用 TypeScript 配置
│   ├── tsconfig.json           # TypeScript 配置
│   ├── tsconfig.node.json      # Node 环境 TypeScript 配置
│   ├── uno.config.ts           # UnoCSS 配置
│   └── vite.config.ts          # Vite 配置（动态 base）
```

## 快速开始

```bash
# 安装依赖（推荐使用 pnpm）
pnpm install

# 启动开发服务器
pnpm run dev

# 类型检查
pnpm run type-check

# 运行测试
pnpm run test

# 运行测试（监听模式）
pnpm run test:watch

# 生成测试覆盖率报告
pnpm run test:coverage

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview
```

## 使用说明

### 1. 上传数据
- **文件上传**：拖拽 JSON 文件到上传区域，或点击选择文件（支持多选）
- **文本粘贴**：切换到"文本粘贴"Tab，直接粘贴 JSON 数据
- 点击"下一步"进入处理页面

### 2. 处理数据
- **选择文件**：在左侧文件列表中选择要处理的文件
- **加密/解密**：
  - 选择算法（AES/DES/TripleDES/RC4/Rabbit/Base64）
  - 选择模式（加密/解密，系统会自动检测建议模式）
  - 输入密钥，点击"加密"或"解密"
- **格式化/压缩**：对 JSON 数据进行格式化或压缩
- **复制结果**：点击复制按钮将原数据或处理后数据复制到剪贴板

### 3. 批量操作
- **筛选文件**：使用筛选下拉框选择要批量处理的文件范围
- **批量处理**：点击"批量处理"，系统自动对每个文件检测加密状态并执行对应操作
- **打包下载**：点击"打包下载 ZIP"将所有处理后文件打包下载

### 4. 数据持久化
- 进入处理页后，所有数据（含文件内容、密钥、加密方式）自动保存到 IndexedDB
- 页面刷新后自动恢复上次状态
- 点击返回按钮时，二次确认后清除所有存储数据

## 代码质量

### Git Hooks
项目配置了 husky pre-commit hook，每次提交前自动运行：
- `vue-tsc -b`（TypeScript 类型检查）
- `vitest run`（366 个单元测试）

### 测试覆盖
- **17 个测试文件**，**366 个测试用例**，全部通过
- 覆盖全部工具函数、状态管理、组件和视图页面
- 总体覆盖率约 **98%**
- 测试执行时间约 **8-14 秒**

详见 [测试文档](docs/testing.md)。

## 部署

本项目支持同时部署到 **GitHub Pages** 和 **Cloudflare Pages**。

> ⚠️ **注意**：Gitee Pages 服务目前可能不可用或位置变更，已从自动部署中移除。如需部署到 Gitee，请参考手动部署部分。

### 自动部署（推荐）

推送代码到 `main` 分支后，GitHub Actions 会自动：
1. 运行类型检查和单元测试
2. 测试通过后并行部署到 **GitHub Pages** 和 **Cloudflare Pages**

#### 首次配置

> 详细步骤和图解请参阅 [多平台部署指南](docs/deployment.md)。

##### 1. GitHub Pages 配置（必需）

1. **打开仓库设置**
   - 进入 GitHub 仓库页面 → 点击 `Settings` 标签

2. **找到 Pages 设置**
   - 在左侧菜单中找到 `Pages`（在 Code and automation 下方）

3. **配置 Build 和部署**
   - 在 "Build and deployment" 部分，Source 下拉菜单选择 `GitHub Actions`

4. **保存**
   - 无需其他配置，GitHub Actions 工作流会自动处理后续部署

##### 2. Cloudflare Pages 配置（推荐）

1. **获取 Cloudflare API Token**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 点击右上角头像 → "My Profile" → "API Tokens" → "Create Custom Token"
   - 配置权限：
     - **Token name**：`GitHub Deploy`
     - **Permissions**：Account → Cloudflare Pages → Edit
     - **Account Resources**：选择你的账户
   - 点击 "Create Token" 并复制 Token

2. **获取 Cloudflare Account ID**
   - 在 Cloudflare Dashboard 首页右上角头像下方找到账户名称
   - 点击 → 复制 "Account ID"

3. **添加到 GitHub Secrets**
   - 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
   - 添加两个 Secret：
     - `CLOUDFLARE_API_TOKEN`：粘贴 API Token
     - `CLOUDFLARE_ACCOUNT_ID`：粘贴账户 ID

#### 查看部署状态

- **GitHub Actions**：仓库页面 → Actions 标签 → 查看部署 job 状态
- **GitHub Pages**：仓库页面 → Settings → Pages → 查看部署状态
- **Cloudflare Pages**：Cloudflare Dashboard → Pages → 查看部署日志

#### 访问地址

- **GitHub Pages**：`https://<你的用户名>.github.io/json-crypto/`
- **Cloudflare Pages**：`https://json-crypto.pages.dev/`（或自定义域名）

##### Cloudflare Pages 配置步骤（可选）

如果只需要 GitHub Pages，跳过此步骤。如果需要双平台部署：

1. **获取 Cloudflare API Token**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 点击右上角头像 → "My Profile"
   - 左侧菜单点击 "API Tokens"
   - 点击 "Create Custom Token"
   - 配置：
     - **Token name**：`GitHub Deploy`（任意名称）
     - **Permissions**：
       - Account → Cloudflare Pages → Edit
       - Zone → Cloudflare Pages → Edit
     - **Account Resources**：选择你的账户
   - 点击 "Create Token"
   - **重要**：复制生成的 Token（只显示一次）

2. **获取 Cloudflare Account ID**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 在首页右上角头像下方，找到你的账户名称
   - 点击 → 复制 "Account ID"

3. **添加到 GitHub Secrets**
   - 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - 添加两个 Secret：
     - `CLOUDFLARE_API_TOKEN`：粘贴刚才复制的 API Token
     - `CLOUDFLARE_ACCOUNT_ID`：粘贴账户 ID

4. **创建 Cloudflare Pages 项目（首次）**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
   - 点击 "Create a project"
   - 选择 "Direct Upload"（上传资源）
   - 项目名称填写：`json-crypto`
   - 点击 "Create project"
   - **后续**：GitHub Actions 会自动部署，不再需要手动操作

> 配置完成后，每次推送代码到 `main` 分支，GitHub Pages 和 Cloudflare Pages 都会自动更新。

#### 验证部署结果

- **GitHub Actions**：仓库页面 → Actions 标签 → 查看部署 job 状态
- **GitHub Pages**：仓库页面 → Settings → Pages → 查看部署状态
- **Cloudflare Pages**：Cloudflare Dashboard → Pages → 点击项目查看部署日志

#### 解决 Cloudflare Pages 部署失败

如果 Cloudflare Pages 部署失败，显示 **"Project not found"** 错误：

1. **手动创建 Cloudflare Pages 项目**：

   **新版界面（左侧导航栏）**：
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 左侧导航 → Workers & Pages → Create application → Pages → Upload assets
   - 项目名称填写：`json-crypto`

   **旧版界面（顶部导航栏）**：
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 顶部导航 → Pages → Create a project → Direct Upload
   - 项目名称填写：`json-crypto`

   创建完成后，返回 GitHub Actions 重新运行失败的 workflow

2. **使用诊断脚本检查问题**：

   ```bash
   chmod +x scripts/diagnose-cloudflare.sh
   ./scripts/diagnose-cloudflare.sh
   ```

3. **使用增强版部署脚本**：

   ```bash
   chmod +x scripts/deploy-cloudflare.sh
   ./scripts/deploy-cloudflare.sh
   ```

   > 该脚本会自动检查并引导创建 Cloudflare 项目

4. **修改项目名称**（如果名称被占用）：

   - 编辑 `.github/workflows/deploy.yml`
   - 修改第 147 行：`--project-name=json-crypto`
   - 改为：`--project-name=your-custom-name`

---

### 手动部署

如果需要手动部署到本地环境或其他平台：

#### 前置要求

```bash
# 安装 pnpm（如果未安装）
npm install -g pnpm
```

#### 方式一：使用部署脚本

```bash
# 进入项目目录
cd json-crypto

# 构建并部署到 Cloudflare Pages（需先安装 wrangler）
pnpm add -D wrangler
chmod +x scripts/deploy-cloudflare.sh
./scripts/deploy-cloudflare.sh

# 本地构建 + 预览（默认 base: /）
chmod +x scripts/build-and-preview.sh
./scripts/build-and-preview.sh

# 本地构建 + 预览（GitHub Pages 模式，base: /<repo>/）
./scripts/build-and-preview.sh github
```

> **注意**：GitHub Pages 通过 GitHub Actions 自动部署，无需手动脚本。

#### 方式二：手动构建

```bash
# 安装依赖
pnpm install

# 构建生产版本（默认部署到根目录）
pnpm run build
# 构建产物在 dist/ 目录

# 构建用于 GitHub Pages（子目录部署）
VITE_BASE=/<repo>/ pnpm run build
# 例如：VITE_BASE=/json-crypto/ pnpm run build
```

#### 方式三：Docker / Podman 部署

```bash
# 方式一：使用 docker-compose（推荐）

# 生产部署（访问 http://localhost:8080）
podman compose --profile production up -d

# 开发模式（热更新，访问 http://localhost:5173）
podman compose --profile dev up -d

# 仅构建（产物在 dist/）
podman compose --profile build up

# 方式二：手动构建
# 构建镜像
docker build -t json-crypto .

# 运行容器
docker run -d -p 8080:80 json-crypto

# 访问 http://localhost:8080

# Docker 替代
docker compose --profile production up -d
```

> 详细使用说明请参阅 [Docker 快速开始](docs/docker.md)。

---

### 部署到不同平台的注意事项

| 平台 | base 配置 | 路由回退 | 首次配置 |
|------|-----------|----------|----------|
| GitHub Pages | `/<repo>/` | `404.html` | Settings → Pages → GitHub Actions |
| Cloudflare Pages | `/` | `_redirects` | 需要 API Token + Account ID |
| 本地预览 | `/` | 无需 | 无 |
| Docker/Nginx | `/` | 需配置 nginx | 需配置 nginx.conf |

详细部署指南请参阅 [docs/deployment.md](docs/deployment.md)。

## 开发指南

### 添加新的加密算法

1. 在 `src/utils/crypto.ts` 中添加新的算法实现
2. 在 `src/types/index.ts` 的 `CryptoAlgorithm` 类型中添加算法名称
3. 在 `src/components/CryptoConfig.vue` 的下拉选项中添加新算法

### 自定义样式

项目使用 UnoCSS，可以通过以下方式自定义样式：

- 修改 `uno.config.ts` 中的主题颜色配置
- 在组件中使用 UnoCSS 原子类
- 在 `src/style.css` 中添加/修改全局 CSS 变量

### CI/CD 流程

```bash
开发者提交代码
  ↓
pre-commit hook: type-check + test
  ↓ (通过)
git push origin main
  ↓
GitHub Actions 触发
  ├─ CI Job: pnpm install → type-check → test
  ├─ Deploy GitHub Pages: build (VITE_BASE=/<repo>/) → deploy
  └─ Deploy Cloudflare Pages: build → wrangler deploy
```

## 许可证

MIT
