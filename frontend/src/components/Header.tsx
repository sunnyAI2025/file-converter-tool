import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography, Dropdown, Button, Avatar, Space } from 'antd'
import { 
  HomeOutlined, 
  FileOutlined, 
  CompressOutlined, 
  ScissorOutlined, 
  SwapOutlined, 
  EditOutlined,
  ToolOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { getUser, handleLogout, isAuthenticated, User } from '../utils/auth'

const { Header: AntHeader } = Layout
const { Title } = Typography

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 监听登录状态变化
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = isAuthenticated()
      const currentUser = getUser()
      setIsLoggedIn(authenticated)
      setUser(currentUser)
    }

    checkAuthStatus()
    
    // 监听存储变化
    window.addEventListener('storage', checkAuthStatus)
    
    // 监听自定义事件（用于登录成功后立即更新状态）
    window.addEventListener('authStateChange', checkAuthStatus)
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus)
      window.removeEventListener('authStateChange', checkAuthStatus)
    }
  }, [])

  // 处理登出
  const onLogout = async () => {
    await handleLogout()
    setIsLoggedIn(false)
    setUser(null)
  }

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

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/user-center')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
      onClick: () => navigate('/user-center')
    },
    {
      key: 'stats',
      icon: <BarChartOutlined />,
      label: '使用统计',
      onClick: () => navigate('/user-center')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout
    }
  ]

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
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ 
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              marginRight: '16px'
            }}
            className="header-nav"
          />
          
          {/* 登录状态显示 */}
          {isLoggedIn && user ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Button type="text" style={{ display: 'flex', alignItems: 'center' }}>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{user.username}</span>
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Button 
              type="primary" 
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </AntHeader>
  )
}

export default Header