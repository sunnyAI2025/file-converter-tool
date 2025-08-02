#!/bin/bash

echo "🚀 开始安装实用工具网站项目..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装Node.js (>= 16.0.0)"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 请先安装npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"

# 安装前端依赖
echo "📦 正在安装前端依赖..."
cd frontend
if npm install; then
    echo "✅ 前端依赖安装成功"
else
    echo "❌ 前端依赖安装失败"
    exit 1
fi

# 返回根目录
cd ..

# 安装后端依赖
echo "📦 正在安装后端依赖..."
cd backend
if npm install; then
    echo "✅ 后端依赖安装成功"
else
    echo "❌ 后端依赖安装失败"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p uploads
mkdir -p logs

# 复制环境配置文件
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ 已创建环境配置文件 .env"
fi

cd ..

echo ""
echo "🎉 安装完成！"
echo ""
echo "📋 使用说明："
echo "1. 启动后端服务: cd backend && npm run dev"
echo "2. 启动前端服务: cd frontend && npm run dev"
echo ""
echo "🌐 访问地址："
echo "- 前端: http://localhost:3000"
echo "- 后端: http://localhost:5000"
echo ""
echo "📚 更多信息请查看 README.md"