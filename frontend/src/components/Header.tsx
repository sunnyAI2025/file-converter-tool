import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography } from 'antd'
import { 
  HomeOutlined, 
  FileOutlined, 
  CompressOutlined, 
  ScissorOutlined, 
  SwapOutlined, 
  EditOutlined,
  ToolOutlined
} from '@ant-design/icons'

const { Header: AntHeader } = Layout
const { Title } = Typography

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/file-converter',
      icon: <FileOutlined />,
      label: '文件转换',
    },
    {
      key: '/image-compress',
      icon: <CompressOutlined />,
      label: '图片压缩',
    },
    {
      key: '/image-crop',
      icon: <ScissorOutlined />,
      label: '图片剪裁',
    },
    {
      key: '/image-convert',
      icon: <SwapOutlined />,
      label: '格式转换',
    },
    {
      key: '/image-watermark',
      icon: <EditOutlined />,
      label: '图片水印',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <AntHeader style={{ 
      background: '#fff', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <ToolOutlined style={{ fontSize: '24px', color: '#3b82f6', marginRight: '12px' }} />
          <Title level={4} style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>
            实用工具网站
          </Title>
        </div>
        
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            border: 'none',
            fontSize: '14px',
            fontWeight: 500
          }}
          className="header-nav"
        />
      </div>
    </AntHeader>
  )
}

export default Header