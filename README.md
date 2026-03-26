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

```
json-crypto/
├── .github/workflows/
│   ├── deploy.yml              # CI/CD 工作流（测试 + GitHub Pages + Cloudflare Pages 部署）
│   └── deploy-gitee.yml        # Gitee Pages 自动部署工作流
├── scripts/
│   ├── deploy-github.sh        # 手动部署 GitHub Pages
│   ├── deploy-gitee.sh         # 手动部署 Gitee Pages
│   ├── deploy-cloudflare.sh    # 手动部署 Cloudflare Pages
│   └── build-and-preview.sh    # 本地构建 + 预览
├── public/
│   ├── 404.html                # GitHub Pages SPA 回退
│   ├── _redirects              # Cloudflare Pages SPA 回退
│   └── favicon.svg             # 网站图标
├── src/
│   ├── main.ts                 # 应用入口
│   ├── App.vue                 # 根组件
│   ├── style.css               # 全局主题样式（亮色/暗黑）
│   ├── types/index.ts          # TypeScript 类型定义
│   ├── utils/
│   │   ├── crypto.ts           # 加密/解密封装（6 种算法）
│   │   ├── json.ts             # JSON 格式化/压缩/验证
│   │   ├── db.ts               # IndexedDB 持久化
│   │   ├── download.ts         # 文件下载 + ZIP 打包
│   │   └── uuid.ts             # UUID v4 生成
│   ├── stores/
│   │   └── jsonStore.ts        # 全局状态管理 + 自动持久化
│   ├── composables/
│   │   └── useTheme.ts         # 主题切换 composable
│   ├── router/index.ts         # 路由配置 + 导航守卫
│   ├── components/
│   │   ├── FileList.vue        # 文件列表（筛选 + 搜索）
│   │   ├── JsonEditor.vue      # JSON 编辑器（复制/下载/加密/解密）
│   │   ├── ToolBar.vue         # 格式化/压缩按钮
│   │   ├── CryptoConfig.vue    # 算法选择 + 模式切换 + 密钥输入
│   │   ├── BatchAction.vue     # 批量处理 + ZIP 下载
│   │   └── ThemeToggle.vue     # 主题切换按钮
│   ├── views/
│   │   ├── UploadView.vue      # 上传页（文件拖拽 + 文本粘贴）
│   │   └── ProcessView.vue     # 处理页（集成所有功能）
│   ├── assets/                 # 静态资源
│   └── __tests__/              # 测试文件（18 个文件，264 个用例）
├── docs/
│   ├── deployment-guide.md     # 详细部署指南
│   ├── docker-guide.md         # Docker 快速开始指南
│   ├── test-analysis-report.md # 测试问题分析报告
│   └── test-coverage-analysis.md # 测试覆盖率分析报告
├── vite.config.ts              # Vite 配置（动态 base）
├── uno.config.ts               # UnoCSS 配置
├── tsconfig.json               # TypeScript 配置
├── tsconfig.app.json           # 应用 TypeScript 配置
├── tsconfig.node.json          # Node 环境 TypeScript 配置
├── package.json                # 项目依赖和脚本
├── pnpm-lock.yaml              # pnpm 锁文件
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile                  # Docker 镜像构建
├── nginx.conf                  # Nginx 配置
└── index.html                  # HTML 入口
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
- `vitest run`（264 个单元测试）

### 测试覆盖
- **12 个测试文件**，**264 个测试用例**，全部通过
- 覆盖全部工具函数、状态管理、组件和视图页面
- 总体覆盖率约 **90%**
- 测试执行时间约 **3-4 秒**

详见 [测试覆盖率分析报告](docs/test-coverage-analysis.md) 和 [测试问题分析报告](docs/test-analysis-report.md)。

## 部署

本项目支持同时部署到 **GitHub Pages**、**Cloudflare Pages** 和 **Gitee Pages** 三个平台。

### 自动部署（推荐）

推送代码到 `main` 分支后，GitHub Actions 会自动：
1. 运行类型检查和单元测试
2. 测试通过后并行部署到 **GitHub Pages**、**Cloudflare Pages** 和 **Gitee Pages**

#### 首次配置

> 详细步骤和图解请参阅 [多平台部署指南](docs/multi-platform-deployment.md)。

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

##### 3. Gitee Pages 配置（可选）

如果需要部署到 Gitee Pages（国内访问速度快）：

**方式一：自动部署（推荐）**

1. 在 Gitee 创建个人访问令牌（Settings → 私人令牌）
   - **必须勾选权限**：✅ **projects**（仓库权限）
   - **可选权限**：pull_requests, issues 等
   - 复制生成的令牌（只显示一次）
2. 在 GitHub 仓库添加 Secrets：
   - `GITEE_TOKEN`：Gitee 个人访问令牌
   - `GITEE_USERNAME`：你的 Gitee 用户名
   - `GITEE_REPO`：你的 Gitee 仓库名称（如 `json-crypto`）

**方式二：手动部署**

1. 克隆 Gitee 仓库并运行 `scripts/deploy-gitee.sh`
2. 在 Gitee 仓库 → 管理 → Gitee Pages → 启动

#### 查看部署状态

- **GitHub Actions**：仓库页面 → Actions 标签 → 查看部署 job 状态
- **Cloudflare Pages**：Cloudflare Dashboard → Pages → 查看部署日志
- **Gitee Pages**：Gitee 仓库 → 管理 → Gitee Pages → 查看部署状态

#### 访问地址

- **GitHub Pages**：`https://<你的用户名>.github.io/json-crypto/`
- **Cloudflare Pages**：`https://json-crypto.pages.dev/`（或自定义域名）
- **Gitee Pages**：`https://<你的用户名>.gitee.io/json-crypto/`

##### Gitee Pages 配置步骤（可选，适合国内用户）

如果只需要 GitHub Pages，跳过此步骤。如果需要国内访问速度快，可以部署到 Gitee Pages：

**方式一：手动部署（推荐小白）**

1. **克隆仓库到本地**
   ```bash
   git clone https://gitee.com/你的用户名/json-crypto.git
   cd json-crypto
   ```

2. **运行部署脚本**
   ```bash
   chmod +x scripts/deploy-gitee.sh
   ./scripts/deploy-gitee.sh
   ```
   脚本会自动构建并推送到 `gh-pages` 分支。

3. **启用 Gitee Pages**
   - 进入 Gitee 仓库页面
   - 点击「管理」
   - 在左侧菜单找到「Gitee Pages」
   - 选择分支：`gh-pages`
   - 点击「启动」
   - 等待部署完成

4. **获取访问地址**
   - 部署成功后，页面会显示访问地址
   - 格式：`https://你的用户名.gitee.io/json-crypto/`

**方式二：自动部署（需要阿里云云效）**

如果希望每次推送自动部署到 Gitee，可以使用阿里云云效：
1. 注册/登录 [云效](https://flow.aliyun.com/)
2. 创建新流水线 → 选择「构建静态网站」
3. 配置 Gitee 仓库和分支（选择 main）
4. 设置构建命令：`pnpm install && pnpm run build`
5. 设置部署分支：`gh-pages`
6. 启用流水线

> **注意**：Gitee Pages 免费版每次更新需要手动刷新，或使用云效自动刷新。

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
   - 选择 "Connect to Git"
   - 选择你的 GitHub 仓库
   - 在 "Production branch" 输入 `main`
   - 在 "Build settings" 中：
     - Build command: （留空）
     - Build output directory: （留空，使用默认）
   - 点击 "Save and Deploy"
   - **后续**：GitHub Actions 会自动部署，不再需要手动操作

> 配置完成后，每次推送代码到 `main` 分支，两个平台都会自动更新。

#### 查看部署状态

- **GitHub Actions**：仓库页面 → Actions 标签 → 查看部署 job 状态
- **Cloudflare Pages**：Cloudflare Dashboard → Pages → 点击项目查看部署日志
- **Gitee Pages**：Gitee 仓库 → 管理 → Gitee Pages → 查看部署状态

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

# 构建并部署到 GitHub Pages（手动gh CLI部署）
chmod +x scripts/deploy-github.sh
./scripts/deploy-github.sh

# 构建并部署到 Cloudflare Pages（需先安装 wrangler）
pnpm add -D wrangler
chmod +x scripts/deploy-cloudflare.sh
./scripts/deploy-cloudflare.sh

# 构建并部署到 Gitee Pages（自动创建 gh-pages 分支）
chmod +x scripts/deploy-gitee.sh
./scripts/deploy-gitee.sh

# 本地构建 + 预览（默认 base: /）
chmod +x scripts/build-and-preview.sh
./scripts/build-and-preview.sh

# 本地构建 + 预览（GitHub Pages 模式，base: /<repo>/）
./scripts/build-and-preview.sh github
```

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

> 详细使用说明请参阅 [Docker 快速开始](docs/docker-guide.md)。


---

### 部署到不同平台的注意事项

| 平台 | base 配置 | 路由回退 | 首次配置 |
|------|-----------|----------|----------|
| GitHub Pages | `/<repo>/` | `404.html` | Settings → Pages → GitHub Actions |
| Gitee Pages | `/` | 自动支持 | 管理 → Gitee Pages → 启动 |
| Cloudflare Pages | `/` | `_redirects` | 需要 API Token + Account ID |
| 本地预览 | `/` | 无需 | 无 |
| Docker/Nginx | `/` | 需配置 nginx | 需配置 nginx.conf |

详细部署指南请参阅 [docs/deployment-guide.md](docs/deployment-guide.md)。

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

```
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
