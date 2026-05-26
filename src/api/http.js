import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'
import { authState, clearAuth } from '../store/auth'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000
})

http.interceptors.request.use((config) => {
  if (authState.token) {
    config.headers.Authorization = `Bearer ${authState.token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && body.code !== 200) {
      ElMessage.error(body.message || '请求失败')
      return Promise.reject(body)
    }
    return body ? body.data : null
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || '请求失败'
    if (status === 401) {
      clearAuth()
      router.replace('/login')
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default http
