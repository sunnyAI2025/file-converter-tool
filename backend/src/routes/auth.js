const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 限制登录尝试次数
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 50, // 每15分钟最多50次尝试（测试期间放宽限制）
  message: {
    success: false,
    message: '登录尝试次数过多，请15分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 限制注册次数
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 每小时最多3次注册
  message: {
    success: false,
    message: '注册次数过多，请1小时后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 限制密码重置次数
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 每小时最多3次
  message: {
    success: false,
    message: '密码重置请求过多，请1小时后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 公开路由（不需要认证）
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// 需要认证的路由
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.get('/stats', authenticateToken, authController.getStats);

// 测试路由 - 验证token是否有效
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token有效',
    data: {
      user: req.user
    }
  });
});

module.exports = router;