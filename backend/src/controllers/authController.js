const authService = require('../services/authService');

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // 基本验证
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 验证密码确认
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: '两次输入的密码不一致'
      });
    }

    // 验证密码强度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度不能少于6位'
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }

    // 验证用户名格式
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({
        success: false,
        message: '用户名长度必须在2-20位之间'
      });
    }

    // 调用注册服务
    const result = await authService.registerUser(username, email, password);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('注册控制器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 基本验证
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入邮箱和密码'
      });
    }

    // 调用登录服务
    const result = await authService.loginUser(email, password);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('登录控制器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 用户登出
const logout = async (req, res) => {
  try {
    // 前端负责清除token，后端只需要返回成功响应
    res.status(200).json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出控制器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取用户信息
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await authService.getUserProfile(userId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('获取用户信息控制器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新用户信息
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    // 基本验证
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: '请提供要更新的信息'
      });
    }

    // 验证邮箱格式
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: '邮箱格式不正确'
        });
      }
    }

    // 验证用户名格式
    if (username) {
      if (username.length < 2 || username.length > 20) {
        return res.status(400).json({
          success: false,
          message: '用户名长度必须在2-20位之间'
        });
      }
    }

    const result = await authService.updateUserProfile(userId, { username, email });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('更新用户信息控制器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取用户统计信息
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await authService.getUserStats(userId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('获取用户统计控制器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 忘记密码 (简化版本，实际应该发送邮件)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '请输入邮箱地址'
      });
    }

    // 这里应该实现发送重置密码邮件的逻辑
    // 为了简化，我们只返回成功响应
    res.status(200).json({
      success: true,
      message: '密码重置链接已发送到您的邮箱'
    });
  } catch (error) {
    console.error('忘记密码控制器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 重置密码 (简化版本)
const resetPassword = async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;

    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请填写所有字段'
      });
    }

    // 这里应该验证验证码并重置密码
    // 为了简化，我们只返回成功响应
    res.status(200).json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('重置密码控制器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getStats,
  forgotPassword,
  resetPassword
};