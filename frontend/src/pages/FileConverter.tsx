import React, { useState, useEffect } from 'react'
import { 
  Typography, 
  Card, 
  Select, 
  Button, 
  Radio, 
  Progress, 
  Alert, 
  Row, 
  Col,
  Divider,
  Space,
  message,
  Tooltip
} from 'antd'
import { 
  DownloadOutlined, 
  SwapOutlined, 
  FileOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import FileUpload, { UploadedFile } from '../components/FileUpload'
import { fileAPI, type SupportedFormatsResponse } from '../utils/api'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

interface ConversionResult {
  success: boolean
  originalName: string
  originalFormat: string
  targetFormat: string
  originalSize: number
  convertedSize: number
  downloadUrl: string
  filename: string
  error?: string
}

const FileConverter: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [targetFormat, setTargetFormat] = useState<string>('')
  const [quality, setQuality] = useState<string>('standard')
  const [converting, setConverting] = useState(false)
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null)
  const [supportedFormats, setSupportedFormats] = useState<SupportedFormatsResponse['data'] | null>(null)
  const [detectedFileInfo, setDetectedFileInfo] = useState<any>(null)

  // 获取支持的格式
  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const response = await fileAPI.getSupportedFormats()
        setSupportedFormats(response.data)
      } catch (error) {
        console.error('获取支持格式失败:', error)
        message.error('获取支持格式失败')
      }
    }
    fetchFormats()
  }, [])

  // 当文件变化时，检测文件类型
  useEffect(() => {
    if (files.length > 0 && files[0].file) {
      detectFileType(files[0].file)
    } else {
      setDetectedFileInfo(null)
      setTargetFormat('')
    }
  }, [files])

  const detectFileType = async (file: File) => {
    try {
      const response = await fileAPI.detectFileType(file)
      setDetectedFileInfo(response.data)
      // 如果检测到的格式有支持的输出格式，自动选择第一个
      if (response.data.supportedOutputFormats.length > 0) {
        setTargetFormat(response.data.supportedOutputFormats[0])
      }
    } catch (error) {
      console.error('文件类型检测失败:', error)
      message.warning('文件类型检测失败，请手动选择转换格式')
    }
  }

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles)
    setConversionResult(null)
  }

  const handleConvert = async () => {
    if (files.length === 0) {
      message.warning('请先选择文件')
      return
    }

    if (!targetFormat) {
      message.warning('请选择目标格式')
      return
    }

    setConverting(true)
    setConversionResult(null)

    try {
      // 更新文件状态为转换中
      const updatedFiles = files.map(f => ({
        ...f,
        status: 'uploading' as const,
        progress: 0
      }))
      setFiles(updatedFiles)

      // 模拟进度更新
      const progressTimer = setInterval(() => {
        setFiles(prevFiles => 
          prevFiles.map(f => ({
            ...f,
            progress: Math.min(f.progress + 10, 90)
          }))
        )
      }, 200)

      const response = await fileAPI.convertFile(files[0].file, targetFormat, quality)

      clearInterval(progressTimer)

      if (response.success) {
        // 更新文件状态为成功
        setFiles(prevFiles => 
          prevFiles.map(f => ({
            ...f,
            status: 'success' as const,
            progress: 100,
            result: response.data
          }))
        )

        setConversionResult({
          success: true,
          ...response.data
        })

        message.success('文件转换成功！')
      }
    } catch (error: any) {
      // 更新文件状态为失败
      setFiles(prevFiles => 
        prevFiles.map(f => ({
          ...f,
          status: 'error' as const,
          progress: 0,
          error: error.message
        }))
      )

      setConversionResult({
        success: false,
        error: error.message,
        originalName: files[0].file.name,
        originalFormat: detectedFileInfo?.detectedType || '',
        targetFormat,
        originalSize: files[0].file.size,
        convertedSize: 0,
        downloadUrl: '',
        filename: ''
      })

      message.error(`转换失败: ${error.message}`)
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = () => {
    if (conversionResult && conversionResult.downloadUrl) {
      const link = document.createElement('a')
      link.href = conversionResult.downloadUrl
      link.download = conversionResult.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAvailableOutputFormats = () => {
    if (!detectedFileInfo) return []
    return detectedFileInfo.supportedOutputFormats || []
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* 页面头部 */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          📁 文件转换
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          支持多种文件格式相互转换，操作简单快捷
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧：文件上传 */}
        <Col xs={24} lg={14}>
          <Card title="选择要转换的文件" style={{ height: '100%' }}>
            <FileUpload
              onFilesChange={handleFilesChange}
              maxFiles={1}
              maxSize={10}
              disabled={converting}
              supportedFormats={supportedFormats?.input || []}
              fileType="document"
            />

            {/* 文件信息显示 */}
            {detectedFileInfo && (
              <Card size="small" style={{ marginTop: '16px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>检测到文件类型: </Text>
                    <Text code>{detectedFileInfo.detectedType.toUpperCase()}</Text>
                  </div>
                  <Tooltip title={detectedFileInfo.formatInfo?.name}>
                    <InfoCircleOutlined style={{ color: '#52c41a' }} />
                  </Tooltip>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary">
                    文件大小: {formatFileSize(detectedFileInfo.fileSize)}
                  </Text>
                </div>
              </Card>
            )}
          </Card>
        </Col>

        {/* 右侧：转换设置 */}
        <Col xs={24} lg={10}>
          <Card title="转换设置" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 格式选择 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  目标格式:
                </Text>
                <Select
                  value={targetFormat}
                  onChange={setTargetFormat}
                  placeholder="选择目标格式"
                  style={{ width: '100%' }}
                  disabled={converting}
                >
                  {getAvailableOutputFormats().map((format: string) => (
                    <Option key={format} value={format}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FileOutlined style={{ marginRight: '8px' }} />
                        {format.toUpperCase()}
                        <Text type="secondary" style={{ marginLeft: '8px' }}>
                          ({supportedFormats?.conversions[format]?.name})
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>

              {/* 质量设置 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  转换质量:
                </Text>
                <Radio.Group 
                  value={quality} 
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={converting}
                >
                  <Radio value="high">高质量</Radio>
                  <Radio value="standard">标准</Radio>
                  <Radio value="compress">压缩</Radio>
                </Radio.Group>
              </div>

              {/* 转换按钮 */}
              <Button
                type="primary"
                size="large"
                icon={<SwapOutlined />}
                onClick={handleConvert}
                loading={converting}
                disabled={files.length === 0 || !targetFormat}
                style={{ width: '100%' }}
              >
                {converting ? '转换中...' : '开始转换'}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 转换进度 */}
      {converting && (
        <Card title="转换进度" style={{ marginTop: '24px' }}>
          <Progress 
            percent={files[0]?.progress || 0} 
            status={files[0]?.status === 'error' ? 'exception' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
            正在转换 {files[0]?.file.name}...
          </Text>
        </Card>
      )}

      {/* 转换结果 */}
      {conversionResult && (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              转换结果
            </div>
          } 
          style={{ marginTop: '24px' }}
        >
          {conversionResult.success ? (
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Text type="secondary">原始文件:</Text>
                  <br />
                  <Text strong>{conversionResult.originalName}</Text>
                  <br />
                  <Text type="secondary">
                    {conversionResult.originalFormat.toUpperCase()} • {formatFileSize(conversionResult.originalSize)}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text type="secondary">转换后文件:</Text>
                  <br />
                  <Text strong>{conversionResult.filename}</Text>
                  <br />
                  <Text type="secondary">
                    {conversionResult.targetFormat.toUpperCase()} • {formatFileSize(conversionResult.convertedSize)}
                  </Text>
                </Col>
              </Row>

              <Divider />

              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                >
                  下载转换后的文件
                </Button>
              </div>
            </div>
          ) : (
            <Alert
              message="转换失败"
              description={conversionResult.error}
              type="error"
              showIcon
            />
          )}
        </Card>
      )}
    </div>
  )
}

export default FileConverter