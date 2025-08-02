import React, { useState, useCallback } from 'react'
import { 
  Typography, 
  Card, 
  Slider, 
  Radio, 
  Button, 
  Progress, 
  Row, 
  Col,
  Space,
  Switch,
  Alert,
  message,
  Tooltip
} from 'antd'
import { 
  CompressOutlined, 
  DownloadOutlined, 
  InfoCircleOutlined,
  FileImageOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import FileUpload, { UploadedFile } from '../components/FileUpload'
import axios from 'axios'

const { Title, Text, Paragraph } = Typography

interface CompressionResult {
  success: boolean
  originalName: string
  filename: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  originalFormat: string
  outputFormat: string
  originalDimensions: {
    width: number
    height: number
  }
  outputDimensions: {
    width: number
    height: number
  }
  downloadUrl: string
  error?: string
}

const ImageCompress: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [quality, setQuality] = useState<number>(70)
  const [compressionLevel, setCompressionLevel] = useState<string>('standard')
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(false)
  const [keepOriginalSize, setKeepOriginalSize] = useState<boolean>(true)
  const [compressing, setCompressing] = useState<boolean>(false)
  const [results, setResults] = useState<CompressionResult[]>([])

  // 质量映射
  const qualityLevels = {
    light: 90,   // 轻度压缩
    standard: 70, // 标准压缩
    high: 50     // 高度压缩
  }

  const handleFilesChange = useCallback((newFiles: UploadedFile[]) => {
    setFiles(newFiles)
    setResults([])
  }, [])

  const handleCompressionLevelChange = (level: string) => {
    setCompressionLevel(level)
    setQuality(qualityLevels[level as keyof typeof qualityLevels])
  }

  const handleCompress = async () => {
    if (files.length === 0) {
      message.warning('请先选择图片文件')
      return
    }

    setCompressing(true)
    setResults([])

    try {
      const compressionResults: CompressionResult[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // 更新单个文件进度
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id 
              ? { ...f, status: 'uploading' as const, progress: 0 }
              : f
          )
        )

        try {
          const formData = new FormData()
          formData.append('image', file.file)
          formData.append('quality', quality.toString())
          formData.append('removeMetadata', removeMetadata.toString())
          formData.append('keepOriginalSize', keepOriginalSize.toString())

          // 模拟进度更新
          const progressTimer = setInterval(() => {
            setFiles(prevFiles => 
              prevFiles.map(f => 
                f.id === file.id 
                  ? { ...f, progress: Math.min(f.progress + 10, 90) }
                  : f
              )
            )
          }, 200)

          const response = await axios.post('/api/images/compress', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })

          clearInterval(progressTimer)

          if (response.data.success) {
            const result: CompressionResult = {
              success: true,
              ...response.data.data
            }

            compressionResults.push(result)

            // 更新文件状态为成功
            setFiles(prevFiles => 
              prevFiles.map(f => 
                f.id === file.id 
                  ? { ...f, status: 'success' as const, progress: 100, result }
                  : f
              )
            )
          }
        } catch (error: any) {
          const errorResult: CompressionResult = {
            success: false,
            error: error.response?.data?.error || error.message,
            originalName: file.file.name,
            filename: '',
            originalSize: file.file.size,
            compressedSize: 0,
            compressionRatio: 0,
            originalFormat: '',
            outputFormat: '',
            originalDimensions: { width: 0, height: 0 },
            outputDimensions: { width: 0, height: 0 },
            downloadUrl: ''
          }

          compressionResults.push(errorResult)

          // 更新文件状态为失败
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.id === file.id 
                ? { ...f, status: 'error' as const, progress: 0, error: errorResult.error }
                : f
            )
          )
        }
      }

      setResults(compressionResults)

      const successCount = compressionResults.filter(r => r.success).length
      if (successCount > 0) {
        message.success(`成功压缩 ${successCount} 张图片`)
      }
      if (successCount < compressionResults.length) {
        message.warning(`${compressionResults.length - successCount} 张图片压缩失败`)
      }
    } catch (error: any) {
      message.error(`压缩失败: ${error.message}`)
    } finally {
      setCompressing(false)
    }
  }

  const handleDownload = (downloadUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCompressionColor = (ratio: number): string => {
    if (ratio >= 70) return '#52c41a'  // 绿色
    if (ratio >= 40) return '#faad14'  // 橙色
    return '#f5222d'  // 红色
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* 页面头部 */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          🗜️ 图片压缩
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          无损压缩，保持图片质量，支持JPG、PNG、WEBP等格式
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧：文件上传 */}
        <Col xs={24} lg={14}>
          <Card title="上传图片文件" style={{ height: '100%' }}>
            <FileUpload
              onFilesChange={handleFilesChange}
              maxFiles={5}
              maxSize={10}
              disabled={compressing}
              supportedFormats={['JPG', 'PNG', 'WEBP', 'GIF']}
              fileType="image"
            />
          </Card>
        </Col>

        {/* 右侧：压缩设置 */}
        <Col xs={24} lg={10}>
          <Card title="压缩设置" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 压缩级别 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                  压缩级别:
                </Text>
                <Radio.Group 
                  value={compressionLevel} 
                  onChange={(e) => handleCompressionLevelChange(e.target.value)}
                  disabled={compressing}
                >
                  <Radio value="light">轻度压缩 (90%)</Radio>
                  <Radio value="standard">标准压缩 (70%)</Radio>
                  <Radio value="high">高度压缩 (50%)</Radio>
                </Radio.Group>
              </div>

              {/* 自定义质量 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <Text strong>自定义质量: </Text>
                  <Text code style={{ marginLeft: '8px' }}>{quality}%</Text>
                </div>
                <Slider
                  min={10}
                  max={100}
                  value={quality}
                  onChange={setQuality}
                  disabled={compressing}
                  marks={{
                    10: '10%',
                    50: '50%',
                    100: '100%'
                  }}
                />
              </div>

              {/* 其他选项 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                  其他选项:
                </Text>
                <Space direction="vertical">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      保持原始尺寸
                      <Tooltip title="保持图片的原始宽度和高度">
                        <InfoCircleOutlined style={{ marginLeft: '4px', color: '#999' }} />
                      </Tooltip>
                    </span>
                    <Switch 
                      checked={keepOriginalSize} 
                      onChange={setKeepOriginalSize}
                      disabled={compressing}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      移除元数据
                      <Tooltip title="移除图片的EXIF等元数据信息，进一步减小文件大小">
                        <InfoCircleOutlined style={{ marginLeft: '4px', color: '#999' }} />
                      </Tooltip>
                    </span>
                    <Switch 
                      checked={removeMetadata} 
                      onChange={setRemoveMetadata}
                      disabled={compressing}
                    />
                  </div>
                </Space>
              </div>

              {/* 压缩按钮 */}
              <Button
                type="primary"
                size="large"
                icon={<CompressOutlined />}
                onClick={handleCompress}
                loading={compressing}
                disabled={files.length === 0}
                style={{ width: '100%' }}
              >
                {compressing ? '压缩中...' : '开始压缩'}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 压缩进度 */}
      {compressing && (
        <Card title="压缩进度" style={{ marginTop: '24px' }}>
          {files.map((file) => (
            <div key={file.id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <FileImageOutlined style={{ marginRight: '8px' }} />
                <Text>{file.file.name}</Text>
                {file.status === 'success' && (
                  <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} />
                )}
              </div>
              <Progress 
                percent={file.progress} 
                status={file.status === 'error' ? 'exception' : 'active'}
                size="small"
              />
            </div>
          ))}
        </Card>
      )}

      {/* 压缩结果 */}
      {results.length > 0 && (
        <Card title="压缩结果" style={{ marginTop: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {results.map((result, index) => (
              <Card key={index} size="small" style={{ backgroundColor: result.success ? '#f6ffed' : '#fff2f0' }}>
                {result.success ? (
                  <div>
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} sm={12}>
                        <div>
                          <Text strong style={{ display: 'block' }}>{result.originalName}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {result.originalFormat?.toUpperCase()} → {result.outputFormat?.toUpperCase()}
                          </Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={6}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                            文件大小
                          </Text>
                          <Text>{formatFileSize(result.originalSize)}</Text>
                          <Text type="secondary"> → </Text>
                          <Text strong>{formatFileSize(result.compressedSize)}</Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={4}>
                        <div style={{ textAlign: 'center' }}>
                          <Text 
                            style={{ 
                              color: getCompressionColor(result.compressionRatio),
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}
                          >
                            {result.compressionRatio}%
                          </Text>
                          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                            压缩率
                          </Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={2}>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(result.downloadUrl, result.filename)}
                          size="small"
                        >
                          下载
                        </Button>
                      </Col>
                    </Row>

                    {/* 尺寸信息 */}
                    {result.originalDimensions && result.outputDimensions && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          尺寸: {result.originalDimensions.width} × {result.originalDimensions.height}
                          {(result.originalDimensions.width !== result.outputDimensions.width || 
                            result.originalDimensions.height !== result.outputDimensions.height) && (
                            <> → {result.outputDimensions.width} × {result.outputDimensions.height}</>
                          )}
                        </Text>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert
                    message={`压缩失败: ${result.originalName}`}
                    description={result.error}
                    type="error"
                    showIcon
                  />
                )}
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  )
}

export default ImageCompress