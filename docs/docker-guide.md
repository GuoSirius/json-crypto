# Docker / Podman 快速开始

本文档说明如何使用 Docker 或 Podman 运行、开发本项目。

## 前置要求

- **Docker** 或 **Podman** 已安装并正常运行
- 网络能访问 Docker Hub（docker.io）

## 快速开始

### 方式一：生产部署（推荐）

```bash
# 构建并运行生产服务（使用 production profile）
podman compose --profile production up -d
# 或使用 Docker
docker compose --profile production up -d

# 访问应用
# http://localhost:8080

# 查看日志
podman compose logs -f web

# 停止服务
podman compose down
```

### 方式二：开发模式（热更新）

```bash
# 启动开发服务器（热更新）
podman compose --profile dev up -d
# 或使用 Docker
docker compose --profile dev up -d

# 访问应用（Vite 热更新服务器）
# http://localhost:5173

# 修改代码后自动热更新
```

### 方式三：仅构建

```bash
# 仅构建前端，不运行容器
podman compose --profile build up
# 构建产物在 dist/ 目录
```

## 常用命令

```bash
# 查看运行状态
podman compose ps

# 查看日志（所有服务）
podman compose logs -f

# 查看特定服务日志
podman compose logs -f web

# 重启服务
podman compose restart web

# 重新构建镜像
podman compose build --no-cache web

# 进入容器调试（生产模式）
podman exec -it json-crypto-web sh

# 进入开发容器调试
podman exec -it json-crypto-dev sh
```

### 端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| web (生产) | 5173 | Nginx 服务 |
| dev (开发) | 5173 | Vite Dev Server |
| dev (开发) | 5174 | Vite HMR WebSocket |

如果端口冲突，修改 `docker-compose.yml` 中的端口映射。

## 环境变量

在构建时可以通过环境变量自定义配置：

```bash
# 使用自定义 base 路径构建
VITE_BASE=/my-app/ podman compose --profile build up
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `VITE_BASE` | 部署基础路径 | `/` |
| `VITE_API_URL` | API 地址 | - |

## Podman 特殊说明

Podman 与 Docker 兼容性良好，基本命令可以直接替换：

```bash
# Podman 运行（替代 docker）
podman compose --profile production up -d

# 或使用 podman-compose（早期版本）
podman-compose up -d

# Podman 直接运行
podman run -d -p 8080:80 --name json-crypto nginx:alpine
```

### Windows/macOS 上的 Podman

```bash
# Windows: 启动 Podman 机器
podman machine start

# macOS: 启动 Podman 机器
podman machine start

# 查看机器状态
podman machine list
```

## 故障排查

### 端口被占用

```bash
# Windows: 查看占用端口的进程
netstat -ano | findstr "8080"

# Linux/macOS: 查看占用端口的进程
lsof -i :8080

# 修改端口：编辑 docker-compose.yml 中的 ports: "8080:80"
```

### 构建失败

```bash
# 清理缓存，重新构建
podman compose build --no-cache

# 清理未使用的资源
podman system prune -f
```

### 镜像拉取失败

```bash
# 检查网络连接
podman pull node:24-alpine

# 尝试使用代理（如果需要）
podman system info
```

### Podman 权限问题（Linux）

```bash
# 如果遇到权限错误，尝试
podman unshare chown -R $(id -u) .
```

### Windows 权限问题

```bash
# 以管理员身份运行 PowerShell
# 或启用 Windows Subsystem for Linux (WSL2)
wsl --install
```

## 自定义域名（可选）

如果需要自定义域名，修改 `nginx.conf` 中的 `server_name`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名
    
    # ... 其他配置不变
}
```

修改后重新构建：

```bash
podman compose build web
podman compose up -d
```

## 生产环境优化建议

1. **使用 Docker Swarm 或 Kubernetes 部署** - 实现服务编排和扩缩容
2. **配置 HTTPS** - 使用 Let's Encrypt 或其他证书
3. **使用 Nginx 缓存静态资源** - 提升访问速度
4. **配置日志收集** - 使用 ELK 或 Loki 收集日志
5. **监控容器健康状态** - 使用 Prometheus + Grafana

## 相关文档

- [详细部署指南](./deployment-guide.md) - 包含各平台部署步骤
- [部署平台对比](./deployment-guide.md#构建配置说明) - base 配置和路由回退说明
- [SPA 路由回退说明](./deployment-guide.md#spa-路由回退) - 各平台 SPA 配置