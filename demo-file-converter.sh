#!/bin/bash

echo "🚀 文件转换功能演示"
echo "========================"

# 检查服务状态
echo "📡 检查服务状态..."
if ! curl -s http://localhost:5008/api/health > /dev/null; then
    echo "❌ 后端服务未运行，请先启动服务"
    echo "运行: ./start.sh"
    exit 1
fi

if ! curl -s http://localhost:3008 > /dev/null; then
    echo "❌ 前端服务未运行，请先启动服务"
    echo "运行: ./start.sh"
    exit 1
fi

echo "✅ 服务运行正常"
echo ""

# 创建演示文件
echo "📝 创建演示文件..."

# 创建文本文件
cat > demo.txt << 'EOF'
文件转换功能演示
=================

这是一个演示文档，用于测试文件转换功能。

功能特点：
1. 支持多种格式转换
2. 简单易用的界面
3. 实时转换进度
4. 一键下载结果

测试内容：
- 文本转HTML
- 文本转Markdown
- HTML转文本

技术实现：
- 前端：React + TypeScript + Ant Design
- 后端：Node.js + Express
- 文件处理：自定义转换逻辑

结束
EOF

# 创建HTML文件
cat > demo.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>演示HTML文档</title>
</head>
<body>
    <h1>HTML文档演示</h1>
    <p>这是一个HTML文档，用于演示格式转换功能。</p>
    <h2>功能列表</h2>
    <ul>
        <li>HTML转文本</li>
        <li>HTML转Markdown</li>
        <li>文本转HTML</li>
    </ul>
    <p><strong>注意</strong>：转换后的格式可能会有所调整。</p>
</body>
</html>
EOF

# 创建Markdown文件
cat > demo.md << 'EOF'
# Markdown文档演示

这是一个Markdown文档，用于演示格式转换功能。

## 功能特点

- **多格式支持**：支持TXT、HTML、MD、PDF等格式
- **智能转换**：自动检测文件格式
- **实时预览**：支持转换进度实时显示
- **一键下载**：转换完成后一键下载

## 使用方法

1. 选择要转换的文件
2. 选择目标格式
3. 点击开始转换
4. 下载转换后的文件

## 技术栈

```javascript
// 前端技术
React + TypeScript + Ant Design

// 后端技术
Node.js + Express + Multer
```

---

*演示完成*
EOF

echo "✅ 演示文件创建完成:"
echo "   - demo.txt (文本文档)"
echo "   - demo.html (HTML网页)"
echo "   - demo.md (Markdown文档)"
echo ""

# 测试API功能
echo "🧪 测试API功能..."

echo "1. 获取支持的格式："
curl -s http://localhost:5008/api/files/formats | jq -r '.data.input | join(", ")'
echo ""

echo "2. 测试文本转HTML："
RESULT=$(curl -s -X POST http://localhost:5008/api/files/convert \
  -F "file=@demo.txt" \
  -F "targetFormat=html")

if echo "$RESULT" | jq -e '.success' > /dev/null; then
    FILENAME=$(echo "$RESULT" | jq -r '.data.filename')
    echo "✅ 转换成功，文件: $FILENAME"
    
    # 下载并预览转换结果
    curl -s "http://localhost:5008/api/files/download/$FILENAME" | head -10
    echo "..."
else
    echo "❌ 转换失败"
    echo "$RESULT" | jq -r '.error // "未知错误"'
fi

echo ""
echo "🌐 打开前端页面进行完整测试："
echo "   http://localhost:3008/file-converter"
echo ""
echo "📋 演示步骤："
echo "   1. 拖拽 demo.txt 到上传区域"
echo "   2. 选择目标格式（如HTML）"
echo "   3. 点击'开始转换'"
echo "   4. 等待转换完成"
echo "   5. 下载转换后的文件"
echo ""
echo "🧹 清理演示文件："
echo "   rm demo.txt demo.html demo.md"