const jwt = require('jsonwebtoken');
const { pool } = require('../utils/database');

// JWT密钥 - 在生产环境中应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 生成JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: '7d' } // token有效期7天
  );
};

// 验证JWT token中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: '访问被拒绝，需要登录' 
      });
    }

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 从数据库获取用户信息
    const result = await pool.query(
      'SELECT id, username, email, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    const user = result.rows[0];
    
    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: '账户已被禁用' 
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token无效' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token已过期，请重新登录' 
      });
    } else {
      console.error('认证中间件错误:', error);
      return res.status(500).json({ 
        success: false, 
        message: '服务器内部错误' 
      });
    }
  }
};

// 可选的认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const result = await pool.query(
        'SELECT id, username, email, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length > 0 && result.rows[0].is_active) {
        req.user = result.rows[0];
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不返回错误，继续执行
    next();
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  JWT_SECRET
};