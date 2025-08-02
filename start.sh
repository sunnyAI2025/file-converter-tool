#!/bin/bash

echo "🚀 启动实用工具网站..."

# 检查是否安装了依赖
if [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "❌ 请先运行 ./install.sh 安装依赖"
    exit 1
fi

# 启动后端服务
echo "🔧 启动后端服务..."
cd backend
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:5008/api/health > /dev/null; then
    echo "✅ 后端服务启动成功 (http://localhost:5008)"
else
    echo "❌ 后端服务启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端服务
echo "🎨 启动前端服务..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 项目启动完成！"
echo ""
echo "🌐 访问地址："
echo "- 前端: http://localhost:3008"
echo "- 后端: http://localhost:5008"
echo ""
echo "📋 停止服务请按 Ctrl+C"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 服务已停止'; exit 0" INT

# 保持脚本运行
wait