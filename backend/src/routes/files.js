const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadDocument, uploadSingle } = require('../middleware/upload');
const { convertDocument, getSupportedFormats, detectFileType } = require('../services/fileService');

// 文件转换
router.post('/convert', uploadSingle, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const { targetFormat, quality = 'standard' } = req.body;
    if (!targetFormat) {
      return res.status(400).json({ error: '请指定目标格式' });
    }

    // 检测文件类型
    const inputFormat = detectFileType(req.file.path);
    console.log(`文件转换: ${req.file.originalname} (${inputFormat} -> ${targetFormat})`);

    const result = await convertDocument(req.file.path, targetFormat, { quality });
    
    res.json({
      success: true,
      message: '文件转换成功',
      data: {
        originalName: req.file.originalname,
        originalFormat: result.originalFormat,
        targetFormat: result.targetFormat,
        originalSize: req.file.size,
        convertedSize: result.size,
        downloadUrl: `/api/files/download/${result.filename}`,
        filename: result.filename
      }
    });
  } catch (error) {
    next(error);
  }
});

// 批量文件转换
router.post('/batch-convert', uploadSingle, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const { targetFormat } = req.body;
    if (!targetFormat) {
      return res.status(400).json({ error: '请指定目标格式' });
    }

    const results = [];
    for (const file of req.files) {
      try {
        const result = await convertDocument(file.path, targetFormat);
        results.push({
          originalName: file.originalname,
          success: true,
          downloadUrl: `/api/files/download/${result.filename}`,
          originalSize: file.size,
          convertedSize: result.size
        });
      } catch (error) {
        results.push({
          originalName: file.originalname,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: '批量转换完成',
      data: results
    });
  } catch (error) {
    next(error);
  }
});

// 文件下载
router.get('/download/:filename', (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    res.download(filePath, (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取支持的格式
router.get('/formats', (req, res) => {
  try {
    const formats = getSupportedFormats();
    res.json({
      success: true,
      data: formats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取格式列表失败'
    });
  }
});

// 检测文件类型
router.post('/detect-type', uploadSingle, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const fileType = detectFileType(req.file.path);
    const formats = getSupportedFormats();
    const supportedOutputs = formats.conversions[fileType]?.outputFormats || [];

    // 删除临时文件
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        detectedType: fileType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        supportedOutputFormats: supportedOutputs,
        formatInfo: formats.conversions[fileType] || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// 转换进度查询（预留接口）
router.get('/conversion-status/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  // 这里可以实现实际的进度查询逻辑
  res.json({
    success: true,
    data: {
      taskId,
      status: 'completed', // pending, processing, completed, failed
      progress: 100,
      message: '转换完成'
    }
  });
});

module.exports = router;