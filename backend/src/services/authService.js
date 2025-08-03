const bcrypt = require('bcrypt');
const { pool } = require('../utils/database');
const { generateToken } = require('../middleware/auth');

// 密码加密轮数
const SALT_ROUNDS = 12;

// 用户注册
const registerUser = async (username, email, password) => {
  try {
    // 检查用户名是否已存在
    const usernameCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (usernameCheck.rows.length > 0) {
      return {
        success: false,
        message: '用户名已存在'
      };
    }

    // 检查邮箱是否已存在
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (emailCheck.rows.length > 0) {
      return {
        success: false,
        message: '邮箱已被注册'
      };
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 插入新用户
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    // 生成token
    const token = generateToken(user);

    return {
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at
        },
        token
      }
    };
  } catch (error) {
    console.error('用户注册错误:', error);
    return {
      success: false,
      message: '注册失败，请稍后重试'
    };
  }
};

// 用户登录
const loginUser = async (email, password) => {
  try {
    // 查找用户
    const result = await pool.query(
      'SELECT id, username, email, password_hash, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        message: '邮箱或密码错误'
      };
    }

    const user = result.rows[0];

    // 检查账户是否激活
    if (!user.is_active) {
      return {
        success: false,
        message: '账户已被禁用，请联系管理员'
      };
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: '邮箱或密码错误'
      };
    }

    // 更新最后登录时间
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // 生成token
    const token = generateToken(user);

    return {
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }
    };
  } catch (error) {
    console.error('用户登录错误:', error);
    return {
      success: false,
      message: '登录失败，请稍后重试'
    };
  }
};

// 获取用户信息
const getUserProfile = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, created_at, last_login 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      };
    }

    return {
      success: true,
      data: {
        user: result.rows[0]
      }
    };
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return {
      success: false,
      message: '获取用户信息失败'
    };
  }
};

// 更新用户信息
const updateUserProfile = async (userId, updateData) => {
  try {
    const { username, email } = updateData;
    
    // 如果更新用户名，检查是否已存在
    if (username) {
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );
      
      if (usernameCheck.rows.length > 0) {
        return {
          success: false,
          message: '用户名已存在'
        };
      }
    }

    // 如果更新邮箱，检查是否已存在
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      
      if (emailCheck.rows.length > 0) {
        return {
          success: false,
          message: '邮箱已被使用'
        };
      }
    }

    // 构建更新语句
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (username) {
      updates.push(`username = $${paramCount++}`);
      values.push(username);
    }
    
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (updates.length === 0) {
      return {
        success: false,
        message: '没有提供更新数据'
      };
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, username, email, updated_at
    `;

    const result = await pool.query(query, values);

    return {
      success: true,
      message: '用户信息更新成功',
      data: {
        user: result.rows[0]
      }
    };
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return {
      success: false,
      message: '更新失败，请稍后重试'
    };
  }
};

// 获取用户使用统计
const getUserStats = async (userId) => {
  try {
    // 获取总使用次数
    const totalUsageResult = await pool.query(
      'SELECT COUNT(*) as total_operations FROM user_usage_logs WHERE user_id = $1',
      [userId]
    );

    // 获取本月使用次数
    const monthlyUsageResult = await pool.query(
      `SELECT COUNT(*) as monthly_operations 
       FROM user_usage_logs 
       WHERE user_id = $1 
       AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );

    // 获取操作类型统计
    const operationStatsResult = await pool.query(
      `SELECT operation_type, COUNT(*) as count 
       FROM user_usage_logs 
       WHERE user_id = $1 
       GROUP BY operation_type
       ORDER BY count DESC`,
      [userId]
    );

    // 获取最近的操作记录
    const recentLogsResult = await pool.query(
      `SELECT operation_type, file_name, file_size, status, created_at
       FROM user_usage_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    );

    return {
      success: true,
      data: {
        totalOperations: parseInt(totalUsageResult.rows[0].total_operations),
        monthlyOperations: parseInt(monthlyUsageResult.rows[0].monthly_operations),
        operationStats: operationStatsResult.rows,
        recentLogs: recentLogsResult.rows
      }
    };
  } catch (error) {
    console.error('获取用户统计错误:', error);
    return {
      success: false,
      message: '获取统计信息失败'
    };
  }
};

// 记录用户操作
const logUserOperation = async (userId, operationType, fileName = null, fileSize = null, status = 'success') => {
  try {
    await pool.query(
      `INSERT INTO user_usage_logs (user_id, operation_type, file_name, file_size, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, operationType, fileName, fileSize, status]
    );
    
    return { success: true };
  } catch (error) {
    console.error('记录用户操作错误:', error);
    return { success: false };
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserStats,
  logUserOperation
};