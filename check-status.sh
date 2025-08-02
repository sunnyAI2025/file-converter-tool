#!/bin/bash

echo "🔍 检查实用工具网站服务状态..."
echo ""

# 检查后端服务
echo "📡 检查后端服务 (端口 5008)..."
if curl -s http://localhost:5008/api/health > /dev/null; then
    echo "✅ 后端服务运行正常"
    echo "   地址: http://localhost:5008"
    echo "   健康检查: $(curl -s http://localhost:5008/api/health | jq -r .status 2>/dev/null || echo "OK")"
else
    echo "❌ 后端服务未运行"
fi

echo ""

# 检查前端服务
echo "🎨 检查前端服务 (端口 3008)..."
if curl -s -I http://localhost:3008 2>/dev/null | grep -q "200 OK"; then
    echo "✅ 前端服务运行正常"
    echo "   地址: http://localhost:3008"
else
    echo "❌ 前端服务未运行"
fi

echo ""

# 检查端口占用
echo "🔌 端口占用情况:"
lsof -i :3008 -i :5008 2>/dev/null | grep LISTEN || echo "   没有检测到服务在指定端口运行"

echo ""
echo "💡 提示:"
echo "   - 启动项目: ./start.sh"
echo "   - 前端访问: http://localhost:3008"
echo "   - 后端API: http://localhost:5008/api/health"