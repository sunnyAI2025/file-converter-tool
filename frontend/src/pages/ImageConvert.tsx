import React from 'react'
import { Typography, Card } from 'antd'

const { Title } = Typography

const ImageConvert: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
        🔄 图片格式转换
      </Title>
      <Card>
        <p>图片格式转换功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default ImageConvert