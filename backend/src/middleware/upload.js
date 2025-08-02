const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
fs.ensureDirSync(uploadDir);

// 文件存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 图片文件过滤器
  if (file.fieldname === 'image') {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片文件 (JPG, PNG, GIF, WEBP, BMP)'));
    }
  }
  
  // 文档文件过滤器
  if (file.fieldname === 'document') {
    const allowedTypes = /pdf|doc|docx|txt|rtf|odt|html|htm|md|markdown/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持文档文件 (PDF, DOC, DOCX, TXT, RTF, ODT, HTML, MD)'));
    }
  }
  
  // 通用文件上传
  if (file.fieldname === 'file') {
    return cb(null, true);
  }
  
  cb(new Error('不支持的文件类型'));
};

// 上传配置
const uploadConfig = {
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
    files: 5 // 最多5个文件
  }
};

// 不同类型的上传中间件
const uploadSingle = multer(uploadConfig).single('file');
const uploadImages = multer(uploadConfig).array('images', 5);
const uploadImage = multer(uploadConfig).single('image');
const uploadDocument = multer(uploadConfig).single('document');

module.exports = {
  uploadSingle,
  uploadImages,
  uploadImage,
  uploadDocument
};