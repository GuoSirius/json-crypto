# Docker / Podman 快速开始

本文档说明如何使用 Docker/Podman 运行、开发本项目。

## 前置要求

- **Docker** 或 **Podman** 已安装
- 网络能访问阿里云镜像源（registry.cn-hangzhou.aliyuncs.com）

## 快速开始

### 方式一：生产部署（推荐）

```bash
# 构建并运行生产服务
docker-compose up -d

# 或使用 Podman
podman-compose up -d

# 访问应用
# http://localhost:8080

# 查看日志
docker-compose logs -f web

# 停止服务
docker-compose down
```

### 方式二：开发模式（热更新）

```bash
# 启动开发服务器（热更新）
docker-compose --profile dev up -d

# 或使用 Podman
podman-compose --profile dev up -d

# 访问应用
# http://localhost:5173

# 修改代码后自动热更新
```

### 方式三：仅构建

```bash
# 仅构建前端，不运行容器
docker-compose --profile build up

# 构建产物在 dist/ 目录
```

## 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart web

# 重新构建镜像
docker-compose build --no-cache web

# 进入容器调试
docker exec -it json-crypto-web sh

# 端口冲突？修改 docker-compose.yml 中的端口映射
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `VITE_BASE` | 部署基础路径 | `/` |
| `VITE_API_URL` | API 地址 | - |

修改示例：

```bash
# 使用自定义 base 路径构建
VITE_BASE=/my-app/ docker-compose up -d
```

## Podman 特殊说明

```bash
# Podman 需要先登录（可选）
podman login registry.cn-hangzhou.aliyuncs.com

# Podman 运行（替代 docker-compose）
podman-compose up -d

# 或使用 podman 直接运行
podman run -d -p 8080:80 --name json-crypto \
  registry.cn-hangzhou.aliyuncs.com/library/nginx:alpine
```

## 故障排查

### 端口被占用

```bash
# 查看占用端口的进程
netstat -ano | findstr "8080"  # Windows
lsof -i :8080                  # Linux/macOS

# 修改端口
# 编辑 docker-compose.yml 中的 ports: "8080:80" 为其他端口
```

### 构建失败

```bash
# 清理缓存，重新构建
docker-compose build --no-cache
docker system prune -f
```

### Podman 权限问题

```bash
# 如果遇到权限错误，尝试
podman unshare chown -R $(id -u) .
```

## 自定义域名（可选）

如果需要自定义域名，修改 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名
    
    # ... 其他配置不变
}
```

## 生产环境优化建议

1. **使用 Docker Swarm 或 Kubernetes 部署**
2. **配置 HTTPS**
3. **使用 Nginx 缓存静态资源**
4. **配置日志收集**
5. **监控容器健康状态**

---

详细部署指南请参阅 [docs/deployment-guide.md](docs/deployment-guide.md)。
