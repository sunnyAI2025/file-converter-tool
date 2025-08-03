import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Button, Form, Input, message, Modal, Typography, Tag, Space } from 'antd'
import { UserOutlined, MailOutlined, CalendarOutlined, EditOutlined, BarChartOutlined } from '@ant-design/icons'
import { authAPI, getUser, setUser, User, UserStats } from '../utils/auth'

const { Title, Text } = Typography

interface EditProfileFormData {
  username: string
  email: string
}

const UserCenter: React.FC = () => {
  const [user, setUserState] = useState<User | null>(getUser())
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editForm] = Form.useForm()

  // 加载用户统计数据
  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const result = await authAPI.getStats()
      if (result.success) {
        setStats(result.data)
      } else {
        message.error('获取统计信息失败')
      }
    } catch (error) {
      message.error('获取统计信息失败')
    } finally {
      setStatsLoading(false)
    }
  }

  // 刷新用户信息
  const refreshUserInfo = async () => {
    try {
      const result = await authAPI.getProfile()
      if (result.success) {
        setUser(result.data.user)
        setUserState(result.data.user)
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  useEffect(() => {
    loadStats()
    refreshUserInfo()
  }, [])

  // 处理编辑资料
  const handleEditProfile = () => {
    editForm.setFieldsValue({
      username: user?.username,
      email: user?.email
    })
    setEditModalVisible(true)
  }

  // 保存用户信息
  const onSaveProfile = async (values: EditProfileFormData) => {
    setLoading(true)
    try {
      const result = await authAPI.updateProfile(values)
      
      if (result.success) {
        message.success('用户信息更新成功')
        setUser(result.data.user)
        setUserState(result.data.user)
        setEditModalVisible(false)
        editForm.resetFields()
      } else {
        message.error(result.message)
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 使用记录表格列定义
  const columns = [
    {
      title: '日期',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作类型',
      dataIndex: 'operation_type',
      key: 'operation_type',
      render: (type: string) => {
        const typeMap: { [key: string]: { text: string; color: string } } = {
          'file_convert': { text: '文件转换', color: 'blue' },
          'image_compress': { text: '图片压缩', color: 'green' },
          'image_crop': { text: '图片剪裁', color: 'orange' },
          'image_convert': { text: '格式转换', color: 'purple' },
          'image_watermark': { text: '图片水印', color: 'red' }
        }
        const config = typeMap[type] || { text: type, color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '文件名',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (name: string) => name || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '✅ 成功' : '❌ 失败'}
        </Tag>
      )
    }
  ]

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Title level={3}>请先登录</Title>
        <Button type="primary" href="/login">去登录</Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        👤 个人中心
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
        管理您的账户信息和设置
      </Text>

      <Row gutter={[24, 24]}>
        {/* 基本信息 */}
        <Col xs={24} lg={8}>
          <Card 
            title="基本信息" 
            extra={
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={handleEditProfile}
              >
                编辑资料
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>👤 用户名:</Text>
                <br />
                <Text style={{ fontSize: '16px' }}>{user.username}</Text>
              </div>
              
              <div>
                <Text strong>📧 邮箱:</Text>
                <br />
                <Text style={{ fontSize: '16px' }}>{user.email}</Text>
              </div>
              
              <div>
                <Text strong>📅 注册时间:</Text>
                <br />
                <Text style={{ fontSize: '16px' }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* 账户统计 */}
        <Col xs={24} lg={16}>
          <Card 
            title="账户统计" 
            loading={statsLoading}
            extra={
              <Button 
                type="text" 
                icon={<BarChartOutlined />} 
                onClick={loadStats}
              >
                刷新
              </Button>
            }
          >
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="📊 本月使用次数"
                  value={stats?.monthlyOperations || 0}
                  suffix="次"
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="📁 转换文件总数"
                  value={stats?.totalOperations || 0}
                  suffix="个"
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="🖼️ 处理图片总数"
                  value={stats?.operationStats?.filter(s => s.operation_type.startsWith('image')).reduce((sum, s) => sum + parseInt(s.count), 0) || 0}
                  suffix="张"
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="⭐ 会员等级"
                  value="普通用户"
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>

            {/* 操作类型统计 */}
            {stats?.operationStats && stats.operationStats.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>操作分布:</Title>
                <Row gutter={8}>
                  {stats.operationStats.map((stat, index) => (
                    <Col key={index} span={8} style={{ marginBottom: 8 }}>
                      <Card size="small">
                        <Statistic
                          title={stat.operation_type}
                          value={stat.count}
                          suffix="次"
                          valueStyle={{ fontSize: '14px' }}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 使用记录 */}
      <Card 
        title="使用记录" 
        style={{ marginTop: 24 }}
        extra={
          <Space>
            <Button>查看更多记录</Button>
            <Button>导出记录</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={stats?.recentLogs || []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无使用记录' }}
        />
      </Card>

      {/* 编辑资料弹窗 */}
      <Modal
        title="编辑个人资料"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          editForm.resetFields()
        }}
        footer={null}
        width={400}
      >
        <Form
          form={editForm}
          name="editProfile"
          onFinish={onSaveProfile}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="👤 用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, max: 20, message: '用户名长度必须在2-20位之间' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="📧 邮箱地址"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '邮箱格式不正确' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="请输入邮箱地址" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                loading={loading}
                style={{ flex: 1 }}
              >
                保存
              </Button>
              <Button 
                size="large" 
                onClick={() => {
                  setEditModalVisible(false)
                  editForm.resetFields()
                }}
                style={{ flex: 1 }}
              >
                取消
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserCenter