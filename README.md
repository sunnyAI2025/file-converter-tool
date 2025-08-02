# 实用工具网站

一个基于React + Node.js的实用工具网站，提供文件转换、图片处理等常用功能。

## 功能特性

- 📁 **文件转换**: 支持PDF、DOC、DOCX、TXT等格式相互转换
- 🗜️ **图片压缩**: 智能压缩图片，保持质量的同时减少文件大小
- ✂️ **图片剪裁**: 精确剪裁图片，支持多种比例和自定义尺寸
- 🔄 **图片格式转换**: 支持JPG、PNG、WEBP、GIF等格式转换
- 📝 **图片水印**: 为图片添加文字或图片水印

## 技术栈

### 前端 (端口: 3008)
- React 18 + TypeScript
- Ant Design UI组件库
- React Router 路由管理
- Vite 构建工具
- Tailwind CSS 样式框架

### 后端 (端口: 5008)
- Node.js + Express
- Sharp 图片处理
- Multer 文件上传
- 文件格式转换支持

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 一键安装和启动

1. **自动安装依赖**：
```bash
./install.sh
```

2. **启动项目**：
```bash
./start.sh
```

### 手动安装和启动

1. 安装前端依赖：
```bash
cd frontend
npm install
```

2. 安装后端依赖：
```bash
cd backend
npm install
```

3. 启动后端服务：
```bash
cd backend
npm run dev
```
后端服务将在 http://localhost:5008 启动

4. 启动前端开发服务器：
```bash
cd frontend
npm run dev
```
前端将在 http://localhost:3008 启动

## 项目结构

```
project/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   ├── pages/          # 页面组件
│   │   ├── utils/          # 工具函数
│   │   └── types/          # TypeScript类型
│   └── package.json
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   └── utils/          # 工具函数
│   └── package.json
└── README.md
```

## API接口

### 图片处理
- `POST /api/images/compress` - 图片压缩
- `POST /api/images/convert` - 图片格式转换
- `POST /api/images/batch-compress` - 批量图片压缩
- `GET /api/images/download/:filename` - 下载处理后的图片

### 文件转换
- `POST /api/files/convert` - 文件格式转换
- `GET /api/files/download/:filename` - 下载转换后的文件
- `GET /api/files/formats` - 获取支持的格式列表

## 部署

### 生产环境部署

1. 构建前端：
```bash
cd frontend
npm run build
```

2. 启动后端：
```bash
cd backend
npm start
```

### 使用PM2部署
```bash
cd backend
pm2 start ecosystem.config.js --env production
```

## 开发说明

### 添加新功能
1. 在 `frontend/src/pages/` 中添加新页面组件
2. 在 `frontend/src/App.tsx` 中添加路由
3. 在 `backend/src/routes/` 中添加对应的API路由
4. 在 `backend/src/services/` 中实现业务逻辑

### 文件上传限制
- 单个文件最大: 10MB
- 批量上传最多: 5个文件
- 支持的图片格式: JPG, PNG, WEBP, GIF, BMP
- 支持的文档格式: PDF, DOC, DOCX, TXT, RTF, ODT

## 常见问题和故障排除

### 端口被占用
如果遇到端口被占用的问题：
```bash
# 检查端口占用
lsof -i :3008 -i :5008

# 结束占用进程
pkill -f "npm run dev"
```

### 服务状态检查
```bash
# 检查服务状态
./check-status.sh
```

### 前端页面打不开
1. 确认后端服务是否启动（端口 5008）
2. 确认前端服务是否启动（端口 3008）
3. 检查防火墙设置
4. 清除浏览器缓存

### 重新启动服务
```bash
# 停止所有服务
pkill -f "npm run dev"

# 重新启动
./start.sh
```

## 访问地址

- **前端界面**: http://localhost:3008
- **后端API**: http://localhost:5008
- **健康检查**: http://localhost:5008/api/health

## 许可证

MIT License

## 贡献

欢迎提交Pull Request和Issue！