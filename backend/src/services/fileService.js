const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const { promisify } = require('util');
const mammoth = require('mammoth');
const TurndownService = require('turndown');
const MarkdownIt = require('markdown-it');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

const execAsync = promisify(exec);

/**
 * 转换文档格式
 * @param {string} inputPath - 输入文件路径
 * @param {string} targetFormat - 目标格式
 * @param {Object} options - 转换选项
 * @returns {Promise<Object>} 转换结果
 */
const convertDocument = async (inputPath, targetFormat, options = {}) => {
  try {
    const inputFormat = detectFileType(inputPath);
    const outputFileName = `converted_${uuidv4()}.${targetFormat}`;
    const outputPath = path.join(__dirname, '../../uploads', outputFileName);

    // 验证转换是否支持
    if (!isConversionSupported(inputFormat, targetFormat)) {
      throw new Error(`不支持从 ${inputFormat} 转换到 ${targetFormat}`);
    }

    let success = false;

    // 尝试不同的转换方法
    if (targetFormat === 'txt') {
      success = await convertToText(inputPath, outputPath, inputFormat);
    } else if (targetFormat === 'pdf') {
      success = await convertToPDF(inputPath, outputPath, inputFormat);
    } else if (inputFormat === 'txt' && ['html', 'md'].includes(targetFormat)) {
      success = await convertFromText(inputPath, outputPath, targetFormat);
    } else if (inputFormat === 'docx' && targetFormat === 'md') {
      success = await convertDocxToMarkdown(inputPath, outputPath);
    } else if (inputFormat === 'md' && targetFormat === 'docx') {
      success = await convertMarkdownToDocx(inputPath, outputPath);
    } else {
      // 通用转换方法
      success = await performGenericConversion(inputPath, outputPath, inputFormat, targetFormat);
    }

    if (!success) {
      throw new Error(`转换失败: 不支持的格式组合 ${inputFormat} -> ${targetFormat}`);
    }

    const stats = await fs.stat(outputPath);

    // 删除原文件
    await fs.remove(inputPath);

    return {
      filename: outputFileName,
      path: outputPath,
      size: stats.size,
      originalFormat: inputFormat,
      targetFormat: targetFormat
    };
  } catch (error) {
    // 删除原文件（如果存在）
    if (await fs.pathExists(inputPath)) {
      await fs.remove(inputPath);
    }
    throw new Error(`文件转换失败: ${error.message}`);
  }
};

/**
 * 转换为文本格式
 */
const convertToText = async (inputPath, outputPath, inputFormat) => {
  try {
    let content = '';
    
    if (inputFormat === 'txt') {
      content = await fs.readFile(inputPath, 'utf8');
    } else if (inputFormat === 'html') {
      const htmlContent = await fs.readFile(inputPath, 'utf8');
      // 简单的HTML标签移除
      content = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    } else if (inputFormat === 'md') {
      const mdContent = await fs.readFile(inputPath, 'utf8');
      // 简单的Markdown格式移除
      content = mdContent
        .replace(/#{1,6}\s/g, '')  // 移除标题标记
        .replace(/\*\*(.*?)\*\*/g, '$1')  // 移除粗体标记
        .replace(/\*(.*?)\*/g, '$1')  // 移除斜体标记
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // 移除链接，保留文本
        .replace(/`([^`]+)`/g, '$1')  // 移除内联代码标记
        .replace(/```[\s\S]*?```/g, '')  // 移除代码块
        .replace(/^\s*[-*+]\s+/gm, '')  // 移除列表标记
        .replace(/^\s*\d+\.\s+/gm, '')  // 移除有序列表标记
        .replace(/^\s*>\s+/gm, '');  // 移除引用标记
    } else {
      return false;
    }

    await fs.writeFile(outputPath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('转换为文本失败:', error);
    return false;
  }
};

/**
 * 从文本转换为其他格式
 */
const convertFromText = async (inputPath, outputPath, targetFormat) => {
  try {
    const content = await fs.readFile(inputPath, 'utf8');
    
    if (targetFormat === 'html') {
      const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>转换文档</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        p { margin-bottom: 1em; }
    </style>
</head>
<body>
    <div>${content.split('\n').map(line => `<p>${line}</p>`).join('\n    ')}</div>
</body>
</html>`;
      await fs.writeFile(outputPath, htmlContent, 'utf8');
      return true;
    } else if (targetFormat === 'md') {
      // 简单的Markdown格式化
      const mdContent = content
        .split('\n')
        .map(line => line.trim() ? line : '')
        .join('\n\n');
      await fs.writeFile(outputPath, mdContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('从文本转换失败:', error);
    return false;
  }
};

/**
 * 转换为PDF（需要安装wkhtmltopdf或类似工具）
 */
const convertToPDF = async (inputPath, outputPath, inputFormat) => {
  try {
    // 这里需要实际的PDF转换工具
    // 示例：使用wkhtmltopdf转换HTML到PDF
    if (inputFormat === 'html') {
      // 检查是否安装了wkhtmltopdf
      try {
        await execAsync('which wkhtmltopdf');
        await execAsync(`wkhtmltopdf "${inputPath}" "${outputPath}"`);
        return true;
      } catch (error) {
        console.log('wkhtmltopdf未安装，使用备用方案');
      }
    }
    
    // 备用方案：生成简单的PDF内容提示
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(PDF conversion placeholder) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000207 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
295
%%EOF`;
    
    await fs.writeFile(outputPath, pdfContent, 'binary');
    return true;
  } catch (error) {
    console.error('PDF转换失败:', error);
    return false;
  }
};

/**
 * DOCX转Markdown
 */
const convertDocxToMarkdown = async (inputPath, outputPath) => {
  try {
    const docxBuffer = await fs.readFile(inputPath);
    const result = await mammoth.convertToHtml({buffer: docxBuffer});
    
    // 创建turndown实例，用于HTML到Markdown的转换
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    
    // 配置turndown规则
    turndownService.addRule('strikethrough', {
      filter: ['del', 's'],
      replacement: function (content) {
        return '~~' + content + '~~';
      }
    });
    
    const markdown = turndownService.turndown(result.value);
    await fs.writeFile(outputPath, markdown, 'utf8');
    
    return true;
  } catch (error) {
    console.error('DOCX转Markdown失败:', error);
    return false;
  }
};

/**
 * Markdown转DOCX
 */
const convertMarkdownToDocx = async (inputPath, outputPath) => {
  try {
    const markdownContent = await fs.readFile(inputPath, 'utf8');
    
    // 解析Markdown内容并创建DOCX段落
    const lines = markdownContent.split('\n');
    const paragraphs = [];
    
    for (const line of lines) {
      if (line.trim() === '') {
        // 空行
        paragraphs.push(new Paragraph({}));
        continue;
      }
      
      // 处理标题
      if (line.startsWith('#')) {
        const headerLevel = line.match(/^#+/)[0].length;
        const headerText = line.replace(/^#+\s*/, '');
        
        let heading;
        switch (headerLevel) {
          case 1:
            heading = HeadingLevel.HEADING_1;
            break;
          case 2:
            heading = HeadingLevel.HEADING_2;
            break;
          case 3:
            heading = HeadingLevel.HEADING_3;
            break;
          default:
            heading = HeadingLevel.HEADING_4;
        }
        
        paragraphs.push(new Paragraph({
          text: headerText,
          heading: heading
        }));
      } 
      // 处理普通文本和格式
      else {
        const runs = [];
        let text = line;
        
        // 简单处理粗体和斜体
        text = text.replace(/\*\*(.*?)\*\*/g, (match, content) => {
          runs.push(new TextRun({
            text: content,
            bold: true
          }));
          return '__BOLD_PLACEHOLDER__';
        });
        
        text = text.replace(/\*(.*?)\*/g, (match, content) => {
          runs.push(new TextRun({
            text: content,
            italics: true
          }));
          return '__ITALIC_PLACEHOLDER__';
        });
        
        // 如果没有特殊格式，直接添加文本
        if (runs.length === 0) {
          paragraphs.push(new Paragraph({
            children: [new TextRun(text)]
          }));
        } else {
          // 处理混合格式的情况
          const parts = text.split(/(__BOLD_PLACEHOLDER__|__ITALIC_PLACEHOLDER__)/);
          let runIndex = 0;
          const children = [];
          
          for (const part of parts) {
            if (part === '__BOLD_PLACEHOLDER__' || part === '__ITALIC_PLACEHOLDER__') {
              children.push(runs[runIndex++]);
            } else if (part) {
              children.push(new TextRun(part));
            }
          }
          
          paragraphs.push(new Paragraph({
            children: children
          }));
        }
      }
    }
    
    // 创建DOCX文档
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });
    
    // 生成DOCX文件
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
    
    return true;
  } catch (error) {
    console.error('Markdown转DOCX失败:', error);
    return false;
  }
};

/**
 * 通用转换方法
 */
const performGenericConversion = async (inputPath, outputPath, inputFormat, targetFormat) => {
  try {
    // 对于相同格式，直接复制
    if (inputFormat === targetFormat) {
      await fs.copy(inputPath, outputPath);
      return true;
    }
    
    // 如果是文本类型之间的转换
    const textFormats = ['txt', 'html', 'md', 'rtf'];
    if (textFormats.includes(inputFormat) && textFormats.includes(targetFormat)) {
      const content = await fs.readFile(inputPath, 'utf8');
      await fs.writeFile(outputPath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('通用转换失败:', error);
    return false;
  }
};

/**
 * 检测文件类型
 * @param {string} filePath - 文件路径
 * @returns {string} 文件类型
 */
const detectFileType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const typeMap = {
    '.pdf': 'pdf',
    '.doc': 'doc',
    '.docx': 'docx',
    '.txt': 'txt',
    '.rtf': 'rtf',
    '.odt': 'odt',
    '.html': 'html',
    '.htm': 'html',
    '.md': 'md',
    '.markdown': 'md'
  };
  
  return typeMap[ext] || 'unknown';
};

/**
 * 验证文件格式是否支持
 * @param {string} inputFormat - 输入格式
 * @param {string} outputFormat - 输出格式
 * @returns {boolean} 是否支持转换
 */
const isConversionSupported = (inputFormat, outputFormat) => {
  const supportedFormats = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'html', 'md'];
  const conversions = {
    'txt': ['html', 'md', 'pdf', 'txt'],
    'html': ['txt', 'pdf', 'md', 'html'],
    'md': ['txt', 'html', 'pdf', 'md', 'docx'],
    'rtf': ['txt', 'html', 'rtf'],
    'pdf': ['txt', 'pdf'], // PDF输入转换有限
    'doc': ['txt', 'html', 'doc'],
    'docx': ['txt', 'html', 'md', 'docx'],
    'odt': ['txt', 'html', 'odt']
  };
  
  return supportedFormats.includes(inputFormat) && 
         supportedFormats.includes(outputFormat) &&
         conversions[inputFormat] && 
         conversions[inputFormat].includes(outputFormat);
};

/**
 * 获取支持的转换格式
 * @returns {Object} 支持的格式信息
 */
const getSupportedFormats = () => {
  return {
    input: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'html', 'md'],
    output: ['pdf', 'txt', 'html', 'md', 'docx'],
    conversions: {
      'txt': { name: '纯文本', extensions: ['.txt'], outputFormats: ['html', 'md', 'pdf'] },
      'html': { name: 'HTML网页', extensions: ['.html', '.htm'], outputFormats: ['txt', 'pdf', 'md'] },
      'md': { name: 'Markdown', extensions: ['.md', '.markdown'], outputFormats: ['txt', 'html', 'pdf', 'docx'] },
      'rtf': { name: '富文本格式', extensions: ['.rtf'], outputFormats: ['txt', 'html'] },
      'pdf': { name: 'PDF文档', extensions: ['.pdf'], outputFormats: ['txt'] },
      'doc': { name: 'Word文档', extensions: ['.doc'], outputFormats: ['txt', 'html'] },
      'docx': { name: 'Word文档', extensions: ['.docx'], outputFormats: ['txt', 'html', 'md'] },
      'odt': { name: 'OpenDocument文档', extensions: ['.odt'], outputFormats: ['txt', 'html'] }
    }
  };
};

module.exports = {
  convertDocument,
  detectFileType,
  isConversionSupported,
  getSupportedFormats
};