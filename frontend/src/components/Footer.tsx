import React from 'react'
import { Layout, Typography } from 'antd'

const { Footer: AntFooter } = Layout
const { Text } = Typography

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ 
      textAlign: 'center', 
      background: '#f8fafc',
      borderTop: '1px solid #e5e7eb',
      padding: '24px 0'
    }}>
      <Text type="secondary">
        © 2024 实用工具网站 - 简单、快速、免费的在线工具集合
      </Text>
    </AntFooter>
  )
}

export default Footer