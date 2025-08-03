import Cookies from 'js-cookie'
import axios from 'axios'

// API基础URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5008/api'

// Token存储key
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_info'

// 用户信息接口
export interface User {
  id: number
  username: string
  email: string
  createdAt?: string
  lastLogin?: string
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// 登录请求接口
export interface LoginRequest {
  email: string
  password: string
}

// 注册请求接口
export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

// 用户统计接口
export interface UserStats {
  totalOperations: number
  monthlyOperations: number
  operationStats: Array<{
    operation_type: string
    count: string
  }>
  recentLogs: Array<{
    operation_type: string
    file_name: string
    file_size: number
    status: string
    created_at: string
  }>
}

// 设置axios默认配置
axios.defaults.baseURL = API_BASE_URL
axios.defaults.timeout = 10000

// 请求拦截器 - 自动添加token
axios.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理token过期
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 只有非登录请求的401/403错误才清除认证信息
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    const isRegisterRequest = error.config?.url?.includes('/auth/register')
    
    if ((error.response?.status === 401 || error.response?.status === 403) 
        && !isLoginRequest && !isRegisterRequest) {
      // Token过期或无效，清除本地存储并跳转到登录页
      clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Token管理
export const getToken = (): string | null => {
  return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  // 同时存储到Cookie和localStorage，Cookie用于服务端，localStorage用于客户端
  Cookies.set(TOKEN_KEY, token, { expires: 7 }) // 7天过期
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

// 用户信息管理
export const getUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY)
}

// 清除所有认证信息
export const clearAuth = (): void => {
  removeToken()
  removeUser()
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken()
}

// API调用函数
export const authAPI = {
  // 用户注册
  register: async (data: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await axios.post('/auth/register', data)
      return response.data
    } catch (error: any) {
      // 对于注册请求，即使是错误也要返回服务器的错误信息
      if (error.response && error.response.data) {
        return error.response.data
      }
      throw error
    }
  },

  // 用户登录
  login: async (data: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await axios.post('/auth/login', data)
      return response.data
    } catch (error: any) {
      // 对于登录请求，即使是401错误也要返回服务器的错误信息
      if (error.response && error.response.data) {
        return error.response.data
      }
      throw error
    }
  },

  // 用户登出
  logout: async (): Promise<ApiResponse> => {
    const response = await axios.post('/auth/logout')
    return response.data
  },

  // 获取用户信息
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await axios.get('/auth/profile')
    return response.data
  },

  // 更新用户信息
  updateProfile: async (data: { username?: string; email?: string }): Promise<ApiResponse<{ user: User }>> => {
    const response = await axios.put('/auth/profile', data)
    return response.data
  },

  // 获取用户统计
  getStats: async (): Promise<ApiResponse<UserStats>> => {
    const response = await axios.get('/auth/stats')
    return response.data
  },

  // 忘记密码
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await axios.post('/auth/forgot-password', { email })
    return response.data
  },

  // 重置密码
  resetPassword: async (data: { email: string; verificationCode: string; newPassword: string }): Promise<ApiResponse> => {
    const response = await axios.post('/auth/reset-password', data)
    return response.data
  },

  // 验证token
  verifyToken: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await axios.get('/auth/verify')
    return response.data
  }
}

// 登录处理函数
export const handleLogin = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const result = await authAPI.login({ email, password })
    
    if (result.success && result.data) {
      setToken(result.data.token)
      setUser(result.data.user)
      
      // 触发自定义事件通知组件更新认证状态
      window.dispatchEvent(new Event('authStateChange'))
      
      return {
        success: true,
        message: result.message,
        user: result.data.user
      }
    } else {
      return {
        success: false,
        message: result.message
      }
    }
  } catch (error: any) {
    // 处理网络错误和服务器错误
    if (error.response) {
      // 服务器返回了错误响应
      return {
        success: false,
        message: error.response.data?.message || '登录失败，请检查您的登录信息'
      }
    } else if (error.request) {
      // 网络请求失败
      return {
        success: false,
        message: '网络连接失败，请检查网络连接后重试'
      }
    } else {
      // 其他错误
      return {
        success: false,
        message: '登录失败，请稍后重试'
      }
    }
  }
}

// 注册处理函数
export const handleRegister = async (
  username: string, 
  email: string, 
  password: string, 
  confirmPassword: string
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const result = await authAPI.register({ username, email, password, confirmPassword })
    
    if (result.success && result.data) {
      setToken(result.data.token)
      setUser(result.data.user)
      
      // 触发自定义事件通知组件更新认证状态
      window.dispatchEvent(new Event('authStateChange'))
      
      return {
        success: true,
        message: result.message,
        user: result.data.user
      }
    } else {
      return {
        success: false,
        message: result.message
      }
    }
  } catch (error: any) {
    // 处理网络错误和服务器错误
    if (error.response) {
      // 服务器返回了错误响应
      return {
        success: false,
        message: error.response.data?.message || '注册失败，请检查您的注册信息'
      }
    } else if (error.request) {
      // 网络请求失败
      return {
        success: false,
        message: '网络连接失败，请检查网络连接后重试'
      }
    } else {
      // 其他错误
      return {
        success: false,
        message: '注册失败，请稍后重试'
      }
    }
  }
}

// 登出处理函数
export const handleLogout = async (): Promise<void> => {
  try {
    await authAPI.logout()
  } catch (error) {
    console.error('登出API调用失败:', error)
  } finally {
    clearAuth()
    
    // 触发自定义事件通知组件更新认证状态
    window.dispatchEvent(new Event('authStateChange'))
    
    window.location.href = '/'
  }
}

// 初始化认证状态
export const initAuth = async (): Promise<User | null> => {
  const token = getToken()
  if (!token) {
    return null
  }

  try {
    const result = await authAPI.verifyToken()
    if (result.success && result.data) {
      setUser(result.data.user)
      return result.data.user
    } else {
      clearAuth()
      return null
    }
  } catch (error) {
    clearAuth()
    return null
  }
}