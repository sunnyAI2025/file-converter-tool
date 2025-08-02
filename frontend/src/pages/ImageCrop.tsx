import React from 'react'
import { Typography, Card } from 'antd'

const { Title } = Typography

const ImageCrop: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
        ✂️ 图片剪裁
      </Title>
      <Card>
        <p>图片剪裁功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default ImageCrop