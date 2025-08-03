const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const fileRoutes = require('./routes/files');
const imageRoutes = require('./routes/images');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { cleanupTempFiles } = require('./utils/fileProcessor');
const { testConnection, initDatabase } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 5008;

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3008',
    'http://localhost:8080'  // 测试页面域名
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api', limiter);

// Body解析中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/files', fileRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理中间件
app.use(errorHandler);

// 定时清理临时文件（每小时执行一次）
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// 启动服务器
app.listen(PORT, async () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📝 API文档: http://localhost:${PORT}/api/health`);
  
  // 测试数据库连接
  await testConnection();
  
  // 初始化数据库表
  await initDatabase();
  
  // 启动时清理一次临时文件
  cleanupTempFiles();
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  cleanupTempFiles();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  cleanupTempFiles();
  process.exit(0);
});

module.exports = app;