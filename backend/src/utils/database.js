const { Pool } = require('pg');

// 数据库连接配置
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_eR1BY0UPgSDQ@ep-snowy-sea-ae799awz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// 初始化数据库表
const initDatabase = async () => {
  try {
    // 创建用户表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // 创建用户使用记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_usage_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        operation_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255),
        file_size INTEGER,
        status VARCHAR(20) DEFAULT 'success',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('数据库表初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
};

// 测试数据库连接
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('数据库连接成功:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
};

module.exports = {
  pool,
  initDatabase,
  testConnection
};