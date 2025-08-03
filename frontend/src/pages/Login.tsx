import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Form, message, Modal, Checkbox, Divider, Typography } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, WechatOutlined, QqOutlined } from '@ant-design/icons'
import { handleLogin, handleRegister, authAPI, isAuthenticated } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

interface LoginFormData {
  email: string
  password: string
  remember: boolean
}

interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  agree: boolean
}

interface ForgotPasswordFormData {
  email: string
  verificationCode: string
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [forgotForm] = Form.useForm()
  
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerModalVisible, setRegisterModalVisible] = useState(false)
  const [forgotModalVisible, setForgotModalVisible] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)

  // 检查是否已登录
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/')
    }
  }, [navigate])

  // 处理登录
  const onLogin = async (values: LoginFormData) => {
    setLoginLoading(true)
    try {
      const result = await handleLogin(values.email, values.password)
      
      if (result.success) {
        // 显示简短的成功提示
        message.success(`欢迎回来，${result.user?.username}！`)
        
        // 直接跳转到首页
        navigate('/')
      } else {
        // 显示登录失败提示
        message.error(result.message)
      }
    } catch (error) {
      console.error('登录异常:', error)
      message.error('登录失败，请稍后重试')
    } finally {
      setLoginLoading(false)
    }
  }

  // 处理注册
  const onRegister = async (values: RegisterFormData) => {
    if (!values.agree) {
      message.error('请同意用户协议和隐私政策')
      return
    }

    setRegisterLoading(true)
    try {
      const result = await handleRegister(
        values.username,
        values.email,
        values.password,
        values.confirmPassword
      )
      
      if (result.success) {
        // 显示简短的成功提示
        message.success(`欢迎加入，${result.user?.username}！注册成功`)
        setRegisterModalVisible(false)
        registerForm.resetFields()
        
        // 直接跳转到首页
        navigate('/')
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('注册失败，请稍后重试')
    } finally {
      setRegisterLoading(false)
    }
  }

  // 处理忘记密码
  const onForgotPassword = async (values: ForgotPasswordFormData) => {
    try {
      const result = await authAPI.forgotPassword(values.email)
      
      if (result.success) {
        message.success(result.message)
        setForgotModalVisible(false)
        forgotForm.resetFields()
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('发送失败，请稍后重试')
    }
  }

  // 第三方登录 (模拟)
  const handleThirdPartyLogin = (provider: string) => {
    message.info(`${provider}登录功能正在开发中`)
  }

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            🔐 用户登录
          </Title>
          <Text type="secondary">欢迎回来，请登录您的账户</Text>
        </div>

        <Form
          form={loginForm}
          name="login"
          onFinish={onLogin}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="📧 邮箱地址"
            name="email"
            rules={[
              { required: true, message: '请输入您的邮箱地址' },
              { type: 'email', message: '邮箱格式不正确' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="请输入您的邮箱地址" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="🔒 密码"
            name="password"
            rules={[
              { required: true, message: '请输入您的密码' },
              { min: 6, message: '密码长度不能少于6位' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入您的密码" 
              size="large"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              loading={loginLoading}
              style={{ width: '100%', marginBottom: 16 }}
            >
              登录
            </Button>
            
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="link" 
                onClick={() => setForgotModalVisible(true)}
                style={{ padding: 0 }}
              >
                忘记密码?
              </Button>
            </div>
          </Form.Item>

          <Divider>或</Divider>

          <Form.Item>
            <Button 
              size="large" 
              onClick={() => setRegisterModalVisible(true)}
              style={{ width: '100%' }}
            >
              立即注册
            </Button>
          </Form.Item>
        </Form>

        <Card 
          title="快速登录选项" 
          size="small" 
          style={{ marginTop: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Button 
              icon={<GoogleOutlined />} 
              onClick={() => handleThirdPartyLogin('Google')}
            >
              Google登录
            </Button>
            <Button 
              icon={<WechatOutlined />} 
              onClick={() => handleThirdPartyLogin('微信')}
            >
              微信登录
            </Button>
            <Button 
              icon={<QqOutlined />} 
              onClick={() => handleThirdPartyLogin('QQ')}
            >
              QQ登录
            </Button>
          </div>
        </Card>
      </Card>

      {/* 注册弹窗 */}
      <Modal
        title="📝 用户注册"
        open={registerModalVisible}
        onCancel={() => {
          setRegisterModalVisible(false)
          registerForm.resetFields()
        }}
        footer={null}
        width={400}
      >
        <Form
          form={registerForm}
          name="register"
          onFinish={onRegister}
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

          <Form.Item
            label="🔒 密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度不能少于6位' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="🔒 确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请再次输入密码" 
              size="large"
            />
          </Form.Item>

          <Form.Item 
            name="agree" 
            valuePropName="checked"
            rules={[
              { 
                validator: (_, value) => 
                  value ? Promise.resolve() : Promise.reject(new Error('请同意用户协议')) 
              }
            ]}
          >
            <Checkbox>
              我同意《用户协议》和《隐私政策》
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                loading={registerLoading}
                style={{ flex: 1 }}
              >
                注册
              </Button>
              <Button 
                size="large" 
                onClick={() => {
                  setRegisterModalVisible(false)
                  registerForm.resetFields()
                }}
                style={{ flex: 1 }}
              >
                取消
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 忘记密码弹窗 */}
      <Modal
        title="🔑 重置密码"
        open={forgotModalVisible}
        onCancel={() => {
          setForgotModalVisible(false)
          forgotForm.resetFields()
        }}
        footer={null}
        width={400}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>请输入您注册时使用的邮箱地址，我们将发送重置密码链接给您。</Text>
        </div>
        
        <Form
          form={forgotForm}
          name="forgot"
          onFinish={onForgotPassword}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="📧 邮箱地址"
            name="email"
            rules={[
              { required: true, message: '请输入您的邮箱地址' },
              { type: 'email', message: '邮箱格式不正确' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="请输入您的邮箱地址" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="🔢 验证码"
            name="verificationCode"
            rules={[
              { required: true, message: '请输入验证码' }
            ]}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input 
                placeholder="请输入验证码" 
                size="large"
                style={{ flex: 1 }}
              />
              <Button size="large">获取验证码</Button>
            </div>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                style={{ flex: 1 }}
              >
                发送重置链接
              </Button>
              <Button 
                size="large" 
                onClick={() => {
                  setForgotModalVisible(false)
                  forgotForm.resetFields()
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

export default Login