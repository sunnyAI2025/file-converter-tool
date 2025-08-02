const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { uploadImage, uploadImages } = require('../middleware/upload');
const { compressImage, convertImageFormat } = require('../services/imageService');

// 图片压缩
router.post('/compress', uploadImage, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const {
      quality = 80,
      keepOriginalFormat = true,
      removeMetadata = false,
      keepOriginalSize = true,
      maxWidth,
      maxHeight
    } = req.body;

    const options = {
      quality: parseInt(quality),
      keepOriginalFormat: keepOriginalFormat === 'true',
      removeMetadata: removeMetadata === 'true',
      keepOriginalSize: keepOriginalSize === 'true',
      maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
      maxHeight: maxHeight ? parseInt(maxHeight) : undefined
    };

    const result = await compressImage(req.file.path, options);
    
    res.json({
      success: true,
      message: '图片压缩成功',
      data: {
        originalName: req.file.originalname,
        filename: result.filename,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        originalFormat: result.originalFormat,
        outputFormat: result.outputFormat,
        originalDimensions: result.originalDimensions,
        outputDimensions: result.outputDimensions,
        downloadUrl: `/api/images/download/${result.filename}`
      }
    });
  } catch (error) {
    next(error);
  }
});

// 图片格式转换
router.post('/convert', uploadImage, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const { format, quality = 80 } = req.body;
    if (!format) {
      return res.status(400).json({ error: '请指定目标格式' });
    }

    const result = await convertImageFormat(req.file.path, format, parseInt(quality));
    
    res.json({
      success: true,
      message: '格式转换成功',
      data: {
        originalFormat: req.file.mimetype,
        newFormat: format,
        downloadUrl: `/api/images/download/${result.filename}`
      }
    });
  } catch (error) {
    next(error);
  }
});

// 批量图片处理
router.post('/batch-compress', uploadImages, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const {
      quality = 80,
      keepOriginalFormat = true,
      removeMetadata = false,
      keepOriginalSize = true,
      maxWidth,
      maxHeight
    } = req.body;

    const options = {
      quality: parseInt(quality),
      keepOriginalFormat: keepOriginalFormat === 'true',
      removeMetadata: removeMetadata === 'true',
      keepOriginalSize: keepOriginalSize === 'true',
      maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
      maxHeight: maxHeight ? parseInt(maxHeight) : undefined
    };

    const results = [];

    for (const file of req.files) {
      try {
        const result = await compressImage(file.path, options);
        results.push({
          originalName: file.originalname,
          filename: result.filename,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          originalFormat: result.originalFormat,
          outputFormat: result.outputFormat,
          downloadUrl: `/api/images/download/${result.filename}`,
          success: true
        });
      } catch (error) {
        results.push({
          originalName: file.originalname,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      message: '批量处理完成',
      data: results
    });
  } catch (error) {
    next(error);
  }
});

// 图片下载
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

module.exports = router;