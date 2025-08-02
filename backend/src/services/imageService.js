const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

/**
 * 压缩图片
 * @param {string} inputPath - 输入文件路径
 * @param {Object} options - 压缩选项
 * @returns {Promise<Object>} 压缩结果
 */
const compressImage = async (inputPath, options = {}) => {
  try {
    const {
      quality = 80,
      keepOriginalFormat = true,
      removeMetadata = false,
      keepOriginalSize = true,
      maxWidth,
      maxHeight
    } = options;

    // 获取原图信息
    const originalMetadata = await sharp(inputPath).metadata();
    const originalStats = await fs.stat(inputPath);
    
    // 确定输出格式
    let outputFormat = originalMetadata.format;
    let outputExt = originalMetadata.format;
    
    if (!keepOriginalFormat) {
      // 如果原图是PNG且质量设置较低，转换为JPEG以获得更好的压缩比
      if (originalMetadata.format === 'png' && quality < 90) {
        outputFormat = 'jpeg';
        outputExt = 'jpg';
      }
    }

    const outputFileName = `compressed_${uuidv4()}.${outputExt}`;
    const outputPath = path.join(__dirname, '../../uploads', outputFileName);

    let sharpInstance = sharp(inputPath);

    // 移除元数据
    if (removeMetadata) {
      sharpInstance = sharpInstance.withMetadata(false);
    }

    // 调整尺寸
    if (!keepOriginalSize && (maxWidth || maxHeight)) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // 根据格式设置压缩参数
    switch (outputFormat) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: quality, 
          progressive: true,
          mozjpeg: true 
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          compressionLevel: Math.round(9 * (100 - quality) / 100),
          progressive: true
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: quality,
          effort: 6
        });
        break;
      default:
        sharpInstance = sharpInstance.jpeg({ 
          quality: quality, 
          progressive: true 
        });
    }

    await sharpInstance.toFile(outputPath);

    const outputStats = await fs.stat(outputPath);
    const outputMetadata = await sharp(outputPath).metadata();

    // 删除原文件
    await fs.remove(inputPath);

    const compressionRatio = Math.round((1 - outputStats.size / originalStats.size) * 100);

    return {
      filename: outputFileName,
      path: outputPath,
      originalSize: originalStats.size,
      compressedSize: outputStats.size,
      compressionRatio: compressionRatio,
      originalFormat: originalMetadata.format,
      outputFormat: outputFormat,
      originalDimensions: {
        width: originalMetadata.width,
        height: originalMetadata.height
      },
      outputDimensions: {
        width: outputMetadata.width,
        height: outputMetadata.height
      }
    };
  } catch (error) {
    // 删除原文件（如果存在）
    if (await fs.pathExists(inputPath)) {
      await fs.remove(inputPath);
    }
    throw new Error(`图片压缩失败: ${error.message}`);
  }
};

/**
 * 转换图片格式
 * @param {string} inputPath - 输入文件路径
 * @param {string} targetFormat - 目标格式
 * @param {number} quality - 质量 (仅适用于jpg/webp)
 * @returns {Promise<Object>} 转换结果
 */
const convertImageFormat = async (inputPath, targetFormat, quality = 80) => {
  try {
    const formatMap = {
      'jpg': 'jpeg',
      'jpeg': 'jpeg',
      'png': 'png',
      'webp': 'webp',
      'gif': 'gif',
      'bmp': 'bmp'
    };

    const format = formatMap[targetFormat.toLowerCase()];
    if (!format) {
      throw new Error('不支持的目标格式');
    }

    const outputFileName = `converted_${uuidv4()}.${targetFormat.toLowerCase()}`;
    const outputPath = path.join(__dirname, '../../uploads', outputFileName);

    let sharpInstance = sharp(inputPath);

    // 根据格式设置参数
    switch (format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ compressionLevel: 6 });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      case 'gif':
        sharpInstance = sharpInstance.gif();
        break;
      case 'bmp':
        sharpInstance = sharpInstance.bmp();
        break;
    }

    await sharpInstance.toFile(outputPath);

    const stats = await fs.stat(outputPath);

    // 删除原文件
    await fs.remove(inputPath);

    return {
      filename: outputFileName,
      path: outputPath,
      size: stats.size
    };
  } catch (error) {
    // 删除原文件（如果存在）
    if (await fs.pathExists(inputPath)) {
      await fs.remove(inputPath);
    }
    throw new Error(`格式转换失败: ${error.message}`);
  }
};

/**
 * 获取图片信息
 * @param {string} imagePath - 图片路径
 * @returns {Promise<Object>} 图片信息
 */
const getImageInfo = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      density: metadata.density,
      channels: metadata.channels
    };
  } catch (error) {
    throw new Error(`获取图片信息失败: ${error.message}`);
  }
};

module.exports = {
  compressImage,
  convertImageFormat,
  getImageInfo
};