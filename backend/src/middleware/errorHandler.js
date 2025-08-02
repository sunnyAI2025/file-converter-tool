const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer错误处理
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: '文件大小超出限制',
      message: '请上传小于10MB的文件'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: '文件数量超出限制',
      message: '一次最多上传5个文件'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: '不支持的文件字段',
      message: '请检查文件上传字段名称'
    });
  }

  // Sharp错误处理
  if (err.message && err.message.includes('Input file is missing')) {
    return res.status(400).json({
      error: '文件处理失败',
      message: '输入文件缺失或损坏'
    });
  }

  if (err.message && err.message.includes('Input file contains unsupported image format')) {
    return res.status(400).json({
      error: '不支持的图片格式',
      message: '请上传JPG、PNG、WEBP、GIF或BMP格式的图片'
    });
  }

  // 自定义错误
  if (err.status) {
    return res.status(err.status).json({
      error: err.message || '服务器内部错误'
    });
  }

  // 默认错误
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
};

module.exports = { errorHandler };