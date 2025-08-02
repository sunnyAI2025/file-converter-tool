import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.error || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export interface FileConversionResponse {
  success: boolean
  message: string
  data: {
    originalName: string
    originalFormat: string
    targetFormat: string
    originalSize: number
    convertedSize: number
    downloadUrl: string
    filename: string
  }
}

export interface SupportedFormatsResponse {
  success: boolean
  data: {
    input: string[]
    output: string[]
    conversions: Record<string, {
      name: string
      extensions: string[]
      outputFormats: string[]
    }>
  }
}

export interface FileDetectionResponse {
  success: boolean
  data: {
    detectedType: string
    fileName: string
    fileSize: number
    supportedOutputFormats: string[]
    formatInfo: {
      name: string
      extensions: string[]
      outputFormats: string[]
    } | null
  }
}

// 文件转换API
export const fileAPI = {
  // 转换文件
  convertFile: async (file: File, targetFormat: string, quality = 'standard'): Promise<FileConversionResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetFormat', targetFormat)
    formData.append('quality', quality)

    return api.post('/files/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 获取支持的格式
  getSupportedFormats: async (): Promise<SupportedFormatsResponse> => {
    return api.get('/files/formats')
  },

  // 检测文件类型
  detectFileType: async (file: File): Promise<FileDetectionResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/files/detect-type', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 下载文件
  downloadFile: (filename: string): string => {
    return `/api/files/download/${filename}`
  },

  // 获取转换状态
  getConversionStatus: async (taskId: string) => {
    return api.get(`/files/conversion-status/${taskId}`)
  },
}

export default api