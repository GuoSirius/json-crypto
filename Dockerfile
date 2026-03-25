# 阶段1: 构建前端
FROM registry.cn-hangzhou.aliyuncs.com/library/node:24-alpine AS builder

# 设置工作目录
WORKDIR /app

# 使用阿里云 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm 并安装依赖
RUN npm install -g pnpm@10 && \
    pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建生产版本（默认部署到根目录）
RUN pnpm run build

# 阶段2: 运行服务
FROM registry.cn-hangzhou.aliyuncs.com/library/nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
