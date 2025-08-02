const fs = require('fs-extra');
const path = require('path');

/**
 * 清理过期的临时文件
 * @param {number} maxAge - 文件最大保留时间（毫秒），默认1小时
 */
const cleanupTempFiles = async (maxAge = 60 * 60 * 1000) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    if (!await fs.pathExists(uploadsDir)) {
      return;
    }

    const files = await fs.readdir(uploadsDir);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        // 如果文件超过最大保留时间，则删除
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath);
          deletedCount++;
          console.log(`已删除过期文件: ${file}`);
        }
      } catch (error) {
        console.error(`删除文件 ${file} 时出错:`, error.message);
      }
    }

    if (deletedCount > 0) {
      console.log(`临时文件清理完成，共删除 ${deletedCount} 个文件`);
    }
  } catch (error) {
    console.error('清理临时文件时出错:', error.message);
  }
};

/**
 * 获取文件大小的人类可读格式
 * @param {number} bytes - 字节数
 * @returns {string} 格式化的文件大小
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 验证文件扩展名
 * @param {string} filename - 文件名
 * @param {Array} allowedExtensions - 允许的扩展名数组
 * @returns {boolean} 是否为允许的扩展名
 */
const isValidFileExtension = (filename, allowedExtensions) => {
  const ext = path.extname(filename).toLowerCase().substring(1);
  return allowedExtensions.includes(ext);
};

/**
 * 生成安全的文件名
 * @param {string} originalName - 原始文件名
 * @returns {string} 安全的文件名
 */
const sanitizeFileName = (originalName) => {
  return originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
};

module.exports = {
  cleanupTempFiles,
  formatFileSize,
  isValidFileExtension,
  sanitizeFileName
};