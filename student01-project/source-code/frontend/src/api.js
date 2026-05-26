import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
