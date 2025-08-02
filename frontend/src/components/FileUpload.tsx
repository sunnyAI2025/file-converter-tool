import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Button, Card, Typography, Progress, Alert } from 'antd'
import { 
  UploadOutlined, 
  FileOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const { Text, Title } = Typography

export interface UploadedFile {
  file: File
  id: string
  status: 'idle' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  result?: any
}

interface FileUploadProps {
  accept?: string[]
  maxSize?: number // MB
  maxFiles?: number
  onFilesChange: (files: UploadedFile[]) => void
  disabled?: boolean
  supportedFormats?: string[]
  fileType?: 'document' | 'image' | 'all'
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = ['.txt', '.html', '.md', '.rtf', '.pdf', '.doc', '.docx', '.odt'],
  maxSize = 10,
  maxFiles = 1,
  onFilesChange,
  disabled = false,
  supportedFormats = [],
  fileType = 'all'
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled) return

    // 处理被拒绝的文件
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`
      ).join('\n')
      
      console.warn('文件上传被拒绝:', errors)
    }

    // 处理接受的文件
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: 'idle' as const,
      progress: 0
    }))

    const updatedFiles = maxFiles === 1 ? newFiles : [...files, ...newFiles].slice(0, maxFiles)
    
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, maxFiles, disabled, onFilesChange])

  // 根据文件类型动态设置accept配置
  const getAcceptConfig = () => {
    const documentTypes = {
      'text/plain': ['.txt'],
      'text/html': ['.html', '.htm'], 
      'text/markdown': ['.md', '.markdown'],
      'text/rtf': ['.rtf'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.oasis.opendocument.text': ['.odt']
    }

    const imageTypes = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/svg+xml': ['.svg']
    }

    switch (fileType) {
      case 'document':
        return documentTypes
      case 'image':
        return imageTypes
      case 'all':
      default:
        return { ...documentTypes, ...imageTypes }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptConfig(),
    maxSize: maxSize * 1024 * 1024,
    maxFiles,
    disabled
  })

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const updateFileStatus = (id: string, updates: Partial<UploadedFile>) => {
    const updatedFiles = files.map(f => 
      f.id === id ? { ...f, ...updates } : f
    )
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return <FileOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return null
    }
  }

  return (
    <div>
      {/* 拖拽上传区域 */}
      <Card
        {...getRootProps()}
        className={`border-dashed cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : disabled 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-400 hover:border-blue-400 hover:bg-blue-50'
        }`}
        style={{ 
          borderWidth: '2px',
          textAlign: 'center',
          padding: '48px 24px',
          marginBottom: files.length > 0 ? '24px' : 0
        }}
      >
        <input {...getInputProps()} />
        
        <UploadOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
        
        {isDragActive ? (
          <div>
            <Title level={4} style={{ color: '#1890ff', marginBottom: '8px' }}>
              释放鼠标上传文件
            </Title>
            <Text type="secondary">支持拖拽上传</Text>
          </div>
        ) : (
          <div>
            <Title level={4} style={{ marginBottom: '8px' }}>
              {disabled ? '上传已禁用' : '拖拽文件到此处'}
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
              或 <Button type="link" style={{ padding: 0 }}>点击选择文件</Button>
            </Text>
            
            {supportedFormats.length > 0 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                支持格式: {supportedFormats.join(', ')}
              </Text>
            )}
            
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                最大文件大小: {maxSize}MB {maxFiles > 1 && `| 最多 ${maxFiles} 个文件`}
              </Text>
            </div>
          </div>
        )}
      </Card>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div>
          <Title level={5} style={{ marginBottom: '16px' }}>
            已选择文件 ({files.length})
          </Title>
          
          {files.map((uploadedFile) => (
            <Card 
              key={uploadedFile.id}
              size="small"
              style={{ marginBottom: '8px' }}
              bodyStyle={{ padding: '12px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  {getFileIcon(uploadedFile.file.name)}
                  <div style={{ marginLeft: '12px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Text strong style={{ marginRight: '8px' }}>
                        {uploadedFile.file.name}
                      </Text>
                      {getStatusIcon(uploadedFile.status)}
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {formatFileSize(uploadedFile.file.size)}
                    </Text>
                    
                    {uploadedFile.status === 'error' && uploadedFile.error && (
                      <Alert
                        message={uploadedFile.error}
                        type="error"
                        size="small"
                        style={{ marginTop: '8px' }}
                      />
                    )}
                    
                    {uploadedFile.status === 'uploading' && (
                      <Progress 
                        percent={uploadedFile.progress} 
                        size="small" 
                        style={{ marginTop: '8px' }}
                      />
                    )}
                  </div>
                </div>
                
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => removeFile(uploadedFile.id)}
                  disabled={disabled || uploadedFile.status === 'uploading'}
                  style={{ color: '#ff4d4f' }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload