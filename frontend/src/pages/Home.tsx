import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Row, Col, Button } from 'antd'
import { 
  FileOutlined, 
  CompressOutlined, 
  ScissorOutlined, 
  SwapOutlined, 
  EditOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

interface ToolCardProps {
  icon: React.ReactNode
  title: string
  description: string
  path: string
  color: string
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, path, color }) => {
  const navigate = useNavigate()

  return (
    <Card
      className="tool-card"
      style={{ 
        height: '100%',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}
      bodyStyle={{ 
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      onClick={() => navigate(path)}
    >
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '16px', 
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        fontSize: '28px',
        color: 'white'
      }}>
        {icon}
      </div>
      
      <Title level={4} style={{ marginBottom: '12px', color: '#1f2937' }}>
        {title}
      </Title>
      
      <Paragraph style={{ 
        color: '#6b7280', 
        fontSize: '14px',
        lineHeight: '1.6',
        flex: 1,
        marginBottom: '20px'
      }}>
        {description}
      </Paragraph>
      
      <Button 
        type="text" 
        icon={<ArrowRightOutlined />} 
        style={{ 
          padding: 0, 
          height: 'auto',
          color: color,
          fontWeight: 500
        }}
      >
        立即使用
      </Button>
    </Card>
  )
}

const Home: React.FC = () => {
  const tools = [
    {
      icon: <FileOutlined />,
      title: '文件转换',
      description: '支持多种文件格式相互转换，包括PDF、DOC、DOCX、TXT等常用格式，操作简单快捷。',
      path: '/file-converter',
      color: '#3b82f6'
    },
    {
      icon: <CompressOutlined />,
      title: '图片压缩',
      description: '智能压缩图片文件大小，保持图片质量的同时显著减少存储空间，支持批量处理。',
      path: '/image-compress',
      color: '#8b5cf6'
    },
    {
      icon: <ScissorOutlined />,
      title: '图片剪裁',
      description: '精确剪裁图片，支持自定义尺寸和预设比例，提供旋转、翻转等编辑功能。',
      path: '/image-crop',
      color: '#10b981'
    },
    {
      icon: <SwapOutlined />,
      title: '图片格式转换',
      description: '支持JPG、PNG、WEBP、GIF等主流图片格式之间的转换，保持最佳图片质量。',
      path: '/image-convert',
      color: '#f59e0b'
    },
    {
      icon: <EditOutlined />,
      title: '图片水印',
      description: '为图片添加文字或图片水印，支持多种位置选择和透明度调节，保护图片版权。',
      path: '/image-watermark',
      color: '#ef4444'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
            实用工具网站
          </Title>
          <Paragraph style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '20px',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            简单易用的在线工具集合，提供文件转换、图片处理等常用功能，助您提升工作效率
          </Paragraph>
        </div>
      </div>

      {/* Tools Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div className="tools-grid">
          <Row gutter={[24, 24]}>
            {tools.map((tool, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <ToolCard {...tool} />
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ 
        background: 'white', 
        padding: '80px 0',
        marginTop: '48px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '16px', color: '#1f2937' }}>
            为什么选择我们？
          </Title>
          <Paragraph style={{ 
            color: '#6b7280', 
            fontSize: '16px',
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            我们致力于提供最简单、最高效的在线工具服务
          </Paragraph>
          
          <Row gutter={[48, 32]}>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '32px', 
                  color: '#3b82f6',
                  marginBottom: '16px'
                }}>
                  🚀
                </div>
                <Title level={4} style={{ marginBottom: '12px' }}>快速高效</Title>
                <Paragraph style={{ color: '#6b7280' }}>
                  无需下载安装，在线即用，处理速度快，节省您的宝贵时间
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '32px', 
                  color: '#10b981',
                  marginBottom: '16px'
                }}>
                  🔒
                </div>
                <Title level={4} style={{ marginBottom: '12px' }}>安全可靠</Title>
                <Paragraph style={{ color: '#6b7280' }}>
                  文件处理完成后自动删除，保护您的隐私和数据安全
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '32px', 
                  color: '#f59e0b',
                  marginBottom: '16px'
                }}>
                  💝
                </div>
                <Title level={4} style={{ marginBottom: '12px' }}>完全免费</Title>
                <Paragraph style={{ color: '#6b7280' }}>
                  所有功能完全免费使用，无需注册，无使用限制
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

export default Home