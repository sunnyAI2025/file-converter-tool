# 实用工具网站 - 项目代码架构设计文档

## 1. 项目概述

本项目是一个实用工具网站，提供6个核心功能：文件转换、图片压缩、图片剪裁、图片格式转换、图片水印、网站登录。采用前后端分离的架构设计，确保功能的独立性和可扩展性。

## 2. 技术架构选型

### 2.1 前端技术栈
- **框架**: React 18 + TypeScript
- **UI库**: Ant Design 或 Material-UI
- **状态管理**: Redux Toolkit 或 Zustand
- **文件上传**: react-dropzone
- **图片处理**: Fabric.js (剪裁) + Canvas API
- **构建工具**: Vite
- **样式**: CSS Modules + Tailwind CSS

### 2.2 后端技术栈
- **运行环境**: Node.js + Express
- **文件处理**: Multer (文件上传)
- **图片处理**: Sharp (压缩、格式转换)
- **文档转换**: LibreOffice API / Pandoc
- **数据库**: PostgreSQL (用户数据存储)
- **数据库连接**: pg (PostgreSQL客户端)
- **身份验证**: JWT (JSON Web Token)
- **密码加密**: bcrypt
- **存储**: 本地文件系统 + 临时文件清理
- **API设计**: RESTful API

### 2.3 部署架构
- **前端**: 静态资源部署 (Nginx)
- **后端**: Node.js 服务
- **数据库**: PostgreSQL (Neon数据库)
- **存储**: 临时文件存储 (定时清理)

## 3. 功能架构分析

### 3.1 是否需要后端服务判断

| 功能 | 前端处理 | 后端处理 | 推荐方案 |
|------|---------|---------|----------|
| 文件转换 | ❌ 复杂格式转换需要专业库 | ✅ 使用LibreOffice/Pandoc | **后端处理** |
| 图片压缩 | ⚠️ 基础压缩可行但效果有限 | ✅ Sharp库压缩效果更好 | **后端处理** |
| 图片剪裁 | ✅ Canvas API可以实现 | ✅ 也可后端处理 | **前端处理** |
| 图片格式转换 | ⚠️ 简单格式可以 | ✅ 支持更多格式 | **后端处理** |
| 图片水印 | ✅ Canvas API可以实现 | ✅ 也可后端处理 | **前端处理** |
| 网站登录 | ❌ 无法安全存储用户数据 | ✅ 用户认证、数据库操作、JWT | **后端处理** |

**结论**: 采用混合架构，部分功能前端处理，部分功能后端处理。

## 4. 项目目录结构

```
project/
├── frontend/                    # 前端项目
│   ├── public/
│   ├── src/
│   │   ├── components/         # 通用组件
│   │   │   ├── FileUpload/     # 文件上传组件
│   │   │   ├── ImageEditor/    # 图片编辑组件
│   │   │   └── ProgressBar/    # 进度条组件
│   │   ├── pages/             # 页面组件
│   │   │   ├── Home/          # 主页
│   │   │   ├── FileConverter/ # 文件转换
│   │   │   ├── ImageCompress/ # 图片压缩
│   │   │   ├── ImageCrop/     # 图片剪裁
│   │   │   ├── ImageConvert/  # 格式转换
│   │   │   ├── ImageWatermark/# 图片水印
│   │   │   ├── Login/         # 登录页面
│   │   │   └── UserCenter/    # 用户中心
│   │   ├── utils/             # 工具函数
│   │   │   ├── api.ts         # API请求
│   │   │   ├── imageUtils.ts  # 图片处理工具
│   │   │   ├── fileUtils.ts   # 文件处理工具
│   │   │   └── auth.ts        # 认证工具函数
│   │   ├── types/             # TypeScript类型定义
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── controllers/        # 控制器
│   │   │   ├── fileController.js
│   │   │   ├── imageController.js
│   │   │   └── authController.js
│   │   ├── services/          # 业务逻辑
│   │   │   ├── fileService.js
│   │   │   ├── imageService.js
│   │   │   └── authService.js
│   │   ├── utils/             # 工具函数
│   │   │   ├── fileProcessor.js
│   │   │   ├── imageProcessor.js
│   │   │   └── database.js
│   │   ├── middleware/        # 中间件
│   │   │   ├── upload.js
│   │   │   ├── errorHandler.js
│   │   │   └── auth.js
│   │   ├── routes/            # 路由
│   │   │   ├── files.js
│   │   │   ├── images.js
│   │   │   └── auth.js
│   │   └── app.js
│   ├── uploads/               # 临时文件存储
│   ├── package.json
│   └── ecosystem.config.js    # PM2配置
└── README.md
```

## 5. 核心功能技术实现

### 5.1 文件转换 (后端处理)
```javascript
// 技术方案: LibreOffice Headless + Pandoc
const convertFile = async (inputFile, targetFormat) => {
  // 1. 检测文件类型
  // 2. 调用转换工具
  // 3. 返回转换后文件
}
```

### 5.2 图片压缩 (后端处理)
```javascript
// 技术方案: Sharp库
const compressImage = async (imageFile, quality) => {
  return sharp(imageFile)
    .jpeg({ quality })
    .toBuffer()
}
```

### 5.3 图片剪裁 (前端处理)
```typescript
// 技术方案: Fabric.js + Canvas
const cropImage = (imageData, cropArea) => {
  // 1. 在Canvas上绘制图片
  // 2. 根据选择区域裁剪
  // 3. 导出处理后的图片
}
```

### 5.4 图片格式转换 (后端处理)
```javascript
// 技术方案: Sharp库
const convertImageFormat = async (imageFile, targetFormat) => {
  return sharp(imageFile)
    .toFormat(targetFormat)
    .toBuffer()
}
```

### 5.5 图片水印 (前端处理)
```typescript
// 技术方案: Canvas API
const addWatermark = (imageData, watermarkText, position) => {
  // 1. 在Canvas上绘制原图
  // 2. 添加文字或图片水印
  // 3. 导出带水印的图片
}
```

### 5.6 网站登录 (后端处理)
```javascript
// 技术方案: JWT + bcrypt + PostgreSQL
const userLogin = async (email, password) => {
  // 1. 验证用户邮箱和密码
  // 2. 生成JWT token
  // 3. 返回用户信息和token
}

const userRegister = async (username, email, password) => {
  // 1. 验证用户输入数据
  // 2. 加密密码存储到数据库
  // 3. 返回注册结果
}
```

## 6. API接口设计

### 6.1 文件转换接口
```
POST /api/files/convert
- 上传文件
- 指定目标格式
- 返回下载链接

GET /api/files/download/:id
- 下载转换后的文件
```

### 6.2 图片处理接口
```
POST /api/images/compress
- 上传图片
- 指定压缩参数
- 返回压缩后图片

POST /api/images/convert
- 上传图片
- 指定目标格式
- 返回转换后图片
```

### 6.3 用户认证接口
```
POST /api/auth/register
- 用户注册
- 邮箱、用户名、密码
- 返回注册结果

POST /api/auth/login
- 用户登录
- 邮箱和密码
- 返回JWT token和用户信息

POST /api/auth/logout
- 用户登出
- 清除token

GET /api/auth/profile
- 获取用户信息
- 需要JWT验证

PUT /api/auth/profile
- 更新用户信息
- 需要JWT验证

POST /api/auth/forgot-password
- 忘记密码
- 发送重置邮件

POST /api/auth/reset-password
- 重置密码
- 验证码和新密码
```

## 7. 数据流程设计

### 7.1 后端处理流程
```
用户上传文件 → 前端验证 → 发送到后端 → 处理文件 → 返回结果 → 用户下载
```

### 7.2 前端处理流程
```
用户上传文件 → 前端加载 → Canvas处理 → 实时预览 → 用户确认 → 下载处理结果
```

### 7.3 用户认证流程
```
用户注册/登录 → 前端验证 → 发送到后端 → 数据库验证 → 生成JWT → 返回token → 前端存储
```

## 8. 数据库设计

### 8.1 数据库连接信息
```
数据库类型: PostgreSQL
连接字符串: postgresql://neondb_owner:npg_eR1BY0UPgSDQ@ep-snowy-sea-ae799awz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 8.2 用户表结构
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  operation_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  status VARCHAR(20) DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


## 9. 部署方案

### 9.1 开发环境
```bash
# 前端开发服务器
cd frontend && npm run dev

# 后端开发服务器
cd backend && npm run dev
```

### 9.2 生产环境
```bash
# 前端构建部署
cd frontend && npm run build
# 部署到 Nginx

# 后端部署
cd backend && pm2 start ecosystem.config.js
```

## 10. 依赖包管理

### 10.1 后端新增依赖
```json
{
  "dependencies": {
    "pg": "^8.11.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0"
  }
}
```

### 10.2 前端新增依赖
```json
{
  "dependencies": {
    "axios": "^1.4.0",
    "js-cookie": "^3.0.5"
  },
  "devDependencies": {
    "@types/js-cookie": "^3.0.3"
  }
}
```


---

*该架构设计基于当前功能需求，可根据实际开发过程中的情况进行调整优化。*