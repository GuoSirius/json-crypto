# Docker 部署指南

本文档说明如何使用 Docker 或 Podman 运行、开发和部署本项目。

## 📋 快速开始

### 前置要求
- **Docker** 或 **Podman** 已安装并正常运行
- 网络能访问 Docker Hub（docker.io）

### 方式一：生产部署（推荐）
```bash
# 构建并运行生产服务
docker compose --profile production up -d

# 访问应用
# http://localhost:8080

# 查看日志
docker compose logs -f web

# 停止服务
docker compose down
```

### 方式二：开发模式（热更新）
```bash
# 启动开发服务器（热更新）
docker compose --profile dev up -d

# 访问应用（Vite 热更新服务器）
# http://localhost:5173

# 修改代码后自动热更新
```

### 方式三：仅构建
```bash
# 仅构建前端，不运行容器
docker compose --profile build up

# 构建产物在 dist/ 目录
```

## 🐳 Docker 配置

### Dockerfile
项目使用多阶段构建的 Dockerfile：

```dockerfile
# 构建阶段
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
项目提供多个配置组合：

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
    profiles: ["production", "build"]
  
  dev:
    build:
      context: .
      target: builder
    ports:
      - "5173:5173"
      - "5174:5174"
    volumes:
      - .:/app
      - /app/node_modules
    command: pnpm run dev
    profiles: ["dev"]
```

## 🔧 常用命令

### 容器管理
```bash
# 查看运行状态
docker compose ps

# 查看日志（所有服务）
docker compose logs -f

# 查看特定服务日志
docker compose logs -f web

# 重启服务
docker compose restart web

# 重新构建镜像
docker compose build --no-cache web
```

### 容器调试
```bash
# 进入容器调试（生产模式）
docker exec -it json-crypto-web sh

# 进入开发容器调试
docker exec -it json-crypto-dev sh

# 查看容器资源使用
docker stats
```

### 清理操作
```bash
# 停止并删除所有容器
docker compose down

# 清理未使用的镜像、容器、网络
docker system prune -f

# 清理构建缓存
docker builder prune -f
```

## ⚙️ 端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| web (生产) | 8080:80 | Nginx 服务 |
| dev (开发) | 5173:5173 | Vite Dev Server |
| dev (开发) | 5174:5174 | Vite HMR WebSocket |

如果端口冲突，修改 `docker-compose.yml` 中的端口映射。

## 🌍 环境变量

在构建时可以通过环境变量自定义配置：

```bash
# 使用自定义 base 路径构建
VITE_BASE=/my-app/ docker compose --profile build up
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `VITE_BASE` | 部署基础路径 | `/` |
| `VITE_APP_TITLE` | 应用标题 | `JSON Crypto` |
| `VITE_API_URL` | API 地址 | - |

## 🐧 Podman 支持

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
# Windows/macOS: 启动 Podman 机器
podman machine start

# 查看机器状态
podman machine list
```

## 🚨 故障排查

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
docker compose build --no-cache

# 清理未使用的资源
docker system prune -f

# 检查 Dockerfile 语法
docker build --no-cache -t test .
```

### 镜像拉取失败
```bash
# 检查网络连接
docker pull node:24-alpine

# 尝试使用代理（如果需要）
# 在 Docker Desktop 中配置代理
```

### 权限问题
```bash
# Linux: 如果遇到权限错误
sudo usermod -aG docker $USER

# 重新登录生效
```

### Windows 权限问题
```bash
# 以管理员身份运行 PowerShell
# 或启用 Windows Subsystem for Linux (WSL2)
wsl --install

# 在 Docker Desktop 中启用 WSL2 后端
```

## 🔒 安全最佳实践

### 1. 使用非 root 用户
```dockerfile
# 在 Dockerfile 中添加
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### 2. 定期更新基础镜像
```bash
# 定期更新基础镜像
docker pull node:24-alpine
docker pull nginx:alpine
```

### 3. 扫描镜像安全漏洞
```bash
# 使用 Docker Scout 或 Trivy 扫描
docker scout cves json-crypto
```

### 4. 限制资源使用
```yaml
# 在 docker-compose.yml 中
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 🌐 自定义域名

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
docker compose build web
docker compose up -d
```

## 🚀 生产环境部署

### 1. 使用 Docker Swarm
```bash
# 初始化 Swarm
docker swarm init

# 部署服务
docker stack deploy -c docker-compose.yml json-crypto

# 查看服务状态
docker service ls
```

### 2. 使用 Kubernetes
```bash
# 生成 Kubernetes 配置
docker compose convert -o k8s.yaml

# 部署到 Kubernetes
kubectl apply -f k8s.yaml
```

### 3. 配置 HTTPS
```bash
# 使用 Let's Encrypt 证书
# 修改 nginx.conf 添加 SSL 配置
# 使用 certbot 获取证书
```

### 4. 监控和日志
```bash
# 使用 Prometheus + Grafana 监控
# 使用 Loki + Grafana 收集日志
# 配置健康检查
```

## 📊 性能优化

### 1. 构建缓存优化
```dockerfile
# 充分利用 Docker 构建缓存
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
```

### 2. 镜像大小优化
```bash
# 使用多阶段构建
# 使用 Alpine 基础镜像
# 清理不必要的文件
```

### 3. Nginx 优化
```nginx
# 启用 gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;

# 设置缓存头
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔗 相关资源

### 官方文档
- [Docker 官方文档](https://docs.docker.com/)
- [Podman 官方文档](https://podman.io/docs/)
- [Docker Compose 文档](https://docs.docker.com/compose/)

### 学习资源
- [Docker 入门教程](https://docker-curriculum.com/)
- [Docker 最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [容器安全指南](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)

### 项目文档
- [完整部署指南](deployment.md)
- [故障排查指南](troubleshooting.md)
- [测试文档](testing.md)

## 📝 更新日志

### v1.0.0 (2026-03-26)
- ✅ 初始 Docker 配置
- ✅ 多阶段构建优化
- ✅ 生产/开发环境分离
- ✅ Podman 兼容支持

### 计划功能
- 🔄 Kubernetes 部署配置
- 🔄 自动证书管理
- 🔄 监控和告警集成
- 🔄 CI/CD 流水线优化

---

**提示**：Docker 部署适合需要容器化部署的场景。如果只是简单静态站点，推荐使用 [GitHub Pages](deployment.md#github-pages-部署必需) 或 [Cloudflare Pages](deployment.md#cloudflare-pages-部署推荐)。